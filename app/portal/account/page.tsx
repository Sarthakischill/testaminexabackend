"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Package, Loader2, User, ShoppingBag, Check, AlertCircle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useCart } from "@/lib/cart-context";
import { createClient } from "@/lib/supabase/client";

const font = { fontFamily: "Helvetica, Arial, sans-serif" } as const;

type Order = {
  id: string;
  status: string;
  total: number;
  items: { name: string; quantity: number }[];
  order_number: string | null;
  created_at: string;
  shipping_name: string;
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending Verification", color: "text-amber-400", bg: "bg-amber-400/10" },
  confirmed: { label: "Confirmed", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  processing: { label: "Processing", color: "text-blue-400", bg: "bg-blue-400/10" },
  shipped: { label: "Shipped", color: "text-purple-400", bg: "bg-purple-400/10" },
  delivered: { label: "Delivered", color: "text-white/80", bg: "bg-white/5" },
  cancelled: { label: "Cancelled", color: "text-red-400", bg: "bg-red-400/10" },
};

type UserProfile = {
  email: string;
  fullName: string;
  dateOfBirth: string;
};

export default function AccountPage() {
  const router = useRouter();
  const { totalItems, openCart } = useCart();
  const [activeTab, setActiveTab] = useState<"account" | "orders">("account");
  const [signingOut, setSigningOut] = useState(false);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: { email?: string; user_metadata?: Record<string, string> } | null } }) => {
      if (user) {
        setProfile({
          email: user.email || "",
          fullName: user.user_metadata?.full_name || "",
          dateOfBirth: user.user_metadata?.date_of_birth || "",
        });
        setNewEmail(user.email || "");
      }
      setProfileLoading(false);
    });

    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => setOrders(data.orders || []))
      .finally(() => setOrdersLoading(false));
  }, []);

  const handleUpdateEmail = async () => {
    if (!newEmail || newEmail === profile?.email) return;
    setSaving("email");
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Confirmation email sent to your new address. Please check your inbox." });
    }
    setSaving(null);
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }
    setSaving("password");
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Password updated successfully." });
      setNewPassword("");
      setConfirmPassword("");
    }
    setSaving(null);
  };

  const tabs = [
    { id: "account" as const, label: "My Account", icon: User },
    { id: "orders" as const, label: "My Orders", icon: ShoppingBag },
  ];

  return (
    <main className="relative min-h-screen w-full bg-[#050505] selection:bg-white/20 selection:text-white">
      <Navbar isPortal cartCount={totalItems} onCartClick={openCart} />

      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 pt-32 pb-40">
        <div className="max-w-5xl mx-auto">
          <Link href="/portal" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span style={font} className="text-xs font-medium tracking-[0.1em] uppercase">Back to Portal</span>
          </Link>

          <h1 style={font} className="text-4xl md:text-5xl font-normal tracking-tight text-white mb-10">
            Account
          </h1>

          {/* Tabs */}
          <div className="flex items-center gap-1 p-1.5 bg-white/[0.03] rounded-2xl border border-white/5 w-fit mb-12">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMessage(null); }}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold tracking-[0.05em] uppercase transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                    : "text-white/50 hover:text-white/80 hover:bg-white/10"
                }`}
                style={font}
              >
                <tab.icon className="w-4 h-4" strokeWidth={1.5} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Message Banner */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex items-center gap-3 p-4 rounded-xl mb-8 ${
                  message.type === "success" ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"
                }`}
              >
                {message.type === "success" ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
                <p style={font} className={`text-sm font-light ${message.type === "success" ? "text-emerald-400/80" : "text-red-400/80"}`}>
                  {message.text}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* My Account Tab */}
          {activeTab === "account" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {profileLoading ? (
                <div className="flex items-center justify-center py-24">
                  <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
                </div>
              ) : profile ? (
                <>
                  {/* Profile Info */}
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8">
                    <h2 style={font} className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 mb-6">Profile Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <span style={font} className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/30 block mb-2">Full Name</span>
                        <p style={font} className="text-lg text-white font-light">{profile.fullName || "—"}</p>
                      </div>
                      <div>
                        <span style={font} className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/30 block mb-2">Email</span>
                        <p style={font} className="text-lg text-white font-light">{profile.email}</p>
                      </div>
                      <div>
                        <span style={font} className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/30 block mb-2">Date of Birth</span>
                        <p style={font} className="text-lg text-white font-light">{profile.dateOfBirth || "—"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Update Email */}
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8">
                    <h2 style={font} className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 mb-6">Update Email</h2>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="new@email.com"
                        className="flex-1 bg-transparent border-b border-white/20 pb-3 text-white font-light text-base placeholder:text-white/10 focus:outline-none focus:border-white transition-colors rounded-none"
                        style={font}
                      />
                      <button
                        onClick={handleUpdateEmail}
                        disabled={saving === "email" || newEmail === profile.email}
                        className="px-6 py-3 rounded-full border border-white/20 bg-white/[0.03] text-xs font-bold tracking-[0.1em] uppercase text-white/60 hover:bg-white hover:text-black transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
                        style={font}
                      >
                        {saving === "email" ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Update Email"}
                      </button>
                    </div>
                  </div>

                  {/* Update Password */}
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8">
                    <h2 style={font} className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 mb-6">Change Password</h2>
                    <div className="flex flex-col gap-4">
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password"
                        className="w-full bg-transparent border-b border-white/20 pb-3 text-white font-light text-base placeholder:text-white/10 focus:outline-none focus:border-white transition-colors rounded-none"
                        style={font}
                      />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full bg-transparent border-b border-white/20 pb-3 text-white font-light text-base placeholder:text-white/10 focus:outline-none focus:border-white transition-colors rounded-none"
                        style={font}
                      />
                      <button
                        onClick={handleUpdatePassword}
                        disabled={saving === "password" || !newPassword}
                        className="w-fit px-6 py-3 rounded-full border border-white/20 bg-white/[0.03] text-xs font-bold tracking-[0.1em] uppercase text-white/60 hover:bg-white hover:text-black transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed mt-2"
                        style={font}
                      >
                        {saving === "password" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
                      </button>
                    </div>
                  </div>

                  {/* Sign Out */}
                  <div className="pt-4 border-t border-white/5">
                    <button
                      onClick={async () => {
                        setSigningOut(true);
                        const supabase = createClient();
                        await supabase.auth.signOut();
                        router.push("/login");
                      }}
                      disabled={signingOut}
                      className="flex items-center gap-3 px-6 py-3 rounded-full border border-white/10 text-xs font-bold tracking-[0.1em] uppercase text-red-400/70 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all duration-300 disabled:opacity-50"
                      style={font}
                    >
                      {signingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                      Sign Out
                    </button>
                  </div>
                </>
              ) : null}
            </motion.div>
          )}

          {/* My Orders Tab */}
          {activeTab === "orders" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {ordersLoading ? (
                <div className="flex items-center justify-center py-24">
                  <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <Package className="w-16 h-16 text-white/10 mb-8" strokeWidth={1} />
                  <h2 style={font} className="text-2xl text-white/40 font-light mb-4">No orders yet</h2>
                  <p style={font} className="text-white/30 text-sm font-light mb-8">Your completed orders will appear here.</p>
                  <Link href="/portal" style={font} className="text-xs text-white/50 hover:text-white tracking-[0.1em] uppercase underline">
                    Browse Catalog
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {orders.map((order, idx) => {
                    const cfg = statusConfig[order.status] || statusConfig.pending;
                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Link
                          href={`/portal/orders/${order.id}`}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 md:p-8 bg-white/[0.02] border border-white/10 rounded-2xl hover:bg-white/[0.04] hover:border-white/20 transition-all duration-500 group gap-4"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <span style={font} className="text-xs text-white/30 font-mono">
                                {order.order_number || order.id.slice(0, 8).toUpperCase()}
                              </span>
                              <span className={`text-[10px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded-full ${cfg.color} ${cfg.bg}`} style={font}>
                                {cfg.label}
                              </span>
                            </div>
                            <p style={font} className="text-sm text-white/60 font-light">
                              {order.items.map((i) => `${i.name} x${i.quantity}`).join(", ")}
                            </p>
                            <p style={font} className="text-xs text-white/30 font-light mt-1">
                              {new Date(order.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span style={font} className="text-lg text-white font-light">
                              ${order.total.toFixed(2)}
                            </span>
                            <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
