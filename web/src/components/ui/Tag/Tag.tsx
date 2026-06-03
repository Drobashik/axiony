import type { ReactNode } from "react";
import cn from "classnames";
import styles from "./Tag.module.scss";

export interface TagProps {
  className?: string;
  children: ReactNode;
}

export const Tag = ({ className, children }: TagProps) => (
  <span className={cn(styles.tag, className)}>{children}</span>
);
