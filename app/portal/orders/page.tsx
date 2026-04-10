"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Package, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useCart } from "@/lib/cart-context";

type Order = {
  id: string;
  status: string;
  total: number;
  items: { name: string; quantity: number }[];
  order_number: string | null;
  created_at: string;
  shipping_name: string;
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  awaiting_payment: { label: "Awaiting Payment", color: "text-orange-400", bg: "bg-orange-400/10" },
  pending: { label: "Pending Verification", color: "text-amber-400", bg: "bg-amber-400/10" },
  confirmed: { label: "Confirmed", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  processing: { label: "Processing", color: "text-blue-400", bg: "bg-blue-400/10" },
  shipped: { label: "Shipped", color: "text-purple-400", bg: "bg-purple-400/10" },
  delivered: { label: "Delivered", color: "text-white/80", bg: "bg-white/5" },
  cancelled: { label: "Cancelled", color: "text-red-400", bg: "bg-red-400/10" },
};

export default function OrdersPage() {
  const { totalItems, openCart } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => setOrders(data.orders || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="relative min-h-screen w-full bg-[#050505] selection:bg-white/20 selection:text-white">
      <Navbar isPortal cartCount={totalItems} onCartClick={openCart} />

      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 pt-32 pb-40">
        <div className="max-w-5xl mx-auto">
          <Link href="/portal" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs font-medium tracking-[0.1em] uppercase">Back to Portal</span>
          </Link>

          <h1 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-4xl md:text-5xl font-normal tracking-tight text-white mb-16">
            My Orders
          </h1>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Package className="w-16 h-16 text-white/10 mb-8" strokeWidth={1} />
              <h2 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-2xl text-white/40 font-light mb-4">No orders yet</h2>
              <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-white/30 text-sm font-light mb-8">Your completed orders will appear here.</p>
              <Link href="/portal" className="text-xs text-white/50 hover:text-white tracking-[0.1em] uppercase underline" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
                Browse Catalog
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map((order, idx) => {
                const cfg = statusConfig[order.status] || statusConfig.pending;
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      href={`/portal/orders/${order.id}`}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 md:p-8 bg-white/[0.02] border border-white/10 rounded-2xl hover:bg-white/[0.04] hover:border-white/20 transition-all duration-500 group gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-white/30 font-mono">
                            {order.order_number || order.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span className={`text-[10px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded-full ${cfg.color} ${cfg.bg}`} style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
                            {cfg.label}
                          </span>
                        </div>
                        <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white/60 font-light">
                          {order.items.map((i) => `${i.name} x${i.quantity}`).join(", ")}
                        </p>
                        <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-white/30 font-light mt-1">
                          {new Date(order.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-lg text-white font-light">
                          ${order.total.toFixed(2)}
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
