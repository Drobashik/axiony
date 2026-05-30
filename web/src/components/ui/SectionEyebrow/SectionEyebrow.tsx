import { CSSProperties, ReactNode } from "react";
import cn from "classnames";
import styles from "./SectionEyebrow.module.scss";

export interface SectionEyebrowProps {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/** Small uppercase label that sits above section headings. */
export function SectionEyebrow({ className, style, children }: SectionEyebrowProps) {
  return (
    <span className={cn(styles.eyebrow, className)} style={style}>
      {children}
    </span>
  );
}
