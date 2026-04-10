"use client";
import { ReactLenis } from "lenis/react";
import { useCallback } from "react";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const prevent = useCallback((node: HTMLElement) => {
    // Skip Lenis for any element inside a [data-lenis-prevent] ancestor
    return node.closest("[data-lenis-prevent]") !== null;
  }, []);

  return (
    <ReactLenis root options={{ lerp: 0.08, duration: 1.5, smoothWheel: true, prevent }}>
      {children}
    </ReactLenis>
  );
}
