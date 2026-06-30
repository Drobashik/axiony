import type { ReactNode } from "react";
import cn from "classnames";
import styles from "./Container.module.scss";

export interface ContainerProps {
  variant?: "default" | "narrow" | "wide";
  className?: string;
  children: ReactNode;
}

const variantClass = {
  default: styles.default,
  narrow: styles.narrow,
  wide: styles.wide,
};

export const Container = ({ variant = "default", className, children }: ContainerProps) => (
  <div className={cn(variantClass[variant], className)}>{children}</div>
);
