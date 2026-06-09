import { Button } from "@/components/ui";
import cn from "classnames";
import { PROJECTS } from "@/lib/data/dashboard";
import { ScoreRing } from "../shared/ScoreRing";
import { Sparkline } from "./Sparkline";
import styles from "./ProjectsTab.module.scss";

const STAT_COLORS = {
  critical: "oklch(0.72 0.20 20)",
  serious: "oklch(0.72 0.18 50)",
  moderate: "oklch(0.75 0.15 80)",
} as const;

export function ProjectsTab() {
  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.search}>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input type="text" placeholder="Search projects..." aria-label="Search projects" />
        </div>
        <Button href="/scan" size="sm">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add project
        </Button>
      </div>

      <div className={styles.grid}>
        {PROJECTS.map((p) => (
          <article className={styles.card} key={p.id}>
            <header className={styles.cardHeader}>
              <div className={styles.cardLogo}>
                <div className={styles.favicon}>🌐</div>
                <div className={styles.cardTitleWrap}>
                  <div className={styles.name}>{p.name}</div>
                  <div className={styles.url}>
                    {p.url}
                    {p.path}
                  </div>
                </div>
              </div>
              <ScoreRing score={p.score} />
            </header>

            <div className={styles.stats}>
              <Stat label="Critical" value={p.critical} color={STAT_COLORS.critical} />
              <Stat label="Serious" value={p.serious} color={STAT_COLORS.serious} />
              <Stat label="Moderate" value={p.moderate} color={STAT_COLORS.moderate} />
              <div className={styles.spark}>
                <Sparkline data={p.trend} />
              </div>
            </div>

            <footer className={styles.footer}>
              <span className={cn(styles.status, styles[`status_${p.status}`])}>
                {prettyStatus(p.status)}
              </span>
              <div className={styles.schedule}>
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                {p.lastScan}
              </div>
            </footer>
          </article>
        ))}
      </div>
    </>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={styles.stat}>
      <div className={styles.statValue} style={{ color }}>
        {value}
      </div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

function prettyStatus(status: string): string {
  switch (status) {
    case "passing":
      return "Passing";
    case "failing":
      return "Failing";
    case "scanning":
      return "Scanning now";
    default:
      return "Warning";
  }
}
