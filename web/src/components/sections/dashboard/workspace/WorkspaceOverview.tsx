"use client";

import { useState } from "react";
import { Badge, Button, Icon } from "@/components/ui";
import cn from "classnames";
import { SeverityBar } from "@/components/sections/scan/components/SeverityBar";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import type { DashboardTab } from "@/lib/data/dashboard";
import {
  aggregateOpenIssues,
  latestScannedPage,
  locatedIssueKey,
  pageLabel,
  pageModel,
  workspaceChangeDigest,
  workspaceSummary,
} from "@/lib/workspace";
import type { JustCreated, Workspace, WorkspaceChangeDigest } from "@/lib/workspace";
import { ScoreRing, colorForScore } from "../shared/ScoreRing";
import { TrendChart } from "./TrendChart";
import styles from "./Workspace.module.scss";

interface WorkspaceOverviewProps {
  workspace: Workspace;
  onTab: (tab: DashboardTab) => void;
}

const Celebration = ({ created, onDismiss }: { created: JustCreated; onDismiss: () => void }) => (
  <section className={styles.celebrate}>
    <span className={styles.celebrateIcon} aria-hidden="true">
      <Icon name="check" size={26} />
    </span>
    <div className={styles.celebrateBody}>
      <h2 className={styles.celebrateTitle}>
        {created.kind === "project" ? "Project created" : "Page added"}
      </h2>
      <p className={styles.celebrateText}>
        {created.kind === "project" ? (
          <>
            We&apos;re now tracking <strong>{created.host}</strong> as a project. Its issues are
            tracked debt — new <strong>regressions</strong> get flagged in CI and pull requests.
          </>
        ) : (
          <>
            Added <strong>{pageLabel(created.host, created.path)}</strong> as a new page, tracked
            alongside the rest of your <strong>{created.host}</strong> project.
          </>
        )}
      </p>
    </div>
    <button
      type="button"
      className={styles.celebrateClose}
      onClick={onDismiss}
      aria-label="Dismiss"
    >
      ✕
    </button>
  </section>
);

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

const fixedCount = (n: number): string => `${n} fixed`;

const fixedChange = (n: number): string => (n > 0 ? `+${fixedCount(n)}` : fixedCount(n));

const signed = (value: number): string => (value === 0 ? "±0" : `${value > 0 ? "+" : ""}${value}`);

const shortDate = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });

const eventTone = (
  event: WorkspaceChangeDigest["events"][number],
): "good" | "alert" | "neutral" => {
  if (event.regressions > 0) return "alert";
  if (event.resolved > 0 || event.scoreDelta > 0) return "good";
  return "neutral";
};

const eventSummary = (event: WorkspaceChangeDigest["events"][number]): string => {
  const parts = [];
  if (event.resolved > 0) parts.push(fixedChange(event.resolved));
  if (event.regressions > 0) parts.push(`${plural(event.regressions, "new regression")}`);
  if (event.scoreDelta !== 0) parts.push(`score ${signed(event.scoreDelta)}`);
  return parts.length > 0 ? parts.join(" · ") : "No issue movement";
};

const ChangeDigest = ({
  digest,
  onScan,
}: {
  digest: WorkspaceChangeDigest;
  onScan: () => void;
}) => {
  const scoreEvent = digest.strongestScoreEvent;
  const hasRecentActivity = digest.followupScans > 0;
  const headline = hasRecentActivity
    ? `Last ${digest.windowDays} days: ${fixedChange(digest.resolved)} · ${plural(
        digest.regressions,
        "new regression",
      )} · ${
        scoreEvent
          ? `score ${signed(scoreEvent.scoreDelta)} on ${scoreEvent.label}`
          : "score steady"
      }`
    : digest.hasFollowups
      ? `No follow-up changes in the last ${digest.windowDays} days`
      : "Baseline saved. Re-scan to start your changelog";
  const support = hasRecentActivity
    ? `${plural(digest.followupScans, "follow-up scan")} across ${plural(
        digest.changedPages,
        "page",
      )}. Latest: ${
        digest.latestEvent
          ? `${eventSummary(digest.latestEvent)} on ${digest.latestEvent.label}.`
          : "waiting for the next scan."
      }`
    : digest.hasFollowups
      ? "Your older history is still tracked. Run a fresh scan to see this week's fixes, regressions, and score movement."
      : "The next scan of the same URL will show what disappeared, what came back, and whether the score moved.";
  const scoreTone =
    digest.netScoreDelta > 0 ? styles.changeGood : digest.netScoreDelta < 0 ? styles.changeBad : "";

  return (
    <section className={styles.changeDigest} aria-labelledby="change-digest-title">
      <div className={styles.changeLead}>
        <span className={styles.changeKicker}>What changed</span>
        <h3 id="change-digest-title" className={styles.changeTitle}>
          {headline}
        </h3>
        <p className={styles.changeText}>{support}</p>
      </div>

      <div className={styles.changeStats} aria-label={`Last ${digest.windowDays} days`}>
        <span className={styles.changeStat}>
          <span className={styles.changeStatLabel}>Fixed</span>
          <strong className={styles.changeGood}>
            {digest.resolved > 0 ? `+${digest.resolved}` : digest.resolved}
          </strong>
        </span>
        <span className={styles.changeStat}>
          <span className={styles.changeStatLabel}>Regressions</span>
          <strong className={digest.regressions > 0 ? styles.changeBad : styles.changeGood}>
            {digest.regressions}
          </strong>
        </span>
        <span className={styles.changeStat}>
          <span className={styles.changeStatLabel}>Score net</span>
          <strong className={scoreTone}>{signed(digest.netScoreDelta)}</strong>
        </span>
      </div>

      {hasRecentActivity ? (
        <ul className={styles.changeFeed} aria-label="Recent scan changes">
          {digest.events.slice(0, 3).map((event) => (
            <li key={`${event.id}-${event.scannedAt}`} className={styles.changeItem}>
              <span className={styles.changeIcon} data-tone={eventTone(event)} aria-hidden="true">
                <Icon
                  name={event.regressions > 0 ? "bolt" : event.resolved > 0 ? "check" : "scan"}
                  size={15}
                />
              </span>
              <span className={styles.changeItemMain}>
                <span className={styles.changeItemTitle}>{event.label}</span>
                <span className={styles.changeItemMeta}>{eventSummary(event)}</span>
              </span>
              <span className={styles.changeDate}>{shortDate(event.scannedAt)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <button type="button" className={styles.changeCta} onClick={onScan}>
          <Icon name="scan" size={14} />
          Run follow-up scan
        </button>
      )}
    </section>
  );
};

export const WorkspaceOverview = ({ workspace, onTab }: WorkspaceOverviewProps) => {
  const reduce = usePrefersReducedMotion();
  const summary = workspaceSummary(workspace);
  const digest = workspaceChangeDigest(workspace);
  const [dismissedCreatedKey, setDismissedCreatedKey] = useState<string | null>(null);

  if (!summary) return null;

  const created = workspace.onboarding.justCreated;
  const createdKey = created ? `${created.kind}:${created.host}:${created.path}` : null;
  const justCreated = createdKey && dismissedCreatedKey === createdKey ? null : created;

  const located = latestScannedPage(workspace);
  const pm = located ? pageModel(located.page) : null;
  const openIssues = aggregateOpenIssues(workspace);

  return (
    <div className={styles.overview}>
      {justCreated && (
        <Celebration
          created={justCreated}
          onDismiss={() => createdKey && setDismissedCreatedKey(createdKey)}
        />
      )}

      <section className={styles.head} data-tour="overview-summary">
        <div className={styles.headMain}>
          <span className={styles.headKicker}>Your workspace</span>
          <h2 className={styles.headHost}>
            {plural(summary.projectCount, "project")} · {plural(summary.pageCount, "page")}
          </h2>
          <span className={styles.headMeta}>
            {plural(summary.openIssues, "open issue")} · {summary.regressionsCaught} regressions
            caught
          </span>
        </div>

        <div className={styles.headSide}>
          <div className={styles.headRing}>
            <ScoreRing score={summary.avgScore} size={62} />
            <div className={styles.headRingMeta}>
              <span className={styles.headRingLabel}>Avg score</span>
              <span className={styles.headRingSub}>across {summary.pageCount} pages</span>
            </div>
          </div>
          <div className={styles.headActions}>
            <Button size="md" variant="secondary" onClick={() => onTab("projects")}>
              <Icon name="globe" size={15} />
              Review projects
            </Button>
          </div>
        </div>
      </section>

      <ChangeDigest digest={digest} onScan={() => onTab("scan")} />

      <div className={styles.tiles}>
        <article className={styles.tile}>
          <span className={styles.tileLabel}>Projects</span>
          <span className={styles.tileValue} style={{ color: colorForScore(summary.avgScore) }}>
            {summary.avgScore}
            <span className={styles.tileUnit}>avg</span>
          </span>
          <span className={styles.tileNote}>{plural(summary.projectCount, "project")} tracked</span>
        </article>

        <article className={styles.tile}>
          <span className={styles.tileLabel}>Tracked debt</span>
          <span className={styles.tileValue}>{summary.debt}</span>
          <span className={styles.tileNote}>Frozen at baseline</span>
        </article>

        <article className={styles.tile}>
          <span className={styles.tileLabel}>Open now</span>
          <span className={styles.tileValue}>{summary.openIssues}</span>
          <span className={styles.tileNote}>
            {summary.resolvedTotal > 0 ? `${summary.resolvedTotal} resolved` : "Across all pages"}
          </span>
        </article>

        <article
          className={cn(styles.tile, summary.regressionsCaught > 0 && styles.tileAlert)}
          style={
            summary.regressionsCaught > 0 ? { borderColor: "var(--severity-serious)" } : undefined
          }
        >
          <span className={styles.tileLabel}>Regressions caught</span>
          <span
            className={styles.tileValue}
            style={{
              color: summary.regressionsCaught > 0 ? "var(--severity-serious)" : "var(--green)",
            }}
          >
            {summary.regressionsCaught}
          </span>
          <span className={styles.tileNote}>Since baseline</span>
        </article>
      </div>

      <section className={styles.panel} data-tour="overview-trends">
        <header className={styles.panelHead}>
          <span className={styles.panelTitle}>Trends</span>
          {located && (
            <span className={styles.panelMeta}>
              {pageLabel(located.project.host, located.page.path)}
            </span>
          )}
        </header>
        {pm && (
          <TrendChart
            points={pm.trend}
            baselineScore={pm.baselineScore}
            baselineTotal={pm.baselineTotal}
            reduce={reduce}
          />
        )}
        <p className={styles.trendHint}>
          {pm?.hasFollowups
            ? `${pm.scanCount} scans tracked — switch between score and open issues above.`
            : "Re-scan a page in Projects to extend its trend."}
        </p>
      </section>

      <section className={styles.panel}>
        <header className={styles.panelHead}>
          <span className={styles.panelTitle}>Tracked debt</span>
          <span className={styles.panelMeta}>{summary.openIssues} open</span>
        </header>
        {openIssues.length === 0 ? (
          <p className={styles.empty}>No open issues — your baselines are clean. 🎉</p>
        ) : (
          <>
            <SeverityBar counts={summary.counts} total={summary.openIssues} />
            <ul className={styles.issueList}>
              {openIssues.slice(0, 6).map((located, index) => {
                const { host, path, issue, isRegression } = located;

                return (
                  <li key={locatedIssueKey(located, index)} className={styles.issueRow}>
                    <Badge severity={issue.severity} />
                    <span className={styles.issueMain}>
                      <span className={styles.issueTitle}>{issue.title}</span>
                      <span className={styles.issueRule}>
                        {pageLabel(host, path)} · {issue.rule}
                      </span>
                    </span>
                    {isRegression && <span className={styles.newPill}>New</span>}
                    <span className={styles.issueCount}>×{issue.count}</span>
                  </li>
                );
              })}
            </ul>
            {openIssues.length > 6 && (
              <button type="button" className={styles.moreLink} onClick={() => onTab("issues")}>
                View all {openIssues.length} issues →
              </button>
            )}
          </>
        )}
      </section>
    </div>
  );
};
