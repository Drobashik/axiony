"use client";

import { useEffect, useState } from "react";

/**
 * Reports whether the page has been scrolled past `threshold` pixels.
 * Used by the navigation bar to toggle a "scrolled" border state.
 */
export function useScrolled(threshold: number = 10): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > threshold);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [threshold]);

  return scrolled;
}
