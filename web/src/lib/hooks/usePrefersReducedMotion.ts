"use client";

import { useEffect, useState } from "react";

// Shared media-query hook so motion-heavy components can degrade gracefully.
// Mirrors the local copy used by the ScanWorkflow section.
export const usePrefersReducedMotion = (): boolean => {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);

    const onChange = () => setReduce(mq.matches);
    mq.addEventListener("change", onChange);

    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduce;
};
