import type { ReactNode } from "react";
import cn from "classnames";
import styles from "./Container.module.scss";

export interface ContainerProps {
  variant?: "default" | "narrow";
  className?: string;
  children: ReactNode;
}

export const Container = ({ variant = "default", className, children }: ContainerProps) => (
  <div className={cn(variant === "narrow" ? styles.narrow : styles.default, className)}>
    {children}
  </div>
);
