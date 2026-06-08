"use client";

import { useEffect, useState } from "react";

/**
 * Eases a numeric counter from 0 to `target` over `duration` ms.
 * Used for stat tiles in the dashboard so totals animate in smoothly.
 */
export function useCountUp(target: number, duration = 900, ready = true): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!ready) return;

    let frame = 0;
    let start: number | null = null;

    const tick = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setValue(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, ready]);

  return value;
}
