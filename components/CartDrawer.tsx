"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingCart, Lock, Snowflake } from "lucide-react";
import { useCart, SHIPPING_FEE, FREE_SHIPPING_THRESHOLD, COLD_CHAIN_FEE } from "@/lib/cart-context";
import { siteConfig } from "@/config/site";
import { getBundleDiscount } from "@/lib/pricing";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, totalItems, subtotal, coldChain, setColdChain, shippingFee, coldChainFee, freeShipping } = useCart();

  const getItemDiscount = getBundleDiscount;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed top-4 right-4 bottom-4 md:top-6 md:right-6 md:bottom-6 w-[calc(100vw-2rem)] md:w-[440px] lg:w-[480px] z-[210] bg-[#111] text-white border border-white/10 rounded-2xl shadow-2xl flex flex-col transition-transform duration-700 pointer-events-auto overflow-hidden"
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(120%)",
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Decorative glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 md:px-8 pt-6 md:pt-8 pb-5 md:pb-6 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <Image
              src={siteConfig.faviconUrl || "/favicon.svg"}
              alt={siteConfig.name}
              width={28}
              height={28}
              className="opacity-70"
            />
            <h2 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm font-bold tracking-[0.15em] uppercase text-white">
              Your Cart
            </h2>
            {totalItems > 0 && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/10 text-white/60">
                {totalItems}
              </span>
            )}
          </div>

          {/* Close */}
          <motion.button
            onClick={onClose}
            initial="initial"
            whileHover="hover"
            aria-label="Close cart"
            className="relative w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border border-white/10"
          >
            <motion.div
              className="absolute inset-0 bg-white/10"
              variants={{
                initial: { y: "100%", borderRadius: "50% 50% 0 0" },
                hover: { y: "0%", borderRadius: "0% 0% 0 0" },
              }}
              transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
            />
            <svg viewBox="0 0 24 24" className="relative z-10 w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M6 6L18 18" />
              <path d="M18 6L6 18" />
            </svg>
          </motion.button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 relative z-10">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <ShoppingCart className="w-14 h-14 text-white/10 mb-6" strokeWidth={1} />
              <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-white/30 text-base font-light mb-2">Your cart is empty</p>
              <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-white/20 text-sm font-light">Add compounds from the catalog</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {items.map((item, idx) => (
                <motion.div
                  key={item.product.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-4 py-5 border-b border-white/5"
                >
                  <Link
                    href={`/portal/product/${item.product.id}`}
                    onClick={onClose}
                    className="relative w-18 h-18 md:w-20 md:h-20 bg-white/[0.02] rounded-xl border border-white/10 flex items-center justify-center shrink-0 p-1 hover:border-white/20 transition-colors"
                  >
                    <Image src={item.product.image} alt={item.product.name} fill sizes="80px" className="object-contain p-1.5" />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <h3 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-base font-normal text-white mb-0.5 truncate">
                      {item.product.name}
                    </h3>
                    <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-white/35 font-light tracking-wide mb-3">
                      {item.product.volume}
                    </p>
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full border border-white/15 flex items-center justify-center hover:bg-white/10 transition-colors"
                      >
                        <Minus className="w-3 h-3 text-white/50" />
                      </button>
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm font-medium text-white w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full border border-white/15 flex items-center justify-center hover:bg-white/10 transition-colors"
                      >
                        <Plus className="w-3 h-3 text-white/50" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <div className="flex flex-col items-end">
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-base font-light text-white">
                        ${(Math.round(item.product.price * item.quantity * (1 - getItemDiscount(item.quantity)) * 100) / 100).toFixed(2)}
                      </span>
                      {getItemDiscount(item.quantity) > 0 && (
                        <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-white/30 line-through mt-0.5">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 md:px-8 pb-6 md:pb-8 pt-4 border-t border-white/10 relative z-10">

            {/* Cold Chain Upsell */}
            <button
              onClick={() => setColdChain(!coldChain)}
              className={`w-full flex items-start gap-3.5 p-4 md:p-5 rounded-xl border mb-5 transition-all duration-300 text-left ${
                coldChain
                  ? 'bg-blue-500/10 border-blue-400/30'
                  : 'bg-white/[0.02] border-white/10 hover:border-white/20'
              }`}
            >
              <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                coldChain ? 'bg-blue-500 border-blue-500' : 'border-white/20'
              }`}>
                {coldChain && (
                  <svg viewBox="0 0 24 24" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Snowflake className="w-4 h-4 text-blue-400/80" strokeWidth={2} />
                  <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm font-bold tracking-[0.08em] uppercase text-white/80">
                    Cold Chain Packaging
                  </span>
                  <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs font-bold text-blue-400/80 ml-auto shrink-0">
                    +${COLD_CHAIN_FEE.toFixed(2)}
                  </span>
                </div>
                <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-white/35 font-light leading-relaxed">
                  Insulated packaging with cold packs to maintain peptide stability during transit.
                </p>
              </div>
            </button>

            <div className="flex flex-col gap-2.5 mb-6">
              <div className="flex justify-between items-center">
                <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white/50 font-normal">Subtotal</span>
                <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white/50 font-normal">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white/50 font-normal">Shipping</span>
                <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className={`text-sm font-normal ${freeShipping ? 'text-emerald-400/80' : 'text-white/50'}`}>
                  {freeShipping ? 'Free' : `$${shippingFee.toFixed(2)}`}
                </span>
              </div>
              {coldChain && (
                <div className="flex justify-between items-center">
                  <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-blue-400/70 font-normal flex items-center gap-2">
                    <Snowflake className="w-3.5 h-3.5" />
                    Cold Chain
                  </span>
                  <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-blue-400/70 font-normal">${coldChainFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 border-t border-white/10">
                <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-base text-white font-medium">Estimated Total</span>
                <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-2xl text-white font-light">${(subtotal + shippingFee + coldChainFee).toFixed(2)}</span>
              </div>
              {!freeShipping && (
                <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-emerald-400/60 font-light mt-1">
                  Add ${(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)} more for free shipping
                </p>
              )}
            </div>

            <Link
              href="/portal/checkout"
              onClick={onClose}
              className="group relative flex items-center justify-center gap-2.5 w-full py-4 rounded-full border border-white/20 bg-white text-black transition-all duration-500 hover:bg-transparent hover:border-white overflow-hidden mb-3"
            >
              <Lock className="relative z-10 w-4 h-4 transition-colors duration-500 group-hover:text-white" strokeWidth={2.5} />
              <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="relative z-10 text-sm font-bold tracking-[0.12em] uppercase transition-colors duration-500 group-hover:text-white">
                Checkout Securely
              </span>
              <div className="absolute inset-0 bg-transparent transition-colors duration-500 group-hover:bg-[#050505] -z-0" />
            </Link>

            <button
              onClick={onClose}
              className="w-full text-center py-2"
            >
              <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-white/30 hover:text-white/60 transition-colors tracking-[0.1em] uppercase">
                Continue Shopping
              </span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
