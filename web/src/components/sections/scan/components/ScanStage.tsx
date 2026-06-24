import type { CSSProperties } from "react";
import cn from "classnames";
import type { TerminalLine } from "@/components/ui";
import { SCAN_PHASES } from "../data";
import { phaseForProgress } from "../hooks/useScanEngine";
import { ScanBeacon } from "./ScanBeacon";
import { ScanConsole } from "./ScanConsole";
import { StopIcon } from "./icons";
import styles from "../ScanStudio.module.scss";

interface ScanStageProps {
  url: string;
  progress: number;
  lines: TerminalLine[];
  reduce: boolean;
  status?: "scanning" | "failed";
  onStop?: () => void;
}

const RADIUS = 30;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const hostOf = (value: string): string => {
  if (!value) return "";
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value.replace(/^https?:\/\//, "").split("/")[0] ?? value;
  }
};

export const ScanStage = ({
  url,
  progress,
  lines,
  reduce,
  status = "scanning",
  onStop,
}: ScanStageProps) => {
  const failed = status === "failed";
  const phase = phaseForProgress(progress);
  const phaseLabel = SCAN_PHASES[phase].label;
  const offset = CIRCUMFERENCE * (1 - Math.min(100, progress) / 100);
  const host = hostOf(url);
  const showStop = !failed && Boolean(onStop);

  return (
    <div className={cn(styles.stage, !failed ? styles.stageScanning : styles.stageFailed)}>
      <ScanBeacon host={host} reduce={reduce} failed={failed} />

      <div className={styles.stageHead}>
        <div
          className={cn(styles.ring, failed && styles.ringFailed)}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Scan progress"
        >
          {!failed && (
            <span
              className={cn(styles.ringScanner, reduce && styles.ringScannerStatic)}
              aria-hidden="true"
            />
          )}
          <svg viewBox="0 0 72 72" aria-hidden="true">
            <circle className={styles.ringTrack} cx="36" cy="36" r={RADIUS} />
            <circle
              className={cn(styles.ringProgress, reduce && styles.ringProgressStatic)}
              cx="36"
              cy="36"
              r={RADIUS}
              style={{ "--c": CIRCUMFERENCE, "--o": offset } as CSSProperties}
            />
          </svg>
          <span className={styles.ringPct}>{failed ? "!" : `${progress}%`}</span>
        </div>

        <div className={styles.stageMeta}>
          <span className={styles.stageKicker}>{failed ? "Interrupted" : "Live scan"}</span>
          <strong>{failed ? "Scan failed" : `${phaseLabel}…`}</strong>
          <span className={styles.stageUrl}>{url}</span>
        </div>

        {showStop && (
          <button
            type="button"
            className={styles.stageStop}
            onClick={onStop}
            title="Stop the scan — your work is safe"
          >
            <StopIcon size={12} />
            <span className={styles.stageStopLabel}>Stop scan</span>
          </button>
        )}
      </div>

      {/* Announce phase changes without visual noise. */}
      <p className={styles.srOnly} role="status" aria-live="polite">
        {failed ? "Scan failed" : `${phaseLabel} — ${progress}% complete`}
      </p>

      <ol className={styles.stepper}>
        {SCAN_PHASES.map((item, index) => {
          const done = index < phase;
          const active = index === phase && !failed;
          const stalled = failed && index === phase;

          return (
            <li
              key={item.key}
              className={cn(
                styles.step,
                done && styles.stepDone,
                active && styles.stepActive,
                stalled && styles.stepStalled,
              )}
              aria-current={active ? "step" : undefined}
            >
              <span className={styles.stepDot} aria-hidden="true" />
              <span className={styles.stepLabel}>{item.label}</span>
            </li>
          );
        })}
      </ol>

      <ScanConsole
        lines={lines}
        progress={progress}
        phaseLabel={phaseLabel}
        host={host}
        reduce={reduce}
        failed={failed}
      />
    </div>
  );
};
