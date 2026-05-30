import { CSSProperties, ReactNode } from "react";
import cn from "classnames";
import styles from "./Card.module.scss";

export interface CardProps {
  className?: string;
  style?: CSSProperties;
  /** Removes default padding when the card hosts its own layout. */
  flush?: boolean;
  children: ReactNode;
}

/** A bordered surface with consistent radius and hover treatment. */
export function Card({ className, style, flush, children }: CardProps) {
  return (
    <div className={cn(styles.card, flush && styles.flush, className)} style={style}>
      {children}
    </div>
  );
}
