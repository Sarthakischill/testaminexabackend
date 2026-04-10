"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Globe, Snowflake, ShieldCheck, Beaker } from "lucide-react";
import Navbar from "@/components/Navbar";
import FAQ, { generalFaqs } from "@/components/FAQ";
import WarningSection from "@/components/WarningSection";
import Footer from "@/components/Footer";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/cart-context";

export default function PortalPage() {
  const { totalItems, openCart } = useCart();
  const [activeTab, setActiveTab] = useState('vials');
  const [isMounted, setIsMounted] = useState(false);
  const [greetingTime, setGreetingTime] = useState("Good Evening");
  const [userName, setUserName] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const vials = allProducts.filter((p) => p.category === "vial");
  const pens = allProducts.filter((p) => p.category === "pen");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const timer = setTimeout(() => {
      const hour = new Date().getHours();
      if (hour < 5) setGreetingTime("Good Evening");
      else if (hour < 12) setGreetingTime("Good Morning");
      else if (hour < 17) setGreetingTime("Good Afternoon");
      else setGreetingTime("Good Evening");
    }, 0);
    return () => clearTimeout(timer);
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    const { createClient } = require("@/lib/supabase/client");
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: any } }) => {
      if (user?.user_metadata?.full_name) {
        const first = user.user_metadata.full_name.split(" ")[0];
        setUserName(first);
      }
    });
  }, [isMounted]);

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.products?.length) setAllProducts(data.products);
      })
      .catch(() => {});
  }, []);

  const cards = [
    { id: 'bpc', name: 'BPC-157', title: 'Tissue Regeneration', tag: 'Clinical', img: 'https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/Product_Mockups/BPC-157_square.png/public', color: '#3b82f6' },
    { id: 'ghk', name: 'GHK-Cu', title: 'Copper Matrix', tag: 'Synthesis', img: 'https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/Product_Mockups/GHK-Cu_square.png/public', color: '#10b981' },
    { id: 'glp', name: 'GLP-3', title: 'Metabolic Optimization', tag: 'Peptide', img: 'https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/Product_Mockups/GLP-3_square.png/public', color: '#a855f7' },
    { id: 'nad', name: 'NAD+', title: 'Cellular Vitality', tag: 'Coenzyme', img: 'https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/Product_Mockups/NAD_square.png/public', color: '#f43f5e' },
    { id: 'epi', name: 'Epithalon', title: 'Aging Pathways', tag: 'Peptide', img: 'https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/Product_Mockups/Epithalon_square.png/public', color: '#ef4444' },
    { id: 'mt2', name: 'MT2', title: 'Melanocortin Research', tag: 'Peptide', img: 'https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/Product_Mockups/MT2_square.png/public', color: '#ea580c' },
    { id: 'mots', name: 'MOTS-c', title: 'Mitochondrial Signal', tag: 'Peptide', img: 'https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/Product_Mockups/MOTS-c_square.png/public', color: '#f59e0b' },
    { id: 'tes', name: 'Tesamorelin', title: 'GHRH Analog', tag: 'Peptide', img: 'https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/Product_Mockups/Tesamorelin_square.png/public', color: '#9333ea' },
  ];

  const loopItems = [...cards, ...cards, ...cards];

  const tabs = [
    { id: 'vials', label: 'Vials' },
    { id: 'pens', label: 'Injection Pens' },
    { id: 'tabs', label: 'Dissolvable Tabs', badge: 'Soon' },
    { id: 'bundles', label: 'Protocol Bundles', badge: 'Soon' }
  ];

  if (!isMounted) {
    return null;
  }

  return (
    <main className="relative min-h-screen w-full bg-[#050505] selection:bg-white/20 selection:text-white">
      
      {/* Portal Navbar */}
      <div className="pointer-events-auto relative z-50">
        <Navbar isPortal={true} cartCount={totalItems} cartColor="#ffffff" onCartClick={openCart} />
      </div>

      {/* NEW PORTAL HERO SCROLL SEQUENCE (Premium Osmo Arch) */}
      <div className="relative w-full min-h-[90vh] md:min-h-[105vh] lg:min-h-[115vh] xl:min-h-[120vh] 2xl:min-h-[130vh] overflow-hidden bg-[#050505] flex flex-col items-center pt-24 z-10">
        
        {/* Atmosphere */}
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[70vw] h-[70vh] bg-white/[0.02] blur-[150px] rounded-full pointer-events-none" />
        
        {/* Central Content (Personalized Typography) */}
        <div className="relative z-20 flex flex-col items-center text-center px-4 w-full mt-12 md:mt-16 lg:mt-16 xl:mt-24 2xl:mt-32 pointer-events-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { 
                opacity: 1, 
                transition: { staggerChildren: 0.15, delayChildren: 0.1 } 
              }
            }}
            className="flex flex-col items-center gap-6 md:gap-8"
          >
            <motion.h1 
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }
              }}
              style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
              className="text-[11vw] sm:text-[9vw] md:text-[7.5vw] lg:text-[6.5vw] xl:text-[6vw] leading-[0.9] tracking-tight font-medium text-white flex items-center justify-center flex-wrap"
            >
              {greetingTime}{userName ? `, ${userName}` : ""}.
            </motion.h1>

            <motion.p 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
              }}
              style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} 
              className="text-lg md:text-xl text-white/60 font-light tracking-wide max-w-2xl text-center pb-2 px-4"
            >
              Access our catalog of clinical-grade research peptides. Precision synthesized for absolute molecular clarity.
            </motion.p>
            
            <motion.button 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
              }}
              className="group relative flex items-center justify-center px-8 py-4 overflow-hidden rounded-full border border-white/20 bg-transparent transition-all duration-500 hover:bg-white mt-2"
              onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            >
              <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="relative z-10 text-xs md:text-sm font-bold tracking-[0.15em] uppercase text-white transition-colors duration-500 group-hover:text-black pr-6">
                View All Products
              </span>
              <div className="absolute right-6 flex items-center justify-center w-6 h-6 rounded-full bg-white transition-transform duration-500 group-hover:translate-x-2 group-hover:bg-black">
                <svg viewBox="0 0 24 24" className="w-3 h-3 text-black transition-colors duration-500 group-hover:text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </motion.button>
          </motion.div>
        </div>

        {/* The Massive Rotating Arch Loop (Vials Track) */}
        <div className="absolute top-[70vh] md:top-[65vh] lg:top-[75vh] xl:top-[80vh] 2xl:top-[75vh] left-1/2 -translate-x-1/2 w-[350vw] md:w-[250vw] lg:w-[200vw] max-w-[4000px] aspect-square flex items-center justify-center z-10 pointer-events-none">
            
           {/* Detailed Compass/Timeline Track perfectly cutting through center of vials */}
           <div className="absolute inset-0 rounded-full border-[1px] border-white/5" />
           <div className="absolute inset-[-1px] rounded-full border-[2px] border-white/5" />
           <div className="absolute inset-[-1px] rounded-full border-[8px] border-white/20 opacity-40 mix-blend-screen" 
                style={{
                  maskImage: 'repeating-conic-gradient(from 0deg, black 0deg, black 0.05deg, transparent 0.05deg, transparent 2deg)',
                  WebkitMaskImage: 'repeating-conic-gradient(from 0deg, black 0deg, black 0.05deg, transparent 0.05deg, transparent 2deg)'
                }}
           />

           {/* Spinning Image Loop Container */}
           <motion.div 
             className="absolute inset-0 pointer-events-auto will-change-transform"
             style={{ transformOrigin: "center" }}
             animate={{ rotate: 360 }}
             transition={{ duration: 300, repeat: Infinity, ease: "linear" }}
           >
             {loopItems.map((c, i) => {
                const angle = (i * 360) / loopItems.length;

                return (
                  <React.Fragment key={i}>
                    {/* Primary Product Vial Node */}
                    <div 
                      className="absolute inset-0 flex justify-center pointer-events-none will-change-transform"
                      style={{ transform: `rotate(${angle}deg) translateZ(0)` }}
                    >
                       {/* Massive Zoomed-In Interactive Vial, -mt is perfectly half of the height to sit strictly on the line */}
                       <div 
                          className="relative w-[180px] h-[260px] md:w-[280px] md:h-[400px] lg:w-[380px] lg:h-[520px] flex flex-col items-center justify-center group -mt-[130px] md:-mt-[200px] lg:-mt-[260px] cursor-pointer pointer-events-auto"
                          onClick={() => {
                            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
                          }}
                       >
                          {/* Colored ambient glow behind the vial */}
                          <div className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-40 pointer-events-none" style={{ background: `radial-gradient(circle at center, ${c.color}, transparent 60%)` }} />
                          
                          {/* Main Floating Image */}
                          <div className="relative w-full h-full z-10 transition-transform duration-700 ease-[0.16,1,0.3,1] group-hover:scale-[1.12] group-hover:-translate-y-4 will-change-transform">
                             <Image 
                               src={c.img} 
                               alt={c.name} 
                               fill 
                               className="object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,0.5)] md:drop-shadow-[0_45px_45px_rgba(0,0,0,0.8)]"
                               sizes="(max-width: 768px) 250px, 500px"
                               priority={i < 4}
                             />
                          </div>
                       </div>
                    </div>

                  </React.Fragment>
                )
             })}
           </motion.div>
        </div>

        {/* Minimal Feature Mentions Below Carousel */}
        <div className="relative z-30 w-full px-4 flex justify-center pt-[50vh] sm:pt-[45vh] md:pt-[50vh] lg:pt-[60vh] xl:pt-[65vh] 2xl:pt-[60vh] pb-12 md:pb-24">
          <motion.div 
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true, margin: "-100px" }}
             variants={{
               hidden: { opacity: 0, y: 20 },
               visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
             }}
             className="flex flex-wrap items-center justify-center gap-2 md:gap-4 max-w-4xl"
          >
             {/* Small Badge 1 */}
             <div className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md whitespace-nowrap">
                 <Globe className="w-3 h-3 md:w-3.5 md:h-3.5 text-white/50 shrink-0" />
                 <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[10px] md:text-xs font-bold text-white/80 tracking-wide uppercase">Made in Germany</span>
             </div>
             {/* Small Badge 2 */}
             <div className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md whitespace-nowrap">
                 <Snowflake className="w-3 h-3 md:w-3.5 md:h-3.5 text-white/50 shrink-0" />
                 <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[10px] md:text-xs font-bold text-white/80 tracking-wide uppercase">Cold-Chain Transit</span>
             </div>
             {/* Small Badge 3 */}
             <div className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md whitespace-nowrap">
                 <Beaker className="w-3 h-3 md:w-3.5 md:h-3.5 text-white/50 shrink-0" />
                 <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[10px] md:text-xs font-bold text-white/80 tracking-wide uppercase">99% HPLC</span>
             </div>
             {/* Small Badge 4 */}
             <div className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md whitespace-nowrap">
                 <ShieldCheck className="w-3 h-3 md:w-3.5 md:h-3.5 text-white/50 shrink-0" />
                 <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[10px] md:text-xs font-bold text-white/80 tracking-wide uppercase">3rd-Party Tested</span>
             </div>
          </motion.div>
        </div>
      </div>

      {/* PRODUCT GRID SECTION */}
      <div className="relative w-full min-h-screen bg-[#050505] px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 pb-40 z-20">
        <div className="w-full">
          
          {/* Header & Tabs */}
          <div className="flex flex-col items-center text-center justify-center mb-10 md:mb-16 gap-6 md:gap-10 max-w-4xl mx-auto">
            <div className="flex flex-col items-center mt-8 md:mt-0">
              <h2 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[8vw] md:text-[6vw] lg:text-[5vw] font-normal tracking-[-0.04em] leading-[0.85] text-white mb-4 md:mb-6">
                Products
              </h2>
              <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-lg md:text-xl text-white/60 font-light tracking-wide max-w-4xl pb-2">
                Select your compound format. All formulations are synthesized to meet our strict 99%+ purity baseline, validated by independent LC-MS analysis.
              </p>
            </div>
            
            {/* Category Tabs Container (Wrapped & fully visible) */}
            <div className="w-full px-2 sm:px-0 flex justify-center">
              <div className="flex items-center justify-center flex-wrap gap-2 w-full sm:w-fit max-w-full bg-white/[0.03] p-1.5 md:p-2 rounded-[20px] md:rounded-2xl border border-white/5">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => !tab.badge && setActiveTab(tab.id)}
                    className={`relative px-4 py-2.5 md:px-6 md:py-3.5 flex-grow sm:flex-grow-0 justify-center rounded-xl md:rounded-xl flex items-center gap-2 transition-colors duration-500 whitespace-nowrap ${
                      activeTab === tab.id 
                        ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                        : 'text-white/50 hover:text-white/80 hover:bg-white/10 bg-transparent'
                    } ${tab.badge ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  >
                    <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs md:text-sm font-bold tracking-[0.05em] uppercase">
                      {tab.label}
                    </span>
                    {tab.badge && (
                      <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold px-2 py-0.5 md:py-1 rounded-full bg-white/10 text-white/70 backdrop-blur-md">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Vials Grid */}
          {activeTab === 'vials' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
              {vials.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.5, delay: idx * 0.05, ease: [0.25, 1, 0.5, 1] }}
                  className="flex flex-col group h-full will-change-[transform,opacity]"
                >
                  <Link href={`/portal/product/${product.id}`} className="relative w-full aspect-[4/5] bg-white/[0.02] border border-white/10 group-hover:border-white/20 group-hover:bg-white/[0.04] transition-all duration-500 rounded-[2rem] overflow-hidden flex items-center justify-center p-8 mb-6 isolate cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0" />
                    <div className={`relative z-10 w-full h-full transform transition-transform duration-700 ease-[0.16,1,0.3,1] group-hover:-translate-y-2 ${product.scaleClass || 'scale-100'}`}>
                      <div className="w-full h-full relative transition-transform duration-700 ease-[0.16,1,0.3,1] group-hover:scale-105">
                        <Image 
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain drop-shadow-2xl"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      </div>
                    </div>
                    {product.comingSoon ? (
                      <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                        <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-white/80">Coming Soon</span>
                      </div>
                    ) : product.soldOut ? (
                      <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 backdrop-blur-md">
                        <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-red-400/80">Sold Out</span>
                      </div>
                    ) : null}
                  </Link>

                  <div className="flex flex-col px-1 flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[10px] md:text-xs font-bold tracking-widest text-white/40 uppercase">
                        {product.volume}
                      </span>
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-white text-xl md:text-2xl font-light tracking-wide">
                        {product.displayPrice}
                      </span>
                    </div>
                    <h3 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-2xl md:text-3xl font-normal tracking-tight text-white/90 group-hover:text-white transition-colors mb-1">
                      {product.name}
                    </h3>
                    <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm md:text-base text-white/40 font-light tracking-wide mb-8">
                      {product.fullName}
                    </p>
                    
                    {product.comingSoon ? (
                      <Link href={`/portal/product/${product.id}`} className="group/btn relative w-full flex items-center justify-center py-[14px] md:py-4 mt-auto rounded-[20px] md:rounded-full border border-white/10 bg-white/[0.03] transition-all duration-500 hover:border-white/20 hover:bg-white/[0.06] overflow-hidden">
                        <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="relative z-10 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-white/40 group-hover/btn:text-white/60 transition-colors duration-500 pl-6 pr-6">
                          Coming Soon
                        </span>
                        <div className="absolute right-4 md:right-5 flex items-center justify-center w-[22px] md:w-6 h-[22px] md:h-6 rounded-full bg-white/10 transition-transform duration-500 group-hover/btn:translate-x-1 group-hover/btn:bg-white/20">
                          <svg viewBox="0 0 24 24" className="w-[10px] md:w-3 h-[10px] md:h-3 text-white/40 group-hover/btn:text-white/70 transition-colors duration-500" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                        </div>
                      </Link>
                    ) : product.soldOut ? (
                      <Link href={`/portal/product/${product.id}`} className="group/btn relative w-full flex items-center justify-center py-[14px] md:py-4 mt-auto rounded-[20px] md:rounded-full border border-red-500/10 bg-red-500/[0.03] transition-all duration-500 hover:border-red-500/20 hover:bg-red-500/[0.06] overflow-hidden">
                        <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="relative z-10 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-red-400/50 group-hover/btn:text-red-400/70 transition-colors duration-500 pl-6 pr-6">
                          Sold Out
                        </span>
                        <div className="absolute right-4 md:right-5 flex items-center justify-center w-[22px] md:w-6 h-[22px] md:h-6 rounded-full bg-red-500/10 transition-transform duration-500 group-hover/btn:translate-x-1 group-hover/btn:bg-red-500/20">
                          <svg viewBox="0 0 24 24" className="w-[10px] md:w-3 h-[10px] md:h-3 text-red-400/40 group-hover/btn:text-red-400/70 transition-colors duration-500" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                        </div>
                      </Link>
                    ) : (
                      <Link href={`/portal/product/${product.id}`} className="group/btn relative w-full flex items-center justify-center py-[14px] md:py-4 mt-auto rounded-[20px] md:rounded-full border border-[rgba(255,255,255,0.15)] bg-transparent transition-all duration-500 hover:bg-white overflow-hidden">
                        <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="relative z-10 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-white transition-colors duration-500 group-hover/btn:text-black pl-6 pr-6">
                          View Details
                        </span>
                        <div className="absolute right-4 md:right-5 flex items-center justify-center w-[22px] md:w-6 h-[22px] md:h-6 rounded-full bg-white transition-transform duration-500 group-hover/btn:translate-x-1 group-hover/btn:bg-black">
                          <svg viewBox="0 0 24 24" className="w-[10px] md:w-3 h-[10px] md:h-3 text-black transition-colors duration-500 group-hover/btn:text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                        </div>
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pens Grid */}
          {activeTab === 'pens' && (
            <div className="flex flex-col gap-12">
              {/* Amino Zero Brand Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center text-center gap-4"
              >
                <div className="flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.03]">
                  <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-white/60">
                    Manufactured by
                  </span>
                  <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-white">
                    Amino Zero
                  </span>
                </div>
                <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-base md:text-lg text-white/40 font-light tracking-wide max-w-2xl">
                  AmiNexa is the official authorized distributor of Amino Zero pre-filled peptide pen products. Amino Zero is an independent manufacturer.
                </p>
              </motion.div>

              {/* Pen Product Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8">
                {pens.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.25, 1, 0.5, 1] }}
                    className="group will-change-[transform,opacity]"
                  >
                    <Link href={`/portal/product/${product.id}`} className="relative w-full flex flex-col bg-white/[0.02] border border-white/10 group-hover:border-white/20 group-hover:bg-white/[0.04] transition-all duration-500 rounded-[2rem] overflow-hidden cursor-pointer">
                      {/* Pen Image — landscape-optimized */}
                      <div className="relative w-full aspect-[16/7] flex items-center justify-center p-8 md:p-12">
                        <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        <div className="relative z-10 w-full h-full transform transition-transform duration-700 ease-[0.16,1,0.3,1] group-hover:-translate-y-1 group-hover:scale-[1.03]">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-contain drop-shadow-2xl"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex flex-col px-8 pb-8 pt-2">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-white/30 px-2 py-1 rounded-full border border-white/10 bg-white/[0.03]">
                              Amino Zero
                            </span>
                            <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[10px] md:text-xs font-bold tracking-widest text-white/40 uppercase">
                              {product.volume}
                            </span>
                          </div>
                          <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-white text-xl md:text-2xl font-light tracking-wide">
                            {product.displayPrice}
                          </span>
                        </div>
                        <h3 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-2xl md:text-3xl font-normal tracking-tight text-white/90 group-hover:text-white transition-colors mb-1">
                          {product.name}
                        </h3>
                        <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm md:text-base text-white/40 font-light tracking-wide">
                          {product.fullName}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* The Synthesis Standard - Supply Chain Storytelling */}
      <div className="relative w-full py-24 md:py-40 bg-[#050505] overflow-hidden border-t border-white/[0.03]">
        {/* Subtle background glow for the story section */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[50vh] max-w-[1200px] blur-[160px] opacity-30 mix-blend-screen bg-white/[0.03] rounded-[100%] pointer-events-none" />
        
        <div className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 flex flex-col relative z-10">
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center mb-16 md:mb-24">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} 
              className="text-[8vw] md:text-[6vw] lg:text-[5vw] font-normal tracking-[-0.04em] leading-[0.85] text-white mb-6"
            >
              Tested for absolute purity.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} 
              className="text-lg md:text-xl text-white/60 font-light tracking-wide max-w-4xl mx-auto text-center pb-2"
            >
              AmiNexa completely bypasses generic commercial compounding. Every compound undergoes a rigorous gauntlet of testing from initial crystallization to sub-zero transit.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-32">
            {[
              { phase: "01", title: "German Manufacturing", desc: "Synthesized in ISO-certified Munich bio-reactors, utilizing closed-loop sequence matching to identical clinical standards.", icon: "https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/icons/TestTube.webp/public", color: "emerald" },
              { phase: "02", title: "Product Purity", desc: "Triple-checked HPLC protocol. We mandate minimum 99.4%+ optical purity, completely rejecting substandard batches before bottling.", icon: "https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/icons/Research.webp/public", color: "blue" },
              { phase: "03", title: "Premium Packaging", desc: "Beyond the vial. Every compound is protected by custom-engineered inner cardboard packaging and sealed in premium light-proof mylar bags.", icon: "https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/icons/BiologicalTest.webp/public", color: "purple" },
              { phase: "04", title: "Cold-Chain Transit", desc: "Molecular stability demands protection. Every dispatch is packed in insulated cold-boxes with specialized ice packs, preventing thermal degradation.", icon: "https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/icons/Delivery.webp/public", color: "gray" }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: 0.08 * (idx + 1), ease: [0.25, 1, 0.5, 1] }}
                className="flex flex-col group will-change-[transform,opacity]"
              >
                <div className="w-full h-[240px] rounded-3xl bg-white/[0.01] border border-white/[0.05] group-hover:bg-white/[0.04] group-hover:border-white/10 transition-all duration-700 mb-8 flex items-center justify-center relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-t from-${item.color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                  <Image src={item.icon} width={120} height={120} alt={item.title} className="invert opacity-60 group-hover:opacity-100 group-hover:-translate-y-1 group-hover:scale-105 transition-all duration-700" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/30">Phase {item.phase}</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                </div>
                <h3 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-2xl md:text-3xl font-normal text-white mb-3">{item.title}</h3>
                <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-base md:text-lg text-white/50 font-light tracking-wide leading-relaxed pr-4">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <FAQ faqs={generalFaqs} title="Frequently Asked Questions" subtitle="Everything you need to know about peptide research, storage, and our strict quality standards." />
      <WarningSection />
      <Footer />
    </main>
  );
}
