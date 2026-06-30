"use client";

import cn from "classnames";
import { useTheme } from "@/lib/theme";
import styles from "./ThemeToggle.module.scss";

const SunGlyph = () => (
  <svg viewBox="0 0 24 24" focusable="false">
    <circle className={styles.sunHalo} cx="12" cy="12" r="7.6" />
    <path
      className={styles.sunRays}
      d="M12 2.7v2.15M12 19.15v2.15M2.7 12h2.15M19.15 12h2.15M5.42 5.42l1.52 1.52M17.06 17.06l1.52 1.52M18.58 5.42l-1.52 1.52M6.94 17.06l-1.52 1.52"
    />
    <circle className={styles.sunCore} cx="12" cy="12" r="4.55" />
    <path className={styles.sunCut} d="M9.2 11.1h5.6M10.4 14h3.2" />
  </svg>
);

const MoonGlyph = () => (
  <svg viewBox="0 0 24 24" focusable="false">
    <path
      className={styles.moonBody}
      d="M18.35 15.62A8.15 8.15 0 0 1 8.38 5.65 8.3 8.3 0 1 0 18.35 15.62Z"
    />
    <circle className={styles.moonCrater} cx="9.65" cy="10.05" r="0.95" />
    <circle className={styles.moonCrater} cx="12.15" cy="14.8" r="0.7" />
    <path
      className={styles.moonSpark}
      d="M18.5 3.6 19.15 5l1.45.65-1.45.65-.65 1.5-.65-1.5-1.45-.65L17.85 5Z"
    />
  </svg>
);

/** Compact icon button that flips light ⇄ dark — for the marketing header. */
export const ThemeToggleButton = ({ className }: { className?: string }) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const label = resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      className={cn(styles.iconButton, className)}
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      data-resolved={resolvedTheme}
    >
      <span className={styles.iconGlow} aria-hidden="true" />
      <span className={styles.iconFrame} aria-hidden="true">
        <span className={cn(styles.iconGlyph, styles.moonGlyph)}>
          <MoonGlyph />
        </span>
        <span className={cn(styles.iconGlyph, styles.sunGlyph)}>
          <SunGlyph />
        </span>
      </span>
    </button>
  );
};
