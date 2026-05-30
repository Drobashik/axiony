import { ReactNode } from "react";
import { AccentColor } from "@/types";
import cn from "classnames";
import styles from "./Pill.module.scss";

export interface PillProps {
  /** Brand accent or neutral muted appearance. */
  tone?: AccentColor | "muted";
  className?: string;
  children: ReactNode;
}

/**
 * Small rounded label used for "Most popular", "Now in beta", etc.
 */
export function Pill({ tone = "blue", className, children }: PillProps) {
  return <span className={cn(styles.pill, styles[tone], className)}>{children}</span>;
}
