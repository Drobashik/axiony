"use client";

import { Button } from "@/components/ui";
import cn from "classnames";
import { LockIcon } from "./icons";
import styles from "../ScanStudio.module.scss";

interface GuestScanLimitDialogProps {
  currentUrl: string;
  hasReport: boolean;
  onCancel: () => void;
  onSignup: () => void;
  onLogin: () => void;
}

export const GuestScanLimitDialog = ({
  currentUrl,
  hasReport,
  onCancel,
  onSignup,
  onLogin,
}: GuestScanLimitDialogProps) => (
  <div className={styles.dialogLayer} role="presentation" onMouseDown={onCancel}>
    <section
      className={cn(styles.dialog, styles.dialogUpgrade)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="guest-scan-limit-title"
      onMouseDown={(event) => event.stopPropagation()}
    >
      <div className={styles.dialogHero}>
        <span className={styles.dialogIcon} aria-hidden="true">
          <LockIcon size={18} />
        </span>
        <div className={styles.dialogHeroCopy}>
          <div className={styles.dialogEyebrow}>Free scan complete</div>
          <p className={styles.dialogUrl}>{currentUrl || "No saved report yet"}</p>
        </div>
      </div>

      <h2 id="guest-scan-limit-title">
        {hasReport ? "Save this report and keep scanning." : "Sign up to run more scans."}
      </h2>

      <p>
        {hasReport
          ? "Your report is ready. Create a free account to keep it, compare future runs, and continue scanning."
          : "You have used the guest scan. Create a free account to scan more pages and keep your history."}
      </p>

      <ul className={styles.dialogBenefits} aria-label="Account benefits">
        <li>More scans after signup</li>
        <li>Saved reports and history</li>
        <li>Baselines your team can track</li>
      </ul>

      <div className={styles.dialogActions}>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          {hasReport ? "Stay on report" : "Not now"}
        </Button>
        <Button variant="secondary" size="sm" onClick={onLogin}>
          Log in
        </Button>
        <Button size="sm" onClick={onSignup}>
          Create free account
        </Button>
      </div>
    </section>
  </div>
);
