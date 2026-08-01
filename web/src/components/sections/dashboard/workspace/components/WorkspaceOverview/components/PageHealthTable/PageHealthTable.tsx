import type { CSSProperties } from "react";
import { Icon } from "@/components/ui";
import { relativeTime } from "@/lib/workspace";
import { colorForScore } from "@/components/sections/dashboard/shared/ScoreRing";
import type { FreshnessStatus, ProjectOverviewModel } from "../../types";
import styles from "./PageHealthTable.module.scss";

interface PageHealthTableProps {
  model: ProjectOverviewModel;
  onOpenPage?: (path: string) => void;
  onScan: () => void;
}

const FRESHNESS_LABEL: Record<FreshnessStatus, string> = {
  fresh: "Fresh",
  aging: "Aging",
  stale: "Stale",
  baseline: "Baseline only",
};

const signed = (value: number): string => (value === 0 ? "±0" : `${value > 0 ? "+" : ""}${value}`);

export const PageHealthTable = ({ model, onOpenPage, onScan }: PageHealthTableProps) => {
  const freshnessPercent = Math.round((model.freshPages / Math.max(1, model.pageCount)) * 100);

  return (
    <section className={styles.card} aria-labelledby="page-health-title">
      <header className={styles.header}>
        <div>
          <span className={styles.kicker}>Coverage</span>
          <h3 id="page-health-title">
            {model.isPageScope ? "Page health" : "Tracked page health"}
          </h3>
          <p>Current score, movement, issue load, and scan freshness.</p>
        </div>
        <div className={styles.coverage}>
          <div className={styles.coverageCopy}>
            <span>Fresh follow-ups</span>
            <strong>
              {model.freshPages}/{model.pageCount}
            </strong>
          </div>
          <span className={styles.coverageTrack} aria-hidden="true">
            <span
              className={styles.coverageFill}
              style={{ "--freshness": `${freshnessPercent}%` } as CSSProperties}
            />
          </span>
        </div>
      </header>

      <div className={styles.table}>
        <div className={styles.tableHead} aria-hidden="true">
          <span>Page</span>
          <span>Score</span>
          <span>Change</span>
          <span>Issues</span>
          <span>Freshness</span>
          <span>Last scan</span>
        </div>
        <ul className={styles.rows}>
          {model.pages.map((row) => (
            <li key={row.page.id} className={styles.row}>
              <button
                type="button"
                className={styles.pageButton}
                onClick={() => onOpenPage?.(row.page.path)}
                disabled={!onOpenPage || model.isPageScope}
              >
                <span className={styles.pageIdentity}>
                  <span className={styles.pageIcon}>
                    <Icon name="globe" size={14} />
                  </span>
                  <span>
                    <strong>{row.page.path}</strong>
                    <small>{row.page.level} conformance</small>
                  </span>
                </span>
                <span className={styles.cell} data-label="Score">
                  <strong className={styles.score} style={{ color: colorForScore(row.score) }}>
                    {row.score}
                  </strong>
                </span>
                <span className={styles.cell} data-label="Change">
                  <strong
                    className={
                      row.scoreDelta > 0
                        ? styles.positive
                        : row.scoreDelta < 0
                          ? styles.negative
                          : styles.neutral
                    }
                  >
                    {signed(row.scoreDelta)}
                  </strong>
                  <small>from baseline</small>
                </span>
                <span className={styles.cell} data-label="Issues">
                  <strong>{row.openIssues}</strong>
                  <small className={row.regressions > 0 ? styles.negative : undefined}>
                    {row.regressions > 0 ? `${row.regressions} new` : "No regressions"}
                  </small>
                </span>
                <span
                  className={styles.freshness}
                  data-label="Freshness"
                  data-status={row.freshness}
                >
                  <span aria-hidden="true" />
                  {FRESHNESS_LABEL[row.freshness]}
                </span>
                <span className={styles.cell} data-label="Last scan">
                  <strong>{relativeTime(row.lastScannedAt)}</strong>
                  <small>{row.page.scans.length} scans</small>
                </span>
              </button>
              <button
                type="button"
                className={styles.rescan}
                onClick={onScan}
                aria-label={`Re-scan ${row.page.path}`}
              >
                <Icon name="scan" size={13} />
                <span>Re-scan</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
