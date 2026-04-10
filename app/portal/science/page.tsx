"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FlaskConical } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Product } from "@/lib/products";
import { researchData } from "@/lib/research-data";
import { useCart } from "@/lib/cart-context";

export default function ScienceIndexPage() {
  const { totalItems, openCart } = useCart();
  const [vials, setVials] = React.useState<Product[]>([]);

  React.useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.products?.length) {
          setVials(data.products.filter((p: Product) => p.category === "vial"));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <main className="relative min-h-screen w-full bg-[#050505] selection:bg-white/20 selection:text-white">
      <div className="pointer-events-auto relative z-50">
        <Navbar isPortal={true} cartCount={totalItems} cartColor="#ffffff" onCartClick={openCart} />
      </div>

      {/* Hero */}
      <div className="relative w-full pt-40 pb-20 md:pt-48 md:pb-28 px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20">
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[60vw] h-[40vh] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <FlaskConical className="w-4 h-4 text-white/40" strokeWidth={1.5} />
            <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-white/40">
              Peptide Research
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
            className="text-[10vw] md:text-[7vw] lg:text-[5.5vw] font-normal tracking-[-0.04em] leading-[0.85] text-white mb-6"
          >
            Science Library
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
            className="text-lg md:text-xl text-white/50 font-light tracking-wide max-w-2xl mx-auto"
          >
            Explore peer-reviewed research, mechanism data, and clinical findings for every compound in the AmiNexa catalog.
          </motion.p>
        </div>
      </div>

      {/* Product Research Grid */}
      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 pb-40">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8 max-w-6xl mx-auto">
          {vials.map((product, idx) => {
            const research = researchData[product.id];
            if (!research) return null;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={`/portal/science/${product.id}`}
                  className="group flex flex-col md:flex-row bg-white/[0.02] border border-white/10 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-500 rounded-[2rem] overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative w-full md:w-48 lg:w-56 aspect-square md:aspect-auto shrink-0 flex items-center justify-center p-6 md:p-8">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none" style={{ background: `radial-gradient(circle at center, ${product.hex}, transparent 70%)` }} />
                    <div className={`relative w-full h-full md:h-40 lg:h-48 ${product.scaleClass || "scale-100"}`}>
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, 200px"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col justify-center p-6 md:p-8 flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center gap-2 mb-3">
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: product.hex }} className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase truncate">
                        {product.fullName}
                      </span>
                    </div>
                    <h3 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-2xl md:text-3xl font-normal tracking-tight text-white mb-3 group-hover:text-white/90 transition-colors">
                      {product.name}
                    </h3>
                    <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white/40 font-light leading-relaxed mb-5 line-clamp-2">
                      {research.subheadline}
                    </p>

                    {/* Mini Stats */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-5">
                      {research.stats.slice(0, 3).map((stat, i) => (
                        <div key={i} className="flex items-center gap-1.5 min-w-0">
                          <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm font-medium text-white/70 shrink-0">{stat.value}</span>
                          <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[8px] md:text-[9px] font-bold tracking-[0.1em] uppercase text-white/25 truncate">{stat.label}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 text-white/40 group-hover:text-white transition-colors duration-500">
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase">
                        View Research
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-500" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      <Footer />
    </main>
  );
}
