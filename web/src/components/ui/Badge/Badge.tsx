import { ReactNode } from "react";
import { Severity } from "@/types";
import cn from "classnames";
import styles from "./Badge.module.scss";

export interface BadgeProps {
  severity: Severity;
  className?: string;
  children?: ReactNode;
}

/**
 * Severity badge with a colored leading dot.
 * Used in scan results, dashboard rows and report cards.
 */
export function Badge({ severity, className, children }: BadgeProps) {
  return (
    <span className={cn(styles.badge, styles[severity], className)}>
      {children ?? severity}
    </span>
  );
}
