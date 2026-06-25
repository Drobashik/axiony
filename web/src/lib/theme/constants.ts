// Theme tokens shared by the no-flash boot script, the provider, and the UI.

export const THEME_STORAGE_KEY = "axiony.theme";

/** What the user picked. `system` follows the OS preference. */
export type ThemeChoice = "system" | "light" | "dark";

/** The theme actually applied to the document. */
export type ResolvedTheme = "light" | "dark";

export const THEME_CHOICES: readonly ThemeChoice[] = ["system", "light", "dark"];

export const DEFAULT_THEME_CHOICE: ThemeChoice = "system";

export const isThemeChoice = (value: unknown): value is ThemeChoice =>
  value === "system" || value === "light" || value === "dark";
