"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui";
import { ReportView } from "@/components/sections/scan-v3/components/ReportView";
import { ScanStage } from "@/components/sections/scan-v3/components/ScanStage";
import { UrlConsole } from "@/components/sections/scan-v3/components/UrlConsole";
import { RefreshIcon } from "@/components/sections/scan-v3/components/icons";
import { useScanEngine } from "@/components/sections/scan-v3/hooks/useScanEngine";
import type { WcagLevel } from "@/components/sections/scan-v3/types";
import { hostFromUrl, pathFromUrl, pendingFromReport, saveScan } from "@/lib/workspace";
import type { Workspace } from "@/lib/workspace";
import type { DashboardTab } from "@/lib/data/dashboard";
import scanStyles from "@/components/sections/scan-v3/ScanStudio.module.scss";
import styles from "./Workspace.module.scss";

interface WorkspaceScanProps {
  workspace: Workspace;
  onTab: (tab: DashboardTab) => void;
}

const lastScanAt = (scans: { scannedAt: string }[]) => scans[scans.length - 1]?.scannedAt ?? "";
const pageLabel = (host: string, path: string) => `${host}${path === "/" ? "" : path}`;

/**
 * The scan tool, embedded in the dashboard. A successful scan is saved
 * automatically (creating a project / page / follow-up), so the user is free
 * to keep working or switch tabs. Header offers one-click re-scans.
 */
export const WorkspaceScan = ({ workspace, onTab }: WorkspaceScanProps) => {
  const engine = useScanEngine();
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<WcagLevel>("AA");
  // Dedupe auto-save across re-renders (one save per completed scan).
  const savedKey = useRef<string | null>(null);

  const busy = engine.status === "scanning";
  const hasProjects = workspace.projects.length > 0;
  const report = engine.report;

  // Auto-create / update the baseline as soon as a scan finishes.
  useEffect(() => {
    if (engine.status !== "results" || !report) return;
    const key = `${report.url}@${report.scannedAt.getTime()}`;
    if (savedKey.current === key) return;
    savedKey.current = key;
    saveScan(pendingFromReport(report));
  }, [engine.status, report]);

  const recentPages = workspace.projects
    .flatMap((project) => project.pages.map((page) => ({ host: project.host, page })))
    .sort((a, b) => lastScanAt(b.page.scans).localeCompare(lastScanAt(a.page.scans)))
    .slice(0, 3);

  const runScan = (url: string) => engine.start(url, level);
  const scanTarget = (url: string) => {
    setQuery(url);
    engine.start(url, level);
  };
  const rescan = () => {
    const target = report?.url || engine.url || query;
    if (target) engine.start(target, level);
  };

  const urlConsole = (
    <UrlConsole
      url={query}
      level={level}
      busy={busy}
      onUrlChange={setQuery}
      onLevelChange={setLevel}
      showQuickLinks={false}
      onScan={runScan}
    />
  );

  return (
    <div className={styles.scanColumn}>
      <header className={styles.scanHead}>
        <div className={styles.scanHeadMain}>
          <span className={styles.scanKicker}>
            <Icon name="scan" size={12} />
            Cloud scanner
          </span>
          <h2 className={styles.scanTitle}>Run a scan</h2>
          <p className={styles.scanLead}>
            {hasProjects
              ? "Results save automatically — a new domain starts a project, a new path adds a page, the same path tracks progress."
              : "Scan a site to create your first project. The result is saved automatically as a baseline."}
          </p>
        </div>
      </header>

      {engine.status === "idle" && (
        <div className={styles.scanReveal}>
          {recentPages.length > 0 && (
            <div className={styles.recentRow}>
              <span className={styles.recentLabel}>Re-scan</span>
              {recentPages.map(({ host, page }) => (
                <button
                  key={page.id}
                  type="button"
                  className={styles.recentChip}
                  onClick={() => scanTarget(page.url)}
                  disabled={busy}
                >
                  <RefreshIcon size={11} />
                  {pageLabel(host, page.path)}
                </button>
              ))}
            </div>
          )}
          {urlConsole}
        </div>
      )}

      {engine.status === "scanning" && (
        <div className={styles.scanReveal}>
          <ScanStage
            url={engine.url}
            progress={engine.progress}
            lines={engine.lines}
            reduce={engine.reduce}
          />
        </div>
      )}

      {engine.status === "failed" && (
        <>
          <div className={styles.scanReveal}>
            <ScanStage
              url={engine.url}
              progress={engine.progress}
              lines={engine.lines}
              reduce={engine.reduce}
              status="failed"
            />
          </div>
          <div className={styles.scanReveal}>{urlConsole}</div>
        </>
      )}

      {engine.status === "results" && report && (
        <>
          <div className={styles.scanReveal}>
            <div className={styles.savedBanner} role="status">
              <span className={styles.savedIcon} aria-hidden="true">
                <Icon name="check" size={15} />
              </span>
              <span className={styles.savedText}>
                Saved to your workspace —{" "}
                <strong>{pageLabel(hostFromUrl(report.url), pathFromUrl(report.url))}</strong>
              </span>
              <span className={styles.savedLinks}>
                <button type="button" onClick={() => onTab("overview")}>
                  Overview
                </button>
                <button type="button" onClick={() => onTab("issues")}>
                  Issues
                </button>
                <button type="button" onClick={() => onTab("projects")}>
                  Projects
                </button>
              </span>
            </div>
          </div>

          <div className={styles.scanReveal}>
            <ReportView report={report} reduce={engine.reduce} onRescan={rescan} embedded />
          </div>

          <div className={styles.scanReveal}>
            <p className={scanStyles.dockTitle}>Scan another site</p>
            {urlConsole}
          </div>
        </>
      )}
    </div>
  );
};
