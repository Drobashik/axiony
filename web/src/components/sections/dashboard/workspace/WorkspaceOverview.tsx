"use client";

import { Badge, Button, Icon } from "@/components/ui";
import cn from "classnames";
import type { IconName } from "@/types";
import type { DashboardTab } from "@/lib/data/dashboard";
import {
  aggregateOpenIssues,
  latestScannedPage,
  markCreatedSeen,
  pageLabel,
  pageModel,
  setOnboardingStep,
  workspaceSummary,
} from "@/lib/workspace";
import type { JustCreated, OnboardingStepId, Workspace } from "@/lib/workspace";
import { ScoreRing, colorForScore } from "../ScoreRing";
import { ScoreTrend } from "./ScoreTrend";
import styles from "./Workspace.module.scss";

interface WorkspaceOverviewProps {
  workspace: Workspace;
  onTab: (tab: DashboardTab) => void;
}

const DeltaBadge = ({ delta }: { delta: number }) => {
  if (delta === 0)
    return <span className={cn(styles.delta, styles.deltaFlat)}>±0 vs baseline</span>;
  const up = delta > 0;
  return (
    <span className={cn(styles.delta, up ? styles.deltaUp : styles.deltaDown)}>
      {up ? "↑ +" : "↓ "}
      {delta} vs baseline
    </span>
  );
};

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

const STEP_DEFS: {
  id: OnboardingStepId;
  icon: IconName;
  title: string;
  text: string;
  locked?: boolean;
}[] = [
  {
    id: "baseline",
    icon: "check",
    title: "Track a project",
    text: "Saved — your issues are now tracked debt.",
    locked: true,
  },
  {
    id: "connect",
    icon: "code",
    title: "Connect GitHub or GitLab",
    text: "Check accessibility on every pull request.",
  },
  {
    id: "ci",
    icon: "ci",
    title: "Add a CI check",
    text: "Block new regressions before they merge.",
  },
  {
    id: "invite",
    icon: "team",
    title: "Invite your team",
    text: "Bring product, engineering & QA into one workflow.",
  },
];

export const WorkspaceOverview = ({ workspace, onTab }: WorkspaceOverviewProps) => {
  const summary = workspaceSummary(workspace);
  if (!summary) return null;

  const { onboarding } = workspace;
  const located = latestScannedPage(workspace);
  const pm = located ? pageModel(located.page) : null;
  const openIssues = aggregateOpenIssues(workspace);
  const stepsDone = STEP_DEFS.filter((s) => onboarding.steps[s.id]).length;
  const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;

  return (
    <div className={styles.overview}>
      {onboarding.justCreated && (
        <Celebration created={onboarding.justCreated} onDismiss={markCreatedSeen} />
      )}

      <section className={styles.head}>
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

      <div className={styles.valueCards}>
        <article className={styles.valueCard}>
          <span className={styles.valueIcon} data-tone="blue">
            <Icon name="report" size={17} />
          </span>
          <span className={styles.valueTitle}>Existing debt, remembered</span>
          <span className={styles.valueText}>
            Each page&apos;s baseline issues are tracked, not forgotten — and never fail your build.
          </span>
        </article>
        <article className={styles.valueCard}>
          <span className={styles.valueIcon} data-tone="green">
            <Icon name="ci" size={17} />
          </span>
          <span className={styles.valueTitle}>Regression protection</span>
          <span className={styles.valueText}>
            Every re-scan is compared to that page&apos;s baseline; new issues get flagged in CI
            &amp; PRs.
          </span>
        </article>
        <article className={styles.valueCard}>
          <span className={styles.valueIcon} data-tone="violet">
            <Icon name="bolt" size={17} />
          </span>
          <span className={styles.valueTitle}>AI fix suggestions</span>
          <span className={styles.valueText}>
            Plain-English fixes and ready-to-paste code for each tracked issue.
          </span>
        </article>
      </div>

      <div className={styles.cols}>
        <section className={styles.panel}>
          <header className={styles.panelHead}>
            <span className={styles.panelTitle}>Score over time</span>
            {pm?.hasFollowups ? (
              <DeltaBadge delta={pm.scoreDelta} />
            ) : (
              located && (
                <span className={styles.panelMeta}>
                  {pageLabel(located.project.host, located.page.path)}
                </span>
              )
            )}
          </header>
          {pm && <ScoreTrend scores={pm.trendScores} baseline={pm.baselineScore} />}
          <p className={styles.trendHint}>
            {pm?.hasFollowups
              ? `Latest ${pm.latestScore} · baseline ${pm.baselineScore} on ${located ? pageLabel(located.project.host, located.page.path) : "this page"}.`
              : "Re-scan a page in Projects to extend its trend."}
          </p>
        </section>

        <section className={styles.panel}>
          <header className={styles.panelHead}>
            <span className={styles.panelTitle}>Finish setting up</span>
            <span className={styles.stepCount}>{stepsDone}/4</span>
          </header>
          <ul className={styles.steps}>
            {STEP_DEFS.map((step) => {
              const done = onboarding.steps[step.id];
              return (
                <li key={step.id} className={cn(styles.step, done && styles.stepDone)}>
                  <button
                    type="button"
                    className={styles.stepCheck}
                    onClick={() => !step.locked && setOnboardingStep(step.id, !done)}
                    disabled={step.locked}
                    aria-pressed={done}
                    aria-label={done ? `${step.title} (done)` : `Mark "${step.title}" done`}
                  >
                    {done && <Icon name="check" size={13} />}
                  </button>
                  <span className={styles.stepIcon} aria-hidden="true">
                    <Icon name={step.icon} size={15} />
                  </span>
                  <span className={styles.stepBody}>
                    <span className={styles.stepTitle}>{step.title}</span>
                    <span className={styles.stepText}>{step.text}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <section className={styles.panel}>
        <header className={styles.panelHead}>
          <span className={styles.panelTitle}>Tracked debt</span>
          <span className={styles.panelMeta}>{summary.openIssues} open</span>
        </header>
        {openIssues.length === 0 ? (
          <p className={styles.empty}>No open issues — your baselines are clean. 🎉</p>
        ) : (
          <>
            <ul className={styles.issueList}>
              {openIssues.slice(0, 6).map(({ host, path, issue, isRegression }) => (
                <li key={`${host}${path}-${issue.id}`} className={styles.issueRow}>
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
              ))}
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
