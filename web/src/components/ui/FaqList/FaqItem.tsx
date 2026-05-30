"use client";

import { useState } from "react";
import cn from "classnames";
import styles from "./FaqList.module.scss";

export interface FaqItemProps {
  question: string;
  answer: string;
}

/**
 * Single collapsible FAQ row. Owns its open state — the parent list
 * renders many of these but doesn't coordinate accordion behaviour.
 */
export function FaqItem({ question, answer }: FaqItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.item}>
      <button
        type="button"
        className={styles.question}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        {question}
        <svg
          className={cn(styles.chevron, open && styles.chevronOpen)}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div className={styles.answer} style={{ maxHeight: open ? 300 : 0 }}>
        <div className={styles.answerInner}>{answer}</div>
      </div>
    </div>
  );
}
