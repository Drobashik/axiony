"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button, Icon } from "@/components/ui";
import {
  pageLabel,
  pendingFromReport,
  previewSave,
  readWorkspace,
  saveScan,
  writePendingScan,
} from "@/lib/workspace";
import type { ScanReport } from "../types";
import { LockIcon } from "./icons";
import styles from "../ScanStudio.module.scss";

interface BaselineCalloutProps {
  report: ScanReport;
  /** Embedded in the dashboard → run this after saving instead of navigating. */
  onSaved?: () => void;
}

/**
 * The save moment, adapted to who's looking and what they scanned:
 *  - Guest → create an account (or log in) to save the baseline.
 *  - Member, new domain → create a new project.
 *  - Member, new path on a tracked domain → add a new page.
 *  - Member, same path → preview the comparison and save a follow-up scan.
 */
export const BaselineCallout = ({ report, onSaved }: BaselineCalloutProps) => {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Read once — this callout only renders client-side, after a scan.
  const [workspace] = useState(() => readWorkspace());
  const pending = useMemo(() => pendingFromReport(report), [report]);
  const preview = useMemo(() => previewSave(workspace, pending), [workspace, pending]);

  const total = report.issues.length;
  const who = workspace ? workspace.account.name || workspace.account.email : "";

  const saveMember = () => {
    if (saving) return;
    setSaving(true);
    saveScan(pending);
    if (onSaved) onSaved();
    else router.push("/dashboard");
  };

  const routeGuest = (dest: string) => {
    if (saving) return;
    setSaving(true);
    writePendingScan(pending);
    router.push(dest);
  };

  const statsBody = (
    <div className={styles.baselineStats}>
      <span>
        <strong>{total}</strong> found
      </span>
      <span className={styles.baselineDivider} aria-hidden="true" />
      <span>
        <strong>{total}</strong> tracked as debt
      </span>
      <span className={styles.baselineDivider} aria-hidden="true" />
      <span>
        <strong>0</strong> new regressions
      </span>
    </div>
  );

  // ── Per-state copy + actions ───────────────────────────────────────
  let context: string | null = null;
  let heading: string;
  let lead: ReactNode;
  let body: ReactNode = statsBody;
  let readyLabel = "Baseline ready";
  let primaryLabel = "Save as baseline";
  let primaryAction = () => routeGuest("/signup");
  let secondary: ReactNode = (
    <button
      type="button"
      className={styles.baselineLogin}
      onClick={() => routeGuest("/login")}
      disabled={saving}
    >
      Already use Axiony? <span>Log in</span>
    </button>
  );

  if (workspace && preview.kind === "rescan" && preview.diff) {
    const { diff, baselineScore = 0 } = preview;
    const deltaColor = diff.scoreDelta >= 0 ? "var(--green)" : "var(--severity-critical)";
    const regColor = diff.regressions > 0 ? "var(--severity-serious)" : "var(--text-secondary)";

    context = `Signed in as ${who} · tracking ${pageLabel(preview.host, preview.path)}`;
    heading = "Compare against your baseline";
    lead = (
      <>
        You&apos;re tracking <strong>{pageLabel(preview.host, preview.path)}</strong> (baseline{" "}
        {baselineScore}). Save this as a follow-up scan to update its progress and catch
        regressions.
      </>
    );
    body = (
      <div className={styles.baselineStats}>
        <span>
          Score <strong>{pending.score}</strong>
        </span>
        <span className={styles.baselineDivider} aria-hidden="true" />
        <span style={{ color: deltaColor }}>
          <strong style={{ color: deltaColor }}>
            {diff.scoreDelta >= 0 ? "+" : ""}
            {diff.scoreDelta}
          </strong>{" "}
          vs baseline
        </span>
        <span className={styles.baselineDivider} aria-hidden="true" />
        <span>
          <strong>{diff.resolved}</strong> resolved
        </span>
        <span className={styles.baselineDivider} aria-hidden="true" />
        <span style={{ color: regColor }}>
          <strong style={{ color: regColor }}>{diff.regressions}</strong> new
        </span>
      </div>
    );
    readyLabel = "Compared to baseline";
    primaryLabel = "Save follow-up scan";
    primaryAction = saveMember;
    secondary = null;
  } else if (workspace && preview.kind === "new-page") {
    context = `Signed in as ${who} · ${preview.host}`;
    heading = `Add this page to ${preview.host}`;
    lead = (
      <>
        <strong>{preview.path}</strong> isn&apos;t tracked yet. Save to add it as a new page to your{" "}
        <strong>{preview.host}</strong> project
        {preview.existingPages ? ` (${preview.existingPages} already tracked)` : ""}.
      </>
    );
    readyLabel = "New page";
    primaryLabel = "Add page";
    primaryAction = saveMember;
    secondary = null;
  } else if (workspace && preview.kind === "new-project") {
    context = `Signed in as ${who}`;
    heading = `Track ${preview.host}`;
    lead = (
      <>
        Save this scan to start a new project for <strong>{preview.host}</strong>. Its {total}{" "}
        issues become tracked debt, and new ones get flagged in CI and pull requests.
      </>
    );
    readyLabel = "New project";
    primaryLabel = "Create project";
    primaryAction = saveMember;
    secondary = null;
  } else {
    heading = "Turn this scan into a baseline";
    lead = (
      <>
        Save it as your starting point. These {total} issues become tracked debt — Axiony remembers
        them, compares every future scan, and flags new regressions in CI and pull requests.
      </>
    );
  }

  return (
    <div className={styles.baseline}>
      <div className={styles.baselineCopy}>
        {context && (
          <span className={styles.baselineContext}>
            <span className={styles.baselineContextDot} aria-hidden="true" />
            {context}
          </span>
        )}
        <h3>{heading}</h3>
        <p>{lead}</p>
        {body}
      </div>

      <div className={styles.baselineActions}>
        <span className={styles.baselineReady}>
          <Icon name="check" size={15} />
          {readyLabel}
        </span>
        <div className={styles.baselineBtns}>
          <Button size="sm" onClick={primaryAction} disabled={saving}>
            <LockIcon size={14} />
            {saving ? "Saving…" : primaryLabel}
          </Button>
          {secondary}
        </div>
      </div>
    </div>
  );
};
