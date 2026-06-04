import type { CSSProperties } from "react";
import { Icon, Terminal } from "@/components/ui";
import type { TerminalLine } from "@/components/ui";
import cn from "classnames";
import { SCAN_PHASES } from "../data";
import { phaseForProgress } from "../hooks/useScanEngine";
import styles from "../ScanStudio.module.scss";

interface ScanStageProps {
  url: string;
  progress: number;
  lines: TerminalLine[];
  reduce: boolean;
}

const RADIUS = 32;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const ScanStage = ({ url, progress, lines, reduce }: ScanStageProps) => {
  const phase = phaseForProgress(progress);
  const offset = CIRCUMFERENCE * (1 - progress / 100);

  return (
    <div className={styles.stage}>
      <div className={styles.stageHead}>
        <div
          className={styles.progressRing}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Scan progress"
        >
          <svg viewBox="0 0 80 80" aria-hidden="true">
            <circle className={styles.ringTrack} cx="40" cy="40" r={RADIUS} />
            <circle
              className={cn(styles.ringProgress, reduce && styles.ringProgressStatic)}
              cx="40"
              cy="40"
              r={RADIUS}
              style={{ "--c": CIRCUMFERENCE, "--o": offset } as CSSProperties}
            />
          </svg>
          <span className={styles.ringPct}>{progress}%</span>
        </div>

        <div className={styles.stageMeta}>
          <strong>Scanning&hellip;</strong>
          <span className={styles.stageUrl}>{url}</span>
        </div>
      </div>

      {/* Announce phase changes without visual noise. */}
      <p className={styles.srOnly} role="status" aria-live="polite">
        {SCAN_PHASES[phase].label} — {progress}% complete
      </p>

      <ol className={styles.phases}>
        {SCAN_PHASES.map((item, index) => {
          const done = index < phase || progress >= 100;
          const active = index === phase && progress < 100;

          return (
            <li
              key={item.key}
              className={cn(styles.phase, done && styles.phaseDone, active && styles.phaseActive)}
              aria-current={active ? "step" : undefined}
            >
              <span className={styles.phaseIcon} aria-hidden="true">
                {done ? <Icon name="check" size={13} /> : <span className={styles.phaseNum}>{index + 1}</span>}
              </span>
              <span className={styles.phaseText}>
                <strong>{item.label}</strong>
                <span>{item.detail}</span>
              </span>
            </li>
          );
        })}
      </ol>

      <div className={styles.stageTerminal}>
        <Terminal filename="axiony — cloud scan" lines={lines} showCursor={!reduce && progress < 100} animated />
      </div>
    </div>
  );
};
