"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";
import type { ResolvedTheme, ThemeChoice } from "./constants";
import {
  readChoice,
  readSystem,
  serverChoice,
  serverSystem,
  subscribeChoice,
  subscribeSystem,
  writeChoice,
} from "./theme-store";

interface ThemeContextValue {
  /** The user's choice. `system` tracks the OS preference. */
  theme: ThemeChoice;
  /** The theme actually applied to the document. */
  resolvedTheme: ResolvedTheme;
  setTheme: (choice: ThemeChoice) => void;
  /** Flip between light and dark as an explicit choice. */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Browser-chrome colour (mobile address bar) per theme — mirrors `--bg-base`.
const META_COLOR: Record<ResolvedTheme, string> = {
  dark: "#09090b",
  light: "#f3f4f7",
};

// Runs before paint on the client, no-op on the server. Applying the theme in a
// layout effect re-asserts it after React hydration (which resets attributes the
// no-flash boot script set), with no visible flash.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// The single writer of the document's theme.
const applyTheme = (resolved: ResolvedTheme): void => {
  const root = document.documentElement;
  root.setAttribute("data-theme", resolved);
  root.style.colorScheme = resolved;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", META_COLOR[resolved]);
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // SSR-safe reactive reads of the persisted choice and the OS preference.
  const theme = useSyncExternalStore(subscribeChoice, readChoice, serverChoice);
  const system = useSyncExternalStore(subscribeSystem, readSystem, serverSystem);
  const resolvedTheme: ResolvedTheme = theme === "light" || theme === "dark" ? theme : system;

  // One mechanism covers every path: mount, user action, OS change, other tabs —
  // each updates `resolvedTheme`, which re-applies the document theme here.
  useIsomorphicLayoutEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((choice: ThemeChoice) => writeChoice(choice), []);

  const toggleTheme = useCallback(
    () => writeChoice(resolvedTheme === "dark" ? "light" : "dark"),
    [resolvedTheme],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
