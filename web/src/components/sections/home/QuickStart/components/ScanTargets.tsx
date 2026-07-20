import { Icon } from "@/components/ui";
import cn from "classnames";
import { SCAN_TARGETS } from "../data";
import type { ScanTarget } from "../types";
import styles from "../QuickStart.module.scss";

interface ScanTargetsProps {
  active: ScanTarget;
  onSelect: (target: ScanTarget) => void;
}

// The trio doubles as a control: picking a card points the terminal's
// step 3 at that target.
export const ScanTargets = ({ active, onSelect }: ScanTargetsProps) => (
  <div className={styles.targets}>
    <p className={styles.targetsLabel} id="quickstart-targets-label">
      One CLI, three things to point it at:
    </p>

    <div className={styles.targetGrid} role="group" aria-labelledby="quickstart-targets-label">
      {SCAN_TARGETS.map((target) => {
        const isActive = target.key === active.key;

        return (
          <button
            key={target.key}
            type="button"
            aria-pressed={isActive}
            className={cn(
              styles.target,
              styles[`accent_${target.accent}`],
              isActive && styles.targetActive,
            )}
            onClick={() => onSelect(target)}
          >
            <span className={styles.targetIcon}>
              <Icon name={target.icon} size={18} />
            </span>
            <span className={styles.targetBody}>
              <strong>{target.label}</strong>
              <code>{target.command}</code>
              <span className={styles.targetDesc}>{target.desc}</span>
            </span>
          </button>
        );
      })}
    </div>
  </div>
);
