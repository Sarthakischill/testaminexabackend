"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/lib/cart-context";

export default function PortalTemplate({ children }: { children: React.ReactNode }) {
  const { isCartOpen, closeCart } = useCart();
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    });
  }, [pathname]);

  return (
    <>
      {children}
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
    </>
  );
}
