"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, LogOut, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { siteConfig } from "@/config/site";

interface NavbarProps {
  isPortal?: boolean;
  cartCount?: number;
  cartColor?: string;
  onCartClick?: () => void;
}

export default function Navbar({ isPortal = false, cartCount = 0, cartColor = "#ffffff", onCartClick }: NavbarProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(isPortal);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (isPortal) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: unknown } }) => {
      setIsAuthenticated(!!user);
    });
  }, [isPortal]);

  const handleSignOut = async () => {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsMenuOpen(false);
    setIsAuthenticated(false);
    router.push("/");
    router.refresh();
  };

  const menuLinks: { name: string; href: string; locked?: boolean }[] = [
    { name: 'Products', href: '/login', locked: true },
    { name: 'Science', href: '/login', locked: true },
    { name: 'Contact', href: '/contact' },
    { name: 'Account', href: '/login', locked: true },
  ];

  const authedPublicLinks: { name: string; href: string; locked?: boolean }[] = [
    { name: 'Products', href: '/portal' },
    { name: 'Science', href: '/portal/science' },
    { name: 'Contact', href: '/contact' },
    { name: 'Account', href: '/portal/account' },
  ];

  const portalLinks: { name: string; href: string; locked?: boolean }[] = [
    { name: 'Products', href: '/portal' },
    { name: 'Science', href: '/portal/science' },
    { name: 'Contact', href: '/portal/contact' },
    { name: 'Account', href: '/portal/account' },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[100] w-full ${isPortal ? '' : 'mix-blend-difference'} text-white pointer-events-none`}>
        <nav aria-label="Main navigation" className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 h-24 flex items-center justify-between relative">
          
          {/* Left: Icon & Mobile Logotype */}
          <div className="flex items-center gap-3 md:gap-4 pointer-events-auto z-[100]">
            <Link href={isPortal ? "/portal" : "/"} className="relative w-10 md:w-12 lg:w-14 h-10 md:h-12 lg:h-14 shrink-0 transition-transform hover:rotate-180 duration-700 ease-in-out">
              <Image 
                src={siteConfig.faviconUrl || "/favicon.svg"} 
                alt={`${siteConfig.name} Icon`} 
                fill
                sizes="(max-width: 768px) 40px, (max-width: 1024px) 48px, 56px" 
                className="object-contain object-left"
                priority
              />
            </Link>
            {/* Mobile Logotype */}
            <Link href={isPortal ? "/portal" : "/"} className="relative w-20 h-4 sm:w-24 sm:h-5 md:hidden shrink-0 transition-transform hover:scale-105">
              <Image 
                src={siteConfig.logoUrl || "/logo.svg"} 
                alt={siteConfig.name} 
                fill
                sizes="(max-width: 640px) 80px, 96px" 
                className="object-contain object-left"
                priority
              />
            </Link>
          </div>

          {/* Center: Logotype (Hidden on mobile) */}
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 hidden md:block transition-transform hover:scale-105 pointer-events-auto">
            <Link href={isPortal ? "/portal" : "/"} className="relative w-24 md:w-28 lg:w-32 h-5 md:h-6 lg:h-7 block">
              <Image 
                src={siteConfig.logoUrl || "/logo.svg"} 
                alt={siteConfig.name} 
                fill
                sizes="(max-width: 1024px) 112px, 128px" 
                className="object-contain"
                priority
              />
            </Link>
          </div>

          {/* Right: Actions, Login & Menu Icon */}
          <div className="flex items-center gap-4 md:gap-6 pointer-events-auto z-[100]">
            {isPortal && (
              <div className="hidden md:flex items-center gap-1 md:gap-2">
                {/* Cart Button */}
                <motion.button
                  onClick={onCartClick}
                  initial="initial"
                  whileHover="hover"
                  aria-label="Open cart"
                  className="relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full group"
                >
                  <motion.div 
                    variants={{ initial: { scale: 0.5, opacity: 0 }, hover: { scale: 1, opacity: 1 } }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 bg-white/10 rounded-full"
                  />
                  <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white/70 group-hover:text-white relative z-10 transition-colors duration-300">
                    <motion.path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <motion.line x1="3" y1="6" x2="21" y2="6" />
                    <motion.path 
                      d="M16 10a4 4 0 0 1-8 0" 
                      variants={{ initial: { y: 0 }, hover: { y: -2 } }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  </motion.svg>
                  <AnimatePresence>
                    {cartCount > 0 && (
                      <motion.span 
                        key="cart-count"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute top-1.5 right-1.5 md:top-2 md:right-2 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-lg z-20"
                        style={{ backgroundColor: cartColor }}
                      >
                        {cartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Orders Button */}
                <Link href="/portal/account">
                  <motion.div 
                    initial="initial"
                    whileHover="hover"
                    className="relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full group"
                  >
                    <motion.div 
                      variants={{ initial: { scale: 0.5, opacity: 0 }, hover: { scale: 1, opacity: 1 } }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0 bg-white/10 rounded-full"
                    />
                    <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white/70 group-hover:text-white relative z-10 transition-colors duration-300">
                      <motion.path 
                        d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" 
                        variants={{ initial: { y: 0 }, hover: { y: 1 } }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      />
                      <motion.circle 
                        cx="12" cy="7" r="4" 
                        variants={{ initial: { y: 0 }, hover: { y: -2 } }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      />
                    </motion.svg>
                  </motion.div>
                </Link>

                {/* Divider */}
                <div className="w-px h-4 bg-white/20 mx-2 hidden md:block" />
              </div>
            )}
            
            {/* Login Button or Account Icon */}
            {!isPortal && !isAuthenticated && (
              <Link href="/login" className="hidden md:flex group relative items-center justify-center px-6 py-2.5 overflow-hidden rounded-full border border-white/20 bg-white/5 backdrop-blur-md transition-all duration-500 hover:bg-white/10 hover:border-white/40">
                <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="relative z-10 text-xs font-medium tracking-[0.15em] uppercase text-white transition-transform duration-500 group-hover:-translate-x-2">
                  Log In
                </span>
                <svg 
                  viewBox="0 0 24 24" 
                  className="absolute right-4 w-4 h-4 text-white opacity-0 translate-x-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0"
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            )}
            {!isPortal && isAuthenticated && (
              <Link href="/portal/account" className="hidden md:flex">
                <motion.div 
                  initial="initial"
                  whileHover="hover"
                  className="relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full group"
                >
                  <motion.div 
                    variants={{ initial: { scale: 0.5, opacity: 0 }, hover: { scale: 1, opacity: 1 } }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 bg-white/10 rounded-full"
                  />
                  <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white/70 group-hover:text-white relative z-10 transition-colors duration-300">
                    <motion.path 
                      d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" 
                      variants={{ initial: { y: 0 }, hover: { y: 1 } }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                    <motion.circle 
                      cx="12" cy="7" r="4" 
                      variants={{ initial: { y: 0 }, hover: { y: -2 } }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  </motion.svg>
                </motion.div>
              </Link>
            )}

            {/* Menu Icon */}
            <motion.button 
              onClick={() => setIsMenuOpen(true)}
              initial="initial"
              whileHover="hover"
              aria-label="Open menu"
              className="relative flex flex-col items-end justify-center gap-[6px] w-10 h-10 md:w-12 md:h-12 group pointer-events-auto z-[100]"
            >
            <motion.span 
              variants={{ initial: { width: "100%" }, hover: { width: "50%" } }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="h-[1.5px] bg-white"
            />
            <motion.span 
              variants={{ initial: { width: "80%" }, hover: { width: "100%" } }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="h-[1.5px] bg-white"
            />
            <motion.span 
              variants={{ initial: { width: "60%" }, hover: { width: "80%" } }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="h-[1.5px] bg-white"
            />
          </motion.button>
          </div>

        </nav>
      </header>
      
      {/* Overlay Backdrop */}
      <div 
        className={`fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Floating Menu Panel */}
      <div 
        className={`fixed top-4 right-4 bottom-4 md:top-6 md:right-6 md:bottom-6 w-[calc(100vw-2rem)] md:w-[400px] lg:w-[480px] z-[120] ${isPortal ? 'bg-[#111] text-white border border-white/10' : 'bg-white text-black'} rounded-2xl shadow-2xl flex flex-col transition-transform duration-700 pointer-events-auto overflow-hidden`}
        style={{ 
          transform: isMenuOpen ? "translateX(0)" : "translateX(120%)",
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        {/* Background Decorative Elements for Portal */}
        {isPortal && (
          <>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
          </>
        )}
        {/* Close Button (Top Right Inside Panel) */}
        <motion.button 
          onClick={() => setIsMenuOpen(false)}
          initial="initial"
          whileHover="hover"
          className={`absolute top-6 right-6 md:top-8 md:right-8 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center z-20 overflow-hidden ${isPortal ? 'border-white/10' : 'border-black/10'} bg-transparent`}
        >
          {/* Liquid Background Fill */}
          <motion.div 
            className={`absolute inset-0 ${isPortal ? 'bg-white/10' : 'bg-black'}`}
            variants={{
              initial: { y: "100%", borderRadius: "50% 50% 0 0" },
              hover: { y: "0%", borderRadius: "0% 0% 0 0" }
            }}
            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          />
          
          {/* Custom Animated X Icon */}
          <motion.svg viewBox="0 0 24 24" className="relative z-10 w-5 h-5 md:w-6 md:h-6 overflow-visible">
            {/* Base paths (visible initially, erase on hover) */}
            <motion.path 
              d="M6 6L18 18" 
              stroke={isPortal ? "#fff" : "#000"} 
              strokeWidth="1.5" 
              strokeLinecap="round"
              variants={{
                initial: { pathLength: 1, opacity: 1 },
                hover: { pathLength: 0, opacity: 0 }
              }}
              transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
            />
            <motion.path 
              d="M18 6L6 18" 
              stroke={isPortal ? "#fff" : "#000"} 
              strokeWidth="1.5" 
              strokeLinecap="round"
              variants={{
                initial: { pathLength: 1, opacity: 1 },
                hover: { pathLength: 0, opacity: 0 }
              }}
              transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
            />
            
            {/* Hover paths (drawn on hover while rotating) */}
            <motion.path 
              d="M6 6L18 18" 
              stroke={isPortal ? "#fff" : "#fff"} 
              strokeWidth="1.5" 
              strokeLinecap="round"
              variants={{
                initial: { pathLength: 0, opacity: 0, rotate: -90, scale: 0.5 },
                hover: { pathLength: 1, opacity: 1, rotate: 0, scale: 1 }
              }}
              style={{ transformOrigin: "12px 12px" }}
              transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1], delay: 0.1 }}
            />
            <motion.path 
              d="M18 6L6 18" 
              stroke={isPortal ? "#fff" : "#fff"} 
              strokeWidth="1.5" 
              strokeLinecap="round"
              variants={{
                initial: { pathLength: 0, opacity: 0, rotate: 90, scale: 0.5 },
                hover: { pathLength: 1, opacity: 1, rotate: 0, scale: 1 }
              }}
              style={{ transformOrigin: "12px 12px" }}
              transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1], delay: 0.1 }}
            />
          </motion.svg>
        </motion.button>

        {/* Menu Links */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-12 relative z-10">
          <div className={`flex flex-col w-full border-t ${isPortal ? 'border-white/10' : 'border-black/10'}`}>
            {(isPortal ? portalLinks : isAuthenticated ? authedPublicLinks : menuLinks).map((item) => (
              <div key={item.name} className={`border-b ${isPortal ? 'border-white/10' : 'border-black/10'} py-5 md:py-6 group ${item.locked ? 'cursor-default' : 'cursor-pointer'}`}>
                {item.locked ? (
                  <Link href="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between w-full">
                    <h2 
                      style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
                      className="relative z-10 text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight text-black/20 group-hover:text-black/35 transition-colors duration-500 ease-[0.16,1,0.3,1]"
                    >
                      {item.name}
                    </h2>
                    <div className="flex items-center gap-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-[0.16,1,0.3,1]">
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[10px] font-medium tracking-[0.1em] uppercase text-black/30">
                        Log in to access
                      </span>
                      <Lock className="w-3.5 h-3.5 text-black/25" strokeWidth={1.5} />
                    </div>
                  </Link>
                ) : (
                  <Link href={item.href} onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between w-full">
                    <h2 
                      style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
                      className="relative z-10 text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight group-hover:translate-x-4 transition-transform duration-500 ease-[0.16,1,0.3,1]"
                    >
                      {item.name}
                    </h2>
                    
                    {isPortal && (
                      <div className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-[0.16,1,0.3,1]">
                        <div className="w-10 h-10 rounded-full border border-white/20 bg-white/5 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                          <ArrowUpRight className="w-5 h-5 text-white" strokeWidth={1.5} />
                        </div>
                      </div>
                    )}
                  </Link>
                )}
              </div>
            ))}

          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-8 md:p-12 flex flex-col mt-auto relative z-10">
          {isPortal && (
            <div className={`flex md:hidden gap-6 mb-8 w-full justify-center border-t border-white/10 pt-8`}>
              <button onClick={() => { setIsMenuOpen(false); onCartClick?.(); }} className="flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors relative group">
                <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <motion.path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <motion.line x1="3" y1="6" x2="21" y2="6" />
                  <motion.path d="M16 10a4 4 0 0 1-8 0" />
                </motion.svg>
                <span className="text-[10px] uppercase tracking-wider font-medium" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>Cart</span>
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span 
                      key="mobile-cart-count"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-1 -right-2 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-lg"
                      style={{ backgroundColor: cartColor }}
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
              <Link 
                href="/portal/account"
                onClick={() => setIsMenuOpen(false)}
                className="flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors ml-8 group"
              >
                <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <motion.path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <motion.circle cx="12" cy="7" r="4" />
                </motion.svg>
                <span className="text-[10px] uppercase tracking-wider font-medium" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>Account</span>
              </Link>
            </div>
          )}

          {/* Authenticated public user: Sign Out */}
          {!isPortal && isAuthenticated && (
            <>
              <div className="flex md:hidden gap-6 mb-8 w-full justify-center border-t border-black/10 pt-8">
                <Link 
                  href="/portal/account"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex flex-col items-center gap-2 text-black/60 hover:text-black transition-colors group"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="text-[10px] uppercase tracking-wider font-medium" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>Account</span>
                </Link>
              </div>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="group flex items-center relative w-full px-8 py-4 mb-8 rounded-full border border-black/15 bg-transparent text-black/50 transition-all duration-500 hover:bg-black hover:border-black hover:text-white"
                title="Sign out"
              >
                <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="relative z-10 text-xs font-medium tracking-[0.15em] uppercase transition-colors duration-500 group-hover:text-white">
                  {signingOut ? "Signing out..." : "Sign Out"}
                </span>
                <div className="absolute right-5 flex items-center justify-center w-6 h-6 rounded-full bg-black/10 text-black/50 transition-all duration-500 group-hover:translate-x-1 group-hover:bg-white group-hover:text-black">
                  <LogOut className="w-3 h-3" strokeWidth={2} />
                </div>
              </button>
            </>
          )}

          {/* Public menu: Log In button (unauthenticated only) */}
          {!isPortal && !isAuthenticated && (
            <Link
              href="/login"
              onClick={() => setIsMenuOpen(false)}
              className="group flex items-center relative w-full px-8 py-4 mb-8 rounded-full border border-black/15 bg-transparent text-black transition-all duration-500 hover:bg-black hover:border-black"
            >
              <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="relative z-10 text-xs font-medium tracking-[0.15em] uppercase transition-colors duration-500 group-hover:text-white">
                Log In / Register
              </span>
              <div className="absolute right-5 flex items-center justify-center w-6 h-6 rounded-full bg-black text-white transition-all duration-500 group-hover:translate-x-1 group-hover:bg-white group-hover:text-black">
                <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </Link>
          )}

          {/* Portal: Sign Out */}
          {isPortal && (
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="group flex items-center relative w-full px-8 py-4 mb-8 rounded-full border border-white/15 bg-transparent text-white/50 transition-all duration-500 hover:bg-white hover:border-white hover:text-black"
              title="Sign out"
            >
              <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="relative z-10 text-xs font-medium tracking-[0.15em] uppercase transition-colors duration-500 group-hover:text-black">
                {signingOut ? "Signing out..." : "Sign Out"}
              </span>
              <div className="absolute right-5 flex items-center justify-center w-6 h-6 rounded-full bg-white/15 text-white/50 transition-all duration-500 group-hover:translate-x-1 group-hover:bg-black group-hover:text-white">
                <LogOut className="w-3 h-3" strokeWidth={2} />
              </div>
            </button>
          )}

          <div className="flex w-full items-end justify-between">
            <Link href={isPortal ? "/" : (isAuthenticated ? "/portal" : "/")} onClick={() => setIsMenuOpen(false)}>
              <h3 
                style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
                className="text-2xl md:text-3xl font-medium tracking-tight cursor-pointer hover:opacity-70 transition-opacity"
              >
                {isPortal ? 'Home' : (isAuthenticated ? 'Portal' : 'Home')}
              </h3>
            </Link>
            <div className={`flex gap-4 text-xs md:text-sm font-medium ${isPortal ? 'text-white/60' : 'text-black/60'}`} style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
              <Link href="/privacy" onClick={() => setIsMenuOpen(false)} className={`hover:${isPortal ? 'text-white' : 'text-black'} transition-colors`}>Privacy</Link>
              <Link href="/terms" onClick={() => setIsMenuOpen(false)} className={`hover:${isPortal ? 'text-white' : 'text-black'} transition-colors`}>Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
