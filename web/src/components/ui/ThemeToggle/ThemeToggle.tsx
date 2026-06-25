"use client";

import { useId } from "react";
import type { ReactNode } from "react";
import cn from "classnames";
import { useTheme } from "@/lib/theme";
import type { ThemeChoice } from "@/lib/theme";
import { MoonIcon, SunIcon, SystemIcon } from "./icons";
import styles from "./ThemeToggle.module.scss";

const OPTIONS: { value: ThemeChoice; label: string; icon: ReactNode }[] = [
  { value: "system", label: "System", icon: <SystemIcon /> },
  { value: "light", label: "Light", icon: <SunIcon /> },
  { value: "dark", label: "Dark", icon: <MoonIcon /> },
];

interface ThemeToggleProps {
  className?: string;
  /** Stretch the control and its segments to fill the available width. */
  block?: boolean;
}

/** Segmented System / Light / Dark control — for the settings surface. */
export const ThemeToggle = ({ className, block }: ThemeToggleProps) => {
  const { theme, setTheme } = useTheme();
  const name = useId();

  return (
    <div
      className={cn(styles.segmented, block && styles.block, className)}
      role="radiogroup"
      aria-label="Theme"
    >
      {OPTIONS.map((option) => {
        const active = theme === option.value;
        return (
          <label key={option.value} className={cn(styles.segment, active && styles.segmentActive)}>
            <input
              type="radio"
              name={name}
              className={styles.input}
              value={option.value}
              checked={active}
              onChange={() => setTheme(option.value)}
            />
            <span className={styles.segmentIcon} aria-hidden="true">
              {option.icon}
            </span>
            {option.label}
          </label>
        );
      })}
    </div>
  );
};
