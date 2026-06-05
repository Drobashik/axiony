"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

// Animates a number from 0 → target with an ease-out curve. Honours
// reduced-motion and is resilient when requestAnimationFrame is throttled
// (e.g. a background tab): a timeout fallback guarantees the value always
// lands on the target, so it can never get stuck mid-count.
export const useCountUp = (target: number, durationMs = 900, active = true): number => {
  const reduce = usePrefersReducedMotion();
  const [value, setValue] = useState(active && !reduce ? 0 : target);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    // No animation needed — show the final value immediately.
    if (!active || reduce || (typeof document !== "undefined" && document.hidden)) {
      const immediate = window.setTimeout(() => setValue(target), 0);
      return () => window.clearTimeout(immediate);
    }

    let startTs: number | null = null;

    const tick = (ts: number) => {
      if (startTs === null) startTs = ts;
      const progress = Math.min((ts - startTs) / durationMs, 1);
      const eased = 1 - (1 - progress) ** 3; // easeOutCubic
      setValue(Math.round(target * eased));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    // Safety net: if rAF is paused/throttled, still land on the target.
    const fallback = window.setTimeout(() => setValue(target), durationMs + 150);

    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
      window.clearTimeout(fallback);
    };
  }, [target, durationMs, active, reduce]);

  return value;
};
