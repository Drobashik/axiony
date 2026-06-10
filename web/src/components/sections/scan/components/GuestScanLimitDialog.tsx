"use client";

import { Button } from "@/components/ui";
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
      className={styles.dialog}
      role="dialog"
      aria-modal="true"
      aria-labelledby="guest-scan-limit-title"
      onMouseDown={(event) => event.stopPropagation()}
    >
      <div className={styles.dialogEyebrow}>Guest scan used</div>
      <p className={styles.dialogUrl}>{currentUrl || "No saved report yet"}</p>
      <h2 id="guest-scan-limit-title">Create a free account to keep scanning</h2>
      <p>
        {hasReport
          ? "Your first scan is still visible, but it is not saved yet. Sign up to save this report, keep history, and run more scans."
          : "Guest preview includes one live scan. Sign up to run more scans and save history."}
      </p>
      <div className={styles.dialogActions}>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          {hasReport ? "Keep report" : "Not now"}
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
