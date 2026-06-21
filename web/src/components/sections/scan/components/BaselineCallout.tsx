"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button, Icon } from "@/components/ui";
import { useSession } from "@/lib/auth-client";
import { pendingFromReport, writePendingScan } from "@/lib/workspace";
import type { ScanReport } from "../types";
import { LockIcon } from "./icons";
import styles from "../ScanStudio.module.scss";

interface BaselineCalloutProps {
  report: ScanReport;
  /** Embedded in the dashboard → run this after saving instead of navigating. */
  onSaved?: () => void;
}

/**
 * Public scan save prompt. Guests carry one pending scan into auth; signed-in
 * users save through the dashboard scanner, where reports persist in Neon.
 */
export const BaselineCallout = ({ report, onSaved }: BaselineCalloutProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);

  const signedIn = Boolean(session?.user);
  const pending = useMemo(() => pendingFromReport(report), [report]);

  const total = report.issues.length;

  const openDashboard = () => {
    if (saving) return;
    setSaving(true);
    if (onSaved) onSaved();
    else router.push("/dashboard/scan");
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
  const body: ReactNode = statsBody;
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

  if (signedIn) {
    context = "Signed in";
    heading = "Save scans from your dashboard";
    lead = (
      <>
        Open the dashboard scanner to save this site as a project or add a follow-up scan to an
        existing page.
      </>
    );
    readyLabel = "Account ready";
    primaryLabel = "Open dashboard";
    primaryAction = openDashboard;
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
