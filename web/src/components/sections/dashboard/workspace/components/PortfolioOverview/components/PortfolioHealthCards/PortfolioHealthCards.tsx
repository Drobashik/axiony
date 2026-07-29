import cn from "classnames";
import { SeverityBar } from "@/components/sections/scan/components/SeverityBar";
import { Icon } from "@/components/ui";
import { ProjectIcon } from "@/components/sections/dashboard/shared/ProjectIcon";
import { ScoreRing, colorForScore } from "@/components/sections/dashboard/shared/ScoreRing";
import type { PortfolioOverviewModel, WindowDays } from "../../types";
import { scoreStatus, signed } from "../../utils";
import styles from "./PortfolioHealthCards.module.scss";

interface PortfolioHealthCardsProps {
  model: PortfolioOverviewModel;
  windowDays: WindowDays;
  onProjects: () => void;
  onOpenProject: (projectId: string) => void;
}

export const PortfolioHealthCards = ({
  model,
  windowDays,
  onProjects,
  onOpenProject,
}: PortfolioHealthCardsProps) => (
  <>
    <section className={styles.healthCard} aria-labelledby="portfolio-health-title">
      <div className={styles.healthLead}>
        <ScoreRing score={model.summary.avgScore} size={86} />
        <div className={styles.healthCopy}>
          <span className={styles.cardKicker}>Portfolio health</span>
          <h3 id="portfolio-health-title">
            {scoreStatus(model.summary.avgScore)}
            <span
              className={cn(
                styles.scoreDelta,
                model.scoreDelta > 0
                  ? styles.positive
                  : model.scoreDelta < 0
                    ? styles.negative
                    : styles.neutral,
              )}
            >
              {signed(model.scoreDelta)} from baseline
            </span>
          </h3>
          <p>{model.support}</p>
        </div>
      </div>

      <SeverityBar counts={model.summary.counts} total={model.summary.openIssues} />

      <div className={styles.healthStats}>
        <span className={styles.healthStat}>
          <strong>{model.summary.openIssues}</strong>
          <span>Open now</span>
        </span>
        <span className={styles.healthStat}>
          <strong className={model.summary.counts.critical > 0 ? styles.critical : undefined}>
            {model.summary.counts.critical}
          </strong>
          <span>Critical</span>
        </span>
        <span className={styles.healthStat}>
          <strong className={styles.positive}>{model.digest.resolved}</strong>
          <span>Fixed · {windowDays}d</span>
        </span>
        <span className={styles.healthStat}>
          <strong className={model.digest.regressions > 0 ? styles.negative : styles.positive}>
            {model.digest.regressions}
          </strong>
          <span>New · {windowDays}d</span>
        </span>
      </div>
    </section>

    <section className={styles.attentionCard} aria-labelledby="attention-title">
      <header className={styles.cardHeader}>
        <div>
          <span className={styles.cardKicker}>Priorities</span>
          <h3 id="attention-title">Needs attention</h3>
        </div>
        <span className={styles.attentionCount}>{model.attention.length}</span>
      </header>

      {model.attention.length > 0 ? (
        <ul className={styles.attentionList}>
          {model.attention.slice(0, 3).map((row) => (
            <li key={row.project.id}>
              <button
                type="button"
                className={styles.attentionRow}
                onClick={() => onOpenProject(row.project.id)}
              >
                <ProjectIcon
                  host={row.project.host}
                  url={row.project.pages[0]?.url}
                  iconUrl={row.project.iconUrl}
                  size={32}
                />
                <span className={styles.attentionMain}>
                  <span className={styles.attentionHost}>{row.project.host}</span>
                  <span className={styles.attentionReason}>{row.attentionReason}</span>
                </span>
                <span className={styles.attentionScore} style={{ color: colorForScore(row.score) }}>
                  {row.score}
                </span>
                <Icon name="arrow" size={14} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.cleanState}>
          <span className={styles.cleanIcon}>
            <Icon name="check" size={20} />
          </span>
          <strong>Everything looks stable</strong>
          <p>No new regressions or critical issues need your attention.</p>
        </div>
      )}

      {model.attention.length > 3 && (
        <button type="button" className={styles.textLink} onClick={onProjects}>
          Review all {model.attention.length} projects
          <Icon name="arrow" size={13} />
        </button>
      )}
    </section>
  </>
);
