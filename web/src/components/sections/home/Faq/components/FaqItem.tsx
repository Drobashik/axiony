import cn from "classnames";
import type { QA } from "../types";
import styles from "../Faq.module.scss";

interface FaqItemProps {
  item: QA;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}

const ChevronIcon = () => (
  <svg
    className={styles.chevron}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export const FaqItem = ({ item, index, isOpen, onToggle }: FaqItemProps) => {
  const answerId = `faq-answer-${index}`;
  const number = String(index + 1).padStart(2, "0");

  return (
    <li className={cn(styles.item, isOpen && styles.itemOpen)}>
      <button
        type="button"
        className={styles.question}
        aria-expanded={isOpen}
        aria-controls={answerId}
        onClick={onToggle}
      >
        <span className={styles.questionMain}>
          <span className={styles.questionIndex}>{number}</span>
          <span className={styles.questionText}>{item.q}</span>
        </span>
        <span className={styles.questionAction}>
          <ChevronIcon />
        </span>
      </button>
      <div id={answerId} className={styles.answer} aria-hidden={!isOpen}>
        <div className={styles.answerInner}>
          <p>{item.a}</p>
        </div>
      </div>
    </li>
  );
};
