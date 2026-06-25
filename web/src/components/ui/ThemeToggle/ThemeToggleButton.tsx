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
    >
      <span className={styles.iconSwap} data-resolved={resolvedTheme} aria-hidden="true">
        <SunIcon className={styles.sun} />
        <MoonIcon className={styles.moon} />
      </span>
    </button>
  );
};
