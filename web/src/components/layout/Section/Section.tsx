import { CSSProperties, ElementType, ReactNode } from "react";
import cn from "classnames";
import styles from "./Section.module.scss";

export interface SectionProps {
  /** Standard or compact vertical padding. */
  size?: "default" | "small";
  /** Switches the background to the elevated surface color. */
  surface?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Override the rendered tag (defaults to `<section>`). */
  as?: ElementType;
  id?: string;
  children: ReactNode;
}

/**
 * Vertical section spacing primitive — wraps a region with the
 * standard 96px padding (or 64px in `small` mode) and an optional
 * surface background.
 */
export function Section({
  size = "default",
  surface,
  className,
  style,
  as: Tag = "section",
  id,
  children,
}: SectionProps) {
  return (
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
}
