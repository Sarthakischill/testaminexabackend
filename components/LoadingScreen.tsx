"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import { siteConfig } from "@/config/site";

export default function LoadingScreen({ videoReady = false }: { videoReady?: boolean }) {
  const [loading, setLoading] = useState(true);
  const dismissedRef = useRef(false);
  
  const progressValue = useMotionValue(0);
  const smoothProgress = useSpring(progressValue, { damping: 25, stiffness: 100, mass: 0.5 });

  const scaleX = useTransform(smoothProgress, [0, 100], [0, 1]);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    progressValue.set(30);
    
    const midTimer = setTimeout(() => {
      progressValue.set(70);
    }, 400);

    return () => {
      clearTimeout(midTimer);
      document.body.style.overflow = "";
    };
  }, [progressValue]);

  useEffect(() => {
    if (!videoReady || dismissedRef.current) return;
    dismissedRef.current = true;

    progressValue.set(100);

    const dismissTimer = setTimeout(() => {
      setLoading(false);
      document.body.style.overflow = "";
    }, 500);

    return () => clearTimeout(dismissTimer);
  }, [videoReady, progressValue]);

  useEffect(() => {
    const maxWait = setTimeout(() => {
      if (dismissedRef.current) return;
      dismissedRef.current = true;
      progressValue.set(100);
      setTimeout(() => {
        setLoading(false);
        document.body.style.overflow = "";
      }, 500);
    }, 8000);

    return () => clearTimeout(maxWait);
  }, [progressValue]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
           initial={{ y: "0%" }}
           exit={{ 
             y: "-100%",
             transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
           }}
           className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] overflow-hidden will-change-transform"
        >
          <div className="relative flex flex-col items-center w-full px-12">
            
            {/* Logo Container */}
            <div className="flex items-center justify-center mb-10 h-16 w-full relative">
              <div className="flex items-center gap-3">
                {/* Icon Container */}
                <div className="relative w-10 h-10 md:w-12 md:h-12 shrink-0">
                  <Image 
                    src={siteConfig.faviconUrl || "/favicon.svg"} 
                    alt={`${siteConfig.name} Icon`}
                    fill
                    priority
                    sizes="48px"
                    className="object-contain"
                  />
                </div>

                {/* Logotype Container */}
                <div className="h-8 md:h-10 relative w-[120px] md:w-[150px]">
                  <Image 
                    src={siteConfig.logoUrl || "/logo.svg"} 
                    alt={`${siteConfig.name} Logo`}
                    fill
                    priority
                    sizes="150px"
                    className="object-contain object-left"
                  />
                </div>
              </div>
            </div>

            {/* Progress Bar Container */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center mt-6"
            >
              <div className="w-48 md:w-64 h-[1px] bg-white/10 overflow-hidden relative">
                <motion.div
                  style={{ 
                    scaleX,
                    transformOrigin: "0% 50%"
                  }}
                  className="absolute inset-y-0 left-0 w-full bg-white will-change-transform"
                />
              </div>
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
