import { ReactNode } from "react";
import cn from "classnames";
import styles from "./Tag.module.scss";

export interface TagProps {
  className?: string;
  children: ReactNode;
}

/** Subtle inline label — used for "v1.4", "CLI", etc. */
export function Tag({ className, children }: TagProps) {
  return <span className={cn(styles.tag, className)}>{children}</span>;
}
