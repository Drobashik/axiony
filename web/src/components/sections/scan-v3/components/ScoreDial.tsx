import type { CSSProperties } from "react";
import cn from "classnames";
import { scoreGrade } from "@/lib/scan/issues";
import { CountUp } from "./CountUp";
import styles from "../ScanStudio.module.scss";

interface ScoreDialProps {
  score: number;
  reduce: boolean;
}

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const bandFor = (score: number): "green" | "blue" | "moderate" | "critical" => {
  if (score >= 90) return "green";
  if (score >= 75) return "blue";
  if (score >= 60) return "moderate";
  return "critical";
};

export const ScoreDial = ({ score, reduce }: ScoreDialProps) => {
  const offset = CIRCUMFERENCE * (1 - score / 100);
  const band = bandFor(score);
  const grade = scoreGrade(score);

  return (
    <div className={cn(styles.dial, styles[`dial_${band}`])}>
      <div className={styles.dialRing}>
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle className={styles.dialTrack} cx="50" cy="50" r={RADIUS} />
          <circle
            className={cn(styles.dialFill, reduce && styles.dialFillStatic)}
            cx="50"
            cy="50"
            r={RADIUS}
            style={{ "--c": CIRCUMFERENCE, "--o": offset } as CSSProperties}
          />
        </svg>
        <div className={styles.dialCenter}>
          <span className={styles.dialScore}>
            <CountUp value={score} durationMs={1000} />
          </span>
          <span className={styles.dialOutOf}>/ 100</span>
        </div>
      </div>

      <div className={styles.dialMeta}>
        <span className={styles.dialGrade}>{grade.letter}</span>
        <span className={styles.dialGradeLabel}>{grade.label}</span>
        <span className={styles.dialCaption}>Accessibility score</span>
      </div>
    </div>
  );
};
