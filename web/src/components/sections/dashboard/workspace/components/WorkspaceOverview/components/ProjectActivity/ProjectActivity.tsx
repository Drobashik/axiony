import { Icon } from "@/components/ui";
import { pageLabel, relativeTime } from "@/lib/workspace";
import type { ProjectOverviewModel } from "../../types";
import styles from "./ProjectActivity.module.scss";

interface ProjectActivityProps {
  model: ProjectOverviewModel;
  onScan: () => void;
}

const signed = (value: number): string => (value === 0 ? "±0" : `${value > 0 ? "+" : ""}${value}`);

const activitySummary = (item: ProjectOverviewModel["activity"][number]): string => {
  if (item.isBaseline) return "Baseline created";

  const parts = [];

  if (item.resolved > 0) parts.push(`${item.resolved} fixed`);

  if (item.regressions > 0) parts.push(`${item.regressions} new`);

  if (item.scoreDelta !== 0) parts.push(`score ${signed(item.scoreDelta)}`);

  return parts.length > 0 ? parts.join(" · ") : "No issue movement";
};

export const ProjectActivity = ({ model, onScan }: ProjectActivityProps) => (
  <section className={styles.card} aria-labelledby="activity-title">
    <header className={styles.header}>
      <div>
        <span className={styles.kicker}>History</span>
        <h3 id="activity-title">Recent scan activity</h3>
        <p>Every baseline and follow-up remains visible as the project evolves.</p>
      </div>
      <button type="button" className={styles.scanLink} onClick={onScan}>
        Run another scan
        <Icon name="arrow" size={13} />
      </button>
    </header>

    <ol className={styles.timeline}>
      {model.activity.map((item) => {
        const tone = item.regressions > 0 ? "risk" : item.resolved > 0 ? "good" : "neutral";
        return (
          <li key={item.id} className={styles.event} data-tone={tone}>
            <span className={styles.marker} aria-hidden="true">
              <Icon
                name={item.isBaseline ? "globe" : item.regressions > 0 ? "bolt" : "scan"}
                size={13}
              />
            </span>
            <span className={styles.eventMain}>
              <strong>{pageLabel(model.project.host, item.page.path)}</strong>
              <span>{activitySummary(item)}</span>
            </span>
            <span className={styles.eventScore}>
              <strong>{item.score}</strong>
              <small>score</small>
            </span>
            <time dateTime={item.scannedAt}>{relativeTime(item.scannedAt)}</time>
          </li>
        );
      })}
    </ol>
  </section>
);
