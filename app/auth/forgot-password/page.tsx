"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail, AlertCircle } from "lucide-react";

const font = { fontFamily: "Helvetica, Arial, sans-serif" } as const;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error || "Something went wrong.");
        return;
      }

      setStatus("sent");
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <main className="relative min-h-[100dvh] w-full bg-[#050505] flex items-center justify-center overflow-hidden selection:bg-white/20 selection:text-white">
      <div className="fixed inset-0 z-0 h-screen w-full pointer-events-none">
        <div className="absolute inset-0 bg-[#050505]" />
        <div className="absolute inset-x-0 -top-[10%] h-[120%] bg-[radial-gradient(ellipse_at_left_center,rgba(50,50,50,0.3)_0%,transparent_50%)] mix-blend-overlay rotate-12 blur-[100px]" />
        <div className="absolute inset-x-0 bottom-0 h-full bg-[radial-gradient(ellipse_at_right_bottom,rgba(80,80,80,0.2)_0%,transparent_60%)] blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4 sm:px-6 py-20">
        <div className="flex flex-col items-center mb-12">
          <div className="relative w-32 h-8 mb-8">
            <Image
              src="https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/Logos/AmiNexa/AmiNexa_full_logo_white.png/public"
              alt="AmiNexa"
              fill
              className="object-contain"
              priority
            />
          </div>

          {status === "sent" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center mb-8">
                <Mail className="w-7 h-7 text-white/60" />
              </div>
              <h1 style={font} className="text-2xl md:text-3xl font-normal text-white mb-4 tracking-tight">
                Check Your Email
              </h1>
              <p style={font} className="text-white/40 text-sm md:text-base font-light leading-relaxed max-w-sm mb-3">
                If an account exists for
              </p>
              <p style={font} className="text-white font-light text-lg mb-6">
                {email}
              </p>
              <p style={font} className="text-white/30 text-sm font-light leading-relaxed max-w-sm mb-10">
                you&apos;ll receive a password reset link shortly. Click it to choose a new password.
              </p>
              <div className="w-full p-4 rounded-xl bg-white/[0.02] border border-white/5 mb-8">
                <p style={font} className="text-white/25 text-xs font-light">
                  Didn&apos;t receive the email? Check your spam folder, or{" "}
                  <button
                    onClick={() => {
                      setStatus("idle");
                      setEmail("");
                    }}
                    className="text-white/50 hover:text-white underline transition-colors"
                  >
                    try again
                  </button>.
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span style={font} className="text-xs font-medium tracking-[0.1em] uppercase">
                  Back to Login
                </span>
              </Link>
            </motion.div>
          ) : (
            <>
              <h1 style={font} className="text-3xl md:text-4xl font-normal tracking-tight text-white text-center mb-2">
                Reset Password
              </h1>
              <p style={font} className="text-white/40 font-light text-center text-sm leading-relaxed max-w-xs">
                Enter the email address associated with your account and we&apos;ll send you a reset link.
              </p>
            </>
          )}
        </div>

        {status !== "sent" && (
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl md:rounded-[2rem] p-6 md:p-10 backdrop-blur-md">
            {status === "error" && errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p style={font} className="text-red-400/80 text-sm font-light">
                  {errorMessage}
                </p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="relative flex flex-col gap-2 w-full mb-8">
                <label
                  style={font}
                  className={`text-xs font-medium tracking-[0.1em] uppercase transition-colors duration-300 ${
                    focused ? "text-white" : "text-white/40"
                  }`}
                >
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="researcher@lab.edu"
                    className="w-full bg-transparent border-b border-white/20 pb-4 text-white font-light text-lg md:text-xl placeholder:text-white/10 focus:outline-none focus:border-white transition-colors duration-500 rounded-none"
                    style={font}
                  />
                  <motion.div
                    className="absolute bottom-0 left-0 h-[1px] bg-white"
                    initial={{ width: "0%" }}
                    animate={{ width: focused || email ? "100%" : "0%" }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === "loading" || !email}
                className="group relative flex items-center justify-center w-full py-5 overflow-hidden rounded-full border border-white/20 bg-white text-black transition-all duration-500 hover:bg-transparent hover:border-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "loading" ? (
                  <Loader2 className="w-5 h-5 animate-spin text-black" />
                ) : (
                  <span style={font} className="relative z-10 text-sm font-medium tracking-[0.15em] uppercase transition-colors duration-500 group-hover:text-white">
                    Send Reset Link
                  </span>
                )}
                <div className="absolute inset-0 bg-transparent transition-colors duration-500 group-hover:bg-[#050505] -z-0" />
              </button>
            </form>

            <div className="flex justify-center mt-8">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-white/30 hover:text-white transition-colors group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                <span style={font} className="text-xs tracking-[0.1em] uppercase">
                  Back to Login
                </span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
