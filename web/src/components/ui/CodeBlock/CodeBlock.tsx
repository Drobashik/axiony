"use client";

import { CSSProperties, useState } from "react";
import cn from "classnames";
import { TerminalLine } from "../Terminal";
import styles from "./CodeBlock.module.scss";

export interface CodeBlockProps {
  filename?: string;
  /** Tokenised source lines — same AST as <Terminal />. */
  lines: TerminalLine[];
  /** Plain-text version for the copy-to-clipboard button. */
  copyText?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Mac-style code window with a copy button.
 * Renders the same line/token AST that the Terminal does, so we can
 * reuse syntax highlighting tokens without any innerHTML magic.
 */
export function CodeBlock({ filename, lines, copyText, className, style }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = copyText ?? lines.map((line) => line.map((t) => t.text).join("")).join("\n");
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div className={cn(styles.codeBlock, className)} style={style}>
      <div className={styles.header}>
        <div className={styles.dots}>
          <span className={cn(styles.dot, styles.dotRed)} />
          <span className={cn(styles.dot, styles.dotYellow)} />
          <span className={cn(styles.dot, styles.dotGreen)} />
        </div>
        {filename && <span className={styles.filename}>{filename}</span>}
        <button type="button" className={styles.copy} onClick={handleCopy}>
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>

      <div className={styles.body}>
        {lines.map((line, i) => (
          <span key={i} className={styles.line}>
            {line.length === 0 ? " " : line.map((token, ti) => (
              <span key={ti} className={token.kind ? styles[token.kind] : undefined}>
                {token.text}
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
