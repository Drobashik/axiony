import { Icon } from "@/components/ui";
import type { ProjectOverviewModel } from "../../types";
import styles from "./ProjectInsights.module.scss";

interface ProjectInsightsProps {
  model: ProjectOverviewModel;
}

export const ProjectInsights = ({ model }: ProjectInsightsProps) => {
  if (model.insights.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="project-insights-title">
      <header className={styles.header}>
        <div>
          <span className={styles.kicker}>Understand</span>
          <h3 id="project-insights-title">Project insights</h3>
        </div>
        <span className={styles.meta}>Based on current scan history</span>
      </header>
      <div className={styles.grid}>
        {model.insights.map((insight) => (
          <article key={insight.id} className={styles.card} data-tone={insight.tone}>
            <span className={styles.icon}>
              <Icon name={insight.icon} size={16} />
            </span>
            <div>
              <h4>{insight.title}</h4>
              <p>{insight.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
