export const THEME_STORAGE_KEY = "axiony.theme";

export type ThemeChoice = "system" | "light" | "dark";

export type ResolvedTheme = "light" | "dark";

export const THEME_CHOICES: readonly ThemeChoice[] = ["system", "light", "dark"];

export const DEFAULT_THEME_CHOICE: ThemeChoice = "system";

export const isThemeChoice = (value: unknown): value is ThemeChoice =>
  value === "system" || value === "light" || value === "dark";
