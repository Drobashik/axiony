"use client";

import Link from "next/link";
import { Button, Icon, LogoMark } from "@/components/ui";
import type { BillingPlan } from "@/lib/billing";
import type { DashboardTab } from "@/lib/data/dashboard";
import { pageModel, relativeTime } from "@/lib/workspace";
import type { Workspace } from "@/lib/workspace";
import { HeaderScopeSwitcher } from "./components/HeaderScopeSwitcher";
import styles from "./Topbar.module.scss";

export interface TopbarProps {
  activeTab: DashboardTab;
  workspace?: Workspace | null;
  selectedProjectId?: string | null;
  selectedPagePath?: string | null;
  /** In-dashboard scan → switch to the scan tab instead of linking to /scan. */
  onNewScan?: () => void;
  onHome?: () => void;
  onNavigate?: (tab: DashboardTab) => void;
  onSelectProject?: (projectId: string | null) => void;
  onSelectPage?: (pagePath: string | null) => void;
  billingPlan?: BillingPlan;
  onUpgrade?: (plan?: Exclude<BillingPlan, "free">) => void;
  /** Mobile: state + toggle for the off-canvas sidebar drawer. */
  menuOpen?: boolean;
  onMenuToggle?: () => void;
}

const BellIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

const average = (values: number[]): number | null => {
  if (values.length === 0) {
    return null;
  }

  const total = values.reduce((sum, value) => sum + value, 0);

  return Math.round(total / values.length);
};

export function Topbar({
  activeTab,
  workspace,
  selectedProjectId,
  selectedPagePath,
  onNewScan,
  onHome,
  onNavigate,
  onSelectProject,
  onSelectPage,
  billingPlan,
  onUpgrade,
  menuOpen = false,
  onMenuToggle,
}: TopbarProps) {
  const selectedProject = workspace?.projects.find((project) => project.id === selectedProjectId);
  const selectedPage = selectedProject?.pages.find((page) => page.path === selectedPagePath);

  const scopePages = (() => {
    if (selectedPage) {
      return [selectedPage];
    }

    if (selectedProject) {
      return selectedProject.pages;
    }

    return workspace?.projects.flatMap((project) => project.pages) ?? [];
  })();

  const scopeModels = scopePages.map(pageModel);

  const score = average(scopeModels.map((model) => model.latestScore));
  const baselineScore = average(scopeModels.map((model) => model.baselineScore));
  const scoreDelta = score !== null && baselineScore !== null ? score - baselineScore : 0;

  const openIssues = scopeModels.reduce((sum, model) => sum + model.openIssues, 0);
  const criticalIssues = scopeModels.reduce((sum, model) => sum + model.counts.critical, 0);
  const lastScannedAt = scopeModels.reduce(
    (latest, model) => (model.lastScannedAt > latest ? model.lastScannedAt : latest),
    "",
  );

  return (
    <header className={styles.topbar}>
      <div className={styles.brandRail}>
        {onMenuToggle && (
          <button
            type="button"
            className={styles.menuBtn}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="dashboard-sidebar"
            onClick={onMenuToggle}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
        )}

        <Link
          href="/"
          className={styles.brand}
          aria-label="Axiony home"
          onClick={(event) => {
            if (!onHome) {
              return;
            }

            event.preventDefault();
            onHome();
          }}
        >
          <span className={styles.logoTile} aria-hidden="true">
            <LogoMark size={25} />
          </span>
          <span className={styles.brandCopy}>
            <span className={styles.wordmark}>Axiony</span>
            <span className={styles.brandMeta}>accessibility workflow</span>
          </span>
        </Link>
      </div>

      <HeaderScopeSwitcher
        workspace={workspace}
        selectedProject={selectedProject}
        selectedPage={selectedPage}
        activeTab={activeTab}
        onSelectProject={onSelectProject}
        onSelectPage={onSelectPage}
      />

      {score !== null && (
        <div className={styles.health} aria-label="Current scope health">
          <div
            className={styles.metric}
            data-score={score >= 85 ? "good" : score >= 70 ? "watch" : "risk"}
          >
            <span>Score</span>
            <div className={styles.metricValue}>
              <strong>{score}</strong>
              {scoreDelta !== 0 && (
                <small data-direction={scoreDelta > 0 ? "up" : "down"}>
                  {scoreDelta > 0 ? "↑" : "↓"} {Math.abs(scoreDelta)}
                </small>
              )}
            </div>
          </div>
          <span className={styles.metricDivider} aria-hidden="true" />
          <div className={styles.metric}>
            <span>Issues</span>
            <div className={styles.metricValue}>
              <strong>{openIssues}</strong>
              <small>open</small>
            </div>
          </div>
          <span className={styles.metricDivider} aria-hidden="true" />
          <div className={styles.metric}>
            <span>Last scan</span>
            <div className={styles.metricValue}>
              <strong className={styles.lastScan}>{relativeTime(lastScannedAt)}</strong>
            </div>
          </div>
        </div>
      )}

      <div className={styles.actions}>
        {billingPlan === "free" && onUpgrade && (
          <button type="button" className={styles.upgrade} onClick={() => onUpgrade("pro")}>
            Upgrade
          </button>
        )}

        {onNavigate && (
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Open alerts"
            onClick={() => onNavigate("alerts")}
          >
            <BellIcon />
            {criticalIssues > 0 && <span className={styles.attentionDot} />}
          </button>
        )}

        {onNewScan ? (
          <Button size="sm" className={styles.scanButton} onClick={onNewScan}>
            <Icon name="scan" size={14} />
            <span>Run scan</span>
          </Button>
        ) : (
          <Button href="/scan" size="sm" className={styles.scanButton}>
            <Icon name="scan" size={14} />
            <span>Run scan</span>
          </Button>
        )}
      </div>
    </header>
  );
}
