"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, Snowflake, Truck, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useCart, FREE_SHIPPING_THRESHOLD } from "@/lib/cart-context";
import { getBundleDiscount } from "@/lib/pricing";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalItems, subtotal, coldChain, setColdChain, shippingFee, coldChainFee, freeShipping, openCart } = useCart();
  const getItemDiscount = getBundleDiscount;

  return (
    <main className="relative min-h-screen w-full bg-[#050505] selection:bg-white/20 selection:text-white">
      <Navbar isPortal cartCount={totalItems} onCartClick={openCart} />

      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 pt-32 pb-40">
        <div className="max-w-5xl mx-auto">
          <Link href="/portal" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs font-medium tracking-[0.1em] uppercase">Continue Shopping</span>
          </Link>

          <h1 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-4xl md:text-5xl font-normal tracking-tight text-white mb-16">
            Your Cart
          </h1>

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <ShoppingBag className="w-16 h-16 text-white/10 mb-8" strokeWidth={1} />
              <h2 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-2xl text-white/40 font-light mb-4">Your cart is empty</h2>
              <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-white/30 text-sm font-light mb-8">Browse the catalog and add compounds to begin.</p>
              <Link href="/portal" className="group relative flex items-center justify-center px-8 py-4 rounded-full border border-white/20 bg-transparent hover:bg-white transition-colors duration-500">
                <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs font-bold tracking-[0.15em] uppercase text-white group-hover:text-black transition-colors duration-500">
                  Browse Catalog
                </span>
              </Link>
            </motion.div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
              <div className="flex-1">
                <div className="border-t border-white/10">
                  {items.map((item, idx) => (
                    <motion.div
                      key={item.product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-6 py-8 border-b border-white/10"
                    >
                      <div className="relative w-20 h-20 md:w-28 md:h-28 bg-white/[0.02] rounded-2xl border border-white/10 flex items-center justify-center shrink-0 p-2">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          sizes="(max-width: 768px) 80px, 112px"
                          className="object-contain p-2"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-lg md:text-xl font-normal text-white mb-1">
                          {item.product.name}
                        </h3>
                        <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-white/40 font-light tracking-wide mb-4">
                          {item.product.fullName} &middot; {item.product.volume}
                        </p>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                          >
                            <Minus className="w-3 h-3 text-white/60" />
                          </button>
                          <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm font-medium text-white w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                          >
                            <Plus className="w-3 h-3 text-white/60" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-4 shrink-0">
                        <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-lg md:text-xl font-light text-white">
                          ${(item.product.price * item.quantity * (1 - getItemDiscount(item.quantity))).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Cold Chain Packaging Upsell */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: items.length * 0.1 + 0.1 }}
                  className="mt-6"
                >
                  <button
                    onClick={() => setColdChain(!coldChain)}
                    className={`w-full flex items-center gap-5 p-5 rounded-2xl border transition-all duration-300 group ${
                      coldChain
                        ? "border-cyan-400/30 bg-cyan-400/[0.04]"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${
                      coldChain ? "bg-cyan-400/10" : "bg-white/5"
                    }`}>
                      <Snowflake className={`w-6 h-6 transition-colors duration-300 ${coldChain ? "text-cyan-400" : "text-white/30"}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2.5">
                        <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white font-medium">Cold Chain Packaging</span>
                        <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className={`text-[10px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 rounded-full border ${
                          coldChain ? "bg-cyan-400/10 border-cyan-400/20 text-cyan-400" : "bg-white/5 border-white/10 text-white/30"
                        }`}>
                          +$8.00
                        </span>
                      </div>
                      <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-white/35 font-light mt-1 leading-relaxed">
                        Temperature-controlled packaging with insulated liner &amp; gel packs to preserve peptide integrity during transit.
                      </p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${
                      coldChain ? "bg-cyan-400 border-cyan-400" : "border-white/20 group-hover:border-white/40"
                    }`}>
                      {coldChain && <Check className="w-3.5 h-3.5 text-black" strokeWidth={3} />}
                    </div>
                  </button>
                </motion.div>

                {/* Free Shipping Progress */}
                {!freeShipping && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: items.length * 0.1 + 0.2 }}
                    className="mt-4 p-4 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/10"
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <Truck className="w-4 h-4 text-emerald-400/60" />
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-emerald-300/70 font-light">
                        Add <strong className="text-emerald-300 font-medium">${(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)}</strong> more for free shipping
                      </span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-400/50 transition-all duration-500"
                        style={{ width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="w-full lg:w-[360px] shrink-0">
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 sticky top-32">
                  <h3 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs font-bold tracking-[0.2em] uppercase text-white/50 mb-8">
                    Order Summary
                  </h3>

                  <div className="flex flex-col gap-4 pb-6 border-b border-white/10 mb-6">
                    <div className="flex justify-between">
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white/50 font-light">Subtotal ({totalItems} items)</span>
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white font-light">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white/50 font-light">Shipping</span>
                      {freeShipping ? (
                        <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-emerald-400 font-light flex items-center gap-1.5">
                          <span className="line-through text-white/25 mr-1">$5.99</span>
                          Free
                        </span>
                      ) : (
                        <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white font-light">${shippingFee.toFixed(2)}</span>
                      )}
                    </div>
                    {coldChain && (
                      <div className="flex justify-between items-center">
                        <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-cyan-400/70 font-light flex items-center gap-1.5">
                          <Snowflake className="w-3 h-3" /> Cold Chain
                        </span>
                        <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-cyan-400/70 font-light">${coldChainFee.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between mb-8">
                    <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-lg font-normal text-white">Total</span>
                    <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-lg font-normal text-white">${(subtotal + shippingFee + coldChainFee).toFixed(2)}</span>
                  </div>

                  <Link
                    href="/portal/checkout"
                    className="group relative flex items-center justify-center w-full py-4 rounded-full border border-white/20 bg-white text-black transition-all duration-500 hover:bg-transparent hover:border-white overflow-hidden"
                  >
                    <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="relative z-10 text-xs font-bold tracking-[0.15em] uppercase transition-colors duration-500 group-hover:text-white">
                      Proceed to Checkout
                    </span>
                    <div className="absolute inset-0 bg-transparent transition-colors duration-500 group-hover:bg-[#050505] -z-0" />
                  </Link>

                  {freeShipping && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <Truck className="w-3.5 h-3.5 text-emerald-400/60" />
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[10px] text-emerald-400/60 font-bold tracking-[0.1em] uppercase">Free Shipping Applied</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
