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

export const usePrefersReducedMotion = (): boolean => {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
};
