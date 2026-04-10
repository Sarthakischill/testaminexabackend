"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Check, AlertCircle, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { siteConfig } from "@/config/site";
import { Suspense } from "react";

function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "submitting" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const isResetMode = searchParams.get("mode") === "reset";

  useEffect(() => {
    async function initSession() {
      const supabase = createClient();
      let resolved = false;

      function markReady(user: { user_metadata?: Record<string, string> }) {
        if (resolved) return;
        resolved = true;
        setUserName(user.user_metadata?.full_name || "");
        setStatus("ready");
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event: string, session: { user?: { user_metadata?: Record<string, string> } } | null) => {
          if (session?.user && (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
            markReady(session.user);
          }
        }
      );

      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error("Code exchange error:", error);
        }
      }

      const hash = window.location.hash;
      if (hash && hash.includes("access_token")) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          window.location.hash = "";
        }
      }

      if (!resolved) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          markReady(user);
        }
      }

      if (!resolved) {
        setTimeout(async () => {
          const { data: { user: retryUser } } = await supabase.auth.getUser();
          if (retryUser) {
            markReady(retryUser);
          } else {
            setStatus("error");
            setErrorMessage(
              isResetMode
                ? "Invalid or expired reset link. Please request a new one."
                : "Invalid or expired verification link. Please register again."
            );
          }
          subscription.unsubscribe();
        }, 3000);
      } else {
        subscription.unsubscribe();
      }
    }

    initSession();
  }, [searchParams, isResetMode]);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setStatus("submitting");

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus("ready");
      setErrorMessage(error.message);
      return;
    }

    setStatus("success");
    setTimeout(() => router.push("/portal"), 1500);
  };

  if (status === "loading") {
    return (
      <main className="relative min-h-[100dvh] w-full bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
      </main>
    );
  }

  if (status === "error" && !password) {
    return (
      <main className="relative min-h-[100dvh] w-full bg-[#050505] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-400/60 mx-auto mb-6" />
          <h1 style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-2xl text-white font-normal mb-4">
            {isResetMode ? "Reset Link Expired" : "Verification Failed"}
          </h1>
          <p style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-white/40 font-light mb-8">
            {errorMessage}
          </p>
          <Link
            href={isResetMode ? "/auth/forgot-password" : "/login"}
            className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="tracking-[0.1em] uppercase text-xs font-medium">
              {isResetMode ? "Try Again" : "Back to Login"}
            </span>
          </Link>
        </div>
      </main>
    );
  }

  if (status === "success") {
    return (
      <main className="relative min-h-[100dvh] w-full bg-[#050505] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-2xl text-white font-normal mb-4">
            {isResetMode ? "Password Updated" : "Account Created"}
          </h1>
          <p style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-white/40 font-light">
            {isResetMode
              ? "Your password has been reset. Redirecting you to the portal..."
              : `Welcome, ${userName}. Redirecting you to the portal...`}
          </p>
        </motion.div>
      </main>
    );
  }

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
              src={siteConfig.logoUrl || "/logo.svg"}
              alt={siteConfig.name}
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            className="text-3xl md:text-4xl font-normal tracking-tight text-white text-center mb-2"
          >
            {isResetMode ? "Reset Your Password" : "Create Your Password"}
          </h1>
          <p style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-white/40 font-light text-center">
            {isResetMode
              ? "Choose a new secure password for your account."
              : userName
                ? `Welcome, ${userName}. Set a secure password to access your account.`
                : "Set a secure password to access your account."}
          </p>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-2xl md:rounded-[2rem] p-6 md:p-10 backdrop-blur-md">
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-red-400/80 text-sm font-light">
                {errorMessage}
              </p>
            </motion.div>
          )}

          <form onSubmit={handleSetPassword} className="flex flex-col">
            <div className="relative flex flex-col gap-2 w-full mb-6">
              <label
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                className={`text-xs font-medium tracking-[0.1em] uppercase transition-colors duration-300 ${focusedField === "password" ? "text-white" : "text-white/40"}`}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  className="w-full bg-transparent border-b border-white/20 pb-4 text-white font-light text-lg md:text-xl placeholder:text-white/10 focus:outline-none focus:border-white transition-colors duration-500 rounded-none"
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                />
                <motion.div
                  className="absolute bottom-0 left-0 h-[1px] bg-white"
                  initial={{ width: "0%" }}
                  animate={{ width: focusedField === "password" || password ? "100%" : "0%" }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>

            <div className="relative flex flex-col gap-2 w-full mb-6">
              <label
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                className={`text-xs font-medium tracking-[0.1em] uppercase transition-colors duration-300 ${focusedField === "confirm" ? "text-white" : "text-white/40"}`}
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocusedField("confirm")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  className="w-full bg-transparent border-b border-white/20 pb-4 text-white font-light text-lg md:text-xl placeholder:text-white/10 focus:outline-none focus:border-white transition-colors duration-500 rounded-none"
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                />
                <motion.div
                  className="absolute bottom-0 left-0 h-[1px] bg-white"
                  initial={{ width: "0%" }}
                  animate={{ width: focusedField === "confirm" || confirmPassword ? "100%" : "0%" }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>

            {password.length > 0 && (
              <div className="flex items-center gap-2 mb-8">
                <div className={`w-1.5 h-1.5 rounded-full ${password.length >= 6 ? "bg-emerald-400" : "bg-white/20"}`} />
                <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className={`text-xs ${password.length >= 6 ? "text-emerald-400/60" : "text-white/30"}`}>
                  At least 6 characters
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === "submitting" || password.length < 6}
              className="group relative flex items-center justify-center w-full py-5 overflow-hidden rounded-full border border-white/20 bg-white text-black transition-all duration-500 hover:bg-transparent hover:border-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "submitting" ? (
                <Loader2 className="w-5 h-5 animate-spin text-black" />
              ) : (
                <span
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                  className="relative z-10 text-sm font-medium tracking-[0.15em] uppercase transition-colors duration-500 group-hover:text-white"
                >
                  {isResetMode ? "Update Password" : "Complete Registration"}
                </span>
              )}
              <div className="absolute inset-0 bg-transparent transition-colors duration-500 group-hover:bg-[#050505] -z-0" />
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="relative min-h-[100dvh] w-full bg-[#050505] flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
        </main>
      }
    >
      <SetPasswordForm />
    </Suspense>
  );
}
