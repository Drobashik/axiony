import { Badge, Icon } from "@/components/ui";
import type { ProjectOverviewModel } from "../../types";
import { NextActionBanner } from "../NextActionBanner";
import { TrendChart } from "../TrendChart";
import styles from "./ProjectFocus.module.scss";

interface ProjectFocusProps {
  model: ProjectOverviewModel;
  reduceMotion: boolean;
  onNextAction: () => void;
  onIssues: () => void;
}

const plural = (value: number, word: string): string => `${value} ${word}${value === 1 ? "" : "s"}`;

export const ProjectFocus = ({
  model,
  reduceMotion,
  onNextAction,
  onIssues,
}: ProjectFocusProps) => (
  <div className={styles.grid}>
    <section className={styles.trendCard} aria-labelledby="trend-title">
      <header className={styles.header}>
        <div>
          <span className={styles.kicker}>Monitor</span>
          <h3 id="trend-title">{model.isPageScope ? "Page trend" : "Project trend"}</h3>
          <p>Switch between accessibility score and open issue movement.</p>
        </div>
        <span className={styles.meta}>{plural(model.scanCount, "scan")}</span>
      </header>
      <TrendChart
        points={model.trend}
        baselineScore={model.baselineTrendScore}
        baselineTotal={model.baselineTrendTotal}
        reduce={reduceMotion}
      />
      <p className={styles.hint}>
        {model.scanCount > model.pageCount
          ? "Every follow-up extends this comparison without replacing the saved baseline."
          : "Run a follow-up scan to start tracking change over time."}
      </p>
    </section>

    <aside className={styles.rail} aria-label="Recommended actions">
      <NextActionBanner model={model} onAction={onNextAction} />

      <section className={styles.priorityCard} aria-labelledby="priority-title">
        <header className={styles.header}>
          <div>
            <span className={styles.kicker}>Fix first</span>
            <h3 id="priority-title">Highest-impact fixes</h3>
            <p>Grouped by rule, severity, and affected pages.</p>
          </div>
        </header>

        {model.priorities.length > 0 ? (
          <ol className={styles.priorityList}>
            {model.priorities.map((priority, index) => (
              <li key={priority.key}>
                <button type="button" className={styles.priority} onClick={onIssues}>
                  <span className={styles.index}>{index + 1}</span>
                  <span className={styles.priorityMain}>
                    <span className={styles.priorityTitle}>
                      {priority.title}
                      {priority.isRegression && <span className={styles.newPill}>New</span>}
                    </span>
                    <span className={styles.priorityMeta}>
                      {plural(priority.occurrences, "instance")} · {plural(priority.pages, "page")}
                    </span>
                    <code>{priority.rule}</code>
                  </span>
                  <Badge severity={priority.severity} />
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <div className={styles.empty}>
            <span>
              <Icon name="check" size={18} />
            </span>
            <strong>No priority fixes right now</strong>
            <p>The current scope has no actionable accessibility debt.</p>
          </div>
        )}

        {model.priorities.length > 0 && (
          <button type="button" className={styles.viewAll} onClick={onIssues}>
            Review all {model.openIssues} open issues
            <Icon name="arrow" size={13} />
          </button>
        )}
      </section>
    </aside>
  </div>
);
