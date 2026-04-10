"use client";

import { createContext, useContext, useReducer, useState, useEffect, useCallback, type ReactNode } from "react";
import { type Product } from "@/lib/products";
import { getBundleDiscount } from "@/lib/pricing";

export const SHIPPING_FEE = 5.99;
export const FREE_SHIPPING_THRESHOLD = 100;
export const COLD_CHAIN_FEE = 8;

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  coldChain: boolean;
};

type CartAction =
  | { type: "ADD_ITEM"; product: Product; quantity?: number }
  | { type: "REMOVE_ITEM"; productId: string }
  | { type: "UPDATE_QUANTITY"; productId: string; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "SET_COLD_CHAIN"; enabled: boolean }
  | { type: "HYDRATE"; items: CartItem[]; coldChain?: boolean }
  | { type: "UPDATE_PRICES"; prices: Map<string, number> };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.product.id === action.product.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.product.id === action.product.id
              ? { ...i, quantity: i.quantity + (action.quantity ?? 1) }
              : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { product: action.product, quantity: action.quantity ?? 1 }],
      };
    }
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((i) => i.product.id !== action.productId) };
    case "UPDATE_QUANTITY":
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.product.id !== action.productId) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.product.id === action.productId ? { ...i, quantity: action.quantity } : i
        ),
      };
    case "CLEAR_CART":
      return { items: [], coldChain: false };
    case "SET_COLD_CHAIN":
      return { ...state, coldChain: action.enabled };
    case "HYDRATE":
      return { items: action.items, coldChain: action.coldChain ?? false };
    case "UPDATE_PRICES":
      return {
        ...state,
        items: state.items.map((i) => {
          const newPrice = action.prices.get(i.product.id);
          if (newPrice !== undefined && newPrice !== i.product.price) {
            return { ...i, product: { ...i.product, price: newPrice, displayPrice: `$${newPrice.toFixed(2)}` } };
          }
          return i;
        }),
      };
    default:
      return state;
  }
}

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updatePrices: (prices: Map<string, number>) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  coldChain: boolean;
  setColdChain: (enabled: boolean) => void;
  shippingFee: number;
  coldChainFee: number;
  freeShipping: boolean;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const CART_STORAGE_KEY = "aminexa-cart";

const COLD_CHAIN_STORAGE_KEY = "aminexa-cold-chain";

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], coldChain: false });
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      const coldChainStored = localStorage.getItem(COLD_CHAIN_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          dispatch({ type: "HYDRATE", items: parsed, coldChain: coldChainStored === "true" });
        }
      }
    } catch {
      // Invalid stored data
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
      localStorage.setItem(COLD_CHAIN_STORAGE_KEY, String(state.coldChain));
    } catch {
      // Storage full or unavailable
    }
  }, [state.items, state.coldChain]);

  const addItem = useCallback((product: Product, quantity?: number) => {
    if (product.comingSoon || product.soldOut) return;
    dispatch({ type: "ADD_ITEM", product, quantity });
  }, []);

  const removeItem = useCallback((productId: string) => {
    dispatch({ type: "REMOVE_ITEM", productId });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", productId, quantity });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  const setColdChain = useCallback((enabled: boolean) => {
    dispatch({ type: "SET_COLD_CHAIN", enabled });
  }, []);

  const updatePrices = useCallback((prices: Map<string, number>) => {
    dispatch({ type: "UPDATE_PRICES", prices });
  }, []);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  
  const subtotal = state.items.reduce((sum, i) => {
    const discount = getBundleDiscount(i.quantity);
    const itemTotal = i.product.price * i.quantity;
    return sum + Math.round(itemTotal * (1 - discount) * 100) / 100;
  }, 0);

  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = freeShipping ? 0 : SHIPPING_FEE;
  const coldChainFee = state.coldChain ? COLD_CHAIN_FEE : 0;

  return (
    <CartContext.Provider value={{ items: state.items, addItem, removeItem, updateQuantity, updatePrices, clearCart, totalItems, subtotal, coldChain: state.coldChain, setColdChain, shippingFee, coldChainFee, freeShipping, isCartOpen, openCart, closeCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
