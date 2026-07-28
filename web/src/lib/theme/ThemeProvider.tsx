"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
  theme: ThemeChoice;
  resolvedTheme: ResolvedTheme;
  setTheme: (choice: ThemeChoice) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const META_COLOR: Record<ResolvedTheme, string> = {
  dark: "#09090b",
  light: "#f3f4f7",
};

const applyTheme = (theme: ResolvedTheme): void => {
  const root = document.documentElement;

  root.setAttribute("data-theme", theme);

  root.style.colorScheme = theme;

  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", META_COLOR[theme]);
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const theme = useSyncExternalStore(subscribeChoice, readChoice, serverChoice);

  const system = useSyncExternalStore(subscribeSystem, readSystem, serverSystem);

  const resolvedTheme: ResolvedTheme = theme === "light" || theme === "dark" ? theme : system;

  useEffect(() => {
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
