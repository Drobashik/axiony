import cn from "classnames";
import { Icon } from "@/components/ui";
import { AI_FIX_LINES, COMMAND_ISSUES, INTEGRATION_CHECKS } from "../data";
import styles from "../Solution.module.scss";

const baselinePoints = [
  [18, 118],
  [76, 106],
  [132, 110],
  [188, 86],
  [244, 72],
  [302, 48],
] as const;

const baselineLine = baselinePoints.map(([x, y]) => `${x},${y}`).join(" ");
const baselineArea = `${baselineLine} 302,136 18,136`;

export const FixCommandCenter = () => (
  <div className={styles.commandCenter} aria-label="Axiony fix workflow preview">
    <div className={styles.commandTop}>
      <div>
        <span className={styles.commandKicker}>Axiony workspace</span>
        <h3 className={styles.commandTitle}>Everything after the scan, connected.</h3>
      </div>
      <div className={styles.commandStatus} aria-label="Current workspace score">
        <span className={styles.statusPulse} aria-hidden="true" />
        <span>baseline +14 this sprint</span>
      </div>
    </div>

    <div className={styles.commandGrid}>
      <section className={cn(styles.commandPanel, styles.issuePanel)}>
        <div className={styles.panelHead}>
          <span>Issue tracking</span>
          <code>17 open</code>
        </div>

        <div className={styles.issueList}>
          {COMMAND_ISSUES.map((issue) => (
            <article
              key={`${issue.rule}-${issue.target}`}
              className={cn(styles.issueCard, styles[`issue_${issue.tone}`])}
            >
              <div className={styles.issueTop}>
                <code>{issue.rule}</code>
                <span>{issue.status}</span>
              </div>
              <strong>{issue.title}</strong>
              <div className={styles.issueMeta}>
                <span>{issue.target}</span>
                <span>{issue.owner}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={cn(styles.commandPanel, styles.aiPanel)}>
        <div className={styles.aiHeader}>
          <span className={styles.aiIcon}>
            <Icon name="bolt" size={16} />
          </span>
          <div>
            <span className={styles.panelEyebrow}>AI fix ready</span>
            <h4>From “button-name” to reviewable code.</h4>
          </div>
        </div>

        <div className={styles.fixSummary}>
          <span>Root cause</span>
          <p>
            Icon-only control is announced as “button”. Add an accessible name that matches intent.
          </p>
        </div>

        <pre className={styles.diff} aria-label="Suggested code change">
          {AI_FIX_LINES.map((line) => (
            <code key={`${line.type}-${line.code}`} className={styles[`diff_${line.type}`]}>
              <span>{line.type === "add" ? "+" : line.type === "remove" ? "-" : " "}</span>
              {line.code}
            </code>
          ))}
        </pre>

        <div className={styles.aiFooter}>
          <span>
            <Icon name="check" size={14} />
            Explain fix
          </span>
          <span>
            <Icon name="code" size={14} />
            Create patch
          </span>
          <span>
            <Icon name="ci" size={14} />
            Re-scan
          </span>
        </div>
      </section>

      <section className={cn(styles.commandPanel, styles.signalPanel)}>
        <div className={styles.panelHead}>
          <span>Baseline graph</span>
          <code>WCAG score</code>
        </div>

        <div className={styles.chartWrap}>
          <svg viewBox="0 0 320 154" className={styles.baselineChart} aria-hidden="true">
            <path className={styles.chartGrid} d="M18 48H302M18 92H302M18 136H302" />
            <polygon className={styles.baselineArea} points={baselineArea} />
            <polyline className={styles.baselineLine} points={baselineLine} />
            {baselinePoints.map(([x, y], index) => (
              <circle
                key={`${x}-${y}`}
                className={styles.baselineDot}
                cx={x}
                cy={y}
                r={index === 5 ? 5 : 3.5}
              />
            ))}
          </svg>
          <div className={styles.chartLegend}>
            <strong>78 → 92</strong>
            <span>new issues blocked, old debt paid down</span>
          </div>
        </div>

        <div className={styles.integrationList}>
          {INTEGRATION_CHECKS.map((check) => (
            <article
              key={check.name}
              className={cn(styles.integrationCard, styles[`integration_${check.tone}`])}
            >
              <span>{check.name}</span>
              <strong>{check.label}</strong>
              <small>{check.status}</small>
            </article>
          ))}
        </div>
      </section>
    </div>
  </div>
);
