"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Check, Loader2, AlertCircle, ShieldCheck, Copy, Tag, X, Snowflake, Truck, CreditCard } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useCart, FREE_SHIPPING_THRESHOLD } from "@/lib/cart-context";
import { createClient } from "@/lib/supabase/client";
import { getBundleDiscount, calculateOrderTotal, type ProductDiscountMap } from "@/lib/pricing";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

function generateOrderNumber(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `ANX-${yy}${mm}-${suffix}`;
}

type Step = "shipping" | "rates" | "payment" | "confirm";
type PaymentMethod = "zelle" | "crypto" | "credit_card";

type ShippingTier = {
  id: "standard" | "priority" | "express";
  label: string;
  description: string;
  deliveryEstimate: string;
  customerPrice: number;
  isFree: boolean;
};

const USDC_ADDRESS = "0xA238e1470f61FBA96A614DEE57FeCC833BB55cB8";
const USDC_NETWORK = "Ethereum";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalItems, subtotal, clearCart, openCart, coldChain, shippingFee, coldChainFee, freeShipping, updatePrices } = useCart();
  const [step, setStep] = useState<Step>("shipping");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("zelle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [orderNumber] = useState(() => generateOrderNumber());
  const [copied, setCopied] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const [shipping, setShipping] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  const [shippingTiers, setShippingTiers] = useState<ShippingTier[]>([]);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<ShippingTier | null>(null);

  const [qboConnected, setQboConnected] = useState(false);

  const [promoInput, setPromoInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountPercent: number;
    discountFixed: number;
    salesRepName: string | null;
    applicableProductIds: string[] | null;
    productDiscounts: Record<string, { percent?: number; fixed?: number }> | null;
  } | null>(null);

  const handleApplyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    setPromoLoading(true);
    setPromoError("");

    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (!res.ok) {
        setPromoError(data.error || "Invalid promo code");
        return;
      }

      const applicableIds: string[] | null = data.applicableProductIds || null;
      const productDiscounts: Record<string, { percent?: number; fixed?: number }> | null = data.productDiscounts || null;

      if (productDiscounts && Object.keys(productDiscounts).length > 0) {
        const cartProductIds = items.map((i) => i.product.id);
        const hasEligible = cartProductIds.some((pid) => pid in productDiscounts);
        if (!hasEligible) {
          setPromoError("This code doesn't apply to any items in your cart");
          return;
        }
      } else if (applicableIds && applicableIds.length > 0) {
        const cartProductIds = items.map((i) => i.product.id);
        const hasEligible = cartProductIds.some((pid) => applicableIds.includes(pid));
        if (!hasEligible) {
          setPromoError("This code doesn't apply to any items in your cart");
          return;
        }
      }

      setAppliedPromo({
        code: data.code,
        discountPercent: data.discountPercent,
        discountFixed: data.discountFixed,
        salesRepName: data.salesRepName,
        applicableProductIds: applicableIds,
        productDiscounts,
      });
      setPromoInput("");
    } catch {
      setPromoError("Failed to validate code");
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoError("");
  };

  const fetchShippingRates = async () => {
    setRatesLoading(true);
    setSelectedTier(null);

    try {
      const res = await fetch("/api/shipping/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subtotal }),
      });

      const data = await res.json();

      if (data.tiers && data.tiers.length > 0) {
        setShippingTiers(data.tiers);
        const standardTier = data.tiers.find((t: ShippingTier) => t.id === "standard");
        if (standardTier?.isFree) {
          setSelectedTier(standardTier);
        }
      } else {
        setShippingTiers([]);
      }
    } catch {
      setShippingTiers([]);
    } finally {
      setRatesLoading(false);
    }
  };

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
        setShipping((prev) => ({ ...prev, email: user.email! }));
      }
    }
    loadUser();
    fetch("/api/qbo/connected", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setQboConnected(data.connected === true))
      .catch(() => setQboConnected(false));
  }, []);

  const processFile = useCallback((file: File) => {
    const accepted = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
    if (!accepted.includes(file.type)) {
      setError("Please upload a PNG, JPEG, WebP, or PDF file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File must be under 10MB.");
      return;
    }

    setScreenshotFile(file);
    if (file.type === "application/pdf") {
      setScreenshotPreview("pdf");
    } else {
      setScreenshotPreview(URL.createObjectURL(file));
    }
    setError("");
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (step !== "payment" || paymentMethod === "credit_card") return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            processFile(file);
            return;
          }
        }
      }
    };
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [step, paymentMethod, processFile]);

  const getRecaptchaToken = useCallback(async (): Promise<string | null> => {
    if (!RECAPTCHA_SITE_KEY) return null;
    try {
      const w = window as unknown as { grecaptcha?: { ready: (cb: () => void) => void; execute: (key: string, opts: { action: string }) => Promise<string> } };
      if (!w.grecaptcha) return null;
      return await new Promise<string>((resolve) => {
        w.grecaptcha!.ready(() => {
          w.grecaptcha!.execute(RECAPTCHA_SITE_KEY, { action: "place_order" }).then(resolve);
        });
      });
    } catch {
      return null;
    }
  }, []);

  const handlePlaceOrder = async () => {
    if (paymentMethod !== "credit_card" && !screenshotFile) {
      setError(`Please upload your ${paymentMethod === "zelle" ? "Zelle" : "USDC"} payment screenshot.`);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const recaptchaToken = await getRecaptchaToken();

      const stockRes = await fetch("/api/products", { cache: "no-store" });
      if (!stockRes.ok) throw new Error("Unable to verify product availability. Please try again.");
      const stockData = await stockRes.json();
      if (!stockData.products?.length) throw new Error("Unable to verify product availability. Please try again.");

      type LatestProduct = { id: string; soldOut?: boolean; comingSoon?: boolean; name: string; inventoryQuantity?: number; price: number };
      const productMap = new Map<string, LatestProduct>(
        stockData.products.map((p: LatestProduct) => [p.id, p])
      );

      const priceUpdates = new Map<string, number>();
      for (const item of items) {
        const latest = productMap.get(item.product.id);
        if (!latest) {
          throw new Error(`${item.product.name} is no longer available. Please remove it from your cart.`);
        }
        if (latest.soldOut || latest.comingSoon) {
          throw new Error(`${latest.name} is no longer available for purchase. Please remove it from your cart.`);
        }
        if (latest.inventoryQuantity !== undefined && latest.inventoryQuantity < item.quantity) {
          throw new Error(
            latest.inventoryQuantity <= 0
              ? `${latest.name} is sold out.`
              : `Only ${latest.inventoryQuantity} unit(s) of ${latest.name} available.`
          );
        }
        if (latest.price !== item.product.price) {
          priceUpdates.set(item.product.id, latest.price);
        }
      }

      if (priceUpdates.size > 0) {
        updatePrices(priceUpdates);
        throw new Error("Some product prices have been updated. Please review the updated totals and place your order again.");
      }

      let screenshotPath: string | null = null;

      if (paymentMethod !== "credit_card" && screenshotFile) {
        const formData = new FormData();
        formData.append("file", screenshotFile);

        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");
        screenshotPath = uploadData.path;
      }

      const orderItems = items.map((i) => ({
        product_id: i.product.id,
        name: i.product.name,
        quantity: i.quantity,
        price: i.product.price,
        volume: i.product.volume,
      }));

      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          subtotal,
          total,
          shipping,
          screenshotUrl: screenshotPath,
          orderNumber,
          paymentMethod,
          promoCode: appliedPromo?.code || null,
          shippingFee: actualShippingFee,
          coldChain,
          coldChainFee,
          serviceName: selectedTier?.label || null,
          estimatedDelivery: selectedTier?.deliveryEstimate || null,
          shippingTierId: selectedTier?.id || "standard",
          recaptchaToken,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) throw new Error(orderData.error || "Order failed");

      clearCart();
      router.push(`/portal/orders/${orderData.order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getItemDiscount = getBundleDiscount;

  const tierPrice = selectedTier ? selectedTier.customerPrice : shippingFee;
  const isFreeStandard = selectedTier?.id === "standard" && subtotal >= FREE_SHIPPING_THRESHOLD;
  const actualShippingFee = isFreeStandard ? 0 : tierPrice;

  const computed = calculateOrderTotal({
    items: items.map((i) => ({ price: i.product.price, quantity: i.quantity, productId: i.product.id })),
    paymentMethod,
    shippingFee: actualShippingFee,
    coldChainFee,
    promoDiscountPercent: appliedPromo?.discountPercent ?? 0,
    promoDiscountFixed: appliedPromo?.discountFixed ?? 0,
    applicableProductIds: appliedPromo?.applicableProductIds ?? null,
    productDiscounts: (appliedPromo?.productDiscounts as ProductDiscountMap | null) ?? null,
  });

  const paymentDiscount = computed.paymentDiscount;
  const promoDiscountAmount = computed.promoDiscount;
  const discountAmount = paymentDiscount + promoDiscountAmount;
  const total = computed.total;

  const isShippingValid =
    shipping.name && shipping.email && shipping.address && shipping.city && shipping.state && shipping.zip;

  if (items.length === 0 && step !== "confirm") {
    return (
      <main className="relative min-h-screen w-full bg-[#050505] selection:bg-white/20 selection:text-white">
        <Navbar isPortal cartCount={0} onCartClick={openCart} />
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
          <h2 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-2xl text-white/40 font-light mb-4">Your cart is empty</h2>
          <Link href="/portal" className="text-xs text-white/50 hover:text-white tracking-[0.1em] uppercase underline">
            Return to catalog
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen w-full bg-[#050505] selection:bg-white/20 selection:text-white">
      {RECAPTCHA_SITE_KEY && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
          strategy="lazyOnload"
        />
      )}
      <Navbar isPortal cartCount={totalItems} onCartClick={openCart} />

      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 pt-32 pb-40">
        <div className="max-w-5xl mx-auto">
          <Link href="/portal" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs font-medium tracking-[0.1em] uppercase">Back to Portal</span>
          </Link>

          <h1 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-4xl md:text-5xl font-normal tracking-tight text-white mb-4">
            Checkout
          </h1>

          {/* Step Indicators */}
          <div className="flex items-center gap-3 mb-16">
            {(["shipping", "rates", "payment", "confirm"] as Step[]).map((s, idx) => (
              <div key={s} className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (s === "shipping") setStep(s);
                    if (s === "rates" && isShippingValid) {
                      setStep(s);
                      if (shippingTiers.length === 0) fetchShippingRates();
                    }
                    if (s === "payment" && isShippingValid) setStep(s);
                  }}
                  className={`text-xs font-bold tracking-[0.15em] uppercase transition-colors ${step === s ? "text-white" : "text-white/30"}`}
                  style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
                >
                  {idx + 1}. {s === "shipping" ? "Shipping" : s === "rates" ? "Method" : s === "payment" ? "Payment" : "Review"}
                </button>
                {idx < 3 && <div className="w-8 h-px bg-white/10" />}
              </div>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            {/* Main Content */}
            <div className="flex-1">
              <AnimatePresence mode="wait">
                {step === "shipping" && (
                  <motion.div
                    key="shipping"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <h2 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xl font-normal text-white mb-8">Shipping Information</h2>
                    <div className="flex flex-col gap-6">
                      {[
                        { label: "Full Name", key: "name" as const, placeholder: "Dr. Jane Doe" },
                        { label: "Email", key: "email" as const, placeholder: userEmail || "researcher@lab.edu", type: "email" },
                        { label: "Street Address", key: "address" as const, placeholder: "123 Research Blvd" },
                        { label: "City", key: "city" as const, placeholder: "San Diego" },
                      ].map((field) => (
                        <div key={field.key} className="flex flex-col gap-2">
                          <label style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs font-medium tracking-[0.1em] uppercase text-white/40">
                            {field.label}
                          </label>
                          <input
                            type={field.type || "text"}
                            value={shipping[field.key]}
                            onChange={(e) => setShipping({ ...shipping, [field.key]: e.target.value })}
                            placeholder={field.placeholder}
                            className="w-full bg-transparent border-b border-white/20 pb-3 text-white font-light text-lg placeholder:text-white/10 focus:outline-none focus:border-white transition-colors duration-500 rounded-none"
                            style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
                          />
                        </div>
                      ))}
                      <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                          <label style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs font-medium tracking-[0.1em] uppercase text-white/40">State</label>
                          <input
                            type="text"
                            value={shipping.state}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 2);
                              setShipping({ ...shipping, state: val });
                            }}
                            maxLength={2}
                            placeholder="CA"
                            className="w-full bg-transparent border-b border-white/20 pb-3 text-white font-light text-lg placeholder:text-white/10 focus:outline-none focus:border-white transition-colors duration-500 rounded-none"
                            style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs font-medium tracking-[0.1em] uppercase text-white/40">ZIP Code</label>
                          <input
                            type="text"
                            value={shipping.zip}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^\d-]/g, "").slice(0, 10);
                              setShipping({ ...shipping, zip: val });
                            }}
                            maxLength={10}
                            placeholder="92101"
                            className="w-full bg-transparent border-b border-white/20 pb-3 text-white font-light text-lg placeholder:text-white/10 focus:outline-none focus:border-white transition-colors duration-500 rounded-none"
                            style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (isShippingValid) {
                          setStep("rates");
                          fetchShippingRates();
                        }
                      }}
                      disabled={!isShippingValid}
                      className="group relative flex items-center justify-center w-full py-4 mt-12 rounded-full border border-white/20 bg-white text-black transition-all duration-500 hover:bg-transparent hover:border-white disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden"
                    >
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="relative z-10 text-xs font-bold tracking-[0.15em] uppercase transition-colors duration-500 group-hover:text-white">
                        Continue to Shipping Method
                      </span>
                      <div className="absolute inset-0 bg-transparent transition-colors duration-500 group-hover:bg-[#050505] -z-0" />
                    </button>
                  </motion.div>
                )}

                {step === "rates" && (
                  <motion.div
                    key="rates"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <h2 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xl font-normal text-white mb-2">Shipping Method</h2>
                    <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white/30 font-light mb-8">
                      Select a shipping speed for your order
                    </p>

                    {ratesLoading ? (
                      <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
                        <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white/30 font-light">
                          Calculating shipping options...
                        </p>
                      </div>
                    ) : (
                      <div className="mb-8">
                        <div className="flex flex-col gap-3 mb-8">
                          {shippingTiers.map((tier) => (
                            <button
                              key={tier.id}
                              onClick={() => setSelectedTier(tier)}
                              className={`relative flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 text-left ${
                                selectedTier?.id === tier.id
                                  ? "border-white/30 bg-white/[0.06]"
                                  : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                              }`}
                            >
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2">
                                  <Truck className="w-4 h-4 text-white/40" />
                                  <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white font-medium">
                                    {tier.label}
                                  </span>
                                  {tier.id === "standard" && subtotal >= FREE_SHIPPING_THRESHOLD && (
                                    <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400">
                                      Free
                                    </span>
                                  )}
                                </div>
                                <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-white/40 font-light pl-6">
                                  {tier.deliveryEstimate}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                {tier.id === "standard" && subtotal >= FREE_SHIPPING_THRESHOLD ? (
                                  <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-base text-emerald-400 font-light">
                                    $0.00
                                  </span>
                                ) : (
                                  <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-base text-white font-light">
                                    ${tier.customerPrice.toFixed(2)}
                                  </span>
                                )}
                                {selectedTier?.id === tier.id && (
                                  <Check className="w-4 h-4 text-emerald-400" />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => selectedTier && setStep("payment")}
                          disabled={!selectedTier}
                          className="group relative flex items-center justify-center w-full py-4 rounded-full border border-white/20 bg-white text-black transition-all duration-500 hover:bg-transparent hover:border-white disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden"
                        >
                          <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="relative z-10 text-xs font-bold tracking-[0.15em] uppercase transition-colors duration-500 group-hover:text-white">
                            Continue to Payment
                          </span>
                          <div className="absolute inset-0 bg-transparent transition-colors duration-500 group-hover:bg-[#050505] -z-0" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {step === "payment" && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <h2 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xl font-normal text-white mb-8">Payment Method</h2>

                    {/* Payment Method Selector */}
                    <div className={`grid gap-3 mb-8 ${qboConnected ? "grid-cols-3" : "grid-cols-2"}`}>
                      {([
                        { id: "zelle" as const, label: "Zelle", sub: "10% discount" },
                        { id: "crypto" as const, label: "USDC", sub: "10% discount" },
                        ...(qboConnected ? [{ id: "credit_card" as const, label: "Credit Card", sub: "via QuickBooks" }] : []),
                      ] as { id: PaymentMethod; label: string; sub: string }[]).map((method) => (
                        <button
                          key={method.id}
                          onClick={() => {
                            setPaymentMethod(method.id);
                            setScreenshotFile(null);
                            setScreenshotPreview(null);
                            setError("");
                          }}
                          className={`relative flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all duration-300 ${
                            paymentMethod === method.id
                              ? "border-white/30 bg-white/[0.04]"
                              : "border-white/10 bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.02]"
                          }`}
                        >
                          {paymentMethod === method.id && (
                            <div className="absolute top-3 right-3">
                              <Check className="w-4 h-4 text-white/60" />
                            </div>
                          )}
                          <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm font-medium text-white tracking-wide">
                            {method.label}
                          </span>
                          <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className={`text-[10px] font-bold tracking-wider uppercase ${
                            method.id === "zelle" ? "text-emerald-400/70" : method.id === "crypto" ? "text-blue-400/70" : "text-white/30"
                          }`}>
                            {method.sub}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Payment Instructions (Zelle / Crypto) */}
                    {paymentMethod !== "credit_card" && (
                    <>
                    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 mb-8">
                      <div className="flex items-center gap-3 mb-6">
                        <ShieldCheck className="w-5 h-5 text-white/50" />
                        <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs font-bold tracking-[0.15em] uppercase text-white/50">
                          {paymentMethod === "zelle" ? "Zelle Payment" : "USDC Payment"}
                        </span>
                      </div>

                      <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 mb-8">
                        <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white/70 font-medium leading-relaxed mb-4">
                          {paymentMethod === "zelle" ? "How to pay with Zelle:" : "How to pay with USDC:"}
                        </p>
                        <ol className="space-y-3">
                          <li style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white/60 font-light flex gap-3">
                            <span className="text-white/40 font-medium shrink-0">1.</span>
                            {paymentMethod === "zelle"
                              ? "Scan the QR code below in your banking app or send payment to our Zelle."
                              : <>Send the exact amount in USDC on <strong className="text-white/80 font-medium">{USDC_NETWORK}</strong> to the wallet address below.</>
                            }
                          </li>
                          <li style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white/60 font-light flex gap-3">
                            <span className="text-white/40 font-medium shrink-0">2.</span>
                            Send the <strong className="text-white/80 font-medium">exact total amount</strong> and include your order number in the {paymentMethod === "zelle" ? "memo or note field" : "transaction memo"}.
                          </li>
                          <li style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white/60 font-light flex gap-3">
                            <span className="text-white/40 font-medium shrink-0">3.</span>
                            After sending, <strong className="text-white/80 font-medium">upload a screenshot of your payment confirmation</strong> (not this page) below.
                          </li>
                        </ol>
                      </div>

                      {/* QR Code */}
                      <div className="flex justify-center mb-8">
                        <div className={`rounded-2xl p-6 w-fit ${paymentMethod === "zelle" ? "bg-white" : "bg-[#2c5dce]"}`}>
                          <Image
                            src={paymentMethod === "zelle" ? "https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/zelle-qr-new/public" : "https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/usdc-qr.png/public"}
                            alt={paymentMethod === "zelle" ? "Zelle QR Code" : "USDC Wallet QR Code"}
                            width={240}
                            height={300}
                            className="w-[240px] h-auto object-contain"
                          />
                        </div>
                      </div>

                      {/* Crypto: Wallet Address */}
                      {paymentMethod === "crypto" && (
                        <div className="p-5 rounded-xl bg-blue-500/[0.06] border border-blue-500/15 mb-6">
                          <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-blue-300/40 block mb-2">
                            Wallet Address ({USDC_NETWORK})
                          </span>
                          <div className="flex items-center justify-between gap-3">
                            <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm md:text-base font-mono text-blue-200/80 break-all">
                              {USDC_ADDRESS}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(USDC_ADDRESS);
                                setCopiedAddress(true);
                                setTimeout(() => setCopiedAddress(false), 2000);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-400/20 hover:bg-blue-400/10 transition-colors shrink-0"
                            >
                              {copiedAddress ? (
                                <Check className="w-3.5 h-3.5 text-blue-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-blue-400/50" />
                              )}
                              <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className={`text-[10px] font-bold tracking-wider uppercase ${copiedAddress ? "text-blue-400" : "text-blue-400/50"}`}>
                                {copiedAddress ? "Copied" : "Copy"}
                              </span>
                            </button>
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-400/10 border border-blue-400/20 text-blue-400">
                              USDC
                            </span>
                            <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-400/10 border border-blue-400/20 text-blue-400">
                              {USDC_NETWORK}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Order Number */}
                      <div className="p-5 rounded-xl bg-white/[0.04] border border-white/10 mb-6">
                        <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-white/30 block mb-3">
                          Your Order Number
                        </span>
                        <div className="flex items-center justify-between gap-4">
                          <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-2xl md:text-3xl font-light tracking-wider text-white">
                            {orderNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(orderNumber);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/[0.05] transition-colors"
                          >
                            {copied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-white/40" />
                            )}
                            <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className={`text-[10px] font-bold tracking-wider uppercase ${copied ? "text-emerald-400" : "text-white/40"}`}>
                              {copied ? "Copied" : "Copy"}
                            </span>
                          </button>
                        </div>
                        <div className="mt-4 p-3 rounded-lg bg-amber-500/[0.06] border border-amber-500/10">
                          <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-amber-200/70 font-light leading-relaxed">
                            <strong className="text-amber-200/90 font-medium">Important:</strong> Include this order number in the{" "}
                            {paymentMethod === "zelle" ? (
                              <strong className="text-amber-200/90 font-medium">memo or note field</strong>
                            ) : (
                              <strong className="text-amber-200/90 font-medium">transaction memo</strong>
                            )}{" "}
                            of your payment so we can match it to this order.
                          </p>
                        </div>
                      </div>

                      {/* Promo Code */}
                      <div className="mb-4">
                        {appliedPromo ? (
                          <div className="flex items-center justify-between p-4 rounded-xl bg-violet-500/[0.06] border border-violet-500/15">
                            <div className="flex items-center gap-3">
                              <Tag className="w-4 h-4 text-violet-400" />
                              <div>
                                <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-violet-300 font-medium tracking-wider">{appliedPromo.code}</span>
                                <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-violet-300/50 mt-0.5">
                                  {appliedPromo.discountPercent > 0 ? `${appliedPromo.discountPercent}% off` : `$${appliedPromo.discountFixed.toFixed(2)} off`}
                                </p>
                              </div>
                            </div>
                            <button onClick={removePromo} className="p-1.5 rounded-lg text-violet-400/50 hover:text-violet-300 hover:bg-violet-400/10 transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={promoInput}
                              onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(""); }}
                              onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                              placeholder="Promo code"
                              className="flex-1 bg-transparent border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-light placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                              style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
                            />
                            <button
                              onClick={handleApplyPromo}
                              disabled={promoLoading || !promoInput.trim()}
                              className="px-5 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-bold tracking-[0.1em] uppercase text-white/50 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                              style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
                            >
                              {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                            </button>
                          </div>
                        )}
                        {promoError && (
                          <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-red-400/70 mt-2 ml-1">{promoError}</p>
                        )}
                      </div>

                      {/* Pricing */}
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center py-2">
                          <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white/40 font-light">Subtotal</span>
                          <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-base text-white/40 font-light">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className={`text-sm font-light flex items-center gap-2 ${paymentMethod === "zelle" ? "text-emerald-400/70" : "text-blue-400/70"}`}>
                            {paymentMethod === "zelle" ? "Zelle" : "USDC"} Discount
                            <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${paymentMethod === "zelle" ? "bg-emerald-400/10 border-emerald-400/20 text-emerald-400" : "bg-blue-400/10 border-blue-400/20 text-blue-400"}`}>
                              10% OFF
                            </span>
                          </span>
                          <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className={`text-base font-light ${paymentMethod === "zelle" ? "text-emerald-400/70" : "text-blue-400/70"}`}>-${paymentDiscount.toFixed(2)}</span>
                        </div>
                        {appliedPromo && promoDiscountAmount > 0 && (
                          <div className="flex justify-between items-center py-2">
                            <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-violet-400/70 font-light flex items-center gap-2">
                              Promo: {appliedPromo.code}
                              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-violet-400/10 border border-violet-400/20 text-violet-400">
                                {appliedPromo.discountPercent > 0 ? `${appliedPromo.discountPercent}%` : `$${appliedPromo.discountFixed}`}
                              </span>
                            </span>
                            <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-base text-violet-400/70 font-light">-${promoDiscountAmount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center py-2">
                          <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white/40 font-light flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5" /> Shipping
                            {selectedTier && (
                              <span className="text-[9px] text-white/20 font-normal">{selectedTier.label}</span>
                            )}
                          </span>
                          {isFreeStandard ? (
                            <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-emerald-400/70 font-light flex items-center gap-1.5">
                              <span className="line-through text-white/20 mr-1">$5.99</span>
                              Free
                            </span>
                          ) : (
                            <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-base text-white/40 font-light">${actualShippingFee.toFixed(2)}</span>
                          )}
                        </div>
                        {coldChain && (
                          <div className="flex justify-between items-center py-2">
                            <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-cyan-400/70 font-light flex items-center gap-1.5">
                              <Snowflake className="w-3.5 h-3.5" /> Cold Chain Packaging
                            </span>
                            <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-base text-cyan-400/70 font-light">${coldChainFee.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center py-3 border-t border-white/10">
                          <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white/70 font-medium">Amount Due</span>
                          <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-2xl text-white font-light">${total.toFixed(2)}</span>
                        </div>
                      </div>
                      <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-white/30 text-xs mt-6 font-light leading-relaxed">
                        {paymentMethod === "zelle" ? (
                          <>After sending <strong className="text-white/50">${total.toFixed(2)}</strong> via Zelle with <strong className="text-white/50">{orderNumber}</strong> in the memo, upload a screenshot of your <strong className="text-white/50">payment confirmation from your banking app</strong> below.</>
                        ) : (
                          <>After sending exactly <strong className="text-white/50">${total.toFixed(2)}</strong> in USDC on <strong className="text-white/50">{USDC_NETWORK}</strong> with <strong className="text-white/50">{orderNumber}</strong> in the memo, upload a screenshot of your <strong className="text-white/50">transaction confirmation</strong> below.</>
                        )}
                      </p>
                    </div>

                    {/* Screenshot Upload */}
                    <div className="mb-8">
                      <label style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs font-bold tracking-[0.15em] uppercase text-white/50 mb-4 block">
                        Payment Confirmation Screenshot
                      </label>

                      {screenshotPreview ? (
                        <div className="relative w-full max-w-xs rounded-2xl overflow-hidden border border-white/10 mb-4">
                          {screenshotPreview === "pdf" ? (
                            <div className="flex flex-col items-center justify-center py-10 px-6 bg-white/[0.02]">
                              <div className="w-12 h-14 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-3">
                                <span className="text-[10px] font-bold tracking-wider text-red-400">PDF</span>
                              </div>
                              <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white/60 font-light truncate max-w-full">
                                {screenshotFile?.name}
                              </p>
                            </div>
                          ) : (
                            <Image src={screenshotPreview} alt="Payment screenshot" width={320} height={400} className="w-full h-auto object-contain bg-black" />
                          )}
                          <button
                            onClick={() => { setScreenshotFile(null); setScreenshotPreview(null); }}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/80 border border-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                          >
                            &times;
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-48 rounded-2xl border-2 border-dashed border-white/10 hover:border-white/30 transition-colors cursor-pointer bg-white/[0.01]">
                          <Upload className="w-8 h-8 text-white/20 mb-3" />
                          <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white/40 font-light">Click to upload or paste a screenshot</span>
                          <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-white/20 mt-1">PNG, JPEG, WebP, or PDF (max 10MB)</span>
                          <input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={handleFileChange} className="hidden" />
                        </label>
                      )}
                    </div>
                    </>
                    )}

                    {/* Credit Card Instructions */}
                    {paymentMethod === "credit_card" && (
                    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 mb-8">
                      <div className="flex items-center gap-3 mb-6">
                        <CreditCard className="w-5 h-5 text-white/50" />
                        <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs font-bold tracking-[0.15em] uppercase text-white/50">
                          Credit Card Payment
                        </span>
                      </div>

                      <div className="p-5 rounded-xl bg-white/[0.04] border border-white/10 mb-6">
                        <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white/60 font-light leading-relaxed">
                          After placing your order, you&apos;ll be redirected to a secure payment page to complete your purchase with a credit or debit card.
                        </p>
                        <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[10px] text-white/30 font-light mt-3">
                          Payment processing is provided by Intuit Payments Inc.
                        </p>
                      </div>

                      {/* Promo Code for CC */}
                      <div className="mb-4">
                        {appliedPromo ? (
                          <div className="flex items-center justify-between p-4 rounded-xl bg-violet-500/[0.06] border border-violet-500/15">
                            <div className="flex items-center gap-3">
                              <Tag className="w-4 h-4 text-violet-400" />
                              <div>
                                <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-violet-300 font-medium tracking-wider">{appliedPromo.code}</span>
                                <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-violet-300/50 mt-0.5">
                                  {appliedPromo.discountPercent > 0 ? `${appliedPromo.discountPercent}% off` : `$${appliedPromo.discountFixed.toFixed(2)} off`}
                                </p>
                              </div>
                            </div>
                            <button onClick={removePromo} className="p-1.5 rounded-lg text-violet-400/50 hover:text-violet-300 hover:bg-violet-400/10 transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={promoInput}
                              onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(""); }}
                              onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                              placeholder="Promo code"
                              className="flex-1 bg-transparent border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-light placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                              style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
                            />
                            <button
                              onClick={handleApplyPromo}
                              disabled={promoLoading || !promoInput.trim()}
                              className="px-5 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-bold tracking-[0.1em] uppercase text-white/50 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                              style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
                            >
                              {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                            </button>
                          </div>
                        )}
                        {promoError && (
                          <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-red-400/70 mt-2 ml-1">{promoError}</p>
                        )}
                      </div>

                      {/* Pricing for CC */}
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center py-2">
                          <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white/40 font-light">Subtotal</span>
                          <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-base text-white/40 font-light">${subtotal.toFixed(2)}</span>
                        </div>
                        {appliedPromo && promoDiscountAmount > 0 && (
                          <div className="flex justify-between items-center py-2">
                            <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-violet-400/70 font-light flex items-center gap-2">
                              Promo: {appliedPromo.code}
                              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-violet-400/10 border border-violet-400/20 text-violet-400">
                                {appliedPromo.discountPercent > 0 ? `${appliedPromo.discountPercent}%` : `$${appliedPromo.discountFixed}`}
                              </span>
                            </span>
                            <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-base text-violet-400/70 font-light">-${promoDiscountAmount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center py-2">
                          <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white/40 font-light flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5" /> Shipping
                            {selectedTier && (
                              <span className="text-[9px] text-white/20 font-normal">{selectedTier.label}</span>
                            )}
                          </span>
                          {isFreeStandard ? (
                            <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-emerald-400/70 font-light flex items-center gap-1.5">
                              <span className="line-through text-white/20 mr-1">$5.99</span>
                              Free
                            </span>
                          ) : (
                            <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-base text-white/40 font-light">${actualShippingFee.toFixed(2)}</span>
                          )}
                        </div>
                        {coldChain && (
                          <div className="flex justify-between items-center py-2">
                            <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-cyan-400/70 font-light flex items-center gap-1.5">
                              <Snowflake className="w-3.5 h-3.5" /> Cold Chain Packaging
                            </span>
                            <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-base text-cyan-400/70 font-light">${coldChainFee.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center py-3 border-t border-white/10">
                          <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white/70 font-medium">Amount Due</span>
                          <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-2xl text-white font-light">${total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    )}

                    {error && (
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-red-400/80 text-sm font-light">{error}</p>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        if (paymentMethod === "credit_card" || screenshotFile) setStep("confirm");
                      }}
                      disabled={paymentMethod !== "credit_card" && !screenshotFile}
                      className="group relative flex items-center justify-center w-full py-4 rounded-full border border-white/20 bg-white text-black transition-all duration-500 hover:bg-transparent hover:border-white disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden"
                    >
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="relative z-10 text-xs font-bold tracking-[0.15em] uppercase transition-colors duration-500 group-hover:text-white">
                        Review Order
                      </span>
                      <div className="absolute inset-0 bg-transparent transition-colors duration-500 group-hover:bg-[#050505] -z-0" />
                    </button>
                  </motion.div>
                )}

                {step === "confirm" && (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <h2 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xl font-normal text-white mb-8">Review & Place Order</h2>

                    {/* Shipping Summary */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs font-bold tracking-[0.15em] uppercase text-white/50">Shipping To</span>
                        <button onClick={() => setStep("shipping")} className="text-xs text-white/30 hover:text-white transition-colors underline" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>Edit</button>
                      </div>
                      <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white/80 font-light leading-relaxed">
                        {shipping.name}<br/>
                        {shipping.address}<br/>
                        {shipping.city}, {shipping.state} {shipping.zip}<br/>
                        {shipping.email}
                      </p>
                    </div>

                    {/* Shipping Method */}
                    {selectedTier && (
                      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 mb-6">
                        <div className="flex justify-between items-center mb-4">
                          <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs font-bold tracking-[0.15em] uppercase text-white/50">Shipping Method</span>
                          <button onClick={() => setStep("rates")} className="text-xs text-white/30 hover:text-white transition-colors underline" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>Edit</button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-white/40" />
                            <div>
                              <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white/80 font-light">{selectedTier.label}</p>
                              <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-white/30 font-light">
                                {selectedTier.deliveryEstimate}
                              </p>
                            </div>
                          </div>
                          {isFreeStandard ? (
                            <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-emerald-400 font-light">Free</span>
                          ) : (
                            <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white/60 font-light">${selectedTier.customerPrice.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Items Summary */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 mb-6">
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs font-bold tracking-[0.15em] uppercase text-white/50 mb-4 block">Items</span>
                      {items.map((item) => (
                        <div key={item.product.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 shrink-0">
                              <Image src={item.product.image} alt={item.product.name} fill sizes="40px" className="object-contain" />
                            </div>
                            <div>
                              <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white font-light">{item.product.name}</span>
                              <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-white/30 ml-2">&times;{item.quantity}</span>
                            </div>
                          </div>
                          <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white font-light">
                            ${(item.product.price * item.quantity * (1 - getItemDiscount(item.quantity))).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Payment Confirmation */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs font-bold tracking-[0.15em] uppercase text-white/50">
                          {paymentMethod === "zelle" ? "Zelle Payment" : paymentMethod === "crypto" ? "USDC Payment" : "Credit Card"}
                        </span>
                        <div className="flex items-center gap-2">
                          {paymentMethod === "credit_card" ? (
                            <>
                              <CreditCard className="w-3.5 h-3.5 text-white/40" />
                              <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-white/40 font-medium">Pay after order</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-emerald-400 font-medium">Screenshot uploaded</span>
                            </>
                          )}
                        </div>
                      </div>
                      {paymentMethod !== "credit_card" && (
                      <div className="flex items-center justify-between pt-3 border-t border-white/5">
                        <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-white/40">Order Number in Memo</span>
                        <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white font-light tracking-wider">{orderNumber}</span>
                      </div>
                      )}
                      {paymentMethod === "credit_card" && (
                      <div className="pt-3 border-t border-white/5">
                        <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-white/30 font-light">
                          You&apos;ll be redirected to a secure payment page after placing your order.
                        </p>
                        <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[10px] text-white/20 font-light mt-1">
                          Payment processing provided by Intuit Payments Inc.
                        </p>
                      </div>
                      )}
                    </div>

                    {error && (
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-red-400/80 text-sm font-light">{error}</p>
                      </div>
                    )}

                    <button
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting}
                      className="group relative flex items-center justify-center w-full py-4 rounded-full border border-white/20 bg-white text-black transition-all duration-500 hover:bg-transparent hover:border-white disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin text-black" />
                      ) : (
                        <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="relative z-10 text-xs font-bold tracking-[0.15em] uppercase transition-colors duration-500 group-hover:text-white">
                          Place Order &mdash; ${total.toFixed(2)}
                        </span>
                      )}
                      <div className="absolute inset-0 bg-transparent transition-colors duration-500 group-hover:bg-[#050505] -z-0" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Order Summary Sidebar */}
            <div className="w-full lg:w-[320px] shrink-0">
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 sticky top-32">
                <h3 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs font-bold tracking-[0.2em] uppercase text-white/50 mb-2">Summary</h3>
                <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-white/25 font-light mb-6 tracking-wider">{orderNumber}</p>
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3 mb-4">
                    <div className="relative w-10 h-10 bg-white/[0.02] rounded-lg border border-white/10 shrink-0">
                      <Image src={item.product.image} alt={item.product.name} fill sizes="40px" className="object-contain p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-white font-light truncate">{item.product.name} &times;{item.quantity}</p>
                    </div>
                    <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-white/60">${(item.product.price * item.quantity * (1 - getItemDiscount(item.quantity))).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-white/10 pt-4 mt-4 flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-white/40">Subtotal</span>
                    <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-white/40">${subtotal.toFixed(2)}</span>
                  </div>
                  {step !== "shipping" && paymentMethod !== "credit_card" && (
                    <div className="flex justify-between">
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className={`text-xs flex items-center gap-1.5 ${paymentMethod === "zelle" ? "text-emerald-400/60" : "text-blue-400/60"}`}>
                        {paymentMethod === "zelle" ? "Zelle" : "USDC"} Discount
                        <span className={`text-[8px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-full ${paymentMethod === "zelle" ? "bg-emerald-400/10 text-emerald-400" : "bg-blue-400/10 text-blue-400"}`}>10%</span>
                      </span>
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className={`text-xs ${paymentMethod === "zelle" ? "text-emerald-400/60" : "text-blue-400/60"}`}>-${paymentDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  {step !== "shipping" && appliedPromo && promoDiscountAmount > 0 && (
                    <div className="flex justify-between">
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-violet-400/60 flex items-center gap-1.5">
                        {appliedPromo.code}
                        <span className="text-[8px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-violet-400/10 text-violet-400">
                          {appliedPromo.discountPercent > 0 ? `${appliedPromo.discountPercent}%` : `$${appliedPromo.discountFixed}`}
                        </span>
                      </span>
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-violet-400/60">-${promoDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-white/40 flex items-center gap-1">
                      <Truck className="w-3 h-3" /> Shipping
                    </span>
                    {isFreeStandard ? (
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-emerald-400/60">Free</span>
                    ) : (
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-white/40">${actualShippingFee.toFixed(2)}</span>
                    )}
                  </div>
                  {coldChain && (
                    <div className="flex justify-between">
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-cyan-400/60 flex items-center gap-1">
                        <Snowflake className="w-3 h-3" /> Cold Chain
                      </span>
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs text-cyan-400/60">${coldChainFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-white/5">
                    <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white font-medium">{step === "shipping" ? "Estimated Total" : "Total"}</span>
                    <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white font-medium">${step === "shipping" ? (subtotal + shippingFee + coldChainFee).toFixed(2) : step === "rates" ? (subtotal + (selectedTier ? selectedTier.customerPrice : shippingFee) + coldChainFee).toFixed(2) : total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
