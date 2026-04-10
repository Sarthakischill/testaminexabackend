"use client";

import { useState, useEffect, use, useCallback } from "react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  Check,
  Truck,
  X,
  Package,
  Clock,
  Archive,
  ArchiveRestore,
  ExternalLink,
  ImageOff,
  Save,
  Trash2,
  AlertTriangle,
  Info,
} from "lucide-react";

type OrderItem = {
  product_id: string;
  name: string;
  quantity: number;
  price: number;
  volume: string;
};

type Order = {
  id: string;
  status: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  shipping_name: string;
  shipping_email: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  zelle_screenshot_url: string | null;
  order_number: string | null;
  payment_method: string | null;
  promo_code: string | null;
  promo_discount: number;
  payment_discount: number;
  attributed_rep_id: string | null;
  notes: string | null;
  admin_notes: string | null;
  tracking_number: string | null;
  carrier_code: string | null;
  service_code: string | null;
  service_name: string | null;
  shipstation_order_id: string | null;
  estimated_delivery: string | null;
  shipping_fee: number;
  cold_chain: boolean;
  cold_chain_fee: number;
  archived: boolean;
  created_at: string;
  updated_at: string;
  qbo_invoice_id: string | null;
  confirmed_at: string | null;
  shipped_at: string | null;
};

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; dot: string }
> = {
  awaiting_payment: {
    label: "Awaiting Payment",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    dot: "bg-orange-400",
  },
  pending: {
    label: "Pending Verification",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    dot: "bg-amber-400",
  },
  confirmed: {
    label: "Confirmed",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    dot: "bg-emerald-400",
  },
  processing: {
    label: "Processing",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    dot: "bg-blue-400",
  },
  shipped: {
    label: "Shipped",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    dot: "bg-purple-400",
  },
  delivered: {
    label: "Delivered",
    color: "text-white/60",
    bg: "bg-white/5",
    dot: "bg-white/60",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-400",
    bg: "bg-red-400/10",
    dot: "bg-red-400",
  },
};

const font = { fontFamily: "Helvetica, Arial, sans-serif" } as const;

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [showTrackingInput, setShowTrackingInput] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [screenshotLoading, setScreenshotLoading] = useState(false);
  const [screenshotError, setScreenshotError] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [repName, setRepName] = useState<string | null>(null);

  useEffect(() => {
    setRepName(null);
    setScreenshotUrl(null);
    setScreenshotError(false);
    fetch(`/api/admin/orders/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load order");
        return r.json();
      })
      .then((data) => {
        setOrder(data.order || null);
        setAdminNotes(data.order?.admin_notes || "");
        if (data.order?.attributed_rep_id) {
          fetch("/api/admin/sales-reps")
            .then((r) => r.json())
            .then((repData) => {
              const rep = repData.reps?.find((r: { id: string }) => r.id === data.order.attributed_rep_id);
              if (rep) setRepName(rep.name);
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        toast.error("Failed to load order");
        setOrder(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const loadScreenshot = useCallback(async (path: string) => {
    setScreenshotLoading(true);
    setScreenshotError(false);
    try {
      const res = await fetch(
        `/api/admin/screenshot?path=${encodeURIComponent(path)}`
      );
      const data = await res.json();
      if (data.url) {
        setScreenshotUrl(data.url);
      } else {
        setScreenshotError(true);
      }
    } catch {
      setScreenshotError(true);
    }
    setScreenshotLoading(false);
  }, []);

  useEffect(() => {
    if (order?.zelle_screenshot_url) {
      const path = order.zelle_screenshot_url;
      if (path.startsWith("http")) {
        setScreenshotUrl(path);
      } else {
        loadScreenshot(path);
      }
    }
  }, [order?.zelle_screenshot_url, loadScreenshot]);

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    let success = false;
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          trackingNumber: trackingNumber || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setOrder(data.order);
        success = true;
        const labels: Record<string, string> = {
          confirmed: "Payment confirmed",
          shipped: "Order marked as shipped",
          delivered: "Order marked as delivered",
          cancelled: "Order cancelled",
        };
        toast.success(labels[newStatus] || "Status updated");
        if (data.shipstationWarning) {
          toast.error(`ShipStation: ${data.shipstationWarning}`, { duration: 8000 });
        }
      } else {
        toast.error(data.error || "Failed to update status");
      }
    } catch {
      toast.error("Failed to update status");
    }
    setUpdating(false);
    if (success) setShowTrackingInput(false);
  };

  const toggleArchive = async () => {
    if (!order) return;
    const newArchived = !order.archived;
    setUpdating(true);
    setOrder((prev) => prev ? { ...prev, archived: newArchived } : prev);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: newArchived }),
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setOrder(data.order);
        toast.success(newArchived ? "Order archived" : "Order unarchived");
      } else {
        setOrder((prev) => prev ? { ...prev, archived: !newArchived } : prev);
        toast.error("Failed to update order");
      }
    } catch {
      setOrder((prev) => prev ? { ...prev, archived: !newArchived } : prev);
      toast.error("Failed to update order");
    }
    setUpdating(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Order permanently deleted");
        router.push("/admin");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete order");
      }
    } catch {
      toast.error("Failed to delete order");
    }
    setDeleting(false);
    setShowDeleteConfirm(false);
  };

  const saveNotes = async () => {
    setNotesSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: adminNotes }),
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setOrder(data.order);
        setNotesSaved(true);
        setTimeout(() => setNotesSaved(false), 2000);
        toast.success("Notes saved");
      } else {
        toast.error(data.error || "Failed to save notes");
      }
    } catch {
      toast.error("Failed to save notes");
    }
    setNotesSaving(false);
  };

  const cfg = statusConfig[order?.status || "pending"] || statusConfig.pending;

  return (
    <main className="relative min-h-screen w-full bg-[#050505] selection:bg-white/20 selection:text-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
        <div className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-10 h-10">
              <Image
                src="https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/Logos/AmiNexa/AmiNexa_favicon_128_white.png/public"
                alt="AmiNexa"
                fill
                sizes="40px"
                className="object-contain"
              />
            </div>
            <div>
              <h1 style={font} className="text-sm font-medium text-white tracking-wide">
                Order Detail
              </h1>
              <p style={font} className="text-[10px] text-white/30 tracking-[0.1em] uppercase font-mono">
                {order?.order_number || id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
          {order && (
            <div className="flex items-center gap-3">
              {order.archived && (
                <span style={font} className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/20 border border-white/10 px-2 py-1 rounded-lg">
                  Archived
                </span>
              )}
              <button
                onClick={toggleArchive}
                disabled={updating}
                className="flex items-center gap-2 text-white/40 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
                title={order.archived ? "Unarchive" : "Archive"}
              >
                {order.archived ? (
                  <ArchiveRestore className="w-4 h-4" />
                ) : (
                  <Archive className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 pt-28 pb-20">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span style={font} className="text-xs font-medium tracking-[0.1em] uppercase">
            All Orders
          </span>
        </Link>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
          </div>
        ) : !order ? (
          <div className="text-center py-24">
            <h2 style={font} className="text-2xl text-white/40 font-light">
              Order not found
            </h2>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            {/* Status + Actions */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`inline-flex items-center gap-2 text-xs font-bold tracking-[0.15em] uppercase px-3 py-1.5 rounded-full ${cfg.color} ${cfg.bg}`}
                    style={font}
                  >
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                  {order.order_number && (
                    <span style={font} className="text-sm text-white/40 font-mono tracking-wider">
                      {order.order_number}
                    </span>
                  )}
                </div>
                <p style={font} className="text-xs text-white/30">
                  Placed{" "}
                  {new Date(order.created_at).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {(order.status === "pending" || order.status === "awaiting_payment") && (
                  <button
                    onClick={() => updateStatus("confirmed")}
                    disabled={updating}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 text-black text-xs font-bold tracking-[0.1em] uppercase hover:bg-emerald-400 transition-colors disabled:opacity-50"
                    style={font}
                  >
                    {updating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    Confirm Payment
                  </button>
                )}

                {order.status === "confirmed" && (
                  <>
                    {showTrackingInput ? (
                      <div className="flex flex-col gap-2 items-end">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            placeholder="Tracking # (optional)"
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 w-48"
                            style={font}
                          />
                          <button
                            onClick={() => updateStatus("shipped")}
                            disabled={updating}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-500 text-white text-xs font-bold tracking-[0.1em] uppercase hover:bg-purple-400 transition-colors disabled:opacity-50"
                            style={font}
                          >
                            {updating ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Truck className="w-3.5 h-3.5" />
                            )}
                            Ship
                          </button>
                        </div>
                        <div className="flex items-start gap-1.5 max-w-sm">
                          <Info className="w-3 h-3 text-amber-400/60 shrink-0 mt-0.5" />
                          <p style={font} className="text-[10px] text-white/30 leading-relaxed">
                            This order will automatically update to &ldquo;shipped&rdquo; when a label is created in ShipStation. Only use this button if shipping outside of ShipStation.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowTrackingInput(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-500 text-white text-xs font-bold tracking-[0.1em] uppercase hover:bg-purple-400 transition-colors"
                        style={font}
                      >
                        <Truck className="w-3.5 h-3.5" />
                        Mark Shipped
                      </button>
                    )}
                  </>
                )}

                {order.status === "shipped" && (
                  <button
                    onClick={() => updateStatus("delivered")}
                    disabled={updating}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 text-white text-xs font-bold tracking-[0.1em] uppercase hover:bg-white/20 transition-colors disabled:opacity-50"
                    style={font}
                  >
                    {updating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Package className="w-3.5 h-3.5" />
                    )}
                    Mark Delivered
                  </button>
                )}

                {["pending", "awaiting_payment", "confirmed"].includes(order.status) && (
                  <button
                    onClick={() => updateStatus("cancelled")}
                    disabled={updating}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-red-500/20 text-red-400 text-xs font-bold tracking-[0.1em] uppercase hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    style={font}
                  >
                    <X className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                {/* Order Items */}
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8">
                  <h3 style={font} className="text-xs font-bold tracking-[0.2em] uppercase text-white/30 mb-6">
                    Items ({order.items.length})
                  </h3>
                  {order.items.map((item: OrderItem, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-4 border-b border-white/5 last:border-0"
                    >
                      <div>
                        <span style={font} className="text-sm text-white font-light">
                          {item.name}
                        </span>
                        <span style={font} className="text-xs text-white/30 ml-2">
                          {item.volume} &times;{item.quantity}
                        </span>
                      </div>
                      <div className="text-right">
                        <span style={font} className="text-sm text-white font-light">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        {item.quantity > 1 && (
                          <p style={font} className="text-[10px] text-white/20">
                            ${item.price.toFixed(2)} each
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 mt-2 border-t border-white/10 flex flex-col gap-2">
                    {order.subtotal != null && (
                      <div className="flex justify-between">
                        <span style={font} className="text-xs text-white/40">
                          Subtotal
                        </span>
                        <span style={font} className="text-xs text-white/40">
                          ${order.subtotal.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {order.payment_method !== "credit_card" && Number(order.payment_discount || 0) > 0 && (
                      <div className="flex justify-between">
                        <span style={font} className={`text-xs ${order.payment_method === "crypto" ? "text-blue-400/70" : "text-emerald-400/70"}`}>
                          {order.payment_method === "crypto" ? "USDC Discount (10%)" : "Zelle Discount (10%)"}
                        </span>
                        <span style={font} className={`text-xs ${order.payment_method === "crypto" ? "text-blue-400/70" : "text-emerald-400/70"}`}>
                          -${Number(order.payment_discount).toFixed(2)}
                        </span>
                      </div>
                    )}
                    {order.promo_code && Number(order.promo_discount) > 0 && (
                      <div className="flex justify-between">
                        <span style={font} className="text-xs text-violet-400/70 flex items-center gap-1.5">
                          Promo: {order.promo_code}
                        </span>
                        <span style={font} className="text-xs text-violet-400/70">
                          -${Number(order.promo_discount).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span style={font} className="text-xs text-white/40">
                        Shipping{order.service_name ? ` (${order.service_name})` : ""}
                      </span>
                      <span style={font} className={`text-xs ${Number(order.shipping_fee) > 0 ? "text-white/40" : "text-emerald-400/70"}`}>
                        {Number(order.shipping_fee) > 0 ? `$${Number(order.shipping_fee).toFixed(2)}` : "Free"}
                      </span>
                    </div>
                    {order.cold_chain && Number(order.cold_chain_fee) > 0 && (
                      <div className="flex justify-between">
                        <span style={font} className="text-xs text-cyan-400/70">
                          Cold Chain
                        </span>
                        <span style={font} className="text-xs text-cyan-400/70">
                          ${Number(order.cold_chain_fee).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-white/5">
                      <span style={font} className="text-base text-white">
                        Total
                      </span>
                      <span style={font} className="text-xl text-white font-light">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sales Rep Attribution */}
                {order.attributed_rep_id && (
                  <div className="bg-violet-500/[0.04] border border-violet-500/10 rounded-2xl p-5">
                    <p style={font} className="text-[10px] font-bold tracking-[0.15em] uppercase text-violet-400/50 mb-1">Attributed Sales Rep</p>
                    <p style={font} className="text-sm text-violet-300/80">{repName || order.attributed_rep_id}</p>
                  </div>
                )}

                {/* Payment Screenshot (only for Zelle/USDC) */}
                {order.payment_method !== "credit_card" && (
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 style={font} className="text-xs font-bold tracking-[0.2em] uppercase text-white/30">
                      {order.payment_method === "crypto" ? "USDC Payment Proof" : "Zelle Payment Proof"}
                    </h3>
                    {screenshotUrl && (
                      <a
                        href={screenshotUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-white/30 hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span style={font} className="text-[10px] tracking-wider uppercase">
                          Open Full
                        </span>
                      </a>
                    )}
                  </div>

                  {screenshotLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
                    </div>
                  ) : screenshotUrl ? (
                    <div className="relative w-full max-w-md rounded-xl overflow-hidden border border-white/10 bg-black/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={screenshotUrl}
                        alt="Payment screenshot"
                        className="w-full h-auto object-contain max-h-[600px]"
                      />
                    </div>
                  ) : screenshotError ? (
                    <div className="flex flex-col items-center py-12 text-center">
                      <ImageOff className="w-10 h-10 text-white/10 mb-4" strokeWidth={1} />
                      <p style={font} className="text-sm text-white/30 font-light mb-3">
                        Failed to load screenshot
                      </p>
                      {order.zelle_screenshot_url && (
                        <button
                          onClick={() => loadScreenshot(order.zelle_screenshot_url!)}
                          className="text-xs text-white/40 hover:text-white underline transition-colors"
                          style={font}
                        >
                          Retry
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-12 text-center">
                      <ImageOff className="w-10 h-10 text-white/10 mb-4" strokeWidth={1} />
                      <p style={font} className="text-sm text-white/30 font-light">
                        No screenshot uploaded
                      </p>
                    </div>
                  )}
                </div>
                )}

                {/* Admin Notes */}
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8">
                  <h3 style={font} className="text-xs font-bold tracking-[0.2em] uppercase text-white/30 mb-4">
                    Internal Notes
                  </h3>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => {
                      setAdminNotes(e.target.value);
                      setNotesSaved(false);
                    }}
                    rows={3}
                    placeholder="Add internal notes about this order..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-light placeholder:text-white/15 focus:outline-none focus:border-white/25 transition-colors resize-none"
                    style={font}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <p style={font} className="text-[10px] text-white/20">
                      Only visible to admins
                    </p>
                    <button
                      onClick={saveNotes}
                      disabled={notesSaving}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
                    >
                      {notesSaving ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : notesSaved ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Save className="w-3 h-3" />
                      )}
                      <span style={font} className={`text-[10px] font-bold tracking-wider uppercase ${notesSaved ? "text-emerald-400" : ""}`}>
                        {notesSaved ? "Saved" : "Save"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-6">
                {/* Customer */}
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                  <h3 style={font} className="text-xs font-bold tracking-[0.2em] uppercase text-white/30 mb-5">
                    Customer
                  </h3>
                  <p style={font} className="text-lg text-white font-light mb-1">
                    {order.shipping_name}
                  </p>
                  <a
                    href={`mailto:${order.shipping_email}`}
                    style={font}
                    className="text-sm text-blue-400/70 hover:text-blue-400 transition-colors"
                  >
                    {order.shipping_email}
                  </a>
                </div>

                {/* Shipping */}
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                  <h3 style={font} className="text-xs font-bold tracking-[0.2em] uppercase text-white/30 mb-5">
                    Shipping Address
                  </h3>
                  <p style={font} className="text-sm text-white/80 font-light leading-relaxed">
                    {order.shipping_address}
                    <br />
                    {order.shipping_city}, {order.shipping_state}{" "}
                    {order.shipping_zip}
                  </p>
                </div>

                {/* Tracking */}
                {order.tracking_number && (
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                    <h3 style={font} className="text-xs font-bold tracking-[0.2em] uppercase text-white/30 mb-5">
                      Tracking
                    </h3>
                    <p style={font} className="text-sm text-white/80 font-mono tracking-wide">
                      {order.tracking_number}
                    </p>
                  </div>
                )}

                {/* Carrier & ShipStation */}
                {(order.carrier_code || order.shipstation_order_id) && (
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                    <h3 style={font} className="text-xs font-bold tracking-[0.2em] uppercase text-white/30 mb-5">
                      Shipping Details
                    </h3>
                    <div className="flex flex-col gap-3">
                      {order.carrier_code && (
                        <div className="flex justify-between items-center">
                          <span style={font} className="text-xs text-white/30">Carrier</span>
                          <span style={font} className="text-xs text-white/60 uppercase">{order.carrier_code}</span>
                        </div>
                      )}
                      {order.service_name && (
                        <div className="flex justify-between items-center">
                          <span style={font} className="text-xs text-white/30">Service</span>
                          <span style={font} className="text-xs text-white/60">{order.service_name}</span>
                        </div>
                      )}
                      {order.estimated_delivery && (
                        <div className="flex justify-between items-center">
                          <span style={font} className="text-xs text-white/30">Est. Delivery</span>
                          <span style={font} className="text-xs text-white/60">{order.estimated_delivery}</span>
                        </div>
                      )}
                      {order.shipstation_order_id && (
                        <a
                          href={`https://ship.shipstation.com/orders/all-orders?orderIds=${order.shipstation_order_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 mt-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-white/50 hover:text-white hover:bg-white/[0.06] transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span style={font} className="text-xs font-bold tracking-[0.1em] uppercase">
                            View in ShipStation
                          </span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* QBO Invoice */}
                {order.qbo_invoice_id && (
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                    <h3 style={font} className="text-xs font-bold tracking-[0.2em] uppercase text-white/30 mb-5">
                      QuickBooks
                    </h3>
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span style={font} className="text-xs text-white/30">Invoice ID</span>
                        <span style={font} className="text-xs text-white/60 font-mono">{order.qbo_invoice_id}</span>
                      </div>
                      {order.payment_method === "credit_card" && order.status === "awaiting_payment" && (
                        <p style={font} className="text-xs text-orange-400/60 mt-1">
                          Auto-confirms when QBO invoice is paid
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                  <h3 style={font} className="text-xs font-bold tracking-[0.2em] uppercase text-white/30 mb-5">
                    Timeline
                  </h3>
                  <div className="flex flex-col gap-4">
                    <TimelineEntry
                      color="bg-white/40"
                      label="Order placed"
                      date={order.created_at}
                    />
                    {order.confirmed_at && (
                      <TimelineEntry
                        color="bg-emerald-400"
                        label="Payment confirmed"
                        date={order.confirmed_at}
                      />
                    )}
                    {(order.status === "shipped" ||
                      order.status === "delivered") && (
                      <TimelineEntry
                        color="bg-purple-400"
                        label="Order shipped"
                        date={order.shipped_at || order.updated_at}
                      />
                    )}
                    {order.status === "delivered" && (
                      <TimelineEntry
                        color="bg-white/60"
                        label="Delivered"
                        date={order.updated_at}
                      />
                    )}
                    {order.status === "cancelled" && (
                      <TimelineEntry
                        color="bg-red-400"
                        label="Order cancelled"
                        date={order.updated_at}
                      />
                    )}
                    {order.status === "pending" && (
                      <div className="flex items-center gap-3">
                        <Clock className="w-2 h-2 text-amber-400 shrink-0" />
                        <span style={font} className="text-sm text-amber-400/80 font-light">
                          Awaiting {order.payment_method === "crypto" ? "USDC" : "Zelle"} verification
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Notes */}
                {order.notes && (
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                    <h3 style={font} className="text-xs font-bold tracking-[0.2em] uppercase text-white/30 mb-5">
                      Customer Notes
                    </h3>
                    <p style={font} className="text-sm text-white/50 font-light leading-relaxed">
                      {order.notes}
                    </p>
                  </div>
                )}

                {/* Metadata */}
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                  <h3 style={font} className="text-xs font-bold tracking-[0.2em] uppercase text-white/30 mb-5">
                    Metadata
                  </h3>
                  <div className="flex flex-col gap-3">
                    {order.order_number && (
                      <MetaRow label="Order #" value={order.order_number} />
                    )}
                    <MetaRow
                      label="Last Updated"
                      value={new Date(order.updated_at).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        }
                      )}
                    />
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="border border-red-500/10 rounded-2xl p-6">
                  <h3 style={font} className="text-xs font-bold tracking-[0.2em] uppercase text-red-400/40 mb-4">
                    Danger Zone
                  </h3>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-500/20 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm"
                    style={font}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Order
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !deleting && setShowDeleteConfirm(false)}
            />
            <div className="relative bg-[#111] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <h3 style={font} className="text-lg text-white font-medium">Delete Order</h3>
              </div>
              <p style={font} className="text-sm text-white/50 font-light leading-relaxed mb-2">
                This will <strong className="text-white/80">permanently delete</strong> order{" "}
                <span className="text-white/70 font-mono">{order?.order_number || order?.id.slice(0, 8).toUpperCase()}</span>.
              </p>
              <p style={font} className="text-xs text-red-400/60 font-light mb-8">
                This action cannot be undone. The order, its history, and all associated data will be removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
                  style={font}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/30 text-sm text-red-400 hover:bg-red-500/25 transition-all disabled:opacity-50"
                  style={font}
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  {deleting ? "Deleting..." : "Delete Permanently"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function TimelineEntry({
  color,
  label,
  date,
}: {
  color: string;
  label: string;
  date: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full ${color} shrink-0`} />
      <div className="flex items-center gap-2 flex-wrap">
        <span
          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
          className="text-sm text-white/80 font-light"
        >
          {label}
        </span>
        <span
          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
          className="text-xs text-white/30"
        >
          {new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}

function MetaRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span
        style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
        className="text-xs text-white/30"
      >
        {label}
      </span>
      <span
        style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
        className={`text-xs text-white/60 ${mono ? "font-mono" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
