import { ReactNode } from "react";
import styles from "./ComingSoon.module.scss";

export interface ComingSoonProps {
  title: string;
  icon: ReactNode;
}

/** Friendly placeholder for sidebar tabs that aren't built out yet. */
export function ComingSoon({ title, icon }: ComingSoonProps) {
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
