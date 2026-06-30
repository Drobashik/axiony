import { Icon } from "@/components/ui";
import cn from "classnames";
import { SCAN_TARGETS } from "../data";
import styles from "../QuickStart.module.scss";

export const ScanTargets = () => (
  <div className={styles.targets}>
    <p className={styles.targetsLabel}>One CLI, three things to point it at:</p>

    <div className={styles.targetGrid}>
      {SCAN_TARGETS.map((target) => (
        <article
          key={target.label}
          className={cn(styles.target, styles[`accent_${target.accent}`])}
        >
          <span className={styles.targetIcon}>
            <Icon name={target.icon} size={18} />
          </span>
          <div className={styles.targetBody}>
            <strong>{target.label}</strong>
            <code>{target.command}</code>
            <p>{target.desc}</p>
          </div>
        </article>
      ))}
    </div>
  </div>
);
