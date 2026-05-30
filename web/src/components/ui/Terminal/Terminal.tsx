import { CSSProperties } from "react";
import cn from "classnames";
import { TerminalLine } from "./terminal-line";
import styles from "./Terminal.module.scss";

export interface TerminalProps {
  /** Header label, e.g. "axiony — bash". */
  filename?: string;
  /** Lines to display. Each line is a list of styled tokens. */
  lines: TerminalLine[];
  /** When true, a blinking cursor is shown after the last line. */
  showCursor?: boolean;
  /** When true, the terminal pulses with a soft glow. */
  animated?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Mac-style terminal frame with three traffic-light dots.
 * The body renders a typed AST instead of dangerouslySetInnerHTML.
 */
export function Terminal({
  filename = "terminal",
  lines,
  showCursor = false,
  animated = false,
  className,
  style,
}: TerminalProps) {
  return (
    <div className={cn(styles.terminal, animated && styles.animated, className)} style={style}>
      <div className={styles.header}>
        <div className={styles.dots}>
          <span className={cn(styles.dot, styles.dotRed)} />
          <span className={cn(styles.dot, styles.dotYellow)} />
          <span className={cn(styles.dot, styles.dotGreen)} />
        </div>
        <span className={styles.title}>{filename}</span>
      </div>

      <div className={styles.body}>
        {lines.map((line, i) => (
          <span key={i} className={styles.line}>
            {line.length === 0 ? " " : line.map((token, ti) => (
              <span key={ti} className={token.kind ? styles[token.kind] : undefined}>
                {token.text}
              </span>
            ))}
          </span>
        ))}
        {showCursor && <span className={styles.cursor} aria-hidden="true" />}
      </div>
    </div>
  );
}
