"use client";

import React, { useEffect, useLayoutEffect, useRef, use } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Snowflake, AlertTriangle, ArrowUpRight, Package, Droplets, Thermometer, ArrowLeft, ArrowRight, FlaskConical } from 'lucide-react';
import { useLenis } from 'lenis/react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import FAQ from '@/components/FAQ';
import WarningSection from '@/components/WarningSection';
import Footer from '@/components/Footer';
import { products as staticProducts, getAdjacentProducts as getStaticAdjacent, type Product } from '@/lib/products';
import { getResearchData } from '@/lib/research-data';
import { useCart } from '@/lib/cart-context';
import { getBundleDiscount } from '@/lib/pricing';

function computeAdjacent(all: Product[], id: string) {
  const product = all.find((p) => p.id === id);
  if (!product) return { prev: all[0], next: all[1] };
  const sameCat = all.filter((p) => p.category === product.category);
  const idx = sameCat.findIndex((p) => p.id === id);
  const prev = sameCat[(idx - 1 + sameCat.length) % sameCat.length];
  const next = sameCat[(idx + 1) % sameCat.length];
  return { prev, next };
}

export default function ProductCarouselPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { addItem, totalItems, openCart } = useCart();
  const [allProducts, setAllProducts] = React.useState<Product[]>(staticProducts);

  React.useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.products?.length) setAllProducts(data.products);
      })
      .catch(() => {});
  }, []);

  const foundProduct = allProducts.find(p => p.id === id);
  const activeProduct = foundProduct || allProducts[0];
  const { prev: prevProduct, next: nextProduct } = computeAdjacent(allProducts, activeProduct.id);

  if (!foundProduct && allProducts.length > 0) {
    return (
      <main className="relative min-h-screen w-full bg-[#050505] flex flex-col items-center justify-center">
        <Navbar isPortal cartCount={totalItems} onCartClick={openCart} />
        <h2 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-2xl text-white/40 font-light mb-4">Product not found</h2>
        <Link href="/portal" className="text-xs text-white/50 hover:text-white tracking-[0.1em] uppercase underline" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
          Return to catalog
        </Link>
      </main>
    );
  }

  const topRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  // Quantity and Bundle State
  const [quantity, setQuantity] = React.useState(1);
  const [selectedBundle, setSelectedBundle] = React.useState<number>(1);

  const handleBundleSelect = (bundleQty: number) => {
    setSelectedBundle(bundleQty);
    if (bundleQty === 3 && quantity < 3) {
      setQuantity(3);
    } else if (bundleQty < 3) {
      setQuantity(bundleQty);
    }
  };

  const handleQuantityChange = (newQty: number) => {
    const validQty = Math.max(1, newQty);
    setQuantity(validQty);
    if (validQty === 1) setSelectedBundle(1);
    else if (validQty === 2) setSelectedBundle(2);
    else if (validQty >= 3) setSelectedBundle(3);
  };

  const currentDiscount = getBundleDiscount(quantity);
  const originalPrice = activeProduct.price * quantity;
  const finalPrice = Math.round(originalPrice * (1 - currentDiscount) * 100) / 100;

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    }

    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      }
    });
  }, [id, lenis]);

  useEffect(() => {
    document.body.style.backgroundColor = '#050505';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  return (
    <main className="w-full bg-[#050505] text-white overflow-x-hidden relative selection:bg-white selection:text-black font-sans">
      <div ref={topRef} />
      <Navbar isPortal={true} cartCount={totalItems} cartColor={activeProduct.hex} onCartClick={openCart} />
      
      <div className="relative w-full min-h-[100dvh] flex flex-col lg:block">
        
        {/* IMMERSIVE CENTERPIECE */}
        <div className="relative lg:absolute w-full h-[55vh] md:h-[65vh] lg:h-auto lg:inset-0 flex items-center justify-center pointer-events-none z-10 pt-20 lg:pt-0">
        {/* Massive Ethereal Background Typography */}
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.04, scale: 1 }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 lg:top-auto lg:left-auto lg:translate-x-0 lg:translate-y-0 text-[35vw] lg:text-[28vw] font-bold tracking-tighter whitespace-nowrap text-white mix-blend-overlay"
        >
          {activeProduct.name}
        </motion.h1>

        {/* Dynamic Light Cast emitting from center */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 lg:top-auto lg:left-auto lg:translate-x-0 lg:translate-y-0 w-[100vw] h-[100vw] lg:w-[80vw] lg:h-[80vw] max-w-[1200px] max-h-[1200px] blur-[100px] lg:blur-[140px] rounded-full mix-blend-screen"
          style={{ backgroundColor: activeProduct.hex }}
        />

        {/* The Giant Tilted 3D Render - Stable Presentation Layer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="relative w-[120vw] sm:w-[80vw] lg:w-[45vw] max-w-[850px] aspect-square flex items-center justify-center z-20 mt-28 md:mt-24 lg:mt-24 pointer-events-none"
        >
          <div className="w-full h-full relative">
            <Image
              src={activeProduct.image}
              alt={activeProduct.name}
              fill
              priority
              className="object-contain drop-shadow-[0_40px_100px_rgba(0,0,0,0.6)]"
              sizes="(max-width: 768px) 140vw, 80vw"
            />
          </div>
        </motion.div>
      </div>

      {/* HUD DASHBOARD - Foreground Layer */}
      <div className="relative lg:absolute inset-x-0 bottom-0 pointer-events-none z-30 flex flex-col justify-end px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 py-12 lg:py-16">
        
        {/* Responsive Grid layout */}
        <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 lg:gap-8 h-full pb-8 md:pb-0">
          
          {/* LEFT: Compound Identity (top part — brand, name, description) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:w-[460px] pointer-events-auto shrink-0 flex flex-col mt-0 lg:mt-0 order-1"
          >
            <div className="flex flex-col relative z-10 w-full">
              
              {activeProduct.brand && (
                <div className="flex items-center gap-2 mb-4">
                  <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03]">
                    {activeProduct.brand}
                  </span>
                  <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[9px] md:text-[10px] font-bold tracking-[0.15em] uppercase text-white/25">
                    Distributed by AmiNexa
                  </span>
                </div>
              )}

              <h2 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[8vw] md:text-[6vw] lg:text-[5vw] font-normal tracking-[-0.04em] leading-[0.85] text-white mb-4">
                {activeProduct.name}
              </h2>
              
              <div className="flex items-center gap-4 mb-6">
                <span style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: activeProduct.hex }} className="text-xs font-bold tracking-[0.2em] uppercase">
                  {activeProduct.fullName}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
              </div>
              
              <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-lg md:text-xl text-white/60 font-light tracking-wide leading-relaxed mb-8 lg:mb-8 max-w-xl">
                {activeProduct.description}
              </p>

              {/* Mechanisms, Research link, Disclaimer — hidden on mobile, shown on desktop */}
              <div className="hidden lg:block">
                <div className="flex flex-col gap-5 border-l border-white/10 pl-5 mb-8">
                  {activeProduct.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex flex-col gap-1.5 relative group">
                      <div className="absolute -left-[22.5px] top-1.5 w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-white transition-colors duration-500" />
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-white/30">
                        Primary Mechanism 0{idx + 1}
                      </span>
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-base md:text-lg text-white/90 font-normal tracking-wide leading-snug">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>

                {activeProduct.category === 'vial' && (
                  <Link href={`/portal/science/${activeProduct.id}`} className="flex items-center justify-between p-4 md:p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors group backdrop-blur-sm mb-3">
                    <div className="flex items-center gap-3">
                      <FlaskConical className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs md:text-sm font-bold tracking-[0.1em] uppercase text-white/70 group-hover:text-white transition-colors">View Research</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-white/30 group-hover:text-white transition-colors" />
                  </Link>
                )}

                <div className="p-4 md:p-5 rounded-2xl border border-red-500/10 bg-red-500/[0.02] flex flex-col gap-2 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-1">
                    <AlertTriangle className="w-4 h-4 text-red-400/80" />
                    <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-red-400/80">Research Use Only</span>
                  </div>
                  <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm md:text-base text-white/40 font-light leading-relaxed">
                    Strictly for laboratory and research purposes. Not for human or veterinary use.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Commerce: Specs & Actions — order-2 on mobile (right after description), stays right on desktop */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:w-[400px] pointer-events-auto shrink-0 flex flex-col pr-2 lg:pr-0 order-2"
          >
            {/* Spec Data Row */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Volume Card */}
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 md:p-6 flex flex-col justify-center backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3 opacity-50">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                  <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">Volume</span>
                </div>
                <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-2xl md:text-3xl font-light tracking-tight text-white">
                  {activeProduct.volume}
                </span>
              </div>
              
              {/* Purity Card */}
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 md:p-6 flex flex-col justify-center backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3 opacity-50">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">Purity</span>
                </div>
                <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-2xl md:text-3xl font-light tracking-tight text-white flex items-baseline gap-1.5">
                  {activeProduct.purity}
                  <span className="text-[9px] font-medium tracking-[0.2em] uppercase opacity-40">HPLC</span>
                </span>
              </div>
            </div>

            {/* Action Card */}
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col backdrop-blur-sm">
               
               <div className="flex items-baseline gap-3 mb-6">
                 <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-4xl md:text-5xl font-light tracking-tight text-white leading-none">
                   ${finalPrice.toFixed(2)}
                 </span>
                 {currentDiscount > 0 && (
                   <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-lg md:text-xl text-white/30 line-through decoration-white/20">
                     ${originalPrice.toFixed(2)}
                   </span>
                 )}
               </div>

               {/* Batch / Quantity Selector */}
               <div className="mb-6">
                 <div className="flex items-center justify-between mb-4">
                   <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-white/50">
                     Bundle & Save
                   </span>
                 </div>
                 <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4">
                   {[
                    { qty: 1, label: activeProduct.category === 'pen' ? '1 PEN' : '1 VIAL', save: 0, badge: null, badgeColor: null },
                    { qty: 2, label: activeProduct.category === 'pen' ? '2 PENS' : '2 VIALS', save: 3.3, badge: 'MOST POPULAR', badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                    { qty: 3, label: activeProduct.category === 'pen' ? '3+ PENS' : '3+ VIALS', save: 5, badge: 'BEST VALUE', badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20' }
                   ].map((opt) => (
                     <button
                       key={opt.qty}
                       onClick={() => handleBundleSelect(opt.qty)}
                       className={`relative flex flex-col items-center justify-center pt-5 pb-3 px-2 md:px-3 rounded-xl border transition-all duration-300 ${
                         selectedBundle === opt.qty 
                           ? 'bg-white/10 border-white/30 text-white' 
                           : 'bg-white/[0.02] border-white/5 text-white/50 hover:bg-white/[0.05] hover:border-white/10'
                       }`}
                     >
                       {opt.badge && (
                         <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className={`text-[7px] md:text-[8px] font-bold tracking-wider uppercase mb-2 ${opt.badgeColor?.split(' ')[0]}`}>
                           {opt.badge}
                         </span>
                       )}
                       
                       <div className="flex items-center justify-center h-10 md:h-12 mb-2">
                         {Array.from({ length: opt.qty }).map((_, i) => (
                           <div key={i} className={`relative w-5 h-10 md:w-7 md:h-12 ${i > 0 ? '-ml-2 md:-ml-3' : ''} drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]`}>
                             <Image src={activeProduct.image} alt="" fill sizes="28px" className="object-contain" />
                           </div>
                         ))}
                       </div>

                       <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[10px] md:text-xs font-bold tracking-wide text-white whitespace-nowrap">
                         {opt.label}
                       </span>
                       
                       {opt.save > 0 ? (
                         <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[9px] md:text-[10px] font-bold text-emerald-400 mt-0.5">
                           {opt.save}% OFF
                         </span>
                       ) : (
                         <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[9px] md:text-[10px] font-medium text-white/30 mt-0.5">
                           Retail Price
                         </span>
                       )}
                     </button>
                   ))}
                 </div>
                 
                 {/* Custom Quantity */}
                 <div className="flex items-center justify-between p-1 rounded-xl border border-white/10 bg-white/[0.02]">
                   <button 
                     onClick={() => handleQuantityChange(quantity - 1)}
                     className="w-12 h-10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                   >
                     <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                   </button>
                   <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm font-medium text-white w-12 text-center">
                     {quantity}
                   </span>
                   <button 
                     onClick={() => handleQuantityChange(quantity + 1)}
                     className="w-12 h-10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                   >
                     <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                   </button>
                 </div>
               </div>
               
               {/* Free shipping hint */}
               {!activeProduct.comingSoon && !activeProduct.soldOut && (
                 <div className="flex items-center gap-2 mb-4">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-emerald-400/60 shrink-0">
                     <rect x="1" y="3" width="15" height="13" rx="2" />
                     <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                     <circle cx="5.5" cy="18.5" r="2.5" />
                     <circle cx="18.5" cy="18.5" r="2.5" />
                   </svg>
                   <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[10px] md:text-[11px] text-white/40 font-medium tracking-wide">
                     {finalPrice >= 100 ? 'Free shipping on this order' : `Free shipping on orders over $100`}
                   </span>
                 </div>
               )}

               {/* Universal CTA Button */}
               {activeProduct.comingSoon ? (
                 <div className="w-full flex items-center justify-center h-14 md:h-16 rounded-full border border-white/10 bg-white/[0.03]">
                   <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm font-bold tracking-[0.2em] uppercase text-white/30">
                     Coming Soon
                   </span>
                 </div>
               ) : activeProduct.soldOut ? (
                 <div className="w-full flex items-center justify-center h-14 md:h-16 rounded-full border border-red-500/10 bg-red-500/[0.03]">
                   <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm font-bold tracking-[0.2em] uppercase text-red-400/40">
                     Sold Out
                   </span>
                 </div>
               ) : (
                 <button
                   onClick={() => { addItem(activeProduct, quantity); openCart(); }}
                   className="group/btn relative w-full flex items-center justify-between h-14 md:h-16 rounded-full border border-white/20 overflow-hidden hover:border-white transition-colors duration-500"
                 >
                   <div className="absolute inset-0 bg-transparent group-hover/btn:bg-white transition-colors duration-500" />
                   <span className="relative z-10 px-5 lg:px-8 text-sm font-medium tracking-[0.2em] uppercase text-white group-hover/btn:text-black transition-colors duration-500 flex items-center gap-2 lg:gap-3">
                     <span className="w-1.5 h-1.5 rounded-full bg-white group-hover/btn:bg-black transition-colors duration-500" />
                     ADD TO CART
                   </span>
                   <div className="relative z-10 flex items-center justify-center w-14 md:w-16 h-full border-l border-white/20 group-hover/btn:border-black/10 transition-colors duration-500 shrink-0">
                     <svg viewBox="0 0 24 24" className="w-4 h-4 md:w-5 md:h-5 text-white group-hover/btn:text-black transform group-hover/btn:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                       <path d="M5 12h14M12 5l7 7-7 7" />
                     </svg>
                   </div>
                 </button>
               )}

            </div>
          </motion.div>

          {/* Mobile only: Mechanisms, Research, Disclaimer — shown after commerce block */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full pointer-events-auto flex flex-col lg:hidden order-3"
          >
            <div className="flex flex-col gap-5 border-l border-white/10 pl-5 mb-8">
              {activeProduct.benefits.map((benefit, idx) => (
                <div key={idx} className="flex flex-col gap-1.5 relative group">
                  <div className="absolute -left-[22.5px] top-1.5 w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-white transition-colors duration-500" />
                  <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-white/30">
                    Primary Mechanism 0{idx + 1}
                  </span>
                  <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-base md:text-lg text-white/90 font-normal tracking-wide leading-snug">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>

            {activeProduct.category === 'vial' && (
              <Link href={`/portal/science/${activeProduct.id}`} className="flex items-center justify-between p-4 md:p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors group backdrop-blur-sm mb-3">
                <div className="flex items-center gap-3">
                  <FlaskConical className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                  <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs md:text-sm font-bold tracking-[0.1em] uppercase text-white/70 group-hover:text-white transition-colors">View Research</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-white/30 group-hover:text-white transition-colors" />
              </Link>
            )}

            <div className="p-4 md:p-5 rounded-2xl border border-red-500/10 bg-red-500/[0.02] flex flex-col gap-2 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-1">
                <AlertTriangle className="w-4 h-4 text-red-400/80" />
                <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-red-400/80">Research Use Only</span>
              </div>
              <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm md:text-base text-white/40 font-light leading-relaxed">
                Strictly for laboratory and research purposes. Not for human or veterinary use.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
      </div>

      {/* Storage & Handling Protocol Section */}
      <section className="w-full bg-[#050505] py-24 md:py-32 relative z-20 border-t border-white/5">
        <div className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20">
          <div className="flex flex-col items-center text-center mb-16 md:mb-24">
             <h2 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-blue-400/80 mb-6 flex items-center justify-center gap-2">
               <Snowflake className="w-4 h-4" /> Cold-Chain Logistics
             </h2>
             <h3 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[8vw] md:text-[6vw] lg:text-[5vw] font-normal tracking-[-0.04em] leading-[0.85] text-white mb-6">
               Storage & Handling.
             </h3>
             <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-lg md:text-xl text-white/60 font-light tracking-wide max-w-4xl">
               {activeProduct.category === 'pen'
                 ? 'Pre-filled pen devices require strict refrigerated storage to maintain compound stability and metering precision.'
                 : 'To maintain absolute molecular integrity, strict temperature controls must be adhered to upon receipt of your compound.'}
             </p>
          </div>

          {activeProduct.category === 'pen' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="p-8 md:p-10 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col group hover:bg-white/[0.04] transition-colors duration-500">
                <div className="text-white/30 mb-8 group-hover:text-white transition-colors duration-500"><Thermometer className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1} /></div>
                <h4 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-2xl md:text-3xl font-normal text-white mb-4 tracking-tight">Refrigerated</h4>
                <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-white/50 text-base md:text-lg font-light leading-relaxed mb-10">
                  Store at 2–8°C (36–46°F). Do not freeze. Keep pen sealed and protected from direct light until use.
                </p>
                <div className="mt-auto pt-6 border-t border-white/10 flex justify-between items-center text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">
                  <span className="text-white/30">Temperature</span>
                  <span className="text-white/80">2–8°C</span>
                </div>
              </div>
              <div className="p-8 md:p-10 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col group hover:bg-white/[0.04] transition-colors duration-500">
                <div className="text-white/30 mb-8 group-hover:text-white transition-colors duration-500"><Package className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1} /></div>
                <h4 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-2xl md:text-3xl font-normal text-white mb-4 tracking-tight">Pre-Filled</h4>
                <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-white/50 text-base md:text-lg font-light leading-relaxed mb-10">
                  Ready for laboratory dispensing. No reconstitution required. Single-use device—do not attempt to refill or disassemble.
                </p>
                <div className="mt-auto pt-6 border-t border-white/10 flex justify-between items-center text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">
                  <span className="text-white/30">Format</span>
                  <span className="text-white/80">Single-Use</span>
                </div>
              </div>
              <div className="p-8 md:p-10 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col group hover:bg-white/[0.04] transition-colors duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="text-blue-400/50 mb-8 group-hover:text-blue-400 transition-colors duration-500 relative z-10"><Snowflake className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1} /></div>
                <h4 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-2xl md:text-3xl font-normal text-white mb-4 tracking-tight relative z-10">Cold-Chain</h4>
                <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-white/50 text-base md:text-lg font-light leading-relaxed mb-10 relative z-10">
                  Ships in insulated packaging with cold packs. Inspect upon arrival and refrigerate immediately to preserve compound stability.
                </p>
                <div className="mt-auto pt-6 border-t border-white/10 flex justify-between items-center text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase relative z-10">
                  <span className="text-white/30">Transit</span>
                  <span className="text-blue-400/80">Insulated</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="p-8 md:p-10 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col group hover:bg-white/[0.04] transition-colors duration-500">
                <div className="text-white/30 mb-8 group-hover:text-white transition-colors duration-500"><Package className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1} /></div>
                <h4 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-2xl md:text-3xl font-normal text-white mb-4 tracking-tight">Lyophilized</h4>
                <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-white/50 text-base md:text-lg font-light leading-relaxed mb-10">
                  Store in freezer at -20°C (-4°F) for up to 36 months. Keep sealed away from direct light and moisture.
                </p>
                <div className="mt-auto pt-6 border-t border-white/10 flex justify-between items-center text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">
                  <span className="text-white/30">Shelf Life</span>
                  <span className="text-white/80">36 Months</span>
                </div>
              </div>
              <div className="p-8 md:p-10 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col group hover:bg-white/[0.04] transition-colors duration-500">
                <div className="text-white/30 mb-8 group-hover:text-white transition-colors duration-500"><Droplets className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1} /></div>
                <h4 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-2xl md:text-3xl font-normal text-white mb-4 tracking-tight">Reconstitution</h4>
                <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-white/50 text-base md:text-lg font-light leading-relaxed mb-10">
                  Allow vial to reach room temperature before mixing. Reconstitute strictly with bacteriostatic water. Do not shake; swirl gently.
                </p>
                <div className="mt-auto pt-6 border-t border-white/10 flex justify-between items-center text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">
                  <span className="text-white/30">Solvent</span>
                  <span className="text-white/80">BAC Water</span>
                </div>
              </div>
              <div className="p-8 md:p-10 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col group hover:bg-white/[0.04] transition-colors duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="text-blue-400/50 mb-8 group-hover:text-blue-400 transition-colors duration-500 relative z-10"><Thermometer className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1} /></div>
                <h4 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-2xl md:text-3xl font-normal text-white mb-4 tracking-tight relative z-10">Reconstituted</h4>
                <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-white/50 text-base md:text-lg font-light leading-relaxed mb-10 relative z-10">
                  Must be refrigerated immediately at 2°C to 8°C (36°F to 46°F). Do not freeze after reconstitution.
                </p>
                <div className="mt-auto pt-6 border-t border-white/10 flex justify-between items-center text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase relative z-10">
                  <span className="text-white/30">Stability</span>
                  <span className="text-blue-400/80">4-6 Weeks</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <FAQ 
        title="Frequently Asked Questions" 
        subtitle={`Common questions about ${activeProduct.name} research`} 
        faqs={activeProduct.faqs} 
      />

      {/* Science Library CTA */}
      {(() => {
        const research = getResearchData(activeProduct.id);
        if (!research) return null;
        return (
          <section className="w-full bg-[#050505] py-24 md:py-32 relative z-20 border-t border-white/5">
            <div className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20">
              <div className="flex flex-col items-center text-center mb-16 md:mb-24">
                <h3 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[8vw] md:text-[6vw] lg:text-[5vw] font-normal tracking-[-0.04em] leading-[0.85] text-white mb-6">
                  Dive into the Science.
                </h3>
                <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-lg md:text-xl text-white/60 font-light tracking-wide max-w-4xl mb-10">
                  Explore published research, clinical data, safety profiles, and mechanism of action for {activeProduct.name}.
                </p>
                <Link
                  href={`/portal/science/${activeProduct.id}`}
                  className="group/sci inline-flex items-center gap-3 h-12 md:h-14 px-7 md:px-8 rounded-full border border-white/15 hover:bg-white hover:border-white transition-all duration-500"
                >
                  <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase text-white/70 group-hover/sci:text-black transition-colors duration-500">
                    View Full Research
                  </span>
                  <ArrowRight className="w-4 h-4 text-white/40 group-hover/sci:text-black group-hover/sci:translate-x-1 transition-all duration-500" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {research.stats.map((stat, idx) => (
                  <div key={idx} className="p-8 md:p-10 rounded-3xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] transition-colors duration-500 flex flex-col justify-center">
                    <span style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: activeProduct.hex }} className="text-4xl md:text-5xl font-light tracking-tight block mb-4">
                      {stat.value}
                    </span>
                    <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-base md:text-lg text-white/80 font-normal block mb-2">
                      {stat.label}
                    </span>
                    <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase text-white/30">
                      {stat.sublabel}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 md:mt-8 p-8 md:p-12 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
                <div className="flex-1">
                  <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-lg md:text-2xl text-white/60 font-light leading-relaxed italic text-center md:text-left">
                    &ldquo;{research.keyInsight}&rdquo;
                  </p>
                </div>
                <div className="w-full md:w-auto flex items-center justify-center md:justify-end shrink-0 border-t border-white/10 md:border-t-0 md:border-l md:pl-12 pt-6 md:pt-0">
                  <Link
                    href={`/portal/science/${activeProduct.id}`}
                    className="flex items-center gap-3 text-white/40 hover:text-white transition-colors duration-300 group"
                  >
                    <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase text-center md:text-right">
                      Read {research.studies.length} Published<br className="hidden md:block" /> Studies
                    </span>
                    <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Product Navigation & CTA */}
      <section className="w-full bg-[#050505] py-24 md:py-32 relative z-20 border-t border-white/5">
        <div className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20">
          
          {/* Main CTA */}
          <div className="flex flex-col items-center text-center mb-24 md:mb-32">
            <h2 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-white/50 mb-6">
              Procurement
            </h2>
            <h3 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[8vw] md:text-[6vw] lg:text-[5vw] font-normal tracking-[-0.04em] leading-[0.85] text-white mb-6">
              Begin Research.
            </h3>
            <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-lg md:text-xl text-white/60 font-light tracking-wide max-w-2xl mb-12">
              {activeProduct.comingSoon
                ? `${activeProduct.name} will be available for procurement soon. Sign up for notifications to be the first to know.`
                : activeProduct.soldOut
                ? `${activeProduct.name} is currently out of stock. Check back soon for restocking updates.`
                : `Secure your allocation of ${activeProduct.name}. All orders are dispatched via expedited cold-chain transit to guarantee absolute molecular stability upon arrival.`}
            </p>
            {activeProduct.comingSoon ? (
              <div className="flex items-center justify-center h-14 md:h-16 w-full max-w-[320px] rounded-full border border-white/10 bg-white/[0.03]">
                <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-white/30">
                  Coming Soon
                </span>
              </div>
            ) : activeProduct.soldOut ? (
              <div className="flex items-center justify-center h-14 md:h-16 w-full max-w-[320px] rounded-full border border-red-500/10 bg-red-500/[0.03]">
                <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-red-400/40">
                  Sold Out
                </span>
              </div>
            ) : (
              <button
                onClick={() => { addItem(activeProduct, quantity); openCart(); }}
                className="group/btn relative flex items-center justify-between h-14 md:h-16 w-full max-w-[320px] rounded-full border border-white/20 bg-white hover:bg-transparent transition-colors duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white group-hover/btn:bg-transparent transition-colors duration-500" />
                
                <div className="relative z-10 flex-1 flex items-center justify-between px-5 md:px-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-black group-hover/btn:bg-white transition-colors duration-500 shrink-0" />
                  <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-black group-hover/btn:text-white transition-colors duration-500 whitespace-nowrap flex-1 text-center">
                    ADD TO CART — ${finalPrice.toFixed(2)}
                  </span>
                </div>

                <div className="relative z-10 flex items-center justify-center w-14 md:w-16 h-full border-l border-black/10 group-hover/btn:border-white/20 transition-colors duration-500 shrink-0">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 md:w-5 md:h-5 text-black group-hover/btn:text-white transform group-hover/btn:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            )}
          </div>

          {/* Next / Prev Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 border-t border-white/10 pt-10">
            {/* Prev Product */}
            <Link href={`/portal/product/${prevProduct.id}`} className="group flex flex-col items-start p-6 md:p-10 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-500">
              <div className="flex items-center gap-3 text-white/40 mb-6 group-hover:text-white transition-colors duration-500">
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-2 transition-transform duration-500" strokeWidth={1.5} />
                <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">Previous Compound</span>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full">
                <div className="relative w-16 h-16 md:w-24 md:h-24 shrink-0 transition-opacity duration-500">
                  <Image src={prevProduct.image} alt={prevProduct.name} fill sizes="(max-width: 768px) 64px, 96px" className="object-contain drop-shadow-2xl" />
                </div>
                <div className="flex flex-col">
                  <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xl md:text-3xl font-light text-white tracking-tight mb-1">{prevProduct.name}</span>
                  <span style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: prevProduct.hex }} className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase opacity-80">{prevProduct.fullName}</span>
                </div>
              </div>
            </Link>

            {/* Next Product */}
            <Link href={`/portal/product/${nextProduct.id}`} className="group flex flex-col items-end text-right p-6 md:p-10 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-500">
              <div className="flex items-center gap-3 text-white/40 mb-6 group-hover:text-white transition-colors duration-500">
                <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">Next Compound</span>
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-2 transition-transform duration-500" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col-reverse sm:flex-row items-end sm:items-center justify-end gap-4 sm:gap-6 w-full">
                <div className="flex flex-col items-end">
                  <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xl md:text-3xl font-light text-white tracking-tight mb-1">{nextProduct.name}</span>
                  <span style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: nextProduct.hex }} className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase opacity-80">{nextProduct.fullName}</span>
                </div>
                <div className="relative w-16 h-16 md:w-24 md:h-24 shrink-0 transition-opacity duration-500">
                  <Image src={nextProduct.image} alt={nextProduct.name} fill sizes="(max-width: 768px) 64px, 96px" className="object-contain drop-shadow-2xl" />
                </div>
              </div>
            </Link>
          </div>

        </div>
      </section>

      <WarningSection />
      <Footer />
    </main>
  );
}
