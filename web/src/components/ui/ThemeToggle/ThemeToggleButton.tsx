"use client";

import cn from "classnames";
import { useTheme } from "@/lib/theme";
import { MoonIcon, SunIcon } from "./icons";
import styles from "./ThemeToggle.module.scss";

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
      <span className={styles.modeIcon} aria-hidden="true">
        <span className={cn(styles.modeGlyph, styles.modeMoon)}>
          <MoonIcon />
        </span>
        <span className={cn(styles.modeGlyph, styles.modeSun)}>
          <SunIcon />
        </span>
      </span>
      <span className={styles.modeCopy} aria-hidden="true">
        <span className={styles.modeKey}>theme</span>
        <span className={styles.modeValue}>{resolvedTheme}</span>
      </span>
      <span className={styles.modeRail} aria-hidden="true">
        <span />
      </span>
    </button>
  );
};
