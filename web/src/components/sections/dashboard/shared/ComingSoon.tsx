import { ReactNode } from "react";
import styles from "./ComingSoon.module.scss";

const PLACEHOLDER_ICON = (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M4 9h16M9 4v16" />
  </svg>
);

export interface ComingSoonProps {
  title: string;
  icon?: ReactNode;
}

/** Friendly placeholder for sidebar tabs that aren't built out yet. */
export function ComingSoon({ title, icon = PLACEHOLDER_ICON }: ComingSoonProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.icon}>{icon}</div>
      <div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.lead}>This section is coming soon in the demo.</p>
      </div>
    </div>
  );
}
