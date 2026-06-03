import type { CSSProperties, ReactNode } from "react";
import cn from "classnames";
import styles from "./SectionEyebrow.module.scss";

export interface SectionEyebrowProps {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export const SectionEyebrow = ({ className, style, children }: SectionEyebrowProps) => (
  <span className={cn(styles.eyebrow, className)} style={style}>
    {children}
  </span>
);
