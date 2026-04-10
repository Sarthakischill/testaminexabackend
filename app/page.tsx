"use client";

import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import HeroScrollSequence from "@/components/HeroScrollSequence";
import Footer from "@/components/Footer";
import LoadingScreen from "@/components/LoadingScreen";
import Features from "@/components/Features";
import FAQ, { generalFaqs } from "@/components/FAQ";
import WarningSection from "@/components/WarningSection";

export default function Home() {
  const [videoReady, setVideoReady] = useState(false);
  const onVideoReady = useCallback(() => setVideoReady(true), []);

  return (
    <main className="relative min-h-[100dvh] font-sans">
      <LoadingScreen videoReady={videoReady} />
      <Navbar />
      <div className="flex flex-col">
        <HeroScrollSequence onVideoReady={onVideoReady} />
        <Features />
        <FAQ faqs={generalFaqs} title="FAQs" subtitle="Everything you need to know about peptide research, storage, and our strict quality standards." />
      </div>
      <WarningSection />
      <Footer />
    </main>
  );
}
