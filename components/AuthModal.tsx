"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, ShieldAlert, ArrowRight } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultView?: "login" | "register";
}

export default function AuthModal({ isOpen, onClose, defaultView = "login" }: AuthModalProps) {
  const [view, setView] = useState<"login" | "register">(defaultView);

  useEffect(() => {
    if (isOpen) {
      // Avoid setting state synchronously in an effect
      const timer = setTimeout(() => {
        setView(defaultView);
      }, 0);
      document.body.style.overflow = "hidden";
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "unset";
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen, defaultView]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[480px] bg-[#0A0A0A] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden my-auto z-10"
          >
            {/* Header Art / Lock Icon */}
            <div className="w-full h-32 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.05),transparent_70%)] flex items-center justify-center border-b border-white/5 relative">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors bg-black/20 p-2 rounded-full backdrop-blur-md"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-lg mt-8">
                <Lock className="w-6 h-6 text-white/60" />
              </div>
            </div>

            <div className="p-8 pt-10">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-white tracking-widest uppercase mb-2">
                  {view === "register" ? "New Researcher" : "Researcher Login"}
                </h2>
                <p className="text-sm text-white/40 leading-relaxed font-light">
                  Access is restricted to registered researchers who acknowledge research use only requirements.
                </p>
              </div>

              {/* View Toggle */}
              <div className="flex bg-[#111] p-1 rounded-xl mb-8 border border-white/5">
                <button
                  onClick={() => setView("register")}
                  className={`flex-1 py-2.5 text-xs font-bold tracking-widest uppercase rounded-lg transition-all ${
                    view === "register" ? "bg-white/10 text-white shadow-md" : "text-white/40 hover:text-white/80"
                  }`}
                >
                  New Account
                </button>
                <button
                  onClick={() => setView("login")}
                  className={`flex-1 py-2.5 text-xs font-bold tracking-widest uppercase rounded-lg transition-all ${
                    view === "login" ? "bg-white/10 text-white shadow-md" : "text-white/40 hover:text-white/80"
                  }`}
                >
                  Returning
                </button>
              </div>

              {/* Form */}
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                {view === "register" && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold tracking-widest text-white/60 uppercase ml-1">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter legal name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm"
                    />
                  </div>
                )}
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold tracking-widest text-white/60 uppercase ml-1">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="researcher@institution.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold tracking-widest text-white/60 uppercase ml-1">Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm mb-2"
                  />
                  {view === "register" && (
                     <p className="text-[10px] text-white/30 pl-1">Must be at least 8 characters.</p>
                  )}
                </div>

                {view === "register" && (
                  <>
                    <div className="space-y-1 mt-2">
                       <label className="text-[10px] font-bold tracking-widest text-white/60 uppercase ml-1">Date of Birth</label>
                       <input 
                         type="date" 
                         className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white/80 focus:outline-none focus:border-white/30 transition-colors text-sm"
                       />
                    </div>
                    
                    <div className="bg-[#111] border border-white/5 p-4 rounded-xl mt-4 flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-white/40 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-white/60 font-light leading-relaxed">
                          By creating an account, you verify that you are <strong className="text-white">21+ years of age</strong> and agree to our <strong className="text-white hover:underline cursor-pointer">Terms of Use</strong>. All compounds are strictly for laboratory research.
                        </p>
                      </div>
                    </div>
                  </>
                )}

                <button className="w-full bg-white text-black font-bold text-sm tracking-widest py-4 rounded-xl mt-6 hover:bg-white/90 transition-colors flex items-center justify-center gap-2 group">
                  {view === "register" ? "CREATE ACCOUNT" : "SECURE LOGIN"}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
