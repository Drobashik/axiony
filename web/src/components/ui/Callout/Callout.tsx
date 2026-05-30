import { ReactNode } from "react";
import cn from "classnames";
import styles from "./Callout.module.scss";

export type CalloutVariant = "note" | "tip" | "warn" | "danger";

export interface CalloutProps {
  variant?: CalloutVariant;
  /** Pre-rendered icon. Defaults to a sensible glyph per variant. */
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

const DEFAULT_ICONS: Record<CalloutVariant, string> = {
  note: "ℹ",
  tip: "✦",
  warn: "⚠",
  danger: "✕",
};

/** Inline highlighted note used in docs and detail panels. */
export function Callout({ variant = "note", icon, className, children }: CalloutProps) {
  return (
    <div className={cn(styles.callout, styles[variant], className)}>
      <span className={styles.icon}>{icon ?? DEFAULT_ICONS[variant]}</span>
      <div className={styles.body}>{children}</div>
    </div>
  );
}
