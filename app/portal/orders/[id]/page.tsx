"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Package, Check, Clock, Truck, ExternalLink, Copy, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useCart } from "@/lib/cart-context";

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
  shipping_fee: number;
  cold_chain: boolean;
  cold_chain_fee: number;
  promo_code: string | null;
  promo_discount: number;
  payment_discount: number;
  shipping_name: string;
  shipping_email: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  order_number: string | null;
  payment_method: string | null;
  tracking_number: string | null;
  carrier_code: string | null;
  service_name: string | null;
  estimated_delivery: string | null;
  qbo_invoice_id: string | null;
  created_at: string;
  confirmed_at: string | null;
};

function buildTrackingUrl(carrierCode: string | null, trackingNumber: string): string {
  const code = (carrierCode || "").toLowerCase();
  if (code.includes("usps")) return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
  if (code.includes("fedex")) return `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
  if (code.includes("ups")) return `https://www.ups.com/track?tracknum=${trackingNumber}`;
  if (code.includes("dhl")) return `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${trackingNumber}`;
  return `https://parcelsapp.com/en/tracking/${trackingNumber}`;
}

function getCarrierName(code: string | null): string {
  if (!code) return "Carrier";
  const c = code.toLowerCase();
  if (c.includes("usps")) return "USPS";
  if (c.includes("fedex")) return "FedEx";
  if (c.includes("ups")) return "UPS";
  if (c.includes("dhl")) return "DHL";
  return code.toUpperCase();
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  awaiting_payment: { label: "Awaiting Payment", color: "text-orange-400", bg: "bg-orange-400/10", icon: CreditCard },
  pending: { label: "Pending Verification", color: "text-amber-400", bg: "bg-amber-400/10", icon: Clock },
  confirmed: { label: "Confirmed", color: "text-emerald-400", bg: "bg-emerald-400/10", icon: Check },
  processing: { label: "Processing", color: "text-blue-400", bg: "bg-blue-400/10", icon: Package },
  shipped: { label: "Shipped", color: "text-purple-400", bg: "bg-purple-400/10", icon: Truck },
  delivered: { label: "Delivered", color: "text-white/80", bg: "bg-white/5", icon: Check },
  cancelled: { label: "Cancelled", color: "text-red-400", bg: "bg-red-400/10", icon: Clock },
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { totalItems, openCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentPaid, setPaymentPaid] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((data) => setOrder(data.order || null))
      .finally(() => setLoading(false));
  }, [id]);

  // Poll for payment status
  useEffect(() => {
    if (!order || order.status !== "awaiting_payment") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/qbo/status/${order.id}`);
        const data = await res.json();
        if (data.paid) {
          setPaymentPaid(true);
          clearInterval(interval);
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      } catch {
        // Silently retry
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [order?.id, order?.status]);

  const cfg = statusConfig[order?.status || "pending"] || statusConfig.pending;
  const StatusIcon = cfg.icon;

  return (
    <main className="relative min-h-screen w-full bg-[#050505] selection:bg-white/20 selection:text-white">
      <Navbar isPortal cartCount={totalItems} onCartClick={openCart} />

      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 pt-32 pb-40">
        <div className="max-w-5xl mx-auto">
          <Link href="/portal/orders" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs font-medium tracking-[0.1em] uppercase">All Orders</span>
          </Link>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
            </div>
          ) : !order ? (
            <div className="text-center py-24">
              <h2 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-2xl text-white/40 font-light">Order not found</h2>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
                <div>
                  <h1 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-3xl md:text-4xl font-normal tracking-tight text-white mb-2">
                    Order Placed
                  </h1>
                  <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-white/30 font-mono">
                    {order.order_number || order.id.slice(0, 8).toUpperCase()} &middot; {new Date(order.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${cfg.bg}`}>
                  <StatusIcon className={`w-4 h-4 ${cfg.color}`} />
                  <span className={`text-xs font-bold tracking-[0.15em] uppercase ${cfg.color}`} style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
                    {cfg.label}
                  </span>
                </div>
              </div>

              {/* Status Message */}
              {order.status === "pending" && (
                <div className="bg-amber-400/5 border border-amber-400/20 rounded-2xl p-6 mb-8">
                  <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-amber-400/80 text-sm font-light leading-relaxed">
                    Your {order.payment_method === "crypto" ? "USDC" : "Zelle"} payment is being verified. You will receive an email confirmation once your payment has been processed and your order is confirmed.
                  </p>
                </div>
              )}

              {order.status === "confirmed" && (
                <div className="bg-emerald-400/5 border border-emerald-400/20 rounded-2xl p-6 mb-8">
                  <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-emerald-400/80 text-sm font-light leading-relaxed">
                    Your payment has been verified and your order is being prepared for shipment.
                  </p>
                </div>
              )}

              {/* Awaiting Payment Card */}
              {order.status === "awaiting_payment" && (
                <div className="bg-orange-400/5 border border-orange-400/20 rounded-2xl p-6 md:p-8 mb-8">
                  {paymentPaid ? (
                    <div className="flex flex-col items-center gap-3 py-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-400/10 flex items-center justify-center">
                        <Check className="w-6 h-6 text-emerald-400" />
                      </div>
                      <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-emerald-400 text-sm font-medium">
                        Payment received! Refreshing...
                      </p>
                    </div>
                  ) : (
                    <>
                      <h3 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs font-bold tracking-[0.2em] uppercase text-orange-400/60 mb-4">
                        Complete Your Payment
                      </h3>
                      <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white/50 font-light leading-relaxed mb-4">
                        A payment invoice has been sent to <strong className="text-white/70">{order.shipping_email}</strong> from QuickBooks. Please check your email (including spam/junk) for the payment link.
                      </p>
                      <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white/40 font-light leading-relaxed mb-4">
                        Your order will be automatically confirmed once payment is received.
                      </p>

                      <div className="flex items-center gap-2 mt-2 text-white/20">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[10px] font-light tracking-wider">
                          Checking payment status...
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Tracking Card */}
              {(order.status === "shipped" || order.status === "delivered") && order.tracking_number && (
                <TrackingCard
                  trackingNumber={order.tracking_number}
                  carrierCode={order.carrier_code}
                  serviceName={order.service_name}
                  isDelivered={order.status === "delivered"}
                />
              )}

              {/* Items & Pricing Breakdown */}
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8 mb-6">
                <h3 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs font-bold tracking-[0.2em] uppercase text-white/50 mb-6">Items</h3>
                {order.items.map((item: OrderItem, idx: number) => (
                  <div key={idx} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
                    <div>
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white font-light">{item.name}</span>
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-white/30 ml-2">{item.volume} &times;{item.quantity}</span>
                    </div>
                    <div className="text-right">
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white font-light">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                      {item.quantity > 1 && (
                        <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[10px] text-white/20">
                          ${item.price.toFixed(2)} each
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                <div className="pt-4 mt-2 border-t border-white/10 flex flex-col gap-2">
                  {order.subtotal != null && (
                    <div className="flex justify-between">
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-white/40">Subtotal</span>
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-white/40">${order.subtotal.toFixed(2)}</span>
                    </div>
                  )}

                  {order.payment_method !== "credit_card" && Number(order.payment_discount || 0) > 0 && (
                    <div className="flex justify-between">
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className={`text-xs ${order.payment_method === "crypto" ? "text-blue-400/70" : "text-emerald-400/70"}`}>
                        {order.payment_method === "crypto" ? "USDC Discount (10%)" : "Zelle Discount (10%)"}
                      </span>
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className={`text-xs ${order.payment_method === "crypto" ? "text-blue-400/70" : "text-emerald-400/70"}`}>
                        -${Number(order.payment_discount).toFixed(2)}
                      </span>
                    </div>
                  )}

                  {order.promo_code && Number(order.promo_discount) > 0 && (
                    <div className="flex justify-between">
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-violet-400/70">
                        Promo: {order.promo_code}
                      </span>
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-violet-400/70">
                        -${Number(order.promo_discount).toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-white/40">
                      Shipping{order.service_name ? ` (${order.service_name})` : ""}
                    </span>
                    <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className={`text-xs ${Number(order.shipping_fee) === 0 ? "text-emerald-400/70" : "text-white/40"}`}>
                      {Number(order.shipping_fee) === 0 ? "Free" : `$${Number(order.shipping_fee).toFixed(2)}`}
                    </span>
                  </div>

                  {order.cold_chain && Number(order.cold_chain_fee) > 0 && (
                    <div className="flex justify-between">
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-cyan-400/70">Cold Chain</span>
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-cyan-400/70">${Number(order.cold_chain_fee).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between pt-3 mt-1 border-t border-white/5">
                    <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-base text-white">Total</span>
                    <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xl text-white font-light">${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8">
                <h3 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs font-bold tracking-[0.2em] uppercase text-white/50 mb-4">Shipping To</h3>
                <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white/80 font-light leading-relaxed">
                  {order.shipping_name}<br/>
                  {order.shipping_address}<br/>
                  {order.shipping_city}, {order.shipping_state} {order.shipping_zip}<br/>
                  {order.shipping_email}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}

function TrackingCard({
  trackingNumber,
  carrierCode,
  serviceName,
  isDelivered,
}: {
  trackingNumber: string;
  carrierCode: string | null;
  serviceName: string | null;
  isDelivered: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const trackingUrl = buildTrackingUrl(carrierCode, trackingNumber);
  const carrier = getCarrierName(carrierCode);

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8 mb-8">
      <div className="flex items-center justify-between mb-5">
        <h3
          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
          className="text-xs font-bold tracking-[0.2em] uppercase text-white/50"
        >
          Package Tracking
        </h3>
        {isDelivered && (
          <span
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            className="text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1 rounded-full bg-emerald-400/10 text-emerald-400"
          >
            Delivered
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              className="text-xs text-white/30"
            >
              {carrier}
              {serviceName && ` · ${serviceName}`}
            </span>
            <span
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              className="text-sm text-white/80 font-mono tracking-wide"
            >
              {trackingNumber}
            </span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(trackingNumber);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/[0.05] transition-colors shrink-0"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-white/40" />
            )}
            <span
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              className={`text-[10px] font-bold tracking-wider uppercase ${copied ? "text-emerald-400" : "text-white/40"}`}
            >
              {copied ? "Copied" : "Copy"}
            </span>
          </button>
        </div>

        <a
          href={trackingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-purple-500/20 bg-purple-500/[0.06] text-purple-400 hover:bg-purple-500/[0.12] transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          <span
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            className="text-xs font-bold tracking-[0.1em] uppercase"
          >
            Track Package
          </span>
        </a>
      </div>
    </div>
  );
}
