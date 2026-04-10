"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check, AlertCircle, Loader2, Mail, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { siteConfig } from "@/config/site";

const InputField = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  isFocused,
  onFocus,
  onBlur,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const hasValue = value !== "";
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="relative flex flex-col gap-2 w-full mb-6">
      <label
        style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
        className={`text-xs font-medium tracking-[0.1em] uppercase transition-colors duration-300 ${isFocused ? "text-white" : "text-white/40"}`}
      >
        {label}
      </label>
      <div className="relative">
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full bg-transparent border-b border-white/20 pb-4 text-white font-light text-lg md:text-xl placeholder:text-white/10 focus:outline-none focus:border-white transition-colors duration-500 rounded-none ${type === "date" ? "[color-scheme:dark] cursor-pointer" : ""} ${isPassword ? "pr-10" : ""}`}
          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-0 top-1/2 -translate-y-1/2 -mt-1 p-1 text-white/30 hover:text-white transition-colors duration-300"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
        <motion.div
          className="absolute bottom-0 left-0 h-[1px] bg-white"
          initial={{ width: "0%" }}
          animate={{ width: isFocused || hasValue ? "100%" : "0%" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
};

const CheckboxField = ({
  name,
  label,
  required = false,
  isChecked,
  onChange,
}: {
  name: string;
  label: React.ReactNode;
  required?: boolean;
  isChecked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <label className="flex items-start gap-4 cursor-pointer group mb-4">
      <div className="relative flex items-center justify-center w-5 h-5 mt-1 rounded border border-white/20 bg-transparent transition-colors duration-300 group-hover:border-white/60 shrink-0">
        <input
          type="checkbox"
          name={name}
          checked={isChecked}
          onChange={onChange}
          className="absolute opacity-0 cursor-pointer w-full h-full"
          required={required}
        />
        <AnimatePresence>
          {isChecked && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full bg-white rounded flex items-center justify-center"
            >
              <Check className="w-3 h-3 text-black stroke-[3]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <span
        style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
        className="text-white/50 text-sm font-light leading-relaxed group-hover:text-white/80 transition-colors duration-300"
      >
        {label}
      </span>
    </label>
  );
};

type RegisterStep = "email" | "info" | "sent";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(false);
  const [registerStep, setRegisterStep] = useState<RegisterStep>("email");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    dob: "",
    agreedToTerms: false,
    researchAck: false,
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("access_token")) {
      const params = new URLSearchParams(hash.substring(1));
      const type = params.get("type");
      const mode = type === "recovery" ? "?mode=reset" : "";
      router.replace(`/auth/set-password${mode}${hash}`);
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (status === "error") {
      setStatus("idle");
      setErrorMessage("");
    }
  };

  const handleEmailNext = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.email || !formData.email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      setStatus("error");
      return;
    }

    setRegisterStep("info");
    setStatus("idle");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.name.trim()) {
      setErrorMessage("Full name is required.");
      setStatus("error");
      return;
    }

    if (!formData.dob) {
      setErrorMessage("Date of birth is required.");
      setStatus("error");
      return;
    }

    if (!formData.researchAck || !formData.agreedToTerms) {
      setErrorMessage("Please accept both acknowledgments to continue.");
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim(),
          fullName: formData.name.trim(),
          dateOfBirth: formData.dob,
          agreedToTerms: formData.agreedToTerms,
          researchAck: formData.researchAck,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error || "Registration failed.");
        return;
      }

      setRegisterStep("sent");
      setStatus("idle");
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setStatus("loading");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (error) {
        setStatus("error");
        if (error.message === "Invalid login credentials") {
          setErrorMessage("Incorrect email or password. Please try again.");
        } else if (error.message === "Email not confirmed") {
          setErrorMessage("Your email hasn't been verified yet. Check your inbox for the confirmation link.");
        } else {
          setErrorMessage(error.message);
        }
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("date_of_birth")
        .single();

      if (profile?.date_of_birth) {
        const dob = new Date(profile.date_of_birth);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        if (age < 21) {
          await supabase.auth.signOut();
          setStatus("error");
          setErrorMessage("You must be at least 21 years of age to access this portal.");
          return;
        }
      }

      setStatus("idle");
      router.push("/portal");
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please check your connection and try again.");
    }
  };

  const resetRegistration = () => {
    setRegisterStep("email");
    setFormData({ name: "", email: "", password: "", dob: "", agreedToTerms: false, researchAck: false });
    setErrorMessage("");
    setStatus("idle");
  };

  return (
    <main className="relative min-h-[100dvh] w-full bg-[#050505] flex items-center justify-center overflow-hidden selection:bg-white/20 selection:text-white">
      <div className="fixed inset-0 z-0 h-screen w-full pointer-events-none">
        <div className="absolute inset-0 bg-[#050505]" />
        <div className="absolute inset-x-0 -top-[10%] h-[120%] bg-[radial-gradient(ellipse_at_left_center,rgba(50,50,50,0.3)_0%,transparent_50%)] mix-blend-screen mix-blend-overlay rotate-12 blur-[100px]" />
        <div className="absolute inset-x-0 bottom-0 h-full bg-[radial-gradient(ellipse_at_right_bottom,rgba(80,80,80,0.2)_0%,transparent_60%)] mix-blend-screen blur-[120px]" />
      </div>

      <Link
        href="/"
        className="absolute top-8 left-8 md:top-12 md:left-12 z-20 group flex items-center gap-3 text-white/50 hover:text-white transition-colors duration-300"
      >
        <ArrowLeft className="w-5 h-5 transition-transform duration-500 group-hover:-translate-x-2" />
        <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-xs font-medium tracking-[0.1em] uppercase">
          Return to Site
        </span>
      </Link>

      <div className="relative z-10 w-full max-w-[1200px] flex flex-col lg:flex-row items-center lg:items-start justify-between px-4 sm:px-6 py-20 md:py-24 gap-8 md:gap-16 lg:gap-24">
        <div className="flex flex-col w-full lg:w-1/2 mt-4 md:mt-0">
          <div className="relative w-24 md:w-40 h-6 md:h-10 mb-8 md:mb-12">
            <Image src={siteConfig.logoUrl || "/logo.svg"} alt={siteConfig.name} fill className="object-contain object-left" priority />
          </div>

          <h1
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            className="text-3xl md:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-[1.1] mb-2 md:mb-6"
          >
            Access restricted to <br />
            <span className="text-white/40">registered researchers.</span>
          </h1>

          <div className="hidden lg:flex items-start gap-4 p-6 rounded-2xl bg-white/[0.02] border border-white/5 mt-8 backdrop-blur-sm">
            <AlertCircle className="w-6 h-6 text-white/40 shrink-0 mt-0.5" />
            <p style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-white/60 text-sm leading-relaxed font-light">
              {`${siteConfig.name} provides pharmaceutical-grade peptides for laboratory and research use only. Creating an account requires acknowledgment of our Terms of Use and age verification. Not intended for human or veterinary use.`}
            </p>
          </div>
        </div>

        <div className="w-full lg:w-1/2 max-w-md lg:max-w-none ml-auto">
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl md:rounded-[2rem] p-6 md:p-12 backdrop-blur-md relative overflow-hidden">
            {/* Tabs - only visible when not on "sent" step */}
            {registerStep !== "sent" && (
              <div className="flex w-full mb-8 md:mb-12 relative border-b border-white/10">
                <button
                  onClick={() => {
                    setIsLogin(false);
                    resetRegistration();
                  }}
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                  className={`flex-1 pb-4 text-xs md:text-sm font-medium tracking-[0.1em] uppercase transition-colors duration-300 ${!isLogin ? "text-white" : "text-white/30 hover:text-white/60"}`}
                >
                  New Researcher
                </button>
                <button
                  onClick={() => {
                    setIsLogin(true);
                    setErrorMessage("");
                    setStatus("idle");
                  }}
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                  className={`flex-1 pb-4 text-xs md:text-sm font-medium tracking-[0.1em] uppercase transition-colors duration-300 ${isLogin ? "text-white" : "text-white/30 hover:text-white/60"}`}
                >
                  Returning
                </button>

                <motion.div
                  className="absolute bottom-0 h-[1px] bg-white w-1/2"
                  initial={false}
                  animate={{ left: isLogin ? "50%" : "0%" }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            )}

            {status === "error" && errorMessage && !isLogin && (
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

            <div className="relative grid" style={{ gridTemplateAreas: "'form'" }}>
              <AnimatePresence mode="wait" initial={false}>
                {!isLogin ? (
                  registerStep === "email" ? (
                    <motion.form
                      key="register-email"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="flex flex-col w-full"
                      style={{ gridArea: "form" }}
                      onSubmit={handleEmailNext}
                    >
                      {/* Step indicator */}
                      <div className="flex items-center gap-2 mb-8">
                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                          <span className="text-[10px] font-bold text-black">1</span>
                        </div>
                        <div className="w-8 h-px bg-white/10" />
                        <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-white/30">2</span>
                        </div>
                        <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-xs text-white/30 ml-3 tracking-[0.1em] uppercase">
                          Email Address
                        </span>
                      </div>

                      <p style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-white/50 text-sm font-light mb-8 leading-relaxed">
                        Enter your email address to begin the registration process. We&apos;ll send you a verification link to confirm your identity.
                      </p>

                      <InputField
                        label="Email Address"
                        name="email"
                        type="email"
                        placeholder="researcher@lab.edu"
                        value={formData.email}
                        onChange={handleInputChange}
                        isFocused={focusedField === "email"}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField(null)}
                      />

                      <button
                        type="submit"
                        className="group relative flex items-center justify-center w-full py-5 mt-4 overflow-hidden rounded-full border border-white/20 bg-white text-black transition-all duration-500 hover:bg-transparent hover:border-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="relative z-10 text-sm font-medium tracking-[0.15em] uppercase transition-colors duration-500 group-hover:text-white flex items-center gap-3">
                          Continue
                          <ArrowRight className="w-4 h-4" />
                        </span>
                        <div className="absolute inset-0 bg-transparent transition-colors duration-500 group-hover:bg-[#050505] -z-0" />
                      </button>
                    </motion.form>
                  ) : registerStep === "info" ? (
                    <motion.form
                      key="register-info"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="flex flex-col w-full"
                      style={{ gridArea: "form" }}
                      onSubmit={handleRegister}
                    >
                      {/* Step indicator */}
                      <div className="flex items-center gap-2 mb-8">
                        <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white/50" />
                        </div>
                        <div className="w-8 h-px bg-white/20" />
                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                          <span className="text-[10px] font-bold text-black">2</span>
                        </div>
                        <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-xs text-white/30 ml-3 tracking-[0.1em] uppercase">
                          Your Information
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setRegisterStep("email");
                          setErrorMessage("");
                          setStatus("idle");
                        }}
                        className="flex items-center gap-2 text-white/30 hover:text-white transition-colors mb-6"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-xs tracking-[0.1em] uppercase">
                          {formData.email}
                        </span>
                      </button>

                      <InputField
                        label="Full Name"
                        name="name"
                        placeholder="Dr. Jane Doe"
                        value={formData.name}
                        onChange={handleInputChange}
                        isFocused={focusedField === "name"}
                        onFocus={() => setFocusedField("name")}
                        onBlur={() => setFocusedField(null)}
                      />
                      <InputField
                        label="Date of Birth"
                        name="dob"
                        type="date"
                        placeholder="MM / DD / YYYY"
                        value={formData.dob}
                        onChange={handleInputChange}
                        isFocused={focusedField === "dob"}
                        onFocus={() => setFocusedField("dob")}
                        onBlur={() => setFocusedField(null)}
                      />

                      <div className="mt-4 mb-8">
                        <CheckboxField
                          name="researchAck"
                          required
                          label={
                            <span>
                              I am 21+ years of age and acknowledge that these products are strictly for{" "}
                              <strong>research and laboratory use only</strong>. They are not intended for human consumption.
                            </span>
                          }
                          isChecked={formData.researchAck}
                          onChange={handleInputChange}
                        />
                        <CheckboxField
                          name="agreedToTerms"
                          required
                          label={
                            <span>
                              I agree to the{" "}
                              <Link href="/terms" className="text-white hover:underline">
                                Terms of Service
                              </Link>{" "}
                              and{" "}
                              <Link href="/privacy" className="text-white hover:underline">
                                Privacy Policy
                              </Link>
                              .
                            </span>
                          }
                          isChecked={formData.agreedToTerms}
                          onChange={handleInputChange}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className="group relative flex items-center justify-center w-full py-5 overflow-hidden rounded-full border border-white/20 bg-white text-black transition-all duration-500 hover:bg-transparent hover:border-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {status === "loading" ? (
                          <Loader2 className="w-5 h-5 animate-spin text-black" />
                        ) : (
                          <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="relative z-10 text-sm font-medium tracking-[0.15em] uppercase transition-colors duration-500 group-hover:text-white">
                            Send Verification Email
                          </span>
                        )}
                        <div className="absolute inset-0 bg-transparent transition-colors duration-500 group-hover:bg-[#050505] -z-0" />
                      </button>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="register-sent"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="flex flex-col items-center text-center w-full py-8"
                      style={{ gridArea: "form" }}
                    >
                      <div className="w-16 h-16 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center mb-8">
                        <Mail className="w-7 h-7 text-white/60" />
                      </div>

                      <h2 style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-2xl md:text-3xl font-normal text-white mb-4 tracking-tight">
                        Check Your Email
                      </h2>

                      <p style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-white/40 text-sm md:text-base font-light leading-relaxed max-w-sm mb-3">
                        We&apos;ve sent a verification link to
                      </p>

                      <p style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-white font-light text-lg mb-6">
                        {formData.email}
                      </p>

                      <p style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-white/30 text-sm font-light leading-relaxed max-w-sm mb-10">
                        Click the link in your email to verify your account, then you&apos;ll be prompted to create your password.
                      </p>

                      <div className="w-full p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <p style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-white/25 text-xs font-light">
                          Didn&apos;t receive the email? Check your spam folder, or{" "}
                          <button onClick={resetRegistration} className="text-white/50 hover:text-white underline transition-colors">
                            try again
                          </button>
                          .
                        </p>
                      </div>
                    </motion.div>
                  )
                ) : (
                  <motion.form
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col w-full h-full"
                    style={{ gridArea: "form" }}
                    onSubmit={handleLogin}
                  >
                    <InputField
                      label="Email Address"
                      name="email"
                      type="email"
                      placeholder="researcher@lab.edu"
                      value={formData.email}
                      onChange={handleInputChange}
                      isFocused={focusedField === "email"}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                    />
                    <InputField
                      label="Password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      isFocused={focusedField === "password"}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                    />

                    <div className="flex justify-end mb-8">
                      <Link href="/auth/forgot-password" style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-xs text-white/40 hover:text-white transition-colors">
                        Forgot password?
                      </Link>
                    </div>

                    <AnimatePresence>
                      {status === "error" && errorMessage && isLogin && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, height: 0, marginBottom: 0 }}
                          animate={{ opacity: 1, y: 0, height: "auto", marginBottom: 16 }}
                          exit={{ opacity: 0, y: -8, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 overflow-hidden"
                        >
                          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                          <p style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-red-400/80 text-sm font-light">
                            {errorMessage}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="mt-auto">
                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className="group relative flex items-center justify-center w-full py-5 overflow-hidden rounded-full border border-white/20 bg-white text-black transition-all duration-500 hover:bg-transparent hover:border-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {status === "loading" ? (
                          <Loader2 className="w-5 h-5 animate-spin text-black" />
                        ) : (
                          <span style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="relative z-10 text-sm font-medium tracking-[0.15em] uppercase transition-colors duration-500 group-hover:text-white">
                            Access Portal
                          </span>
                        )}
                        <div className="absolute inset-0 bg-transparent transition-colors duration-500 group-hover:bg-[#050505] -z-0" />
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="flex lg:hidden items-start gap-3 p-4 md:p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm w-full max-w-md mx-auto mb-12">
          <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-white/40 shrink-0 mt-0.5" />
          <p style={{ fontFamily: "Helvetica, Arial, sans-serif" }} className="text-white/60 text-xs md:text-sm leading-relaxed font-light">
            {`${siteConfig.name} provides pharmaceutical-grade peptides for laboratory and research use only. Creating an account requires acknowledgment of our Terms of Use and age verification. Not intended for human or veterinary use.`}
          </p>
        </div>
      </div>
    </main>
  );
}
