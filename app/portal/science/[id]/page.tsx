"use client";

import { siteConfig } from "@/config/site";
import React, { use, useEffect, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useLenis } from "lenis/react";
import {
  ArrowRight,
  ArrowLeft,
  FlaskConical,
  Dna,
  Microscope,
  BookOpen,
  Beaker,
  ExternalLink,
  ShieldAlert,
  Atom,
  Activity,
  TestTubes,
  FileSearch,
  Shield,
  HelpCircle,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { products as staticProducts, type Product } from "@/lib/products";
import { researchData, type ChartBar } from "@/lib/research-data";
import { useCart } from "@/lib/cart-context";

import WarningSection from "@/components/WarningSection";

function AnimatedCounter({ value, delay = 0 }: { value: string; delay?: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
      className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-white leading-none"
    >
      {value}
    </motion.span>
  );
}

function AnimatedBar({ bar, index, color }: { bar: ChartBar; index: number; color: string }) {
  const percentage = (bar.value / bar.maxValue) * 100;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-xs text-white/50 font-light">
          {bar.label}
        </span>
        <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-xs font-medium text-white/70">
          {bar.value}{bar.unit ? ` ${bar.unit}` : ""}
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${percentage}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.2 + index * 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{ backgroundColor: color, opacity: 0.7 }}
        />
      </div>
    </div>
  );
}

function EfficacyBar({ value, delay }: { value: number; delay: number }) {
  return (
    <div className="flex items-center gap-3 mt-3">
      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full bg-white/30"
        />
      </div>
      <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-[10px] font-bold tracking-wider text-white/30 w-10 text-right">
        {value}%
      </span>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className="border-b border-white/5 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-start justify-between gap-4 py-6 text-left group"
      >
        <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-base md:text-lg text-white/80 font-normal group-hover:text-white transition-colors">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="shrink-0 mt-1"
        >
          <ChevronDown className="w-4 h-4 text-white/30" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden"
      >
        <p style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-sm md:text-base text-white/40 font-light leading-relaxed pb-6">
          {answer}
        </p>
      </motion.div>
    </div>
  );
}

const sectionIcons = [Activity, Atom, TestTubes, FileSearch];

export default function ScienceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { totalItems, openCart } = useCart();
  const [allProducts, setAllProducts] = React.useState<Product[]>(staticProducts);

  React.useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.products?.length) setAllProducts(data.products);
      })
      .catch(() => {});
  }, []);

  const vials = allProducts.filter((p) => p.category === "vial");

  const lenis = useLenis();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
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

  const product = allProducts.find((p) => p.id === id);
  const research = researchData[id];

  if (!product || !research) {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Research data not found</h1>
          <Link href="/portal/science" className="text-white/50 hover:text-white underline">
            Back to Science Library
          </Link>
        </div>
      </main>
    );
  }

  const vialIndex = vials.findIndex((v) => v.id === id);
  const prevVial = vials[(vialIndex - 1 + vials.length) % vials.length];
  const nextVial = vials[(vialIndex + 1) % vials.length];

  return (
    <main className="relative min-h-screen w-full bg-[#050505] text-white selection:bg-white/20 selection:text-white">
      <div className="pointer-events-auto relative z-50">
        <Navbar isPortal={true} cartCount={totalItems} cartColor={product.hex} onCartClick={openCart} />
      </div>

      {/* Hero Section */}
      <section className="relative w-full pt-32 pb-16 md:pt-44 md:pb-24 px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.12 }}
          transition={{ duration: 2 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[900px] max-h-[900px] rounded-full blur-[120px]"
          style={{ backgroundColor: product.hex }}
        />

        <div className="w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3 mb-8"
          >
            <Link
              href="/portal/science"
              className="flex items-center gap-2 text-white/40 hover:text-white transition-colors duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase">
                Science Library
              </span>
            </Link>
            <span className="text-white/20">/</span>
            <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase text-white/60">
              {product.name}
            </span>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="flex items-center gap-2 mb-4"
              >
                <FlaskConical className="w-4 h-4 text-white/40" strokeWidth={1.5} />
                <span style={{ fontFamily: "Helvetica, Arial, sans-serif", color: product.hex }} className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">
                  Research Profile
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                className="text-[10vw] md:text-[6vw] lg:text-[4.5vw] font-normal tracking-[-0.04em] leading-[0.85] text-white mb-6"
              >
                {research.headline}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.25 }}
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                className="text-lg md:text-xl text-white/50 font-light tracking-wide leading-relaxed max-w-2xl"
              >
                {research.subheadline}
              </motion.p>
            </div>

            {/* Product Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-48 h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 shrink-0 mx-auto lg:mx-0"
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                sizes="300px"
                priority
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 py-16 md:py-24 border-t border-white/5">
        <div className="w-full">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {research.stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col p-6 md:p-8 rounded-2xl bg-white/[0.02] border border-white/10"
              >
                <AnimatedCounter value={stat.value} delay={idx * 0.1} />
                <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-xs md:text-sm font-bold tracking-[0.1em] uppercase text-white/60 mt-3 mb-1">
                  {stat.label}
                </span>
                <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-xs text-white/30 font-light">
                  {stat.sublabel}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mechanism of Action */}
      <section className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 py-20 md:py-32 border-t border-white/5">
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3 mb-4"
          >
            <Dna className="w-4 h-4 text-white/40" strokeWidth={1.5} />
            <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-white/40">
              Mechanism of Action
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            className="text-[8vw] md:text-[5vw] lg:text-[3.5vw] font-normal tracking-[-0.03em] leading-[0.9] text-white mb-8"
          >
            How {product.name} Works
          </motion.h2>

          <div className="grid grid-cols-1 gap-6 mb-12">
            {research.mechanisms.map((mech, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                className="flex flex-col md:flex-row gap-6 md:gap-8 p-8 md:p-10 rounded-2xl bg-white/[0.02] border border-white/10 group hover:bg-white/[0.04] hover:border-white/15 transition-all duration-500"
              >
                <div className="flex items-start gap-4 md:w-64 shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/10 transition-colors duration-500">
                    <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-xs font-bold text-white/50">
                      0{idx + 1}
                    </span>
                  </div>
                  <h3 style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-xl md:text-2xl font-normal text-white tracking-tight">
                    {mech.title}
                  </h3>
                </div>
                <p style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-base text-white/45 font-light leading-relaxed flex-1">
                  {mech.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Key Insight Callout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative p-8 md:p-10 rounded-2xl overflow-hidden"
            style={{ backgroundColor: `${product.hex}08`, borderColor: `${product.hex}20`, borderWidth: 1 }}
          >
            <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: product.hex, opacity: 0.5 }} />
            <div className="flex items-start gap-4">
              <Microscope className="w-5 h-5 shrink-0 mt-0.5" style={{ color: product.hex, opacity: 0.7 }} strokeWidth={1.5} />
              <div>
                <span style={{ fontFamily: "Helvetica, Arial, sans-serif", color: product.hex }} className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase mb-2 block opacity-70">
                  Key Insight
                </span>
                <p style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-base md:text-lg text-white/70 font-light leading-relaxed">
                  {research.keyInsight}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Clinical Research */}
      <section className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 py-20 md:py-32 border-t border-white/5">
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3 mb-4"
          >
            <BookOpen className="w-4 h-4 text-white/40" strokeWidth={1.5} />
            <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-white/40">
              Published Research
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            className="text-[8vw] md:text-[5vw] lg:text-[3.5vw] font-normal tracking-[-0.03em] leading-[0.9] text-white mb-12"
          >
            Clinical Research
          </motion.h2>

          <div className="flex flex-col gap-6">
            {research.studies.map((study, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                className="p-8 md:p-10 rounded-2xl bg-white/[0.02] border border-white/10 group hover:bg-white/[0.04] transition-all duration-500"
              >
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-white/50">
                    {study.journal}
                  </span>
                  <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase text-white/30">
                    {study.year}
                  </span>
                  {study.participants && (
                    <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase px-3 py-1 rounded-full border border-white/10 text-white/40">
                      {study.participants} participants
                    </span>
                  )}
                </div>

                <h3 style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-lg md:text-xl font-normal text-white/90 tracking-tight mb-2 leading-snug">
                  {study.title}
                </h3>
                <p style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-sm text-white/30 mb-5">
                  {study.author}
                </p>

                <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 mb-5">
                  <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-white/30 block mb-2">
                    Key Finding
                  </span>
                  <p style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-sm md:text-base text-white/60 font-light leading-relaxed">
                    {study.keyFinding}
                  </p>
                </div>

                {study.chartData && study.chartData.length > 0 && (
                  <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 mb-5">
                    <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-white/30 block mb-4">
                      Research Data
                    </span>
                    <div className="flex flex-col gap-3">
                      {study.chartData.map((bar, barIdx) => (
                        <AnimatedBar key={barIdx} bar={bar} index={barIdx} color={product.hex} />
                      ))}
                    </div>
                  </div>
                )}

                {study.pmid && (
                  <a
                    href={`https://pubmed.ncbi.nlm.nih.gov/${study.pmid}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-white/30 hover:text-white transition-colors duration-300"
                  >
                    <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase">
                      View on PubMed
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Research Applications */}
      <section className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 py-20 md:py-32 border-t border-white/5">
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3 mb-4"
          >
            <Beaker className="w-4 h-4 text-white/40" strokeWidth={1.5} />
            <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-white/40">
              Applications
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            className="text-[8vw] md:text-[5vw] lg:text-[3.5vw] font-normal tracking-[-0.03em] leading-[0.9] text-white mb-12"
          >
            Research Applications
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {research.applications.map((app, idx) => {
              const Icon = sectionIcons[idx % sectionIcons.length];
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.08 }}
                  className="p-7 md:p-8 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col group hover:bg-white/[0.04] hover:border-white/15 transition-all duration-500"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors duration-500">
                      <Icon className="w-4 h-4 text-white/50" strokeWidth={1.5} />
                    </div>
                    <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-lg md:text-xl font-normal text-white tracking-tight">
                      {app.label}
                    </span>
                  </div>
                  <p style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-sm text-white/40 font-light mb-3">
                    {app.description}
                  </p>
                  {app.efficacy !== undefined && (
                    <EfficacyBar value={app.efficacy} delay={0.3 + idx * 0.1} />
                  )}
                  <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/20 mt-auto pt-3">
                    {app.detail}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Compound Information */}
      <section className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 py-20 md:py-32 border-t border-white/5">
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3 mb-4"
          >
            <Atom className="w-4 h-4 text-white/40" strokeWidth={1.5} />
            <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-white/40">
              Compound Data
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            className="text-[8vw] md:text-[5vw] lg:text-[3.5vw] font-normal tracking-[-0.03em] leading-[0.9] text-white mb-12"
          >
            Molecular Profile
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden"
          >
            {[
              { label: "CAS Number", value: research.compound.casNumber },
              { label: "Molecular Formula", value: research.compound.molecularFormula },
              { label: "Molecular Weight", value: research.compound.molecularWeight },
              { label: "Type", value: research.compound.type },
              { label: "Appearance", value: research.compound.appearance },
              { label: "Solubility", value: research.compound.solubility },
              { label: "Storage", value: research.compound.storage },
            ].map((row, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between px-8 py-5 ${idx > 0 ? "border-t border-white/5" : ""} hover:bg-white/[0.02] transition-colors duration-300`}
              >
                <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase text-white/30">
                  {row.label}
                </span>
                <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-sm md:text-base text-white/70 font-light text-right">
                  {row.value}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Safety Profile */}
      <section className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 py-20 md:py-32 border-t border-white/5">
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3 mb-4"
          >
            <Shield className="w-4 h-4 text-white/40" strokeWidth={1.5} />
            <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-white/40">
              Safety Data
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            className="text-[8vw] md:text-[5vw] lg:text-[3.5vw] font-normal tracking-[-0.03em] leading-[0.9] text-white mb-6"
          >
            Safety Profile
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            className="text-base md:text-lg text-white/40 font-light leading-relaxed max-w-3xl mb-12"
          >
            {research.safety.overview}
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Reported Effects */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="p-7 md:p-8 rounded-2xl bg-white/[0.02] border border-white/10"
            >
              <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-white/30 block mb-6">
                Reported Effects
              </span>
              <div className="flex flex-col gap-4">
                {research.safety.commonEffects.map((effect, idx) => (
                  <div key={idx} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-sm text-white/60 font-light">
                        {effect.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-xs text-white/40">
                          {effect.percentage}%
                        </span>
                        <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${
                          effect.severity === "mild" ? "text-emerald-400/60 bg-emerald-400/[0.06] border border-emerald-400/10" :
                          effect.severity === "moderate" ? "text-amber-400/60 bg-amber-400/[0.06] border border-amber-400/10" :
                          "text-white/30 bg-white/[0.04] border border-white/5"
                        }`}>
                          {effect.severity}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${effect.percentage}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.3 + idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className={`h-full rounded-full ${
                          effect.severity === "mild" ? "bg-emerald-400/40" :
                          effect.severity === "moderate" ? "bg-amber-400/40" :
                          "bg-white/20"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Rate-Dependent Factors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="p-7 md:p-8 rounded-2xl bg-white/[0.02] border border-white/10"
            >
              <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-white/30 block mb-6">
                Rate-Dependent Factors
              </span>
              <div className="flex flex-col gap-4">
                {research.safety.rateFactors.map((factor, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20 mt-2 shrink-0" />
                    <p style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-sm text-white/50 font-light leading-relaxed">
                      {factor}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Managing Side Effects */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="p-7 md:p-8 rounded-2xl bg-white/[0.02] border border-white/10"
            >
              <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-white/30 block mb-6">
                Managing Side Effects
              </span>
              <div className="flex flex-col gap-4">
                {research.safety.managementTips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-md bg-emerald-500/[0.08] border border-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-emerald-400/60 text-[10px] font-bold">{idx + 1}</span>
                    </div>
                    <p style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-sm text-white/50 font-light leading-relaxed">
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Precautions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="p-7 md:p-8 rounded-2xl bg-amber-500/[0.02] border border-amber-500/10"
            >
              <div className="flex items-center gap-2 mb-6">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400/60" strokeWidth={1.5} />
                <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-amber-400/50">
                  Precautions
                </span>
              </div>
              <div className="flex flex-col gap-4">
                {research.safety.precautions.map((precaution, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400/30 mt-2 shrink-0" />
                    <p style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-sm text-white/50 font-light leading-relaxed">
                      {precaution}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 py-20 md:py-32 border-t border-white/5">
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3 mb-4"
          >
            <HelpCircle className="w-4 h-4 text-white/40" strokeWidth={1.5} />
            <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-white/40">
              FAQ
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            className="text-[8vw] md:text-[5vw] lg:text-[3.5vw] font-normal tracking-[-0.03em] leading-[0.9] text-white mb-12"
          >
            Frequently Asked
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="rounded-2xl bg-white/[0.02] border border-white/10 px-8 md:px-10"
          >
            {research.faqs.map((faq, idx) => (
              <FAQItem key={idx} question={faq.question} answer={faq.answer} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA — View Product */}
      <section className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 py-20 md:py-32 border-t border-white/5">
        <div className="w-full flex flex-col items-center text-center mb-24 md:mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-white/40 mb-6 block">
              Procurement
            </span>
            <h2
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              className="text-[8vw] md:text-[5vw] lg:text-[3.5vw] font-normal tracking-[-0.03em] leading-[0.9] text-white mb-6"
            >
              Ready to begin research?
            </h2>
            <p style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-lg md:text-xl text-white/50 font-light tracking-wide mb-12 max-w-xl mx-auto">
              {`Access ${product.name} through the ${siteConfig.name} catalog. All compounds ship via cold-chain transit with batch-specific Certificate of Analysis.`}
            </p>

            <Link
              href={`/portal/product/${product.id}`}
              className="group/btn relative inline-flex items-center justify-center gap-3 h-14 md:h-16 px-10 rounded-full border border-white/20 bg-white hover:bg-transparent transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white group-hover/btn:bg-transparent transition-colors duration-500" />
              <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="relative z-10 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-black group-hover/btn:text-white transition-colors duration-500">
                View {product.name} Product
              </span>
              <ArrowRight className="relative z-10 w-4 h-4 text-black group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all duration-500" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Prev/Next Navigation */}
      <section className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 border-t border-white/10 pt-10">
          <Link
            href={`/portal/science/${prevVial.id}`}
            className="group flex flex-col items-start p-6 md:p-10 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-500"
          >
            <div className="flex items-center gap-3 text-white/40 mb-6 group-hover:text-white transition-colors duration-500">
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-2 transition-transform duration-500" strokeWidth={1.5} />
              <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">
                Previous Compound
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full">
              <div className="relative w-16 h-16 md:w-24 md:h-24 shrink-0 transition-opacity duration-500">
                <Image src={prevVial.image} alt={prevVial.name} fill sizes="(max-width: 768px) 64px, 96px" className="object-contain drop-shadow-2xl" />
              </div>
              <div className="flex flex-col text-left">
                <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-xl md:text-3xl font-light text-white tracking-tight mb-1">
                  {prevVial.name}
                </span>
                <span style={{ fontFamily: "Helvetica, Arial, sans-serif", color: prevVial.hex }} className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase opacity-80">
                  {prevVial.fullName}
                </span>
              </div>
            </div>
          </Link>

          <Link
            href={`/portal/science/${nextVial.id}`}
            className="group flex flex-col items-end text-right p-6 md:p-10 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-500"
          >
            <div className="flex items-center gap-3 text-white/40 mb-6 group-hover:text-white transition-colors duration-500">
              <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">
                Next Compound
              </span>
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-2 transition-transform duration-500" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col-reverse sm:flex-row items-end sm:items-center justify-end gap-4 sm:gap-6 w-full">
              <div className="flex flex-col items-end text-right">
                <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-xl md:text-3xl font-light text-white tracking-tight mb-1">
                  {nextVial.name}
                </span>
                <span style={{ fontFamily: "Helvetica, Arial, sans-serif", color: nextVial.hex }} className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase opacity-80">
                  {nextVial.fullName}
                </span>
              </div>
              <div className="relative w-16 h-16 md:w-24 md:h-24 shrink-0 transition-opacity duration-500">
                <Image src={nextVial.image} alt={nextVial.name} fill sizes="(max-width: 768px) 64px, 96px" className="object-contain drop-shadow-2xl" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Research Disclaimer */}
      <WarningSection />

      <Footer />
    </main>
  );
}
