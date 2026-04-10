"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Tag,
  Users,
  Loader2,
  Check,
  X,
  Trash2,
  ToggleLeft,
  ToggleRight,
  DollarSign,
  TrendingUp,
  UserPlus,
  Pencil,
  Infinity,
  Package,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const font = { fontFamily: "Helvetica, Arial, sans-serif" } as const;

type SalesRep = {
  id: string;
  name: string;
  email: string | null;
  active: boolean;
  created_at: string;
};

type Product = {
  id: string;
  name: string;
};

type ProductDiscountEntry = { percent?: number; fixed?: number };
type ProductDiscountsMap = Record<string, ProductDiscountEntry>;

type PromoCode = {
  id: string;
  code: string;
  discount_percent: number;
  discount_fixed: number;
  sales_rep_id: string | null;
  sales_reps: { id: string; name: string } | null;
  max_uses: number | null;
  times_used: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
  applicable_product_ids: string[] | null;
  product_discounts: ProductDiscountsMap | null;
};

type RepAnalytics = SalesRep & {
  orderCount: number;
  accountCount: number;
  totalRevenue: number;
  accounts: { id: string; email: string; referred_by_code: string | null }[];
};

export default function PromoPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"codes" | "reps">("codes");
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [reps, setReps] = useState<SalesRep[]>([]);
  const [analytics, setAnalytics] = useState<RepAnalytics[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [showNewCode, setShowNewCode] = useState(false);
  const [showNewRep, setShowNewRep] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editData, setEditData] = useState({ code: "", maxUses: "", discountPercent: "", discountFixed: "", expiresAt: "", salesRepId: "", productDiscounts: {} as Record<string, { type: "percent" | "fixed"; value: string }> });

  const [newCode, setNewCode] = useState({ code: "", discountPercent: "", discountFixed: "", salesRepId: "", maxUses: "", expiresAt: "", productDiscounts: {} as Record<string, { type: "percent" | "fixed"; value: string }> });
  const [newRep, setNewRep] = useState({ name: "", email: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [codesRes, repsRes, analyticsRes, productsRes] = await Promise.all([
        fetch("/api/admin/promo"),
        fetch("/api/admin/sales-reps"),
        fetch("/api/admin/sales-reps/analytics"),
        fetch("/api/admin/products"),
      ]);
      if (!codesRes.ok || !repsRes.ok || !analyticsRes.ok) {
        toast.error("Failed to load data");
        return;
      }
      const [codesData, repsData, analyticsData] = await Promise.all([
        codesRes.json(),
        repsRes.json(),
        analyticsRes.json(),
      ]);
      setCodes(codesData.codes || []);
      setReps(repsData.reps || []);
      setAnalytics(analyticsData.analytics || []);
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts((productsData.products || []).map((p: { id: string; name: string }) => ({ id: p.id, name: p.name })));
      }
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: { app_metadata?: Record<string, string> } | null } }) => {
      if (!user || user.app_metadata?.role !== "admin") {
        router.push("/login");
        return;
      }
      fetchData();
    });
  }, [router, fetchData]);

  const buildProductDiscountsPayload = (pd: Record<string, { type: "percent" | "fixed"; value: string }>): ProductDiscountsMap | null => {
    const result: ProductDiscountsMap = {};
    for (const [pid, entry] of Object.entries(pd)) {
      const val = Number(entry.value);
      if (!val || val <= 0) continue;
      result[pid] = entry.type === "percent" ? { percent: val } : { fixed: val };
    }
    return Object.keys(result).length > 0 ? result : null;
  };

  const createPromoCode = async () => {
    setSaving(true);
    try {
      const pdPayload = buildProductDiscountsPayload(newCode.productDiscounts);
      const res = await fetch("/api/admin/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newCode.code,
          discountPercent: pdPayload ? 0 : (newCode.discountPercent ? Number(newCode.discountPercent) : 0),
          discountFixed: pdPayload ? 0 : (newCode.discountFixed ? Number(newCode.discountFixed) : 0),
          salesRepId: newCode.salesRepId || null,
          maxUses: newCode.maxUses !== "" ? Number(newCode.maxUses) : null,
          expiresAt: newCode.expiresAt || null,
          productDiscounts: pdPayload,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCodes((prev) => [data.code, ...prev]);
        setShowNewCode(false);
        setNewCode({ code: "", discountPercent: "", discountFixed: "", salesRepId: "", maxUses: "", expiresAt: "", productDiscounts: {} });
        toast.success("Promo code created");
      } else {
        toast.error(data.error || "Failed to create promo code");
      }
    } catch {
      toast.error("Failed to create promo code");
    }
    setSaving(false);
  };

  const deleteRep = async (repId: string) => {
    const prevAnalytics = analytics;
    const prevReps = reps;
    const prevCodes = codes;
    setAnalytics((prev) => prev.filter((r) => r.id !== repId));
    setReps((prev) => prev.filter((r) => r.id !== repId));
    setCodes((prev) => prev.map((c) => c.sales_rep_id === repId ? { ...c, sales_rep_id: null, sales_reps: null } : c));
    try {
      const res = await fetch(`/api/admin/sales-reps?id=${repId}`, { method: "DELETE" });
      if (!res.ok) {
        setAnalytics(prevAnalytics);
        setReps(prevReps);
        setCodes(prevCodes);
        toast.error("Failed to delete sales rep");
        return;
      }
      toast.success("Sales rep deleted");
    } catch {
      setAnalytics(prevAnalytics);
      setReps(prevReps);
      setCodes(prevCodes);
      toast.error("Failed to delete sales rep");
    }
  };

  const createSalesRep = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/sales-reps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRep.name, email: newRep.email }),
      });
      const data = await res.json();
      if (res.ok) {
        const newRepData = data.rep as SalesRep;
        setReps((prev) => [...prev, newRepData]);
        setAnalytics((prev) => [...prev, { ...newRepData, orderCount: 0, accountCount: 0, totalRevenue: 0, accounts: [] }]);
        setShowNewRep(false);
        setNewRep({ name: "", email: "" });
        toast.success("Sales rep added");
      } else {
        toast.error(data.error || "Failed to add sales rep");
      }
    } catch {
      toast.error("Failed to add sales rep");
    }
    setSaving(false);
  };

  const toggleCode = async (id: string, active: boolean) => {
    setCodes((prev) => prev.map((c) => (c.id === id ? { ...c, active } : c)));
    try {
      const res = await fetch("/api/admin/promo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active }),
      });
      if (!res.ok) {
        setCodes((prev) => prev.map((c) => (c.id === id ? { ...c, active: !active } : c)));
        toast.error("Failed to update promo code");
        return;
      }
      toast.success(active ? "Promo code activated" : "Promo code deactivated");
    } catch {
      setCodes((prev) => prev.map((c) => (c.id === id ? { ...c, active: !active } : c)));
      toast.error("Failed to update promo code");
    }
  };

  const deleteCode = async (codeId: string) => {
    const prev = codes;
    setCodes((c) => c.filter((code) => code.id !== codeId));
    if (editingCode === codeId) setEditingCode(null);
    try {
      const res = await fetch(`/api/admin/promo?id=${codeId}`, { method: "DELETE" });
      if (!res.ok) {
        setCodes(prev);
        toast.error("Failed to delete promo code");
        return;
      }
      toast.success("Promo code deleted");
    } catch {
      setCodes(prev);
      toast.error("Failed to delete promo code");
    }
  };

  const startEditing = (c: PromoCode) => {
    setEditingCode(c.id);
    const pd: Record<string, { type: "percent" | "fixed"; value: string }> = {};
    if (c.product_discounts) {
      for (const [pid, entry] of Object.entries(c.product_discounts)) {
        if (entry.percent && entry.percent > 0) {
          pd[pid] = { type: "percent", value: String(entry.percent) };
        } else if (entry.fixed && entry.fixed > 0) {
          pd[pid] = { type: "fixed", value: String(entry.fixed) };
        }
      }
    }
    setEditData({
      code: c.code,
      maxUses: c.max_uses !== null ? String(c.max_uses) : "",
      discountPercent: c.discount_percent > 0 ? String(c.discount_percent) : "",
      discountFixed: c.discount_fixed > 0 ? String(c.discount_fixed) : "",
      expiresAt: c.expires_at ? c.expires_at.split("T")[0] : "",
      salesRepId: c.sales_rep_id || "",
      productDiscounts: pd,
    });
  };

  const saveEdit = async () => {
    if (!editingCode) return;
    setSaving(true);
    try {
      const pdPayload = buildProductDiscountsPayload(editData.productDiscounts);
      const res = await fetch("/api/admin/promo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingCode,
          code: editData.code,
          maxUses: editData.maxUses !== "" ? Number(editData.maxUses) : null,
          discountPercent: pdPayload ? 0 : (editData.discountPercent ? Number(editData.discountPercent) : 0),
          discountFixed: pdPayload ? 0 : (editData.discountFixed ? Number(editData.discountFixed) : 0),
          expiresAt: editData.expiresAt || null,
          salesRepId: editData.salesRepId || null,
          productDiscounts: pdPayload,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCodes((prev) => prev.map((c) => (c.id === editingCode ? data.code : c)));
        setEditingCode(null);
        toast.success("Promo code updated");
      } else {
        toast.error(data.error || "Failed to update promo code");
      }
    } catch {
      toast.error("Failed to update promo code");
    }
    setSaving(false);
  };

  return (
    <main className="relative min-h-screen w-full bg-[#050505] selection:bg-white/20 selection:text-white">
      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 pt-10 pb-40">
        <div className="max-w-5xl mx-auto">

          <Link href="/admin" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span style={font} className="text-xs font-medium tracking-[0.1em] uppercase">Back to Admin</span>
          </Link>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
            <div>
              <h1 style={font} className="text-3xl md:text-4xl font-normal tracking-tight text-white">Promo & Sales</h1>
              <p style={font} className="text-sm text-white/40 mt-2">Manage promo codes, sales reps, and attribution</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
            </div>
          ) : (
          <>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
            {[
              { label: "Active Codes", value: codes.filter((c) => c.active).length, icon: Tag },
              { label: "Sales Reps", value: reps.length, icon: Users },
              { label: "Total Uses", value: codes.reduce((s, c) => s + c.times_used, 0), icon: TrendingUp },
              { label: "Attributed Revenue", value: `$${analytics.reduce((s, a) => s + a.totalRevenue, 0).toFixed(0)}`, icon: DollarSign },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
                <stat.icon className="w-4 h-4 text-white/30 mb-3" />
                <p style={font} className="text-2xl text-white font-light">{stat.value}</p>
                <p style={font} className="text-[10px] text-white/30 tracking-[0.1em] uppercase mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 p-1.5 bg-white/[0.03] rounded-2xl border border-white/5 w-fit mb-8">
            {[
              { id: "codes" as const, label: "Promo Codes", icon: Tag },
              { id: "reps" as const, label: "Sales Reps", icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold tracking-[0.05em] uppercase transition-all duration-300 ${
                  activeTab === tab.id ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.15)]" : "text-white/50 hover:text-white/80 hover:bg-white/10"
                }`}
                style={font}
              >
                <tab.icon className="w-4 h-4" strokeWidth={1.5} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Promo Codes Tab */}
          {activeTab === "codes" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 style={font} className="text-xs font-bold tracking-[0.2em] uppercase text-white/40">All Promo Codes</h2>
                <button
                  onClick={() => setShowNewCode(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black text-xs font-bold tracking-[0.1em] uppercase hover:bg-white/90 transition-colors"
                  style={font}
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Code
                </button>
              </div>

              {/* New Code Form */}
              {showNewCode && (
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 style={font} className="text-sm text-white font-medium">Create Promo Code</h3>
                    <button onClick={() => setShowNewCode(false)} className="text-white/30 hover:text-white"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label style={font} className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/30 block mb-2">Code</label>
                      <input
                        value={newCode.code}
                        onChange={(e) => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                        placeholder="e.g. PHIL123"
                        className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-white/30"
                        style={font}
                      />
                    </div>
                    <div>
                      <label style={font} className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/30 block mb-2">Linked Sales Rep</label>
                      <select
                        value={newCode.salesRepId}
                        onChange={(e) => setNewCode({ ...newCode, salesRepId: e.target.value })}
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30"
                        style={font}
                      >
                        <option value="">None (general discount)</option>
                        {reps.filter((r) => r.active).map((rep) => (
                          <option key={rep.id} value={rep.id}>{rep.name}</option>
                        ))}
                      </select>
                    </div>
                    {Object.keys(newCode.productDiscounts).length === 0 && (
                      <>
                        <div>
                          <label style={font} className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/30 block mb-2">Discount % (or fixed below)</label>
                          <input
                            type="number"
                            value={newCode.discountPercent}
                            onChange={(e) => setNewCode({ ...newCode, discountPercent: e.target.value, discountFixed: "" })}
                            placeholder="e.g. 15"
                            className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-white/30"
                            style={font}
                          />
                        </div>
                        <div>
                          <label style={font} className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/30 block mb-2">Fixed $ Discount</label>
                          <input
                            type="number"
                            value={newCode.discountFixed}
                            onChange={(e) => setNewCode({ ...newCode, discountFixed: e.target.value, discountPercent: "" })}
                            placeholder="e.g. 25"
                            className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-white/30"
                            style={font}
                          />
                        </div>
                      </>
                    )}
                    <div>
                      <label style={font} className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/30 block mb-2">Max Uses (optional)</label>
                      <input
                        type="number"
                        value={newCode.maxUses}
                        onChange={(e) => setNewCode({ ...newCode, maxUses: e.target.value })}
                        placeholder="Unlimited"
                        className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-white/30"
                        style={font}
                      />
                    </div>
                    <div>
                      <label style={font} className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/30 block mb-2">Expires (optional)</label>
                      <input
                        type="date"
                        value={newCode.expiresAt}
                        onChange={(e) => setNewCode({ ...newCode, expiresAt: e.target.value })}
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30"
                        style={font}
                      />
                    </div>
                  </div>
                  {products.length > 0 && (
                    <div className="mb-6">
                      <label style={font} className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/30 block mb-2">
                        Per-product discounts (optional)
                      </label>
                      <p style={font} className="text-[9px] text-white/20 mb-3">Select products and set individual discount amounts. Leave all unselected to use the global discount above for all products.</p>
                      <div className="flex flex-col gap-2">
                        {products.map((p) => {
                          const entry = newCode.productDiscounts[p.id];
                          const selected = !!entry;
                          return (
                            <div key={p.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                              selected ? "bg-cyan-400/5 border-cyan-400/20" : "bg-white/[0.01] border-white/5"
                            }`}>
                              <button
                                type="button"
                                onClick={() => setNewCode((prev) => {
                                  const next = { ...prev.productDiscounts };
                                  if (selected) { delete next[p.id]; } else { next[p.id] = { type: "percent", value: "" }; }
                                  return { ...prev, productDiscounts: next };
                                })}
                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                                  selected ? "bg-cyan-400 border-cyan-400" : "border-white/20 hover:border-white/40"
                                }`}
                              >
                                {selected && <Check className="w-3 h-3 text-black" />}
                              </button>
                              <span style={font} className={`text-sm flex-1 min-w-0 ${selected ? "text-white" : "text-white/40"}`}>{p.name}</span>
                              {selected && (
                                <div className="flex items-center gap-2 shrink-0">
                                  <select
                                    value={entry.type}
                                    onChange={(e) => setNewCode((prev) => ({
                                      ...prev,
                                      productDiscounts: { ...prev.productDiscounts, [p.id]: { ...prev.productDiscounts[p.id], type: e.target.value as "percent" | "fixed" } },
                                    }))}
                                    className="bg-[#0a0a0a] border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-white/30"
                                    style={font}
                                  >
                                    <option value="percent">%</option>
                                    <option value="fixed">$</option>
                                  </select>
                                  <input
                                    type="number"
                                    value={entry.value}
                                    onChange={(e) => setNewCode((prev) => ({
                                      ...prev,
                                      productDiscounts: { ...prev.productDiscounts, [p.id]: { ...prev.productDiscounts[p.id], value: e.target.value } },
                                    }))}
                                    placeholder={entry.type === "percent" ? "e.g. 10" : "e.g. 5"}
                                    className="w-20 bg-transparent border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs placeholder:text-white/15 focus:outline-none focus:border-white/30"
                                    style={font}
                                    min="0"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <button
                    onClick={createPromoCode}
                    disabled={saving || !newCode.code.trim()}
                    className="px-6 py-3 rounded-xl bg-white text-black text-xs font-bold tracking-[0.1em] uppercase hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    style={font}
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Code"}
                  </button>
                </div>
              )}

              {/* Codes List */}
              <div className="flex flex-col gap-3">
                {codes.map((c) => {
                  const isEditing = editingCode === c.id;
                  const usageRatio = c.max_uses ? c.times_used / c.max_uses : null;
                  const isNearLimit = usageRatio !== null && usageRatio >= 0.8;
                  const isExhausted = c.max_uses !== null && c.times_used >= c.max_uses;

                  return (
                    <div key={c.id} className={`rounded-2xl border transition-all ${c.active ? "bg-white/[0.02] border-white/10" : "bg-white/[0.01] border-white/5 opacity-50"}`}>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <Tag className={`w-5 h-5 shrink-0 ${c.active ? "text-violet-400" : "text-white/20"}`} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3">
                              <p style={font} className="text-base text-white font-medium tracking-wider">{c.code}</p>
                              {isExhausted && (
                                <span style={font} className="text-[9px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Limit Reached</span>
                              )}
                              {!isExhausted && isNearLimit && (
                                <span style={font} className="text-[9px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Near Limit</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              {c.product_discounts && Object.keys(c.product_discounts).length > 0 ? (
                                <span style={font} className="text-xs text-cyan-400/60 flex items-center gap-1">
                                  <Package className="w-3 h-3" />
                                  {Object.entries(c.product_discounts).map(([pid, d], i) => {
                                    const pName = products.find((p) => p.id === pid)?.name || pid;
                                    const label = d.percent ? `${d.percent}%` : `$${d.fixed}`;
                                    return <span key={pid}>{i > 0 ? ", " : ""}{pName} ({label})</span>;
                                  })}
                                </span>
                              ) : (
                                <span style={font} className="text-xs text-white/40">
                                  {c.discount_percent > 0 ? `${c.discount_percent}% off` : c.discount_fixed > 0 ? `$${Number(c.discount_fixed).toFixed(2)} off` : "No discount"}
                                </span>
                              )}
                              {c.sales_reps && (
                                <span style={font} className="text-xs text-violet-400/60 flex items-center gap-1">
                                  <Users className="w-3 h-3" /> {c.sales_reps.name}
                                </span>
                              )}
                              {c.expires_at && (
                                <span style={font} className="text-xs text-white/25">
                                  exp {new Date(c.expires_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>

                            {/* Usage tracking bar */}
                            <div className="mt-3 max-w-xs">
                              <div className="flex items-center justify-between mb-1">
                                <span style={font} className="text-[10px] text-white/30 tracking-[0.1em] uppercase">Usage</span>
                                <span style={font} className="text-[10px] text-white/40 flex items-center gap-1">
                                  {c.times_used}
                                  {c.max_uses !== null ? (
                                    <> / {c.max_uses}</>
                                  ) : (
                                    <span className="inline-flex items-center gap-0.5 text-white/25">/ <Infinity className="w-3 h-3" /></span>
                                  )}
                                </span>
                              </div>
                              {c.max_uses !== null ? (
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      isExhausted ? "bg-red-400" : isNearLimit ? "bg-amber-400" : "bg-emerald-400"
                                    }`}
                                    style={{ width: `${Math.min((c.times_used / c.max_uses) * 100, 100)}%` }}
                                  />
                                </div>
                              ) : (
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full bg-violet-400/40" style={{ width: c.times_used > 0 ? "100%" : "0%" }} />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => isEditing ? setEditingCode(null) : startEditing(c)}
                            className={`p-2 rounded-lg transition-colors ${isEditing ? "text-violet-400 bg-violet-400/10" : "text-white/30 hover:text-white hover:bg-white/5"}`}
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleCode(c.id, !c.active)}
                            className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors"
                            title={c.active ? "Deactivate" : "Activate"}
                          >
                            {c.active ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => deleteCode(c.id)}
                            className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Inline edit panel */}
                      {isEditing && (
                        <div className="border-t border-white/5 px-5 pb-5 pt-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            <div>
                              <label style={font} className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/30 block mb-2">Code</label>
                              <input
                                type="text"
                                value={editData.code}
                                onChange={(e) => setEditData({ ...editData, code: e.target.value.toUpperCase() })}
                                placeholder="e.g. SAVE20"
                                className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-white/30"
                                style={font}
                              />
                            </div>
                            <div>
                              <label style={font} className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/30 block mb-2">Max Uses</label>
                              <input
                                type="number"
                                value={editData.maxUses}
                                onChange={(e) => setEditData({ ...editData, maxUses: e.target.value })}
                                placeholder="Unlimited"
                                min="0"
                                className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-white/30"
                                style={font}
                              />
                              <p style={font} className="text-[9px] text-white/20 mt-1">Leave blank for unlimited</p>
                            </div>
                            {Object.keys(editData.productDiscounts).length === 0 && (
                              <>
                                <div>
                                  <label style={font} className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/30 block mb-2">Discount %</label>
                                  <input
                                    type="number"
                                    value={editData.discountPercent}
                                    onChange={(e) => setEditData({ ...editData, discountPercent: e.target.value, discountFixed: "" })}
                                    placeholder="e.g. 15"
                                    className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-white/30"
                                    style={font}
                                  />
                                </div>
                                <div>
                                  <label style={font} className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/30 block mb-2">Fixed $ Discount</label>
                                  <input
                                    type="number"
                                    value={editData.discountFixed}
                                    onChange={(e) => setEditData({ ...editData, discountFixed: e.target.value, discountPercent: "" })}
                                    placeholder="e.g. 25"
                                    className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-white/30"
                                    style={font}
                                  />
                                </div>
                              </>
                            )}
                            <div>
                              <label style={font} className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/30 block mb-2">Linked Sales Rep</label>
                              <select
                                value={editData.salesRepId}
                                onChange={(e) => setEditData({ ...editData, salesRepId: e.target.value })}
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/30"
                                style={font}
                              >
                                <option value="">None (general discount)</option>
                                {reps.filter((r) => r.active).map((rep) => (
                                  <option key={rep.id} value={rep.id}>{rep.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label style={font} className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/30 block mb-2">Expires</label>
                              <input
                                type="date"
                                value={editData.expiresAt}
                                onChange={(e) => setEditData({ ...editData, expiresAt: e.target.value })}
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/30"
                                style={font}
                              />
                            </div>
                          </div>
                          {products.length > 0 && (
                            <div className="mb-4">
                              <label style={font} className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/30 block mb-2">
                                Per-product discounts
                              </label>
                              <p style={font} className="text-[9px] text-white/20 mb-3">Select products and set individual discount amounts. Leave all unselected to use the global discount above for all products.</p>
                              <div className="flex flex-col gap-2">
                                {products.map((p) => {
                                  const entry = editData.productDiscounts[p.id];
                                  const selected = !!entry;
                                  return (
                                    <div key={p.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                                      selected ? "bg-cyan-400/5 border-cyan-400/20" : "bg-white/[0.01] border-white/5"
                                    }`}>
                                      <button
                                        type="button"
                                        onClick={() => setEditData((prev) => {
                                          const next = { ...prev.productDiscounts };
                                          if (selected) { delete next[p.id]; } else { next[p.id] = { type: "percent", value: "" }; }
                                          return { ...prev, productDiscounts: next };
                                        })}
                                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                                          selected ? "bg-cyan-400 border-cyan-400" : "border-white/20 hover:border-white/40"
                                        }`}
                                      >
                                        {selected && <Check className="w-3 h-3 text-black" />}
                                      </button>
                                      <span style={font} className={`text-sm flex-1 min-w-0 ${selected ? "text-white" : "text-white/40"}`}>{p.name}</span>
                                      {selected && (
                                        <div className="flex items-center gap-2 shrink-0">
                                          <select
                                            value={entry.type}
                                            onChange={(e) => setEditData((prev) => ({
                                              ...prev,
                                              productDiscounts: { ...prev.productDiscounts, [p.id]: { ...prev.productDiscounts[p.id], type: e.target.value as "percent" | "fixed" } },
                                            }))}
                                            className="bg-[#0a0a0a] border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-white/30"
                                            style={font}
                                          >
                                            <option value="percent">%</option>
                                            <option value="fixed">$</option>
                                          </select>
                                          <input
                                            type="number"
                                            value={entry.value}
                                            onChange={(e) => setEditData((prev) => ({
                                              ...prev,
                                              productDiscounts: { ...prev.productDiscounts, [p.id]: { ...prev.productDiscounts[p.id], value: e.target.value } },
                                            }))}
                                            placeholder={entry.type === "percent" ? "e.g. 10" : "e.g. 5"}
                                            className="w-20 bg-transparent border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs placeholder:text-white/15 focus:outline-none focus:border-white/30"
                                            style={font}
                                            min="0"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={saveEdit}
                              disabled={saving || !editData.code.trim()}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black text-xs font-bold tracking-[0.1em] uppercase hover:bg-white/90 transition-colors disabled:opacity-30"
                              style={font}
                            >
                              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                              Save
                            </button>
                            <button
                              onClick={() => setEditingCode(null)}
                              className="px-5 py-2.5 rounded-xl text-white/40 text-xs font-bold tracking-[0.1em] uppercase hover:text-white hover:bg-white/5 transition-colors"
                              style={font}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {codes.length === 0 && (
                  <div className="text-center py-16">
                    <Tag className="w-10 h-10 text-white/10 mx-auto mb-4" />
                    <p style={font} className="text-sm text-white/30">No promo codes yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sales Reps Tab */}
          {activeTab === "reps" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 style={font} className="text-xs font-bold tracking-[0.2em] uppercase text-white/40">Sales Representatives</h2>
                <button
                  onClick={() => setShowNewRep(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black text-xs font-bold tracking-[0.1em] uppercase hover:bg-white/90 transition-colors"
                  style={font}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Add Rep
                </button>
              </div>

              {/* New Rep Form */}
              {showNewRep && (
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 style={font} className="text-sm text-white font-medium">Add Sales Rep</h3>
                    <button onClick={() => setShowNewRep(false)} className="text-white/30 hover:text-white"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label style={font} className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/30 block mb-2">Name</label>
                      <input
                        value={newRep.name}
                        onChange={(e) => setNewRep({ ...newRep, name: e.target.value })}
                        placeholder="Phil Jackson"
                        className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-white/30"
                        style={font}
                      />
                    </div>
                    <div>
                      <label style={font} className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/30 block mb-2">Email (optional)</label>
                      <input
                        value={newRep.email}
                        onChange={(e) => setNewRep({ ...newRep, email: e.target.value })}
                        placeholder="phil@example.com"
                        className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-white/30"
                        style={font}
                      />
                    </div>
                  </div>
                  <button
                    onClick={createSalesRep}
                    disabled={saving || !newRep.name.trim()}
                    className="px-6 py-3 rounded-xl bg-white text-black text-xs font-bold tracking-[0.1em] uppercase hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    style={font}
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Rep"}
                  </button>
                </div>
              )}

              {/* Rep Analytics */}
              <div className="flex flex-col gap-4">
                {analytics.map((rep) => (
                  <div key={rep.id} className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                      <div>
                        <h3 style={font} className="text-lg text-white font-light">{rep.name}</h3>
                        {rep.email && <p style={font} className="text-xs text-white/30 mt-1">{rep.email}</p>}
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p style={font} className="text-xl text-white font-light">{rep.accountCount}</p>
                          <p style={font} className="text-[9px] text-white/30 tracking-[0.15em] uppercase">Accounts</p>
                        </div>
                        <div className="text-center">
                          <p style={font} className="text-xl text-white font-light">{rep.orderCount}</p>
                          <p style={font} className="text-[9px] text-white/30 tracking-[0.15em] uppercase">Orders</p>
                        </div>
                        <div className="text-center">
                          <p style={font} className="text-xl text-emerald-400 font-light">${rep.totalRevenue.toFixed(0)}</p>
                          <p style={font} className="text-[9px] text-white/30 tracking-[0.15em] uppercase">Revenue</p>
                        </div>
                        <button
                          onClick={() => deleteRep(rep.id)}
                          className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-colors ml-2"
                          title="Delete rep"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {rep.accounts.length > 0 && (
                      <div className="border-t border-white/5 pt-4 mt-2">
                        <p style={font} className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/20 mb-3">Attributed Accounts</p>
                        <div className="flex flex-wrap gap-2">
                          {rep.accounts.map((acc) => (
                            <span key={acc.id} style={font} className="text-xs text-white/50 bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/5">
                              {acc.email}
                              {acc.referred_by_code && <span className="text-white/20 ml-2">via {acc.referred_by_code}</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {analytics.length === 0 && (
                  <div className="text-center py-16">
                    <Users className="w-10 h-10 text-white/10 mx-auto mb-4" />
                    <p style={font} className="text-sm text-white/30">No sales reps yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
          </>
          )}
        </div>
      </div>
    </main>
  );
}
