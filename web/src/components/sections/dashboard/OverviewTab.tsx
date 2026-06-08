"use client";

import cn from "classnames";
import { ACTIVITY, PROJECTS, TREND_DATASETS } from "@/lib/data/dashboard";
import { useCountUp } from "@/lib/hooks/useCountUp";
import { colorForScore } from "./ScoreRing";
import { TrendChart } from "./TrendChart";
import styles from "./OverviewTab.module.scss";

export function OverviewTab() {
  const totals = PROJECTS.reduce(
    (acc, p) => ({
      critical: acc.critical + p.critical,
      serious: acc.serious + p.serious,
      moderate: acc.moderate + p.moderate,
      minor: acc.minor + p.minor,
    }),
    { critical: 0, serious: 0, moderate: 0, minor: 0 },
  );

  const totalIssues = totals.critical + totals.serious + totals.moderate + totals.minor;
  const avgScore = Math.round(PROJECTS.reduce((acc, p) => acc + p.score, 0) / PROJECTS.length);

  const animatedScore = useCountUp(avgScore, 1000);
  const animatedCrit = useCountUp(totals.critical, 800);
  const animatedTotal = useCountUp(totalIssues, 900);
  const animatedFixed = useCountUp(24, 700);

  return (
    <>
      <div className={styles.statRow}>
        <article className={styles.tile}>
          <div className={styles.tileLabel}>Avg. Score</div>
          <div className={styles.tileValue} style={{ color: colorForScore(avgScore) }}>
            {animatedScore}
            <span className={styles.tileUnit}>/100</span>
          </div>
          <div className={cn(styles.delta, styles.deltaUp)}>↑ +4 pts this week</div>
        </article>

        <article className={cn(styles.tile, styles.tileCritical)}>
          <div className={styles.tileLabel}>Critical Issues</div>
          <div className={styles.tileValue} style={{ color: "oklch(0.72 0.20 20)" }}>
            {animatedCrit}
          </div>
          <div className={cn(styles.delta, styles.deltaDown)}>↑ +3 since last scan</div>
        </article>

        <article className={styles.tile}>
          <div className={styles.tileLabel}>Total Open Issues</div>
          <div className={styles.tileValue}>{animatedTotal}</div>
          <div className={cn(styles.delta, styles.deltaUp)}>↓ −8 this week</div>
        </article>

        <article className={cn(styles.tile, styles.tileResolved)}>
          <div className={styles.tileLabel}>Resolved this week</div>
          <div className={styles.tileValue} style={{ color: "var(--green)" }}>
            {animatedFixed}
          </div>
          <div className={cn(styles.delta, styles.deltaUp)}>↑ +12 vs last week</div>
        </article>
      </div>

      <div className={styles.chartCard}>
        <header className={styles.chartHeader}>
          <span className={styles.chartTitle}>Issue trend — last 8 weeks</span>
          <div className={styles.legend}>
            {TREND_DATASETS.map((d) => (
              <div key={d.label} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: d.color }} />
                {d.label}
              </div>
            ))}
          </div>
        </header>
        <TrendChart />
      </div>

      <div className={styles.twoCol}>
        <section>
          <header className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>Projects</div>
            <a href="#" className={styles.viewAll}>
              View all →
            </a>
          </header>
          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Score</th>
                  <th>Issues</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {PROJECTS.slice(0, 5).map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className={styles.projectName}>{p.name}</div>
                      <div className={styles.url}>
                        <span className={styles.urlHost}>{p.url}</span>
                        {p.path}
                      </div>
                    </td>
                    <td>
                      <div className={styles.scoreWrap}>
                        <div className={styles.scoreBg}>
                          <div
                            className={styles.scoreFill}
                            style={{ width: `${p.score}%`, background: colorForScore(p.score) }}
                          />
                        </div>
                        <span className={styles.scoreVal} style={{ color: colorForScore(p.score) }}>
                          {p.score}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.issueCount}>
                        <span className={styles.critical}>{p.critical}</span>
                        <span className={styles.divider}> / </span>
                        <span>{p.serious + p.moderate + p.minor}</span>
                      </span>
                    </td>
                    <td>
                      <span className={cn(styles.status, styles[`status_${p.status}`])}>
                        {prettyStatus(p.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <header className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>Recent activity</div>
          </header>
          <div className={styles.activityCard}>
            {ACTIVITY.map((item, i) => (
              <div key={i} className={styles.activityItem}>
                <div className={styles.activityIcon} style={{ background: item.background }}>
                  {item.icon}
                </div>
                <div>
                  <div className={styles.activityText}>{item.text}</div>
                  <div className={styles.activityTime}>{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function prettyStatus(status: string): string {
  switch (status) {
    case "passing":
      return "Passing";
    case "failing":
      return "Failing";
    case "scanning":
      return "Scanning";
    default:
      return "Warning";
  }
}
