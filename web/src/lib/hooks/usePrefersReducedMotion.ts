"use client";

import { useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const subscribeToReducedMotion = (onStoreChange: () => void): (() => void) => {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", onStoreChange);

  return () => mq.removeEventListener("change", onStoreChange);
};

const getReducedMotionSnapshot = (): boolean =>
  typeof window !== "undefined" && window.matchMedia(REDUCED_MOTION_QUERY).matches;

const getReducedMotionServerSnapshot = (): boolean => false;

// Shared media-query hook so motion-heavy components can degrade gracefully.
// Mirrors the local copy used by the ScanWorkflow section.
export const usePrefersReducedMotion = (): boolean => {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
};
