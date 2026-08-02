import { Button, Icon } from "@/components/ui";
import { SeverityBar } from "@/components/sections/scan/components/SeverityBar";
import { relativeTime } from "@/lib/workspace";
import { ProjectIcon } from "@/components/sections/dashboard/shared/ProjectIcon";
import { ScoreRing, colorForScore } from "@/components/sections/dashboard/shared/ScoreRing";
import type { ProjectOverviewModel } from "../../types";
import styles from "./ProjectHealthHero.module.scss";

interface ProjectHealthHeroProps {
  model: ProjectOverviewModel;
  onScan: () => void;
  onShowProject?: () => void;
}

const plural = (value: number, word: string): string => `${value} ${word}${value === 1 ? "" : "s"}`;

const signed = (value: number): string => (value === 0 ? "±0" : `${value > 0 ? "+" : ""}${value}`);

const fixed = (value: number): string => (value > 0 ? `+${value}` : `${value}`);

const scoreTone = (score: number): "good" | "watch" | "risk" => {
  if (score >= 80) {
    return "good";
  }

  if (score >= 60) {
    return "watch";
  }

  return "risk";
};

export const ProjectHealthHero = ({ model, onScan, onShowProject }: ProjectHealthHeroProps) => (
  <section className={styles.hero} data-score-tone={scoreTone(model.score)}>
    <header className={styles.header}>
      <div className={styles.identity}>
        <ProjectIcon
          host={model.project.host}
          url={model.url}
          iconUrl={model.project.iconUrl}
          iconAppearance={model.project.iconAppearance}
          size={48}
        />
        <div className={styles.identityCopy}>
          <span className={styles.kicker}>
            {model.isPageScope ? "Tracked page" : "Project health"}
          </span>
          <h2>{model.label}</h2>
          <div className={styles.meta}>
            <a href={model.url} target="_blank" rel="noreferrer">
              {model.url}
              <Icon name="arrow" size={11} />
            </a>
            <span aria-hidden="true">·</span>
            <span className={styles.monitoring}>
              <span aria-hidden="true" /> Monitoring
            </span>
            <span aria-hidden="true">·</span>
            <span>{plural(model.pageCount, "page")}</span>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        {model.isPageScope && onShowProject && (
          <Button size="sm" variant="secondary" onClick={onShowProject}>
            All project pages
          </Button>
        )}
        <Button size="sm" onClick={onScan}>
          <Icon name="scan" size={14} />
          Re-scan
        </Button>
      </div>
    </header>

    <div className={styles.health}>
      <div className={styles.scoreBlock}>
        <ScoreRing score={model.score} size={96} />
        <div className={styles.healthCopy}>
          <span className={styles.healthLabel}>Current health</span>
          <h3>{model.healthTitle}</h3>
          <p>{model.healthText}</p>
          <span
            className={styles.scoreDelta}
            data-tone={model.scoreDelta > 0 ? "up" : model.scoreDelta < 0 ? "down" : "flat"}
          >
            <strong style={{ color: colorForScore(model.score) }}>
              {signed(model.scoreDelta)}
            </strong>
            from baseline score {model.baselineScore}
          </span>
        </div>
      </div>

      <dl className={styles.metrics}>
        <div>
          <dt>Open now</dt>
          <dd>{model.openIssues}</dd>
        </div>
        <div data-alert={model.severityCounts.critical > 0 || undefined}>
          <dt>Critical</dt>
          <dd>{model.severityCounts.critical}</dd>
        </div>
        <div>
          <dt>Pages</dt>
          <dd>{model.pageCount}</dd>
        </div>
        <div>
          <dt>Last scan</dt>
          <dd className={styles.metricText}>{relativeTime(model.lastScannedAt)}</dd>
        </div>
      </dl>
    </div>

    <div className={styles.severityBreakdown}>
      <SeverityBar counts={model.severityCounts} total={model.openIssues} />
    </div>

    <div className={styles.changeStrip}>
      {model.digest.hasFollowups ? (
        <>
          <span className={styles.changeLabel}>Last {model.digest.windowDays} days</span>
          <span className={styles.changeItem} data-tone="good">
            <strong>{fixed(model.digest.resolved)}</strong>
            Fixed
          </span>
          <span
            className={styles.changeItem}
            data-tone={model.digest.regressions > 0 ? "risk" : "good"}
          >
            <strong>{model.digest.regressions}</strong>
            New
          </span>
          <span
            className={styles.changeItem}
            data-tone={
              model.digest.netScoreDelta > 0
                ? "good"
                : model.digest.netScoreDelta < 0
                  ? "risk"
                  : "neutral"
            }
          >
            <strong>{signed(model.digest.netScoreDelta)}</strong>
            Score
          </span>
          <span className={styles.changeItem}>
            <strong>{model.digest.changedPages}</strong>
            Changed pages
          </span>
        </>
      ) : (
        <span className={styles.baselineNote}>
          <Icon name="check" size={14} />
          Baseline ready · The next scan will start change tracking
        </span>
      )}
    </div>
  </section>
);
