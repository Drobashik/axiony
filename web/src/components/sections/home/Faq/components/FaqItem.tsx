import cn from "classnames";
import type { QA } from "../types";
import styles from "../Faq.module.scss";

interface FaqItemProps {
  item: QA;
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

export const FaqItem = ({ item, isOpen, onToggle }: FaqItemProps) => (
  <li className={cn(styles.item, isOpen && styles.item_open)}>
    <button type="button" className={styles.question} aria-expanded={isOpen} onClick={onToggle}>
      <span>{item.q}</span>
      <ChevronIcon />
    </button>
    <div className={styles.answer}>
      <div className={styles.answerInner}>
        <p>{item.a}</p>
      </div>
    </div>
  </li>
);
