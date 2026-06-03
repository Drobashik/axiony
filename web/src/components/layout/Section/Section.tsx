import type { CSSProperties, ElementType, ReactNode } from "react";
import cn from "classnames";
import styles from "./Section.module.scss";

export interface SectionProps {
  size?: "default" | "small";
  surface?: boolean;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
  id?: string;
  children: ReactNode;
}

export const Section = ({
  size = "default",
  surface,
  className,
  style,
  as: Tag = "section",
  id,
  children,
}: SectionProps) => (
  <Tag
    id={id}
    style={style}
    className={cn(
      styles.section,
      size === "small" && styles.small,
      surface && styles.surface,
      className,
    )}
  >
    {children}
  </Tag>
);
