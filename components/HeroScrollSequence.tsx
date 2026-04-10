"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, Variants, MotionValue, useMotionValue } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { siteConfig } from "@/config/site";

function lerp(v: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  if (v <= inMin) return outMin;
  if (v >= inMax) return outMax;
  return outMin + ((v - inMin) / (inMax - inMin)) * (outMax - outMin);
}

const stockImages = [
  "https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/Stock_Photos/hamish-duncan-Ae1rnzWL_44-unsplash.jpg/public",
  "https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/Stock_Photos/labbeakers.jpg/public",
  "https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/Stock_Photos/labmicroscope.jpg/public",
  "https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/Stock_Photos/labproduction.jpg/public",
  "https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/Stock_Photos/milada-vigerova-YbiL2tzN_ig-unsplash.jpg/public",
  "https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/Stock_Photos/molecules1white.jpg/public",
  "https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/Stock_Photos/molecules2color.jpg/public",
  "https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/Stock_Photos/molecules2white.jpg/public",
];

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

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

function FadingWord({ word, step, scrollYProgress }: { word: string; step: number; scrollYProgress: MotionValue<number> }) {
  const snapPoint = 0.02 + step * (0.04 / 8);
  const scrollOpacity = useTransform(scrollYProgress, (v) => (v >= snapPoint ? 0 : 1));

  return (
    <motion.span variants={wordVariants} style={{ display: "inline-block" }}>
      <motion.span style={{ opacity: scrollOpacity, display: "inline-block" }}>{word}</motion.span>
    </motion.span>
  );
}

const loginWords = "Unlock rigorous, pharma-grade scientific peptides. Log securely into the research terminal or register now.".split(" ");
const portalWords = "Your research portal is ready. Access pharmaceutical-grade peptides, track orders, and manage your account.".split(" ");

function AppearingWord({ word, step, scrollYProgress }: { word: string; step: number; scrollYProgress: MotionValue<number> }) {
  const start = 0.02 + step * 0.003;
  const end = start + 0.012;
  const opacity = useTransform(scrollYProgress, [start, end], [0, 1]);
  const y = useTransform(scrollYProgress, [start, end], [8, 0]);

  return (
    <motion.span style={{ opacity, y, display: "inline-block" }} className="mr-[0.3em] font-light">
      {word}
    </motion.span>
  );
}

const LoginRevealContent = ({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const { createClient } = require("@/lib/supabase/client");
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: any } }) => {
      if (user) setIsAuthenticated(true);
    });
  }, []);

  const words = isAuthenticated ? portalWords : loginWords;
  const ctaStart = 0.02 + words.length * 0.003 + 0.005;
  const ctaOpacityInner = useTransform(scrollYProgress, [ctaStart, ctaStart + 0.02], [0, 1]);
  const ctaY = useTransform(scrollYProgress, [ctaStart, ctaStart + 0.02], [10, 0]);

  const textColor = useTransform(scrollYProgress, [0.85, 0.95], ["#000000", "#ffffff"]);
  const borderColor = useTransform(scrollYProgress, [0.85, 0.95], ["rgba(0,0,0,0.2)", "rgba(255,255,255,0.2)"]);
  const iconBg = useTransform(scrollYProgress, [0.85, 0.95], ["#000000", "#ffffff"]);
  const iconFg = useTransform(scrollYProgress, [0.85, 0.95], ["#ffffff", "#000000"]);

  return (
    <motion.div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-30 px-4 md:px-10 lg:px-20">
      <div className="max-w-[900px] text-center flex flex-col items-center mt-10">
        <motion.h3 style={{ color: textColor }} className="text-2xl sm:text-3xl md:text-5xl lg:text-[3.5rem] tracking-tight mb-12 leading-[1.2]">
          {words.map((word, i) => (
            <AppearingWord key={i} word={word} step={i} scrollYProgress={scrollYProgress} />
          ))}
        </motion.h3>

        <motion.div style={{ opacity: ctaOpacityInner, y: ctaY }} className="pointer-events-auto">
          <Link href={isAuthenticated ? "/portal" : "/login"} className="group flex w-fit">
            <motion.div
              style={{ borderColor, color: textColor }}
              className="relative flex items-center justify-center px-10 py-4 overflow-hidden rounded-full border bg-transparent transition-all duration-500 hover:bg-black"
            >
              <span
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                className="relative z-10 text-xs md:text-sm font-medium tracking-[0.15em] uppercase transition-colors duration-500 group-hover:text-white pr-6"
              >
                {isAuthenticated ? "Go to Portal" : "Log In / Register"}
              </span>
              <motion.div
                style={{ backgroundColor: iconBg, color: iconFg }}
                className="absolute right-6 flex items-center justify-center w-6 h-6 rounded-full transition-transform duration-500 group-hover:translate-x-2 group-hover:bg-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-3 h-3 transition-colors duration-500 group-hover:text-black"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </motion.div>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

function OrbitItem({
  index,
  imageSrc,
  scrollYProgress,
  windowWidth,
}: {
  index: number;
  imageSrc: string;
  scrollYProgress: MotionValue<number>;
  windowWidth: MotionValue<number>;
}) {
  const angles = [20, 60, 100, 140, 220, 260, 300, 340];
  const baseAng = angles[index];

  const xRaw = useTransform([scrollYProgress, windowWidth], ([v, ww]: number[]) => {
    const baseRx = ww < 768 ? lerp(v, 0.20, 0.50, 30, 80) : 55;
    const finalRx = lerp(v, 0.65, 0.85, baseRx, 200);

    const initialSpin = lerp(v, 0.0, 0.25, baseAng - 180, baseAng);
    const continuousSpin = lerp(v, 0.25, 0.65, 0, 60);
    const r = lerp(v, 0.0, 0.25, 0, 1);
    return Math.cos(((initialSpin + continuousSpin) * Math.PI) / 180) * finalRx * r;
  });

  const yRaw = useTransform([scrollYProgress, windowWidth], ([v, ww]: number[]) => {
    const baseRy = ww < 768 ? lerp(v, 0.20, 0.50, 25, 75) : 45;
    const finalRy = lerp(v, 0.65, 0.85, baseRy, 200);

    const initialSpin = lerp(v, 0.0, 0.25, baseAng - 180, baseAng);
    const continuousSpin = lerp(v, 0.25, 0.65, 0, 60);
    const r = lerp(v, 0.0, 0.25, 0, 1);
    return Math.sin(((initialSpin + continuousSpin) * Math.PI) / 180) * finalRy * r;
  });

  const x = useTransform(xRaw, (v) => `${v}vw`);
  const y = useTransform(yRaw, (v) => `${v}vh`);

  const targetScaleBase = 0.35 + (index % 4) * 0.12;
  const scale = useTransform([scrollYProgress, windowWidth], ([v, ww]: number[]) => {
    if (v < 0.0) return 0;
    const mobileBoost = ww < 768 ? 0.25 : 0;
    return lerp(v, 0.0, 0.20, 0, targetScaleBase + mobileBoost);
  });

  const opacity = useTransform(scrollYProgress, [0.70, 0.85], [1, 0]);

  return (
    <motion.div style={{ x, y, scale, opacity }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 origin-center z-10 pointer-events-none">
      <motion.div
        animate={{ x: ["-10px", "10px", "-10px"] }}
        transition={{ duration: 4 + (index % 3), repeat: Infinity, ease: "easeInOut" }}
        className="w-[40vw] h-[25vw] md:w-[25vw] md:h-[18vw] relative rounded-lg overflow-hidden shadow-2xl"
      >
        <Image src={imageSrc} alt={`${siteConfig.name} hero image`} fill sizes="(max-width: 768px) 40vw, 20vw" className="object-cover" />
      </motion.div>
    </motion.div>
  );
}

const HeroTextContent = ({
  textColor,
  scrollYProgress,
}: {
  textColor: string;
  scrollYProgress: MotionValue<number>;
}) => {
  const ctaSnapPoint = 0.02 + 8 * (0.04 / 8);
  const ctaOpacity = useTransform(scrollYProgress, (v: number) => (v >= ctaSnapPoint ? 0 : 1));

  return (
    <div className={`flex flex-col justify-center px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 absolute inset-0 w-full h-full pointer-events-none ${textColor}`}>
      <div className="flex flex-col w-full mt-14 sm:mt-16 md:mt-20">
        {/* Part 1: Left Aligned */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
          className="text-[11vw] sm:text-[10vw] md:text-[9vw] lg:text-[8vw] xl:text-[7.5vw] leading-[0.95] tracking-tight font-medium max-w-full lg:max-w-[80%]"
        >
          <span className="block">
            <FadingWord word="Pharmaceutical" step={0} scrollYProgress={scrollYProgress} />
          </span>
          <span className="block">
            <FadingWord word="grade" step={1} scrollYProgress={scrollYProgress} />
            <span>&nbsp;</span>
            <FadingWord word="purity" step={2} scrollYProgress={scrollYProgress} />
          </span>
          <span className="block">
            <FadingWord word="for" step={3} scrollYProgress={scrollYProgress} />
            <span>&nbsp;</span>
            <FadingWord word="absolute" step={4} scrollYProgress={scrollYProgress} />
          </span>
        </motion.div>

        {/* Part 2 & CTA Container */}
        <div className="flex flex-col md:flex-row items-end md:items-end justify-between mt-6 sm:mt-8 md:mt-16 lg:mt-20 w-full gap-6 md:gap-0">
          {/* Desktop CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
            className="hidden md:block md:pb-2 self-start pointer-events-auto"
          >
            <motion.div style={{ opacity: ctaOpacity }}>
              <Link
                href="/login"
                className="group relative flex items-center justify-center px-8 py-4 overflow-hidden rounded-full border border-white/20 bg-white/5 backdrop-blur-md transition-all duration-500 hover:bg-white hover:border-white"
              >
                <span
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                  className="relative z-10 text-sm md:text-base font-medium tracking-[0.15em] uppercase text-white transition-colors duration-500 group-hover:text-black pr-6"
                >
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
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Part 2: Right Aligned */}
          <motion.div
            variants={containerVariantsDelayed}
            initial="hidden"
            animate="show"
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            className="text-[11vw] sm:text-[10vw] md:text-[9vw] lg:text-[8vw] xl:text-[7.5vw] leading-[0.95] tracking-tight font-medium text-right max-w-full lg:max-w-[80%] self-end pb-2"
          >
            <span className="block">
              <FadingWord word="research" step={5} scrollYProgress={scrollYProgress} />
            </span>
            <span className="block">
              <FadingWord word="precision" step={6} scrollYProgress={scrollYProgress} />
            </span>
          </motion.div>

          {/* Mobile CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="block md:hidden mt-4 self-start pointer-events-auto"
          >
            <motion.div style={{ opacity: ctaOpacity }}>
              <Link
                href="/login"
                className="group relative flex items-center justify-center px-6 py-3.5 overflow-hidden rounded-full border border-white/20 bg-white/5 backdrop-blur-md transition-all duration-500 hover:bg-white hover:border-white"
              >
                <span
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                  className="relative z-10 text-xs font-medium tracking-[0.15em] uppercase text-white transition-colors duration-500 group-hover:text-black pr-6"
                >
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
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default function HeroScrollSequence({ onVideoReady }: { onVideoReady?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const videoReadyFired = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const fireVideoReady = () => {
    if (!videoReadyFired.current) {
      videoReadyFired.current = true;
      onVideoReady?.();
    }
  };

  const windowWidth = useMotionValue(1920);
  const windowHeight = useMotionValue(1080);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fireVideoReady();
    }, 4000);
    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const updateDimensions = () => {
      windowWidth.set(window.innerWidth);
      windowHeight.set(window.innerHeight);
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [isMounted, windowWidth, windowHeight]);

  const { scrollYProgress } = useScroll({
    target: isMounted ? containerRef : undefined,
    offset: ["start start", "end end"],
  });

  const heroScaleRadiusRaw = useTransform(scrollYProgress, (v) => lerp(v, 0.0, 0.25, 0, 1));

  const heroWidthRaw = useTransform([heroScaleRadiusRaw, windowWidth], ([r, ww]: number[]) => {
    const targetVw = ww < 768 ? 32 : 18;
    return 100 - r * (100 - targetVw);
  });

  const heroHeightRaw = useTransform([heroScaleRadiusRaw, windowWidth, windowHeight], ([r, ww, wh]: number[]) => {
    const targetVw = ww < 768 ? 32 : 18;
    const targetVh = (((targetVw / 100) * ww * 0.75) / wh) * 100;
    return 100 - r * (100 - targetVh);
  });

  const heroXRaw = useTransform([scrollYProgress, windowWidth], ([v, ww]: number[]) => {
    const baseRx = ww < 768 ? lerp(v, 0.20, 0.50, 30, 80) : 55;
    const finalRx = lerp(v, 0.65, 0.85, baseRx, 200);

    const videoBase = 60;
    const initialSpin = lerp(v, 0.05, 0.30, videoBase - 180, videoBase);
    const continuousSpin = lerp(v, 0.25, 0.65, 0, 60);
    const r = lerp(v, 0.05, 0.30, 0, 1);
    return Math.cos(((initialSpin + continuousSpin) * Math.PI) / 180) * finalRx * r;
  });
  const heroYRaw = useTransform([scrollYProgress, windowWidth], ([v, ww]: number[]) => {
    const baseRy = ww < 768 ? lerp(v, 0.20, 0.50, 25, 75) : 45;
    const finalRy = lerp(v, 0.65, 0.85, baseRy, 200);

    const videoBase = 60;
    const initialSpin = lerp(v, 0.05, 0.30, videoBase - 180, videoBase);
    const continuousSpin = lerp(v, 0.25, 0.65, 0, 60);
    const r = lerp(v, 0.05, 0.30, 0, 1);
    return Math.sin(((initialSpin + continuousSpin) * Math.PI) / 180) * finalRy * r;
  });

  const heroBorderRadiusRaw = useTransform(scrollYProgress, (v) => lerp(v, 0.0, 0.25, 0, 16));

  const heroWidth = useTransform(heroWidthRaw, (w) => `${w}vw`);
  const heroHeight = useTransform(heroHeightRaw, (h) => `${h}vh`);
  const heroX = useTransform(heroXRaw, (x) => `${x}vw`);
  const heroY = useTransform(heroYRaw, (y) => `${y}vh`);
  const heroBorderRadius = useTransform(heroBorderRadiusRaw, (r) => `${r}px`);

  const heroOpacity = useTransform(scrollYProgress, [0, 0.70, 0.85], [1, 1, 0]);

  const clipPath = useTransform([heroXRaw, heroYRaw, heroWidthRaw, heroHeightRaw, heroBorderRadiusRaw], ([tx, ty, w, h, br]: number[]) => {
    const top = 50 + ty - h / 2;
    const bottom = 50 - ty - h / 2;
    const left = 50 + tx - w / 2;
    const right = 50 - tx - w / 2;
    return `inset(${top}% ${right}% ${bottom}% ${left}% round ${br}px)`;
  });

  const initialTextOpacity = useTransform(scrollYProgress, [0.70, 0.85], [1, 0]);
  const bgColor = useTransform(scrollYProgress, [0.85, 0.95], ["#ffffff", "#050505"]);
  const watermarkBlackOpacity = useTransform(scrollYProgress, [0.85, 0.95], [0.06, 0]);
  const watermarkWhiteOpacity = useTransform(scrollYProgress, [0.85, 0.95], [0, 0.06]);

  if (!isMounted) {
    return <section className="relative w-full h-[100dvh] bg-white" />;
  }

  return (
    <div ref={containerRef} className="h-[360vh] relative w-full">
      <motion.div style={{ backgroundColor: bgColor }} className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center relative">
        {/* Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <motion.div style={{ opacity: watermarkBlackOpacity }} className="absolute">
            <Image src={siteConfig.faviconUrl || "/favicon.svg"} alt="" width={700} height={700} className="object-contain" loading="lazy" />
          </motion.div>
          <motion.div style={{ opacity: watermarkWhiteOpacity }} className="absolute">
            <Image src={siteConfig.faviconUrl || "/favicon.svg"} alt="" width={700} height={700} className="object-contain" />
          </motion.div>
        </div>

        {/* Login reveal text */}
        <LoginRevealContent scrollYProgress={scrollYProgress} />

        {/* Layer 1: Black text (beneath video, visible against white bg) */}
        <motion.div style={{ opacity: initialTextOpacity }} className="absolute inset-0 z-0 pointer-events-none">
          <HeroTextContent
            textColor="text-black"
            scrollYProgress={scrollYProgress}
          />
        </motion.div>

        {/* Layer 2: Orbiting images */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {stockImages.map((src, i) => (
            <OrbitItem key={i} index={i} imageSrc={src} scrollYProgress={scrollYProgress} windowWidth={windowWidth} />
          ))}
        </div>

        {/* Layer 3: Hero video */}
        <motion.div
          style={{ x: heroX, y: heroY, width: heroWidth, height: heroHeight, opacity: heroOpacity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 origin-center z-20 pointer-events-none"
        >
          <motion.div style={{ borderRadius: heroBorderRadius }} className="w-full h-full relative overflow-hidden">
            {videoFailed && (
              <Image
                src={stockImages[1]}
                alt={`${siteConfig.name} hero`}
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
            )}
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onCanPlayThrough={fireVideoReady}
              onLoadedData={fireVideoReady}
              onError={() => {
                setVideoFailed(true);
                fireVideoReady();
              }}
              className={`absolute inset-0 w-full h-full object-cover ${videoFailed ? 'hidden' : ''}`}
            >
              <source src="https://fcpnwblwttnkpycovcwv.supabase.co/storage/v1/object/public/herovideo/hero-vid.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/30 z-10" />
          </motion.div>
        </motion.div>

        {/* Layer 4: White text clipped to video */}
        <motion.div style={{ clipPath, opacity: initialTextOpacity }} className="absolute inset-0 z-40 pointer-events-none">
          <HeroTextContent
            textColor="text-white"
            scrollYProgress={scrollYProgress}
          />
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          style={{ opacity: initialTextOpacity }}
          className="absolute bottom-10 left-0 z-50 px-6 md:px-10 lg:px-14 xl:px-20 w-fit flex items-center gap-3 text-white mix-blend-difference pointer-events-none"
        >
          <ArrowDown className="w-4 h-4 md:w-5 md:h-5" />
          <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-sm md:text-base font-normal tracking-wide">
            Scroll for more
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
