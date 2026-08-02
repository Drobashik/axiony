import { Badge, Button, Icon } from "@/components/ui";
import { locatedIssueKey, pageLabel, relativeTime } from "@/lib/workspace";
import { ProjectIcon } from "@/components/sections/dashboard/shared/ProjectIcon";
import type { PortfolioOverviewModel, WindowDays } from "../../types";
import { movementSummary, movementTone } from "../../utils";
import styles from "./PortfolioInsights.module.scss";

interface PortfolioInsightsProps {
  model: PortfolioOverviewModel;
  windowDays: WindowDays;
  onIssues: () => void;
  onScan: () => void;
}

export const PortfolioInsights = ({
  model,
  windowDays,
  onIssues,
  onScan,
}: PortfolioInsightsProps) => (
  <>
    <section className={styles.movementCard} aria-labelledby="movement-title">
      <header className={styles.header}>
        <div>
          <span className={styles.cardKicker}>Activity</span>
          <h3 id="movement-title">What changed</h3>
          <p>
            {model.digest.followupScans > 0
              ? `Last ${windowDays} days: ${model.movementParts.join(" · ") || "no issue movement"}.`
              : `No follow-up changes in the last ${windowDays} days.`}
          </p>
        </div>
      </header>

      {model.digest.events.length > 0 ? (
        <ul className={styles.movementList}>
          {model.digest.events.slice(0, 4).map((event) => (
            <li key={`${event.id}-${event.scannedAt}`}>
              <span className={styles.movementIcon} data-tone={movementTone(event)}>
                <Icon
                  name={event.regressions > 0 ? "bolt" : event.resolved > 0 ? "check" : "scan"}
                  size={14}
                />
              </span>
              <span className={styles.movementMain}>
                <strong>{event.label}</strong>
                <span>{movementSummary(event)}</span>
              </span>
              <time dateTime={event.scannedAt}>{relativeTime(event.scannedAt)}</time>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.activityEmpty}>
          <p>Run a follow-up scan to start tracking fixes and regressions across projects.</p>
          <Button size="sm" variant="secondary" onClick={onScan}>
            <Icon name="scan" size={14} />
            Run follow-up scan
          </Button>
        </div>
      )}
    </section>

    <section className={styles.issuesCard} aria-labelledby="priority-issues-title">
      <header className={styles.header}>
        <div>
          <span className={styles.cardKicker}>Across projects</span>
          <h3 id="priority-issues-title">Priority issues</h3>
          <p>Regressions and highest-severity debt to review next.</p>
        </div>
      </header>

      {model.issues.length > 0 ? (
        <>
          <ul className={styles.issueList}>
            {model.issues.slice(0, 5).map((located, index) => (
              <li key={locatedIssueKey(located, index)}>
                <Badge severity={located.issue.severity} />
                <ProjectIcon
                  host={located.host}
                  url={located.url}
                  iconUrl={located.iconUrl}
                  iconAppearance={located.iconAppearance}
                  size={24}
                />
                <span className={styles.issueMain}>
                  <strong>{located.issue.title}</strong>
                  <span>
                    {pageLabel(located.host, located.path)} · {located.issue.rule}
                  </span>
                </span>
                {located.isRegression && <span className={styles.newPill}>New</span>}
                <span className={styles.issueCount}>×{located.issue.count}</span>
              </li>
            ))}
          </ul>
          <button type="button" className={styles.textLink} onClick={onIssues}>
            View all {model.issues.length} issues
            <Icon name="arrow" size={13} />
          </button>
        </>
      ) : (
        <div className={styles.cleanState}>
          <span className={styles.cleanIcon}>
            <Icon name="check" size={20} />
          </span>
          <strong>No open issues</strong>
          <p>Your tracked pages are currently clean.</p>
        </div>
      )}
    </section>
  </>
);
