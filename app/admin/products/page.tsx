"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Loader2,
  Package,
  ArrowLeft,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Upload,
  X,
  Check,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type DbProduct = {
  id: string;
  name: string;
  full_name: string;
  price: number;
  display_price: string;
  purity: string;
  volume: string;
  hex: string;
  image: string;
  scale_class: string;
  color_from: string;
  color_to: string;
  accent_glow: string;
  description: string;
  benefits: string[];
  faqs: { question: string; answer: string }[];
  category: "vial" | "pen";
  brand: string | null;
  coming_soon: boolean;
  sort_order: number;
  active: boolean;
  inventory_quantity: number;
  inventory_status: "ready" | "not_ready";
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
};

const font = { fontFamily: "Helvetica, Arial, sans-serif" } as const;

const emptyProduct: Omit<DbProduct, "created_at" | "updated_at"> = {
  id: "",
  name: "",
  full_name: "",
  price: 0,
  display_price: "",
  purity: "99.0%",
  volume: "",
  hex: "#ffffff",
  image: "",
  scale_class: "scale-100",
  color_from: "",
  color_to: "",
  accent_glow: "",
  description: "",
  benefits: [],
  faqs: [],
  category: "vial",
  brand: null,
  coming_soon: false,
  sort_order: 0,
  active: true,
  inventory_quantity: 0,
  inventory_status: "not_ready",
  low_stock_threshold: 5,
};

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "vial" | "pen">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  const [editing, setEditing] = useState<DbProduct | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<Omit<DbProduct, "created_at" | "updated_at">>(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [uploadingImage, setUploadingImage] = useState(false);

  const [newBenefit, setNewBenefit] = useState("");
  const [newFaqQ, setNewFaqQ] = useState("");
  const [newFaqA, setNewFaqA] = useState("");

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const filtered = products.filter((p) => {
    if (activeFilter !== "all" && p.category !== activeFilter) return false;
    if (!showInactive && !p.active) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.full_name.toLowerCase().includes(q) ||
        p.id.includes(q)
      );
    }
    return true;
  });

  const openCreate = () => {
    const maxSort = products.reduce((m, p) => Math.max(m, p.sort_order), 0);
    setFormData({ ...emptyProduct, sort_order: maxSort + 1 });
    setCreating(true);
    setEditing(null);
    setError("");
  };

  const openEdit = (product: DbProduct) => {
    setFormData({
      id: product.id,
      name: product.name,
      full_name: product.full_name,
      price: product.price,
      display_price: product.display_price,
      purity: product.purity,
      volume: product.volume,
      hex: product.hex,
      image: product.image,
      scale_class: product.scale_class,
      color_from: product.color_from,
      color_to: product.color_to,
      accent_glow: product.accent_glow,
      description: product.description,
      benefits: [...product.benefits],
      faqs: product.faqs.map((f) => ({ ...f })),
      category: product.category,
      brand: product.brand,
      coming_soon: product.coming_soon,
      sort_order: product.sort_order,
      active: product.active,
      inventory_quantity: product.inventory_quantity ?? 0,
      inventory_status: product.inventory_status ?? "not_ready",
      low_stock_threshold: product.low_stock_threshold ?? 5,
    });
    setEditing(product);
    setCreating(false);
    setError("");
  };

  const closeForm = () => {
    setEditing(null);
    setCreating(false);
    setFormData(emptyProduct);
    setError("");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError("");

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/products/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      setFormData((prev) => ({ ...prev, image: data.publicUrl }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      if (creating) {
        if (!formData.id || !formData.name || !formData.volume || !formData.image) {
          throw new Error("ID, name, volume, and image are required");
        }

        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            display_price: formData.display_price || `$${Number(formData.price).toFixed(2)}`,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create product");

        const newProduct = data.product as DbProduct;
        setProducts((prev) => [...prev, newProduct]);
        toast.success("Product created successfully");
        closeForm();
      } else if (editing) {
        const numPrice = Number(formData.price);
        const res = await fetch(`/api/admin/products/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            full_name: formData.full_name,
            price: numPrice,
            display_price: `$${numPrice.toFixed(2)}`,
            purity: formData.purity,
            volume: formData.volume,
            hex: formData.hex,
            image: formData.image,
            scale_class: formData.scale_class,
            color_from: formData.color_from,
            color_to: formData.color_to,
            accent_glow: formData.accent_glow,
            description: formData.description,
            benefits: formData.benefits,
            faqs: formData.faqs,
            category: formData.category,
            brand: formData.brand,
            coming_soon: formData.coming_soon,
            sort_order: formData.sort_order,
            active: formData.active,
            inventory_quantity: formData.inventory_quantity,
            inventory_status: formData.inventory_status,
            low_stock_threshold: formData.low_stock_threshold,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update product");

        const updated = data.product as DbProduct;
        setProducts((prev) => prev.map((p) => (p.id === editing.id ? updated : p)));
        toast.success("Product updated successfully");
        closeForm();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      toast.error(msg);
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const toggleActive = async (product: DbProduct) => {
    const newActive = !product.active;
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, active: newActive } : p)));
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: newActive }),
      });
      if (!res.ok) {
        setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, active: product.active } : p)));
        toast.error("Failed to update product");
        return;
      }
      toast.success(newActive ? "Product activated" : "Product deactivated");
    } catch {
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, active: product.active } : p)));
      toast.error("Failed to update product");
    }
  };

  const isFormOpen = editing || creating;


  return (
    <main className="relative min-h-screen w-full bg-[#050505] selection:bg-white/20 selection:text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
        <div className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-3 text-white/40 hover:text-white transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <div className="relative w-10 h-10">
                <Image src="https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/Logos/AmiNexa/AmiNexa_favicon_128_white.png/public" alt="AmiNexa" fill className="object-contain" />
              </div>
            </Link>
            <div>
              <h1 style={font} className="text-sm font-medium text-white tracking-wide">Product Manager</h1>
              <p style={font} className="text-[10px] text-white/30 tracking-[0.1em] uppercase">
                {products.length} product{products.length !== 1 ? "s" : ""} total
              </p>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black hover:bg-white/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span style={font} className="text-xs font-bold tracking-[0.1em] uppercase">
              Add Product
            </span>
          </button>
        </div>
      </header>

      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 pt-28 pb-20">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
              style={font}
            />
          </div>
          <div className="flex items-center gap-2">
            {(["all", "vial", "pen"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-bold tracking-[0.1em] uppercase transition-colors ${
                  activeFilter === tab
                    ? "bg-white text-black"
                    : "text-white/40 hover:text-white/80 hover:bg-white/5 border border-white/10"
                }`}
                style={font}
              >
                {tab === "all" ? "All" : tab === "vial" ? "Vials" : "Pens"}
              </button>
            ))}
            <button
              onClick={() => setShowInactive(!showInactive)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors ${
                showInactive
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-white/[0.02] border-white/10 text-white/40 hover:text-white/80"
              }`}
            >
              {showInactive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span style={font} className="text-[10px] font-bold tracking-[0.1em] uppercase">
                {showInactive ? "Showing All" : "Active Only"}
              </span>
            </button>
          </div>
        </div>

        {/* Product List */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Package className="w-16 h-16 text-white/10 mb-8" strokeWidth={1} />
            <h2 style={font} className="text-xl text-white/40 font-light mb-2">No products found</h2>
            <p style={font} className="text-sm text-white/20 font-light mb-8">
              {searchQuery ? "Try a different search" : "Create your first product"}
            </p>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black hover:bg-white/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span style={font} className="text-xs font-bold tracking-[0.1em] uppercase">Add Product</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {/* Header */}
            <div
              className="hidden md:grid grid-cols-[60px_1fr_100px_80px_80px_100px_80px_100px] gap-4 px-6 py-3 text-[10px] font-bold tracking-[0.15em] uppercase text-white/30"
              style={font}
            >
              <span></span>
              <span>Product</span>
              <span>Price</span>
              <span>Category</span>
              <span>Status</span>
              <span>Stock</span>
              <span>Order</span>
              <span></span>
            </div>

            {filtered.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative"
              >
                <div
                  className={`grid grid-cols-1 md:grid-cols-[60px_1fr_100px_80px_80px_100px_80px_100px] gap-2 md:gap-4 items-center px-6 py-4 border border-white/10 rounded-xl transition-all duration-300 ${
                    !product.active
                      ? "bg-white/[0.01] opacity-50"
                      : "bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20"
                  }`}
                >
                  {/* Image */}
                  <div className="relative w-12 h-12 rounded-lg border border-white/10 bg-white/[0.02] overflow-hidden shrink-0">
                    <Image src={product.image} alt={product.name} fill sizes="48px" className="object-contain p-1" />
                  </div>

                  {/* Name */}
                  <div className="min-w-0">
                    <p style={font} className="text-sm text-white font-light truncate">{product.name}</p>
                    <p style={font} className="text-xs text-white/30 truncate">
                      {product.id} &middot; {product.full_name}
                    </p>
                  </div>

                  {/* Price */}
                  <span style={font} className="text-sm text-white font-light">{product.display_price}</span>

                  {/* Category */}
                  <span
                    style={font}
                    className="text-[10px] font-bold tracking-[0.1em] uppercase text-white/50 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 w-fit"
                  >
                    {product.category}
                  </span>

                  {/* Status */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        product.coming_soon ? "bg-amber-400" : product.active ? "bg-emerald-400" : "bg-red-400"
                      }`}
                    />
                    <span
                      style={font}
                      className={`text-[10px] font-bold tracking-[0.1em] uppercase ${
                        product.coming_soon
                          ? "text-amber-400/70"
                          : product.active
                          ? "text-emerald-400/70"
                          : "text-red-400/70"
                      }`}
                    >
                      {product.coming_soon ? "Soon" : product.active ? "Live" : "Off"}
                    </span>
                  </div>

                  {/* Stock */}
                  <div className="flex items-center gap-1.5">
                    {product.inventory_status !== "ready" ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        <span style={font} className="text-[10px] font-bold tracking-[0.1em] uppercase text-red-400/70">
                          Not Ready
                        </span>
                      </>
                    ) : product.inventory_quantity <= 0 ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        <span style={font} className="text-[10px] font-bold tracking-[0.1em] uppercase text-red-400/70">
                          Sold Out
                        </span>
                      </>
                    ) : product.inventory_quantity <= (product.low_stock_threshold ?? 5) ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span style={font} className="text-[10px] font-bold tracking-[0.1em] uppercase text-amber-400/70">
                          {product.inventory_quantity}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span style={font} className="text-[10px] font-bold tracking-[0.1em] uppercase text-emerald-400/70">
                          {product.inventory_quantity}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Sort Order */}
                  <div className="flex items-center gap-1.5 text-white/30">
                    <GripVertical className="w-3.5 h-3.5" />
                    <span style={font} className="text-xs">{product.sort_order}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      onClick={() => openEdit(product)}
                      className="p-2 rounded-lg text-white/20 hover:text-white hover:bg-white/10 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleActive(product)}
                      className="p-2 rounded-lg text-white/20 hover:text-white hover:bg-white/10 transition-colors"
                      title={product.active ? "Deactivate" : "Activate"}
                    >
                      {product.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    {confirmDelete === product.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                          className="p-2 rounded-lg text-red-400 bg-red-400/10 hover:bg-red-400/20 transition-colors"
                        >
                          {deletingId === product.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(product.id)}
                        className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit / Create Drawer */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
              onClick={closeForm}
              onWheel={(e) => e.stopPropagation()}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              data-lenis-prevent
              className="fixed top-0 right-0 bottom-0 w-full md:w-[640px] lg:w-[720px] z-[210] bg-[#0a0a0a] border-l border-white/10 flex flex-col overflow-hidden overscroll-none"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-white/10 shrink-0">
                <h2 style={font} className="text-lg font-normal text-white">
                  {creating ? "New Product" : `Edit: ${editing?.name}`}
                </h2>
                <button
                  onClick={closeForm}
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Body */}
              <div id="product-drawer-body" className="flex-1 overflow-y-auto overscroll-contain px-8 py-8">
                {error && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <p style={font} className="text-red-400/80 text-sm font-light">{error}</p>
                  </div>
                )}

                <div className="flex flex-col gap-8">
                  {/* SECTION: Identity */}
                  <section>
                    <h3 style={font} className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/30 mb-5">
                      Identity
                    </h3>
                    <div className="flex flex-col gap-5">
                      {creating && (
                        <Field label="Product ID (slug)" hint="Lowercase, hyphens only. Cannot be changed later.">
                          <input
                            type="text"
                            value={formData.id}
                            onChange={(e) => setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                            placeholder="e.g. bpc-157"
                            className="input-field"
                            style={font}
                          />
                        </Field>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Display Name">
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="BPC-157"
                            className="input-field"
                            style={font}
                          />
                        </Field>
                        <Field label="Full Name">
                          <input
                            type="text"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            placeholder="Body Protection Compound"
                            className="input-field"
                            style={font}
                          />
                        </Field>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Category">
                          <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value as "vial" | "pen" })}
                            className="input-field appearance-none cursor-pointer"
                            style={font}
                          >
                            <option value="vial">Vial</option>
                            <option value="pen">Injection Pen</option>
                          </select>
                        </Field>
                        <Field label="Brand (optional)">
                          <input
                            type="text"
                            value={formData.brand || ""}
                            onChange={(e) => setFormData({ ...formData, brand: e.target.value || null })}
                            placeholder="e.g. Amino Zero"
                            className="input-field"
                            style={font}
                          />
                        </Field>
                      </div>
                    </div>
                  </section>

                  {/* SECTION: Pricing & Specs */}
                  <section>
                    <h3 style={font} className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/30 mb-5">
                      Pricing & Specs
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <Field label="Price ($)">
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) => {
                            const newPrice = parseFloat(e.target.value) || 0;
                            setFormData({ ...formData, price: newPrice, display_price: `$${newPrice.toFixed(2)}` });
                          }}
                          className="input-field"
                          style={font}
                          min={0}
                          step={0.01}
                        />
                      </Field>
                      <Field label="Volume">
                        <input
                          type="text"
                          value={formData.volume}
                          onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                          placeholder="10mg"
                          className="input-field"
                          style={font}
                        />
                      </Field>
                      <Field label="Purity">
                        <input
                          type="text"
                          value={formData.purity}
                          onChange={(e) => setFormData({ ...formData, purity: e.target.value })}
                          placeholder="99.0%"
                          className="input-field"
                          style={font}
                        />
                      </Field>
                    </div>
                  </section>

                  {/* SECTION: Image */}
                  <section>
                    <h3 style={font} className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/30 mb-5">
                      Product Image
                    </h3>
                    <div className="flex items-start gap-6">
                      {formData.image ? (
                        <div className="relative w-32 h-32 rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden shrink-0">
                          <Image src={formData.image} alt="Preview" fill sizes="128px" className="object-contain p-2" />
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.01] flex items-center justify-center shrink-0">
                          <Package className="w-8 h-8 text-white/10" />
                        </div>
                      )}
                      <div className="flex flex-col gap-3 flex-1">
                        <label className="flex items-center gap-2 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors cursor-pointer w-fit">
                          {uploadingImage ? (
                            <Loader2 className="w-4 h-4 text-white/50 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 text-white/50" />
                          )}
                          <span style={font} className="text-xs font-bold tracking-[0.1em] uppercase text-white/60">
                            {uploadingImage ? "Uploading..." : "Upload Image"}
                          </span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={uploadingImage}
                          />
                        </label>
                        <Field label="Or paste image URL">
                          <input
                            type="text"
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            placeholder="/Product Mockups/tilted/example.png"
                            className="input-field"
                            style={font}
                          />
                        </Field>
                      </div>
                    </div>
                  </section>

                  {/* SECTION: Visual Customization */}
                  <section>
                    <h3 style={font} className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/30 mb-5">
                      Visual Customization
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Accent Color (hex)">
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={formData.hex}
                            onChange={(e) => setFormData({ ...formData, hex: e.target.value })}
                            className="w-10 h-10 rounded-lg border border-white/20 bg-transparent cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={formData.hex}
                            onChange={(e) => setFormData({ ...formData, hex: e.target.value })}
                            className="input-field flex-1"
                            style={font}
                          />
                        </div>
                      </Field>
                      <Field label="Scale Class">
                        <input
                          type="text"
                          value={formData.scale_class}
                          onChange={(e) => setFormData({ ...formData, scale_class: e.target.value })}
                          placeholder="scale-100"
                          className="input-field"
                          style={font}
                        />
                      </Field>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <Field label="Gradient From">
                        <input
                          type="text"
                          value={formData.color_from}
                          onChange={(e) => setFormData({ ...formData, color_from: e.target.value })}
                          placeholder="from-green-600/40"
                          className="input-field"
                          style={font}
                        />
                      </Field>
                      <Field label="Gradient To">
                        <input
                          type="text"
                          value={formData.color_to}
                          onChange={(e) => setFormData({ ...formData, color_to: e.target.value })}
                          placeholder="to-green-900/20"
                          className="input-field"
                          style={font}
                        />
                      </Field>
                      <Field label="Accent Glow (rgba)">
                        <input
                          type="text"
                          value={formData.accent_glow}
                          onChange={(e) => setFormData({ ...formData, accent_glow: e.target.value })}
                          placeholder="rgba(34, 197, 94, 0.5)"
                          className="input-field"
                          style={font}
                        />
                      </Field>
                    </div>
                  </section>

                  {/* SECTION: Content */}
                  <section>
                    <h3 style={font} className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/30 mb-5">
                      Content
                    </h3>
                    <Field label="Description">
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        className="input-field resize-none"
                        style={font}
                        placeholder="Product description..."
                      />
                    </Field>

                    {/* Benefits */}
                    <div className="mt-5">
                      <label style={font} className="text-xs font-medium tracking-[0.1em] uppercase text-white/40 mb-3 block">
                        Benefits / Mechanisms
                      </label>
                      <div className="flex flex-col gap-2 mb-3">
                        {formData.benefits.map((b, i) => (
                          <div key={i} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/10">
                            <span style={font} className="text-sm text-white/70 flex-1">{b}</span>
                            <button
                              onClick={() => setFormData({ ...formData, benefits: formData.benefits.filter((_, j) => j !== i) })}
                              className="text-white/20 hover:text-red-400 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newBenefit}
                          onChange={(e) => setNewBenefit(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && newBenefit.trim()) {
                              setFormData({ ...formData, benefits: [...formData.benefits, newBenefit.trim()] });
                              setNewBenefit("");
                            }
                          }}
                          placeholder="Add a benefit..."
                          className="input-field flex-1"
                          style={font}
                        />
                        <button
                          onClick={() => {
                            if (newBenefit.trim()) {
                              setFormData({ ...formData, benefits: [...formData.benefits, newBenefit.trim()] });
                              setNewBenefit("");
                            }
                          }}
                          className="p-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* FAQs */}
                    <div className="mt-5">
                      <label style={font} className="text-xs font-medium tracking-[0.1em] uppercase text-white/40 mb-3 block">
                        FAQs
                      </label>
                      <div className="flex flex-col gap-2 mb-3">
                        {formData.faqs.map((faq, i) => (
                          <details key={i} className="rounded-xl bg-white/[0.02] border border-white/10 overflow-hidden group">
                            <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer list-none">
                              <ChevronDown className="w-3.5 h-3.5 text-white/20 group-open:rotate-180 transition-transform shrink-0" />
                              <span style={font} className="text-sm text-white/70 flex-1 truncate">{faq.question}</span>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  setFormData({ ...formData, faqs: formData.faqs.filter((_, j) => j !== i) });
                                }}
                                className="text-white/20 hover:text-red-400 transition-colors shrink-0"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </summary>
                            <div className="px-4 pb-3 pt-1">
                              <p style={font} className="text-xs text-white/40 font-light leading-relaxed">{faq.answer}</p>
                            </div>
                          </details>
                        ))}
                      </div>
                      <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/[0.01] border border-dashed border-white/10">
                        <input
                          type="text"
                          value={newFaqQ}
                          onChange={(e) => setNewFaqQ(e.target.value)}
                          placeholder="Question..."
                          className="input-field"
                          style={font}
                        />
                        <textarea
                          value={newFaqA}
                          onChange={(e) => setNewFaqA(e.target.value)}
                          placeholder="Answer..."
                          rows={2}
                          className="input-field resize-none"
                          style={font}
                        />
                        <button
                          onClick={() => {
                            if (newFaqQ.trim() && newFaqA.trim()) {
                              setFormData({
                                ...formData,
                                faqs: [...formData.faqs, { question: newFaqQ.trim(), answer: newFaqA.trim() }],
                              });
                              setNewFaqQ("");
                              setNewFaqA("");
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-colors w-fit"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span style={font} className="text-[10px] font-bold tracking-[0.1em] uppercase">Add FAQ</span>
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* SECTION: Inventory */}
                  <section>
                    <h3 style={font} className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/30 mb-5">
                      Inventory
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <Field label="Quantity in Stock">
                        <input
                          type="number"
                          value={formData.inventory_quantity}
                          onChange={(e) => setFormData({ ...formData, inventory_quantity: parseInt(e.target.value) || 0 })}
                          className="input-field"
                          style={font}
                          min={0}
                        />
                      </Field>
                      <Field label="Low Stock Alert Threshold">
                        <input
                          type="number"
                          value={formData.low_stock_threshold}
                          onChange={(e) => setFormData({ ...formData, low_stock_threshold: parseInt(e.target.value) || 0 })}
                          className="input-field"
                          style={font}
                          min={0}
                        />
                      </Field>
                    </div>
                    <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/10">
                      <div>
                        <p style={font} className="text-xs font-medium tracking-[0.1em] uppercase text-white/40 mb-1">
                          Inventory Status
                        </p>
                        <p style={font} className="text-[10px] text-white/20 font-light">
                          Only products marked &quot;Ready&quot; with stock &gt; 0 are available for purchase
                        </p>
                      </div>
                      <select
                        value={formData.inventory_status}
                        onChange={(e) => setFormData({ ...formData, inventory_status: e.target.value as "ready" | "not_ready" })}
                        className="input-field w-auto min-w-[140px] appearance-none cursor-pointer"
                        style={font}
                      >
                        <option value="ready">Ready</option>
                        <option value="not_ready">Not Ready</option>
                      </select>
                    </div>
                  </section>

                  {/* SECTION: Settings */}
                  <section>
                    <h3 style={font} className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/30 mb-5">
                      Settings
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Sort Order">
                        <input
                          type="number"
                          value={formData.sort_order}
                          onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                          className="input-field"
                          style={font}
                          min={0}
                        />
                      </Field>
                      <div className="flex flex-col gap-3">
                        <ToggleField
                          label="Active"
                          checked={formData.active}
                          onChange={(v) => setFormData({ ...formData, active: v })}
                        />
                        <ToggleField
                          label="Coming Soon"
                          checked={formData.coming_soon}
                          onChange={(v) => setFormData({ ...formData, coming_soon: v })}
                        />
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="px-8 py-6 border-t border-white/10 flex items-center gap-4 shrink-0">
                <button
                  onClick={closeForm}
                  className="flex-1 py-3.5 rounded-full border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <span style={font} className="text-xs font-bold tracking-[0.15em] uppercase">Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3.5 rounded-full bg-white text-black hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span style={font} className="text-xs font-bold tracking-[0.15em] uppercase">
                      {creating ? "Create Product" : "Save Changes"}
                    </span>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .input-field {
          width: 100%;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          color: white;
          font-size: 0.875rem;
          font-weight: 300;
          transition: border-color 0.3s;
          outline: none;
        }
        .input-field:focus {
          border-color: rgba(255, 255, 255, 0.3);
        }
        .input-field::placeholder {
          color: rgba(255, 255, 255, 0.15);
        }
        .input-field option {
          background: #111;
          color: white;
        }
      `}</style>
    </main>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const font = { fontFamily: "Helvetica, Arial, sans-serif" } as const;
  return (
    <div className="flex flex-col gap-2">
      <label style={font} className="text-xs font-medium tracking-[0.1em] uppercase text-white/40">
        {label}
      </label>
      {children}
      {hint && (
        <p style={font} className="text-[10px] text-white/20 font-light">{hint}</p>
      )}
    </div>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const font = { fontFamily: "Helvetica, Arial, sans-serif" } as const;
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer group">
      <span style={font} className="text-xs font-medium tracking-[0.1em] uppercase text-white/40 group-hover:text-white/60 transition-colors">
        {label}
      </span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
          checked ? "bg-emerald-500" : "bg-white/10"
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}
