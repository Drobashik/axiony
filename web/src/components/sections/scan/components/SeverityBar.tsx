import type { CSSProperties } from "react";
import cn from "classnames";
import { SEVERITY_LABEL, SEVERITY_ORDER } from "@/lib/scan/issues";
import type { SeverityCounts } from "@/lib/scan/issues";
import styles from "../ScanStudio.module.scss";

interface SeverityBarProps {
  counts: SeverityCounts;
  total: number;
}

// Stacked distribution bar. Colour + a per-segment label keep it readable
// without relying on colour alone; a text legend sits below.
export const SeverityBar = ({ counts, total }: SeverityBarProps) => (
  <div className={styles.sevBar}>
    <div
      className={styles.sevTrack}
      role="img"
      aria-label={SEVERITY_ORDER.map((s) => `${counts[s]} ${SEVERITY_LABEL[s]}`).join(", ")}
    >
      {SEVERITY_ORDER.filter((s) => counts[s] > 0).map((severity, i) => (
        <span
          key={severity}
          className={cn(styles.sevSeg, styles[`sevSeg_${severity}`])}
          style={
            {
              flexGrow: counts[severity],
              "--seg-delay": `${i * 0.08}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>

    <ul className={styles.sevLegend}>
      {SEVERITY_ORDER.map((severity) => (
        <li key={severity} className={styles.sevLegendItem}>
          <span className={cn(styles.sevDot, styles[`sevSeg_${severity}`])} aria-hidden="true" />
          <span className={styles.sevLegendLabel}>{SEVERITY_LABEL[severity]}</span>
          <span className={styles.sevLegendCount}>{counts[severity]}</span>
        </li>
      ))}
      <li className={cn(styles.sevLegendItem, styles.sevLegendTotal)}>
        <span className={styles.sevLegendLabel}>Total</span>
        <span className={styles.sevLegendCount}>{total}</span>
      </li>
    </ul>
  </div>
);
