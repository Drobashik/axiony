import { Button, Icon } from "@/components/ui";
import { LockIcon } from "./icons";
import styles from "../ScanStudio.module.scss";

interface BaselineCalloutProps {
  total: number;
}

// Brings v1's baseline idea into the results context: this scan becomes
// the starting point, existing issues become tracked debt.
export const BaselineCallout = ({ total }: BaselineCalloutProps) => (
  <div className={styles.baseline}>
    <div className={styles.baselineCopy}>
      <h3>Turn this scan into a baseline</h3>
      <p>
        Save this scan as your starting point. Existing issues become tracked
        debt, while new regressions can be flagged in CI and pull requests.
      </p>
      <div className={styles.baselineStats}>
        <span><strong>{total}</strong> found</span>
        <span className={styles.baselineDivider} aria-hidden="true" />
        <span><strong>{total}</strong> tracked as debt</span>
        <span className={styles.baselineDivider} aria-hidden="true" />
        <span><strong>0</strong> new regressions</span>
      </div>
    </div>

    <div className={styles.baselineActions}>
      <span className={styles.baselineReady}>
        <Icon name="check" size={15} />
        Baseline ready
      </span>
      <div className={styles.baselineBtns}>
        <Button variant="secondary" size="sm" disabled aria-disabled="true">
          <LockIcon size={14} />
          Save baseline · Soon
        </Button>
        <Button href="#early-access" size="sm">Join early access</Button>
      </div>
    </div>
  </div>
);
