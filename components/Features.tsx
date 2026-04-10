"use client";

import { useRef, useEffect } from "react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const MetricCard = ({ title, value, desc, index, iconPath }: { title: string, value: string, desc: string, index: number, iconPath?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const numericValue = value ? parseInt(value.replace(/\D/g, '')) : 0;
  const suffix = value ? value.replace(/[0-9]/g, '') : '';
  const hasValue = !!value;
  
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    if (isInView && hasValue) {
      animate(count, numericValue, { 
        duration: 2, 
        delay: index * 0.15, 
        ease: [0.16, 1, 0.3, 1] 
      });
    }
  }, [isInView, numericValue, index, count, hasValue]);

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col justify-between p-8 md:p-12 rounded-3xl bg-white/5 hover:bg-white/10 border border-white/10 overflow-hidden isolate h-[380px] md:h-[450px] transition-colors duration-500"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <div className="flex flex-col relative z-10">
        <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-white/50 text-xs md:text-sm font-medium tracking-[0.2em] uppercase mb-6 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-white/80 transition-colors duration-500" />
          {title}
        </span>
        {hasValue ? (
          <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-6xl md:text-7xl lg:text-[8rem] font-normal tracking-tighter leading-[0.8] text-white flex items-baseline">
            <motion.span>{rounded}</motion.span>
            <span className="text-[0.6em] ml-1 opacity-50 group-hover:opacity-100 transition-opacity duration-500">{suffix}</span>
          </span>
        ) : (
          <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-5xl md:text-6xl lg:text-7xl font-normal tracking-tighter leading-[0.85] text-white">
            {title}
          </span>
        )}
      </div>

      <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-white/60 text-sm md:text-base font-normal tracking-wide leading-relaxed max-w-[280px] relative z-10 group-hover:text-white/90 transition-colors duration-500">
        {desc}
      </p>

      {/* Ghosted Background Icon */}
      {iconPath && (
        <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-[250px] h-[250px] opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-700 pointer-events-none select-none">
          <Image src={iconPath} alt={title} fill sizes="250px" className="object-contain invert" />
        </div>
      )}
    </motion.div>
  );
};

const FeatureRow = ({ title, desc, index, iconPath }: { title: string, desc: string, index: number, iconPath?: string }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-16 py-12 md:py-20 border-b border-white/10 group overflow-hidden"
    >
      {/* Subtle hover background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -z-10" />

      <h3 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-3xl md:text-5xl lg:text-6xl font-normal tracking-tighter w-full md:w-1/2 text-white/80 group-hover:text-white transition-colors duration-500 flex items-center gap-4 md:gap-8">
        {iconPath && (
          <div className="hidden md:flex items-center justify-center w-20 h-20 rounded-full border border-white/20 bg-white/[0.05] overflow-hidden relative group-hover:bg-white/[0.1] group-hover:border-white/40 transition-colors duration-500 shrink-0 opacity-100">
             <Image src={iconPath} alt={title} width={45} height={45} className="invert opacity-100 group-hover:scale-110 transition-transform duration-700 brightness-200" />
          </div>
        )}
        <span className="group-hover:translate-x-4 transition-transform duration-500 ease-[0.16,1,0.3,1]">
          {title}
        </span>
        <ArrowRight className="w-8 h-8 md:w-12 md:h-12 opacity-0 -translate-x-8 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-[0.16,1,0.3,1]" strokeWidth={1} />
      </h3>
      <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-white/50 text-lg md:text-2xl font-normal leading-relaxed tracking-tight w-full md:w-1/2 group-hover:text-white/80 transition-colors duration-500">
        {desc}
      </p>
    </motion.div>
  );
};

export default function Features() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <section ref={containerRef} className="relative w-full bg-[#050505] text-white overflow-hidden pb-32">
      
      {/* --- Scientifically-Minded Sticky Scroll Section --- */}
      <div className="relative w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 pt-24 md:pt-40">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center mb-16 md:mb-24 gap-6"
        >
          <div className="w-full">
            <h2 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[8vw] md:text-[6vw] lg:text-[5vw] font-normal tracking-[-0.04em] leading-[0.85] text-white">
              Scientifically
              <br />
              minded.
            </h2>
          </div>
          <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-lg md:text-2xl text-white/60 font-normal tracking-tight max-w-md md:max-w-xl pb-2">
            Peptides you can trust to provide absolute, accurate research data.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard 
            index={0}
            title="Potency" 
            value="99%" 
            desc="Lyophilized only maintains 80% potency during transport without insulation. That's why we cold-pack our peptides to maintain 99% potency."
            iconPath="https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/icons/Delivery.webp/public"
          />
          <MetricCard 
            index={1}
            title="Purity" 
            value="99%" 
            desc="All of our research peptides are guaranteed to be independently verified at 99% purity with triple filtration and validated safety."
            iconPath="https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/icons/Research.webp/public"
          />
          <MetricCard 
            index={2}
            title="Longevity" 
            value="99%" 
            desc="99% of peptides won't degrade until 2-6 weeks post-reconstitution when stored correctly."
            iconPath="https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/icons/Support.webp/public"
          />
        </div>
      </div>

      {/* --- Why AmiNexa Section --- */}
      <div className="relative w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 pt-40 md:pt-56">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 md:mb-24 flex flex-col items-center text-center"
        >
          <h2 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[8vw] md:text-[6vw] lg:text-[5vw] font-normal tracking-[-0.04em] leading-[0.85] text-white">
            Why AmiNexa?
          </h2>
          <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-lg md:text-xl text-white/60 font-light tracking-wide max-w-2xl mt-6">
            We refuse to compromise on quality, purity, or stability. Discover the standard that separates clinical-grade synthesis from generic compounding.
          </p>
        </motion.div>

        <div className="flex flex-col border-t border-white/10">
          <FeatureRow 
            index={0}
            title="Cutting-Edge"
            desc="Peptides are nothing new, but that doesn't mean we can't improve and evolve. Our scientists continually apply the latest sterile manufacturing techniques and formulations to keep our peptides at the absolute cutting-edge."
            iconPath="https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/icons/BiologicalTest.webp/public"
          />
          <FeatureRow 
            index={1}
            title="Data-Driven"
            desc="Third-party COA tests are the standard, but HPLC and LC-MS tests still don't cover everything. We go exponentially further by testing our peptides for multi-variable stability to ensure longer-lasting effectiveness post-reconstitution."
            iconPath="https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/icons/Research.webp/public"
          />
          <FeatureRow 
            index={2}
            title="Exacting"
            desc="We believe quality is everything. That's why our peptides are formulated and manufactured in high-end, European pharmaceutical facilities with ISO, HACCP, and GMP certifications. We guarantee our quality is precisely what you require."
            iconPath="https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/icons/Support.webp/public"
          />
        </div>

        {/* Certifications Row */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center mt-40"
        >
          <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs font-medium tracking-[0.2em] uppercase text-white/40 mb-12">Facility Certifications</p>
          <div className="flex flex-wrap justify-center items-center gap-16 md:gap-32 opacity-60 hover:opacity-100 transition-opacity duration-700">
            <div className="relative w-28 h-28 md:w-40 md:h-40 transition-transform duration-700 hover:scale-110">
              <Image 
                src="https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/Logos/Other/iso90012015-logo-300x300-1.png/public"
                alt="ISO 9001:2015"
                fill
                sizes="(max-width: 768px) 112px, 160px"
                className="object-contain invert"
              />
            </div>
            <div className="relative w-28 h-28 md:w-40 md:h-40 transition-transform duration-700 hover:scale-110">
              <Image 
                src="https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/Logos/Other/haccp-hazard-analysis-critical-control-points-logo-300x300-1.png/public"
                alt="HACCP"
                fill
                sizes="(max-width: 768px) 112px, 160px"
                className="object-contain invert"
              />
            </div>
            <div className="relative w-28 h-28 md:w-40 md:h-40 transition-transform duration-700 hover:scale-110">
              <Image 
                src="https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/Logos/Other/gmp-good-manufacturing-practice-certification-logo-300x300-1.png/public"
                alt="GMP Certified"
                fill
                sizes="(max-width: 768px) 112px, 160px"
                className="object-contain invert"
              />
            </div>
          </div>
        </motion.div>
      </div>

    </section>
  );
}
