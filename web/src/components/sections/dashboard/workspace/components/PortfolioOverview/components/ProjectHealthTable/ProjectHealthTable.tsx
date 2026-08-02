import type { CSSProperties } from "react";
import { Icon } from "@/components/ui";
import { relativeTime } from "@/lib/workspace";
import { ProjectIcon } from "@/components/sections/dashboard/shared/ProjectIcon";
import { colorForScore } from "@/components/sections/dashboard/shared/ScoreRing";
import type { PortfolioOverviewModel, WindowDays } from "../../types";
import { movementLabel, plural, signed } from "../../utils";
import styles from "./ProjectHealthTable.module.scss";

interface ProjectHealthTableProps {
  model: PortfolioOverviewModel;
  windowDays: WindowDays;
  onProjects: () => void;
  onOpenProject: (projectId: string) => void;
}

export const ProjectHealthTable = ({
  model,
  windowDays,
  onProjects,
  onOpenProject,
}: ProjectHealthTableProps) => (
  <section className={styles.card} aria-labelledby="project-health-title">
    <header className={styles.header}>
      <div>
        <span className={styles.cardKicker}>Compare</span>
        <h3 id="project-health-title">Project health</h3>
        <p>Current health, recent movement, and scan coverage in one view.</p>
      </div>
      <button type="button" className={styles.textLink} onClick={onProjects}>
        View projects
        <Icon name="arrow" size={13} />
      </button>
    </header>

    <div className={styles.table}>
      <div className={styles.tableHead} aria-hidden="true">
        <span>Project</span>
        <span>Score</span>
        <span>Issues</span>
        <span>Movement</span>
        <span>Coverage</span>
        <span>Last scan</span>
        <span />
      </div>
      <ul className={styles.rows}>
        {[...model.rows]
          .sort((left, right) => right.attentionPriority - left.attentionPriority)
          .map((row) => (
            <li key={row.project.id}>
              <button
                type="button"
                className={styles.row}
                onClick={() => onOpenProject(row.project.id)}
              >
                <span className={styles.identity}>
                  <ProjectIcon
                    host={row.project.host}
                    url={row.project.pages[0]?.url}
                    iconUrl={row.project.iconUrl}
                    iconAppearance={row.project.iconAppearance}
                    size={36}
                  />
                  <span className={styles.identityCopy}>
                    <strong>{row.project.host}</strong>
                    <span>{plural(row.pageCount, "page")}</span>
                  </span>
                </span>
                <span className={styles.cell} data-label="Score">
                  <strong style={{ color: colorForScore(row.score) }}>{row.score}</strong>
                  <small
                    className={
                      row.scoreDelta > 0
                        ? styles.positive
                        : row.scoreDelta < 0
                          ? styles.negative
                          : styles.neutral
                    }
                  >
                    {signed(row.scoreDelta)} baseline
                  </small>
                </span>
                <span className={styles.cell} data-label="Issues">
                  <strong>{row.openIssues}</strong>
                  <small>
                    {row.critical > 0
                      ? plural(row.critical, "critical")
                      : row.serious > 0
                        ? plural(row.serious, "serious")
                        : "No high risk"}
                  </small>
                </span>
                <span className={styles.cell} data-label="Movement">
                  <strong
                    className={
                      row.regressions > 0
                        ? styles.negative
                        : row.resolved > 0 || row.movementScore > 0
                          ? styles.positive
                          : undefined
                    }
                  >
                    {movementLabel(row)}
                  </strong>
                  <small>Last {windowDays} days</small>
                </span>
                <span className={styles.coverageCell} data-label="Coverage">
                  <span className={styles.coverageTrack} aria-hidden="true">
                    <span
                      className={styles.coverageFill}
                      style={
                        {
                          "--coverage": `${(row.recentPages / Math.max(1, row.pageCount)) * 100}%`,
                        } as CSSProperties
                      }
                    />
                  </span>
                  <small>
                    {row.recentPages}/{row.pageCount} recent
                  </small>
                </span>
                <span className={styles.cell} data-label="Last scan">
                  <strong>{relativeTime(row.lastScannedAt)}</strong>
                  <small>{row.lastScannedAt ? "Latest page" : "No scan yet"}</small>
                </span>
                <span className={styles.rowArrow}>
                  <Icon name="arrow" size={14} />
                </span>
              </button>
            </li>
          ))}
      </ul>
    </div>
  </section>
);
