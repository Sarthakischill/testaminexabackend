"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Package,
  Loader2,
  LogOut,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Archive,
  ArchiveRestore,
  DollarSign,
  Clock,
  AlertCircle,
  RefreshCw,
  Mail,
  CreditCard,
  BookOpen,
} from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type Order = {
  id: string;
  status: string;
  total: number;
  subtotal: number;
  items: { name: string; quantity: number; price: number }[];
  order_number: string | null;
  created_at: string;
  shipping_name: string;
  shipping_email: string;
  archived: boolean;
  zelle_screenshot_url: string | null;
  payment_method: string | null;
  promo_code: string | null;
  attributed_rep_id: string | null;
};

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; dot: string }
> = {
  awaiting_payment: {
    label: "Awaiting",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    dot: "bg-orange-400",
  },
  pending: {
    label: "Pending",
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

const filterTabs = [
  "all",
  "pending",
  "awaiting_payment",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

const font = { fontFamily: "Helvetica, Arial, sans-serif" } as const;

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [stats, setStats] = useState<{ needsAttention: number; revenue: number; todayCount: number } | null>(null);
  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeFilter !== "all") params.set("status", activeFilter);
      if (searchQuery) params.set("search", searchQuery);
      params.set("page", String(page));
      if (showArchived) params.set("archived", "true");

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!res.ok) {
        toast.error("Failed to load orders");
        return;
      }
      const data = await res.json();
      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
      setTotalOrders(data.total || 0);
      if (data.stats) setStats(data.stats);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [activeFilter, searchQuery, page, showArchived]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    setPage(1);
  }, [activeFilter, searchQuery, showArchived]);

  const handleSearchInput = (value: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearchQuery(value);
    }, 350);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const toggleArchive = async (orderId: string, archive: boolean) => {
    setArchivingId(orderId);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, archived: archive } : o)));
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: archive }),
      });
      if (!res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, archived: !archive } : o)));
        toast.error("Failed to update order");
      } else {
        toast.success(archive ? "Order archived" : "Order unarchived");
        fetchOrders();
      }
    } catch {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, archived: !archive } : o)));
      toast.error("Failed to update order");
    }
    setArchivingId(null);
  };

  const pendingCount = stats?.needsAttention ?? orders.filter((o) => o.status === "pending" || o.status === "awaiting_payment").length;
  const revenue = stats?.revenue ?? orders.filter((o) => o.status !== "cancelled" && !o.archived).reduce((s, o) => s + o.total, 0);
  const todayCount = stats?.todayCount ?? orders.filter((o) => new Date(o.created_at).toDateString() === new Date().toDateString()).length;

  return (
    <main className="relative min-h-screen w-full bg-[#050505] selection:bg-white/20 selection:text-white">
      {/* Header */}
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
                AmiNexa Admin
              </h1>
              <p style={font} className="text-[10px] text-white/30 tracking-[0.1em] uppercase">
                Order Manager
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/products"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Package className="w-4 h-4" />
              <span style={font} className="text-xs tracking-[0.1em] uppercase hidden sm:inline">
                Products
              </span>
            </Link>
            <Link
              href="/admin/promo"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
            >
              <DollarSign className="w-4 h-4" />
              <span style={font} className="text-xs tracking-[0.1em] uppercase hidden sm:inline">
                Promo
              </span>
            </Link>
            <Link
              href="/admin/emails"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span style={font} className="text-xs tracking-[0.1em] uppercase hidden sm:inline">
                Emails
              </span>
            </Link>
            <Link
              href="/admin/qbo-connect"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              <span style={font} className="text-xs tracking-[0.1em] uppercase hidden sm:inline">
                QBO
              </span>
            </Link>
            <Link
              href="/admin/docs"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span style={font} className="text-xs tracking-[0.1em] uppercase hidden sm:inline">
                Docs
              </span>
            </Link>
            <button
              onClick={fetchOrders}
              className="text-white/30 hover:text-white transition-colors p-2"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-white/40 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span style={font} className="text-xs tracking-[0.1em] uppercase hidden sm:inline">
                Sign Out
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 pt-28 pb-20">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            {
              icon: Package,
              label: "Total Orders",
              value: totalOrders,
              sub: `Page ${page} of ${totalPages}`,
            },
            {
              icon: AlertCircle,
              label: "Needs Attention",
              value: pendingCount,
              highlight: pendingCount > 0,
              sub: "Awaiting verification",
            },
            {
              icon: DollarSign,
              label: "Store Revenue",
              value: `$${revenue.toFixed(0)}`,
              sub: `${totalOrders} total orders`,
            },
            {
              icon: Clock,
              label: "Today",
              value: todayCount,
              sub: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 md:p-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <stat.icon className="w-3.5 h-3.5 text-white/20" strokeWidth={1.5} />
                <p style={font} className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/30">
                  {stat.label}
                </p>
              </div>
              <p
                style={font}
                className={`text-2xl md:text-3xl font-light ${
                  stat.highlight ? "text-amber-400" : "text-white"
                }`}
              >
                {stat.value}
              </p>
              <p style={font} className="text-[10px] text-white/20 mt-1">
                {stat.sub}
              </p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                onChange={(e) => handleSearchInput(e.target.value)}
                placeholder="Search by name, email, or order number..."
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                style={font}
              />
            </div>

            {/* Archive toggle */}
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors shrink-0 ${
                showArchived
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-white/[0.02] border-white/10 text-white/40 hover:text-white/80"
              }`}
            >
              {showArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
              <span style={font} className="text-xs font-bold tracking-[0.1em] uppercase">
                {showArchived ? "Show Active" : "Show Archived"}
              </span>
            </button>
          </div>

          {/* Status tabs */}
          <div className="flex items-center gap-1 flex-wrap">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-2 rounded-lg text-[10px] font-bold tracking-[0.1em] uppercase transition-colors ${
                  activeFilter === tab
                    ? "bg-white text-black"
                    : "text-white/40 hover:text-white/80 hover:bg-white/5"
                }`}
                style={font}
              >
                {tab === "all" ? "All" : statusConfig[tab]?.label || tab}
              </button>
            ))}
          </div>
        </div>

        {/* Orders */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Package className="w-16 h-16 text-white/10 mb-8" strokeWidth={1} />
            <h2 style={font} className="text-xl text-white/40 font-light mb-2">
              {showArchived ? "No archived orders" : "No orders found"}
            </h2>
            <p style={font} className="text-sm text-white/20 font-light">
              {searchQuery
                ? "Try a different search term"
                : showArchived
                ? "Archived orders will appear here"
                : "Orders will appear here once placed"}
            </p>
          </div>
        ) : (
          <>
            {/* Header Row */}
            <div
              className="hidden md:grid grid-cols-[1fr_1fr_80px_80px_90px_100px_80px] gap-3 px-6 py-3 text-[10px] font-bold tracking-[0.15em] uppercase text-white/30"
              style={font}
            >
              <span>Customer</span>
              <span>Items</span>
              <span>Date</span>
              <span>Payment</span>
              <span>Total</span>
              <span>Status</span>
              <span></span>
            </div>

            <div className="flex flex-col gap-2">
              <AnimatePresence mode="popLayout">
                {orders.map((order, idx) => {
                  const cfg =
                    statusConfig[order.status] || statusConfig.pending;
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.02 }}
                      className="group relative"
                    >
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className={`grid grid-cols-1 md:grid-cols-[1fr_1fr_80px_80px_90px_100px_80px] gap-2 md:gap-3 items-center px-6 py-5 border border-white/10 rounded-xl hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300 ${
                          order.status === "pending"
                            ? "bg-amber-400/[0.02] border-amber-400/10"
                            : "bg-white/[0.02]"
                        }`}
                      >
                        {/* Customer */}
                        <div className="min-w-0">
                          <p style={font} className="text-sm text-white font-light truncate">
                            {order.shipping_name}
                          </p>
                          <p style={font} className="text-xs text-white/30 truncate">
                            {order.order_number && (
                              <span className="text-white/50 mr-2">
                                {order.order_number}
                              </span>
                            )}
                            {order.shipping_email}
                          </p>
                        </div>

                        {/* Items */}
                        <p
                          style={font}
                          className="text-xs text-white/50 font-light truncate"
                        >
                          {order.items
                            .map((i) => `${i.name} ×${i.quantity}`)
                            .join(", ")}
                        </p>

                        {/* Date */}
                        <span style={font} className="text-xs text-white/40 whitespace-nowrap">
                          {new Date(order.created_at).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" }
                          )}
                        </span>

                        {/* Payment & Promo */}
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`text-[8px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-full shrink-0 ${
                            order.payment_method === "crypto"
                              ? "bg-blue-400/10 text-blue-400"
                              : order.payment_method === "credit_card"
                              ? "bg-orange-400/10 text-orange-400"
                              : "bg-emerald-400/10 text-emerald-400"
                          }`}>
                            {order.payment_method === "crypto" ? "USDC" : order.payment_method === "credit_card" ? "CC" : "Zelle"}
                          </span>
                          {order.promo_code && (
                            <span className="text-[8px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-violet-400/10 text-violet-400 truncate max-w-[60px]" title={order.promo_code}>
                              {order.promo_code}
                            </span>
                          )}
                        </div>

                        {/* Total */}
                        <span style={font} className="text-sm text-white font-light whitespace-nowrap">
                          ${order.total.toFixed(2)}
                        </span>

                        {/* Status */}
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.1em] uppercase px-2.5 py-1 rounded-full w-fit whitespace-nowrap ${cfg.color} ${cfg.bg}`}
                          style={font}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`}
                          />
                          {cfg.label}
                        </span>

                        {/* Actions */}
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleArchive(order.id, !order.archived);
                            }}
                            disabled={archivingId === order.id}
                            className="p-1.5 rounded-lg text-white/20 hover:text-white/60 hover:bg-white/5 transition-colors"
                            title={
                              order.archived
                                ? "Unarchive order"
                                : "Archive order"
                            }
                          >
                            {archivingId === order.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : order.archived ? (
                              <ArchiveRestore className="w-3.5 h-3.5" />
                            ) : (
                              <Archive className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <ArrowUpRight className="w-4 h-4 text-white/10 group-hover:text-white/60 transition-colors hidden md:block" />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                <p style={font} className="text-xs text-white/30">
                  {totalOrders} order{totalOrders !== 1 ? "s" : ""} total
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span style={font} className="text-xs tracking-wider uppercase">
                      Prev
                    </span>
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                            page === pageNum
                              ? "bg-white text-black"
                              : "text-white/40 hover:text-white hover:bg-white/5"
                          }`}
                          style={font}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={page >= totalPages}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    <span style={font} className="text-xs tracking-wider uppercase">
                      Next
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
