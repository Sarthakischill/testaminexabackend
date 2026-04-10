"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ShieldAlert, Snowflake, Microscope } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function LandingStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // High-level scroll progress for the whole section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Story 1: German Precision
  const opacity1 = useTransform(scrollYProgress, [0, 0.15, 0.3, 0.45], [0, 1, 1, 0]);
  const y1 = useTransform(scrollYProgress, [0, 0.15, 0.3, 0.45], [50, 0, 0, -50]);
  const scale1 = useTransform(scrollYProgress, [0, 0.3], [0.95, 1.05]);

  // Story 2: Cold-Chain
  const opacity2 = useTransform(scrollYProgress, [0.35, 0.5, 0.65, 0.8], [0, 1, 1, 0]);
  const y2 = useTransform(scrollYProgress, [0.35, 0.5, 0.65, 0.8], [50, 0, 0, -50]);
  const blur2 = useTransform(scrollYProgress, [0.35, 0.5], ["10px", "0px"]);

  // Story 3: Purity
  const opacity3 = useTransform(scrollYProgress, [0.7, 0.85, 1], [0, 1, 1]);
  const y3 = useTransform(scrollYProgress, [0.7, 0.85, 1], [50, 0, 0]);

  // Global background color shifting slightly
  const bgShift = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["#020202", "#05070A", "#030303"]
  );

  return (
    <motion.section 
      ref={containerRef} 
      className="relative h-[400vh] w-full"
      style={{ backgroundColor: bgShift }}
    >
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        
        {/* Dynamic Abstract Background Elements */}
        {/* Orb 1: Precision (Silver/Charcoal) */}
        <motion.div 
          className="absolute w-[800px] h-[800px] rounded-full mix-blend-screen opacity-20 blur-[120px] pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(20,20,20,1) 70%)",
            opacity: useTransform(scrollYProgress, [0, 0.3, 0.5], [0.15, 0.2, 0]),
            scale: scale1,
          }}
        />

        {/* Orb 2: Cold (Ice Blue) */}
        <motion.div 
          className="absolute w-[100vw] h-[100vh] mix-blend-screen opacity-10 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at bottom, #112A46 0%, transparent 60%)",
            opacity: useTransform(scrollYProgress, [0.3, 0.5, 0.8], [0, 0.5, 0]),
          }}
        />
        
        {/* Story 1 */}
        <motion.div 
          className="absolute w-full px-6 md:px-12 flex flex-col items-center text-center max-w-5xl mx-auto"
          style={{ opacity: opacity1, y: y1 }}
        >
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl mb-8 shadow-2xl">
            <ShieldAlert className="w-8 h-8 md:w-10 md:h-10 text-white/80" />
          </div>
          <h3 className="text-4xl md:text-7xl font-black tracking-tighter text-white mb-6 uppercase leading-[0.9]">
             Engineered <br className="hidden md:block"/> in <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Germany</span>
          </h3>
          <p className="text-lg md:text-2xl text-white/50 max-w-2xl font-light tracking-wide leading-relaxed">
            Manufactured in world-class facilities to exact specifications. We reject the industry standard of unverified sourcing, ensuring absolute consistency from synthesis to vial.
          </p>
        </motion.div>

        {/* Story 2 */}
        <motion.div 
          className="absolute w-full px-6 md:px-12 flex flex-col items-center text-center max-w-5xl mx-auto"
          style={{ opacity: opacity2, y: y2, filter: `blur(${blur2})` }}
        >
           <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#112A46]/30 border border-[#112A46]/50 flex items-center justify-center backdrop-blur-xl mb-8 shadow-[0_0_40px_rgba(17,42,70,0.6)]">
            <Snowflake className="w-8 h-8 md:w-10 md:h-10 text-blue-200" />
          </div>
          <h3 className="text-4xl md:text-7xl font-black tracking-tighter text-white mb-6 uppercase leading-[0.9]">
             Unbroken <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-[#112A46]">Cold Chain</span>
          </h3>
          <p className="text-lg md:text-2xl text-white/50 max-w-2xl font-light tracking-wide leading-relaxed">
            Peptides degrade under heat. While others ship in standard envelopes, every {siteConfig.name} order is packed in insulated cold-shippers with advanced refrigerants to preserve complete molecular integrity.
          </p>
        </motion.div>

        {/* Story 3 */}
        <motion.div 
          className="absolute w-full px-6 md:px-12 flex flex-col items-center text-center max-w-5xl mx-auto"
          style={{ opacity: opacity3, y: y3 }}
        >
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/5 border border-white/20 flex items-center justify-center backdrop-blur-xl mb-8 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            <Microscope className="w-8 h-8 md:w-10 md:h-10 text-white/90" />
          </div>
          <h3 className="text-4xl md:text-7xl font-black tracking-tighter text-white mb-6 uppercase leading-[0.9]">
             Clinical <br/> <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-600">Purity</span>
          </h3>
          <p className="text-lg md:text-2xl text-white/50 max-w-2xl font-light tracking-wide leading-relaxed">
            We guarantee 99.9%+ purity on every batch. No fillers, no compromises. All Certificates of Analysis are publicly verified and independently backed by top-tier third-party laboratories.
          </p>
        </motion.div>

      </div>
    </motion.section>
  );
}
