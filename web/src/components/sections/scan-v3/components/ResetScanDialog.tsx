"use client";

import { Button } from "@/components/ui";
import styles from "../ScanStudio.module.scss";

interface ResetScanDialogProps {
  mode: "report" | "scanning";
  url: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ResetScanDialog = ({
  mode,
  url,
  onCancel,
  onConfirm,
}: ResetScanDialogProps) => {
  const title = mode === "report" ? "Start a new scan?" : "Stop this scan?";
  const body =
    mode === "report"
      ? "Your current report will be cleared from this screen. Export or copy anything you need before starting over."
      : "The scan in progress will be cancelled and the current progress will be cleared.";
  const cancelLabel = mode === "report" ? "Keep report" : "Keep scanning";

  return (
    <div className={styles.dialogLayer} role="presentation" onMouseDown={onCancel}>
      <section
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-scan-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.dialogEyebrow}>Current target</div>
        <p className={styles.dialogUrl}>{url || "No URL selected"}</p>
        <h2 id="reset-scan-title">{title}</h2>
        <p>{body}</p>
        <div className={styles.dialogActions}>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button size="sm" onClick={onConfirm}>
            {mode === "report" ? "Clear and scan new URL" : "Stop and reset"}
          </Button>
        </div>
      </section>
    </div>
  );
};
