import type { ReactNode } from "react";
import type { Severity } from "@/types";
import cn from "classnames";
import styles from "./Badge.module.scss";

export interface BadgeProps {
  severity: Severity;
  className?: string;
  children?: ReactNode;
}

// Severity badge with a coloured leading dot. The dot is decorative — the
// label text (children, or the severity name) is what conveys meaning, so
// it never relies on colour alone.
export const Badge = ({ severity, className, children }: BadgeProps) => (
  <span className={cn(styles.badge, styles[severity], className)}>
    {children ?? severity}
  </span>
);
