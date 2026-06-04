import cn from "classnames";
import { SEVERITY_LABEL, SEVERITY_ORDER } from "@/lib/scan/issues";
import type { FilterValue, SeverityCounts } from "@/lib/scan/issues";
import { CountUp } from "./CountUp";
import styles from "../ScanStudio.module.scss";

interface StatTilesProps {
  counts: SeverityCounts;
  total: number;
  filter: FilterValue;
  onFilter: (filter: FilterValue) => void;
}

// Severity tiles double as filter shortcuts. The "Total" tile clears the
// filter; each severity tile toggles that severity.
export const StatTiles = ({ counts, total, filter, onFilter }: StatTilesProps) => (
  <div className={styles.tiles}>
    <button
      type="button"
      className={cn(styles.tile, styles.tileTotal, filter === "all" && styles.tileActive)}
      onClick={() => onFilter("all")}
      aria-pressed={filter === "all"}
    >
      <span className={styles.tileNum}><CountUp value={total} /></span>
      <span className={styles.tileLabel}>Total issues</span>
    </button>

    {SEVERITY_ORDER.map((severity) => (
      <button
        key={severity}
        type="button"
        className={cn(styles.tile, styles[`tile_${severity}`], filter === severity && styles.tileActive)}
        onClick={() => onFilter(filter === severity ? "all" : severity)}
        aria-pressed={filter === severity}
        aria-label={`Filter to ${counts[severity]} ${SEVERITY_LABEL[severity]} issues`}
      >
        <span className={styles.tileNum}><CountUp value={counts[severity]} /></span>
        <span className={styles.tileLabel}>{SEVERITY_LABEL[severity]}</span>
      </button>
    ))}
  </div>
);
