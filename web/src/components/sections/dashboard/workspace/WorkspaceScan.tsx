"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button, Icon } from "@/components/ui";
import { ReportView } from "@/components/sections/scan/components/ReportView";
import { ScanStage } from "@/components/sections/scan/components/ScanStage";
import { UrlConsole } from "@/components/sections/scan/components/UrlConsole";
import { RefreshIcon } from "@/components/sections/scan/components/icons";
import { useScanEngine } from "@/components/sections/scan/hooks/useScanEngine";
import type { WcagLevel } from "@/components/sections/scan/types";
import {
  canManageIssues,
  entitlementsForPlan,
  planDefinition,
  recordScanUsage,
  remainingScans,
} from "@/lib/billing";
import type { BillingPlan, BillingState } from "@/lib/billing";
import { normalizeUrl } from "@/lib/scan/url";
import { hostFromUrl, pageLabel, pathFromUrl, pendingFromReport, saveScan } from "@/lib/workspace";
import type { Workspace } from "@/lib/workspace";
import type { DashboardTab } from "@/lib/data/dashboard";
import { ScannerUpgradeCard } from "../billing";
import scanStyles from "@/components/sections/scan/ScanStudio.module.scss";
import styles from "./Workspace.module.scss";

interface WorkspaceScanProps {
  workspace: Workspace;
  onTab: (tab: DashboardTab) => void;
  billing: BillingState;
  onUpgrade: (plan?: Exclude<BillingPlan, "free">) => void;
  setNavigationGuard: (guard: (() => boolean) | null) => void;
}

interface PendingScanRequest {
  url: string;
  query?: string;
  reason: "replace-report" | "rescan-history";
}

const lastScanAt = (scans: { scannedAt: string }[]) => scans[scans.length - 1]?.scannedAt ?? "";
const normalizeDomain = (host: string): string =>
  host
    .trim()
    .toLowerCase()
    .replace(/^www\./, "")
    .split("/")[0] ?? "";

const nextPlan = (plan: BillingPlan): Exclude<BillingPlan, "free"> | null => {
  if (plan === "free") return "pro";
  if (plan === "pro") return "team";
  return null;
};

const WarningIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
    <path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
  </svg>
);

/**
 * The scan tool, embedded in the dashboard. A successful scan is saved
 * automatically (creating a project / page / follow-up), so the user is free
 * to keep working or switch tabs. Header offers one-click re-scans.
 */
export const WorkspaceScan = ({
  workspace,
  onTab,
  billing,
  onUpgrade,
  setNavigationGuard,
}: WorkspaceScanProps) => {
  const engine = useScanEngine();
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<WcagLevel>("AA");
  const [quotaAlert, setQuotaAlert] = useState<string | null>(null);
  const [quotaFocusSignal, setQuotaFocusSignal] = useState(0);
  const [pendingScan, setPendingScan] = useState<PendingScanRequest | null>(null);
  // Dedupe usage and auto-save independently across re-renders.
  const recordedKey = useRef<string | null>(null);
  const savedKey = useRef<string | null>(null);
  const quotaCardRef = useRef<HTMLElement | null>(null);
  const quotaAlertRef = useRef<HTMLDivElement | null>(null);

  const busy = engine.status === "scanning";
  const hasProjects = workspace.projects.length > 0;
  const report = engine.report;
  const plan = planDefinition(billing.plan);
  const entitlements = entitlementsForPlan(billing.plan);
  const scansLeft = remainingScans(billing);
  const usagePercent = Math.min(
    100,
    Math.round((billing.usage.scansUsed / entitlements.monthlyScans) * 100),
  );
  const canControlIssues = canManageIssues(billing);
  const domainCount = workspace.projects.length;
  const upgradeTarget = nextPlan(billing.plan);
  const approachingScanLimit =
    scansLeft <= Math.max(10, Math.ceil(entitlements.monthlyScans * 0.1));
  const showQuotaCard = billing.plan === "free" || approachingScanLimit || quotaAlert !== null;
  const resultKey =
    engine.status === "results" && report ? `${report.url}@${report.scannedAt.getTime()}` : null;
  const hasVisibleResult = engine.status === "results" && Boolean(report);
  const resultHost = report ? normalizeDomain(hostFromUrl(report.url)) : "";
  const resultIsNewDomainProject =
    Boolean(resultHost) &&
    !workspace.projects.some((project) => normalizeDomain(project.host) === resultHost);
  const saveBlocked =
    resultKey && resultIsNewDomainProject && workspace.projects.length >= entitlements.domainLimit
      ? `${plan.name} can save ${entitlements.domainLimit.toLocaleString()} domain project${
          entitlements.domainLimit === 1 ? "" : "s"
        }. This scan is visible here, but it was not saved to your workspace.`
      : null;
  const unsavedResult = Boolean(saveBlocked);

  // Auto-create / update the baseline as soon as a scan finishes.
  useEffect(() => {
    if (!resultKey || !report) return;
    const host = hostFromUrl(report.url);

    if (recordedKey.current !== resultKey) {
      recordedKey.current = resultKey;
      recordScanUsage(host);
    }

    if (saveBlocked || savedKey.current === resultKey) return;

    const saved = saveScan(pendingFromReport(report));
    if (saved) savedKey.current = resultKey;
  }, [report, resultKey, saveBlocked]);

  useEffect(() => {
    if (!unsavedResult) {
      setNavigationGuard(null);
      return;
    }

    const message = "This scan result has not been saved. If you leave now, you will lose it.";
    setNavigationGuard(() => window.confirm(message));
    return () => setNavigationGuard(null);
  }, [setNavigationGuard, unsavedResult]);

  useEffect(() => {
    if (!unsavedResult) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [unsavedResult]);

  useEffect(() => {
    if (quotaFocusSignal === 0) return;
    const target = quotaAlertRef.current ?? quotaCardRef.current;

    quotaCardRef.current?.scrollIntoView({
      behavior: engine.reduce ? "auto" : "smooth",
      block: "center",
    });
    target?.focus({ preventScroll: true });
  }, [engine.reduce, quotaFocusSignal]);

  const recentPages = workspace.projects
    .flatMap((project) => project.pages.map((page) => ({ host: project.host, page })))
    .sort((a, b) => lastScanAt(b.page.scans).localeCompare(lastScanAt(a.page.scans)))
    .slice(0, 3);

  const showQuotaLimit = () => {
    setQuotaAlert(
      `${plan.name} includes ${entitlements.monthlyScans.toLocaleString()} scans per month. Upgrade to keep scanning this period.`,
    );
    setQuotaFocusSignal((value) => value + 1);
  };

  const executeScan = (rawUrl: string, nextQuery?: string) => {
    setPendingScan(null);
    if (nextQuery !== undefined) setQuery(nextQuery);

    const url = normalizeUrl(rawUrl);
    const host = normalizeDomain(hostFromUrl(url));

    if (!host) {
      engine.start(rawUrl, level);
      return;
    }

    if (scansLeft <= 0) {
      showQuotaLimit();
      return;
    }

    setQuotaAlert(null);
    engine.start(url, level);
  };

  const requestScan = (
    url: string,
    nextQuery?: string,
    reason: PendingScanRequest["reason"] = "replace-report",
  ) => {
    if (scansLeft <= 0) {
      showQuotaLimit();
      return;
    }

    if (hasVisibleResult || reason === "rescan-history") {
      setPendingScan({
        url,
        query: nextQuery,
        reason: hasVisibleResult ? "replace-report" : reason,
      });
      return;
    }

    executeScan(url, nextQuery);
  };

  const confirmPendingScan = () => {
    if (!pendingScan) return;
    executeScan(pendingScan.url, pendingScan.query);
  };

  const runScan = (url: string) => requestScan(url);
  const scanTarget = (url: string) => {
    requestScan(url, url, "rescan-history");
  };
  const rescan = () => {
    const target = report?.url || engine.url || query;
    if (target) requestScan(target);
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
            {canControlIssues
              ? hasProjects
                ? "Results save automatically — a new domain starts a project, a new path adds a page, the same path tracks progress."
                : "Scan a site to create your first project. The result is saved automatically as a baseline."
              : "Free saves one domain project. You can scan other sites, but extra domains stay unsaved until you upgrade."}
          </p>
        </div>
      </header>

      {showQuotaCard && (
        <div className={styles.scanReveal}>
          <section
            ref={quotaCardRef}
            className={styles.quotaCard}
            data-tone={scansLeft === 0 ? "danger" : scansLeft <= 2 ? "warn" : "default"}
            aria-label={`${plan.name} scan usage`}
            tabIndex={quotaAlert ? -1 : undefined}
          >
            <div className={styles.quotaTopline}>
              <span className={styles.quotaKicker}>{plan.name} usage</span>
              <strong>{scansLeft.toLocaleString()} scans left</strong>
            </div>
            <div className={styles.quotaMeter} aria-hidden="true">
              <span style={{ width: `${usagePercent}%` }} />
            </div>
            <div className={styles.quotaMeta}>
              <span>
                {billing.usage.scansUsed.toLocaleString()} of{" "}
                {entitlements.monthlyScans.toLocaleString()} scans this month
              </span>
              <span>
                {domainCount.toLocaleString()} of {entitlements.domainLimit.toLocaleString()}{" "}
                domains used
              </span>
            </div>
            {quotaAlert && (
              <div ref={quotaAlertRef} className={styles.quotaAlert} role="alert" tabIndex={-1}>
                <span>{quotaAlert}</span>
                {upgradeTarget && (
                  <Button size="sm" onClick={() => onUpgrade(upgradeTarget)}>
                    Upgrade to {planDefinition(upgradeTarget).name}
                  </Button>
                )}
              </div>
            )}
          </section>
        </div>
      )}

      {billing.plan === "free" && (
        <div className={styles.scanReveal}>
          <ScannerUpgradeCard onUpgrade={onUpgrade} />
        </div>
      )}

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
            <div
              className={
                !saveBlocked
                  ? styles.savedBanner
                  : `${styles.savedBanner} ${styles.savedBannerLocked}`
              }
              role="status"
            >
              <span className={styles.savedIcon} aria-hidden="true">
                <Icon name={saveBlocked ? "bolt" : "check"} size={15} />
              </span>
              {!saveBlocked ? (
                <>
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
                </>
              ) : (
                <>
                  <span className={styles.savedText}>
                    {saveBlocked}{" "}
                    <strong>{pageLabel(hostFromUrl(report.url), pathFromUrl(report.url))}</strong>
                  </span>
                  {upgradeTarget && (
                    <span className={styles.savedLinks}>
                      <button type="button" onClick={() => onUpgrade(upgradeTarget)}>
                        Upgrade to {planDefinition(upgradeTarget).name}
                      </button>
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          <div className={styles.scanReveal}>
            <ReportView
              report={report}
              reduce={engine.reduce}
              onRescan={rescan}
              embedded
              freePreview={billing.plan === "free"}
              onUpgrade={() => onUpgrade("pro")}
            />
          </div>

          <div className={styles.scanReveal}>
            <p className={scanStyles.dockTitle}>Scan another site</p>
            {urlConsole}
          </div>
        </>
      )}

      {pendingScan &&
        createPortal(
          <div
            className={styles.confirmOverlay}
            role="presentation"
            onClick={() => setPendingScan(null)}
          >
            <div
              className={styles.confirmDialog}
              role="dialog"
              aria-modal="true"
              aria-labelledby="discard-scan-title"
              aria-describedby="discard-scan-copy"
              onClick={(event) => event.stopPropagation()}
            >
              <span className={styles.confirmIcon} aria-hidden="true">
                <WarningIcon />
              </span>
              <h3 id="discard-scan-title">
                {pendingScan.reason === "rescan-history"
                  ? "Re-scan this URL?"
                  : "Start another scan?"}
              </h3>
              <p className={styles.confirmUrl}>{pendingScan.url}</p>
              {pendingScan.reason === "rescan-history" ? (
                <p id="discard-scan-copy">
                  This URL already has scan history. A new scan will be added as another history
                  point.
                </p>
              ) : unsavedResult ? (
                <p id="discard-scan-copy">
                  This result was not saved to your workspace. Starting another scan will clear it
                  from this screen.
                </p>
              ) : (
                <p id="discard-scan-copy">
                  The current report on this screen will be replaced. Export or copy anything you
                  need before starting another scan.
                </p>
              )}
              <div className={styles.confirmActions}>
                <button
                  type="button"
                  className={styles.confirmCancel}
                  onClick={() => setPendingScan(null)}
                >
                  {pendingScan.reason === "rescan-history" ? "Keep history" : "Keep report"}
                </button>
                <button type="button" className={styles.confirmDanger} onClick={confirmPendingScan}>
                  {pendingScan.reason === "rescan-history" ? "Re-scan URL" : "Scan anyway"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};
