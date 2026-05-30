"use client";

import { useEffect } from "react";

/**
 * Adds a `visible` class to elements that match the provided selectors
 * when they intersect the viewport. Used for scroll-reveal animations.
 *
 * Pure side-effect hook with no return value — the styling lives in CSS.
 */
export function useReveal(
  selectors: string = ".reveal, .reveal-left, .reveal-right, .reveal-scale",
): void {
  useEffect(() => {
    const elements = document.querySelectorAll(selectors);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [selectors]);
}
