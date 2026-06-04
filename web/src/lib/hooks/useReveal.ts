"use client";

import { useEffect } from "react";

export const useReveal = (
  selectors: string = ".reveal, .reveal-left, .reveal-right, .reveal-scale",
): void => {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const observed = new WeakSet<Element>();

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

    const observeReveal = (el: Element) => {
      if (observed.has(el) || el.classList.contains("visible")) return;
      observed.add(el);
      observer.observe(el);
    };

    const observeTree = (root: ParentNode) => {
      root.querySelectorAll(selectors).forEach(observeReveal);
    };

    observeTree(document);

    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;

          const element = node as Element;
          if (element.matches(selectors)) observeReveal(element);
          observeTree(element);
        });
      }
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [selectors]);
};
