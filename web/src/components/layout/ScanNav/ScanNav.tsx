"use client";

import Link from "next/link";
import { Button, LogoMark } from "@/components/ui";
import type { StudioState } from "@/components/sections/scan/types";
import { RefreshIcon, SearchIcon } from "@/components/sections/scan/components/icons";
import cn from "classnames";
import styles from "./ScanNav.module.scss";

interface ScanNavProps {
  status: StudioState;
  currentUrl: string;
  progress: number;
  score?: number;
  issueCount?: number;
  onNewScan: () => void;
  onRescan: () => void;
}

const statusLabel: Record<StudioState, string> = {
  idle: "Ready",
  scanning: "Scanning",
  results: "Report ready",
  failed: "Failed",
};

const shortUrl = (value: string): string => {
  if (!value) return "No URL selected";

  try {
    const url = new URL(value);
    return `${url.hostname}${url.pathname === "/" ? "" : url.pathname}`;
  } catch {
    return value;
  }
};

export const ScanNav = ({
  status,
  currentUrl,
  progress,
  score,
  issueCount,
  onNewScan,
  onRescan,
}: ScanNavProps) => {
  const activeUrl = shortUrl(currentUrl);
  const hasTarget = Boolean(currentUrl);
  const metric =
    status === "results" && typeof score === "number"
      ? `${score}/100 · ${issueCount ?? 0} issue${issueCount === 1 ? "" : "s"}`
      : status === "scanning"
        ? `${Math.round(progress)}%`
        : activeUrl;

  return (
    <header className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="Axiony home">
          <LogoMark size={30} />
          <span className={styles.wordmark}>Axiony</span>
        </Link>

        <div className={styles.context} aria-label="Scanner status">
          <span className={styles.divider} aria-hidden="true" />
          <span className={styles.product}>Scanner</span>
          <span className={cn(styles.status, styles[`status_${status}`])}>
            <span className={styles.statusDot} aria-hidden="true" />
            {statusLabel[status]}
          </span>
          <span className={styles.metric} title={currentUrl || undefined}>
            {metric}
          </span>
        </div>

        <div className={styles.actions} aria-label="Scanner controls">
          {status === "scanning" ? null : status === "idle" ? (
            <>
              <Button href="/login" variant="ghost" size="sm" className={styles.idleLogin}>
                Log in
              </Button>
              <Button href="/signup" size="sm">
                Sign up
              </Button>
            </>
          ) : (
            <>
              {status === "results" && (
                <Button
                  variant="secondary"
                  size="sm"
                  className={styles.rescanAction}
                  onClick={onRescan}
                >
                  <RefreshIcon size={14} />
                  Rescan
                </Button>
              )}

              {status === "failed" && hasTarget && (
                <Button variant="secondary" size="sm" onClick={onRescan}>
                  <RefreshIcon size={14} />
                  Retry
                </Button>
              )}

              <Button variant="secondary" size="sm" onClick={onNewScan}>
                <SearchIcon size={14} />
                New scan
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
