"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Clock, Send, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/lib/cart-context";

export default function ContactPage() {
  const { totalItems, openCart } = useCart();
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          subject: formData.get("subject"),
          message: formData.get("message"),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send message");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full bg-[#050505] selection:bg-white/20 selection:text-white">
      <div className="pointer-events-auto relative z-50">
        <Navbar isPortal={true} cartCount={totalItems} cartColor="#ffffff" onCartClick={openCart} />
      </div>

      {/* Hero */}
      <div className="relative w-full pt-40 pb-16 md:pt-48 md:pb-24 px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20">
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[60vw] h-[40vh] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            className="text-[10vw] md:text-[7vw] lg:text-[5.5vw] font-normal tracking-[-0.04em] leading-[0.85] text-white mb-6"
          >
            Get in Touch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15 }}
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            className="text-lg md:text-xl text-white/50 font-light tracking-wide"
          >
            Have questions about our research compounds, orders, or wholesale inquiries? We're here to help.
          </motion.p>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 pb-40">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">

          {/* Info Cards */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {[
              { icon: Mail, label: "Email", value: "support@aminexa.net", sublabel: "General inquiries" },
              { icon: MapPin, label: "Location", value: "United States", sublabel: "Ships domestically" },
              { icon: Clock, label: "Response Time", value: "Within 24 hours", sublabel: "Monday – Friday" },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 + idx * 0.1 }}
                className="p-7 md:p-8 rounded-2xl bg-white/[0.02] border border-white/10 flex items-start gap-5"
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-white/50" strokeWidth={1.5} />
                </div>
                <div>
                  <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/30 block mb-1">
                    {item.label}
                  </span>
                  <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-lg text-white font-normal block mb-0.5">
                    {item.value}
                  </span>
                  <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-xs text-white/30 font-light">
                    {item.sublabel}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-3"
          >
            {submitted ? (
              <div className="p-12 md:p-16 rounded-2xl bg-white/[0.02] border border-white/10 text-center flex flex-col items-center">
                <CheckCircle className="w-12 h-12 text-emerald-400/70 mb-6" strokeWidth={1} />
                <h3 style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-2xl md:text-3xl font-normal text-white mb-3">
                  Message Sent
                </h3>
                <p style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-base text-white/40 font-light">
                  We'll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 md:p-10 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full px-5 py-4 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm font-light focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
                      style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full px-5 py-4 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm font-light focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
                      style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                      placeholder="you@email.com"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40">
                    Subject
                  </label>
                  <select
                    name="subject"
                    required
                    className="w-full px-5 py-4 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm font-light focus:outline-none focus:border-white/30 transition-colors appearance-none"
                    style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                    defaultValue=""
                  >
                    <option value="" disabled className="bg-[#111]">Select a topic</option>
                    <option value="order" className="bg-[#111]">Order Inquiry</option>
                    <option value="product" className="bg-[#111]">Product Question</option>
                    <option value="wholesale" className="bg-[#111]">Wholesale / Bulk</option>
                    <option value="coa" className="bg-[#111]">Certificate of Analysis</option>
                    <option value="other" className="bg-[#111]">Other</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40">
                    Message
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    className="w-full px-5 py-4 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm font-light focus:outline-none focus:border-white/30 transition-colors resize-none placeholder:text-white/20"
                    style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                    placeholder="How can we help?"
                  />
                </div>

                {error && (
                  <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="group relative w-full flex items-center justify-center gap-3 py-4 rounded-full border border-white/20 bg-white hover:bg-transparent transition-all duration-500 overflow-hidden mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-white group-hover:bg-transparent transition-colors duration-500" />
                  <Send className={`relative z-10 w-4 h-4 text-black group-hover:text-white transition-colors duration-500 ${sending ? "animate-pulse" : ""}`} strokeWidth={2} />
                  <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="relative z-10 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-black group-hover:text-white transition-colors duration-500">
                    {sending ? "Sending..." : "Send Message"}
                  </span>
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
