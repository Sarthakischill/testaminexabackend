"use client";

import { motion, Variants } from "framer-motion";
import { ArrowDown } from "lucide-react";
import Link from "next/link";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const containerVariantsDelayed: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.6,
    },
  },
};

export default function Hero() {
  return (
    <section className="relative w-full h-[100dvh] bg-[#050505] overflow-hidden flex flex-col justify-between">
      {/* Background Video & Overlays */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        >
          <source src="/hero-vid.webm" type="video/webm" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80 z-10" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-30 flex-1 flex flex-col justify-center px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 w-full mt-20">
        <div className="flex flex-col w-full">
          {/* Part 1: Left Aligned */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
            className="text-[13vw] sm:text-[11vw] md:text-[9vw] lg:text-[8vw] xl:text-[7.5vw] leading-[0.9] tracking-tight text-white font-medium max-w-full lg:max-w-[80%]"
          >
            <span className="block whitespace-nowrap">Pharmaceutical</span>
            <span className="block whitespace-nowrap">grade purity</span>
            <span className="block whitespace-nowrap">for absolute</span>
          </motion.div>
          
          {/* Part 2 & CTA Container */}
          <div className="flex flex-col md:flex-row items-end md:items-end justify-between mt-12 sm:mt-16 md:mt-24 lg:mt-32 w-full gap-8 md:gap-0">
            
            {/* Desktop CTA Button (Left Aligned on Desktop) - Hidden on Mobile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
              className="hidden md:block md:pb-2 self-start"
            >
              <Link href="/login" className="group relative flex items-center justify-center px-8 py-4 overflow-hidden rounded-full border border-white/20 bg-white/5 backdrop-blur-md transition-all duration-500 hover:bg-white hover:border-white">
                <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="relative z-10 text-sm md:text-base font-medium tracking-[0.15em] uppercase text-white transition-colors duration-500 group-hover:text-black pr-6">
                  Enter Portal
                </span>
                <div className="absolute right-6 flex items-center justify-center w-6 h-6 rounded-full bg-white transition-transform duration-500 group-hover:translate-x-2 group-hover:bg-black">
                  <svg 
                    viewBox="0 0 24 24" 
                    className="w-3 h-3 text-black transition-colors duration-500 group-hover:text-white"
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </Link>
            </motion.div>

            {/* Part 2: Right Aligned */}
            <motion.div 
              variants={containerVariantsDelayed}
              initial="hidden"
              animate="show"
              style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
              className="text-[13vw] sm:text-[11vw] md:text-[9vw] lg:text-[8vw] xl:text-[7.5vw] leading-[0.9] tracking-tight text-white font-medium text-right max-w-full lg:max-w-[80%] self-end"
            >
              <span className="block whitespace-nowrap">research</span>
              <span className="block whitespace-nowrap">precision</span>
            </motion.div>

            {/* Mobile CTA Button (Left Aligned on Mobile) - Hidden on Desktop */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="block md:hidden mt-4 self-start"
            >
              <Link href="/login" className="group relative flex items-center justify-center px-6 py-3.5 overflow-hidden rounded-full border border-white/20 bg-white/5 backdrop-blur-md transition-all duration-500 hover:bg-white hover:border-white">
                <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="relative z-10 text-xs font-medium tracking-[0.15em] uppercase text-white transition-colors duration-500 group-hover:text-black pr-6">
                  Enter Portal
                </span>
                <div className="absolute right-4 flex items-center justify-center w-5 h-5 rounded-full bg-white transition-transform duration-500 group-hover:translate-x-1 group-hover:bg-black">
                  <svg 
                    viewBox="0 0 24 24" 
                    className="w-2.5 h-2.5 text-black transition-colors duration-500 group-hover:text-white"
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="relative z-30 pb-8 px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 w-full flex items-center gap-3 text-white text-sm md:text-base font-normal tracking-wide"
        style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
      >
        <ArrowDown className="w-4 h-4 md:w-5 md:h-5 animate-bounce" />
        Scroll for more
      </motion.div>
    </section>
  );
}
