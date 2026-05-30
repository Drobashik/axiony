"use client";

import { createContext, useContext } from "react";

export interface BootStatus {
  /** `true` once the LoadingScreen has finished and the page is visible. */
  loaded: boolean;
}

/**
 * Simple boot-status broadcast.
 *
 * Components that have splashy first-paint animations can opt into the
 * boot lifecycle via `useBootStatus()` and only kick those animations
 * off once `loaded` is `true` — which happens either after the
 * LoadingScreen finishes (cold load / refresh) or immediately on
 * client-side navigation (where there's no loader).
 *
 * The default of `loaded: true` means components rendered outside a
 * BootGate (tests, isolated stories, etc.) just animate immediately.
 */
export const BootContext = createContext<BootStatus>({ loaded: true });

export function useBootStatus(): BootStatus {
  return useContext(BootContext);
}
