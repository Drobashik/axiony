"use client";

import { DEFAULT_THEME_CHOICE, isThemeChoice, THEME_STORAGE_KEY } from "./constants";
import type { ResolvedTheme, ThemeChoice } from "./constants";

// External stores for `useSyncExternalStore` — the SSR-safe pattern used
// elsewhere in the app (see `lib/scan/guest-usage.ts`). One tracks the
// persisted choice, the other the OS colour-scheme preference.

const CHANGE_EVENT = "axiony:theme-change";
const isBrowser = (): boolean => typeof window !== "undefined";

const lightQuery = (): MediaQueryList => window.matchMedia("(prefers-color-scheme: light)");

// ── Persisted choice ─────────────────────────────────────────────────
export const readChoice = (): ThemeChoice => {
  if (!isBrowser()) return DEFAULT_THEME_CHOICE;
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeChoice(raw) ? raw : DEFAULT_THEME_CHOICE;
  } catch {
    return DEFAULT_THEME_CHOICE;
  }
};

export const serverChoice = (): ThemeChoice => DEFAULT_THEME_CHOICE;

export const writeChoice = (choice: ThemeChoice): void => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, choice);
  } catch {
    /* persistence is best-effort */
  }
  if (isBrowser()) window.dispatchEvent(new Event(CHANGE_EVENT));
};

export const subscribeChoice = (onChange: () => void): (() => void) => {
  if (!isBrowser()) return () => {};
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
};

// ── OS preference ────────────────────────────────────────────────────
export const readSystem = (): ResolvedTheme =>
  isBrowser() && lightQuery().matches ? "light" : "dark";

export const serverSystem = (): ResolvedTheme => "dark";

export const subscribeSystem = (onChange: () => void): (() => void) => {
  if (!isBrowser()) return () => {};
  const query = lightQuery();
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
