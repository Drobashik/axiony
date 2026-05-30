import { ReactNode } from "react";
import cn from "classnames";
import styles from "./Container.module.scss";

export interface ContainerProps {
  /** Width preset. `narrow` is used for FAQ / docs-style content. */
  variant?: "default" | "narrow";
  className?: string;
  children: ReactNode;
}

/**
 * Centered, padded container — the only place we write `max-width`
 * for page-level layout, so it stays consistent everywhere.
 */
export function Container({ variant = "default", className, children }: ContainerProps) {
  return (
    <div className={cn(variant === "narrow" ? styles.narrow : styles.default, className)}>
      {children}
    </div>
  );
}
