import cn from "classnames";
import styles from "./LogoMark.module.scss";

export interface LogoMarkProps {
  size?: number;
  className?: string;
}

/** The Axiony "A" mark — a blue square with a white check. */
export function LogoMark({ size = 26, className }: LogoMarkProps) {
  return (
    <span
      className={cn(styles.mark, className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 16 16" fill="none">
        <path d="M3 13L8 3L13 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.5 9.5H10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </span>
  );
}
