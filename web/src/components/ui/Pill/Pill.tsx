import type { ReactNode } from "react";
import type { AccentColor } from "@/types";
import cn from "classnames";
import styles from "./Pill.module.scss";

export interface PillProps {
  tone?: AccentColor | "muted";
  className?: string;
  children: ReactNode;
}

export const Pill = ({ tone = "blue", className, children }: PillProps) => (
  <span className={cn(styles.pill, styles[tone], className)}>{children}</span>
);
