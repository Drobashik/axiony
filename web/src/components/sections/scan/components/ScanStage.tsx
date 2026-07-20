import type { CSSProperties } from "react";
import cn from "classnames";
import type { TerminalLine } from "@/components/ui";
import { SCAN_PHASES } from "../data";
import { phaseForProgress } from "../hooks/useScanEngine";
import type { ScanDiagnostic } from "../hooks/useScanEngine";
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
  error?: string | null;
  diagnostic?: ScanDiagnostic | null;
  onStop?: () => void;
}

interface FailureExplanation {
  title: string;
  reason: string;
  nextStep: string;
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

const explainFailure = (
  error: string | null | undefined,
  diagnostic: ScanDiagnostic | null | undefined,
): FailureExplanation => {
  const reason = error?.trim() || "The scanner stopped before it could return a report.";
  const normalized = reason.toLowerCase();
  const status = diagnostic?.httpStatus;

  if (
    normalized.includes("cloudflare") ||
    normalized.includes("turnstile") ||
    normalized.includes("bot-protection") ||
    normalized.includes("access denied") ||
    normalized.includes("blocked the scanner") ||
    status === 401 ||
    status === 403 ||
    status === 429
  ) {
    return {
      title: "The site blocked automated scanning",
      reason,
      nextStep:
        "Run the Axiony CLI from a trusted network, scan a staging URL, or allow the scanner network through the site protection layer.",
    };
  }

  if (
    normalized.includes("temporarily unavailable") ||
    normalized.includes("waking up") ||
    normalized.includes("bad gateway") ||
    normalized.includes("502") ||
    normalized.includes("503") ||
    normalized.includes("504")
  ) {
    return {
      title: "The scanner service is not ready",
      reason,
      nextStep:
        "Wait about a minute and retry. If the problem continues, use the local CLI while the hosted scanner recovers.",
    };
  }

  if (normalized.includes("timed out") || normalized.includes("timeout")) {
    return {
      title: "The page took too long to become scannable",
      reason,
      nextStep:
        "Confirm the URL loads publicly, then retry. For a heavy or authenticated page, scan a smaller route or run the CLI locally.",
    };
  }

  if (
    normalized.includes("could not open") ||
    normalized.includes("could not read") ||
    normalized.includes("not found") ||
    normalized.includes("invalid url") ||
    normalized.includes("name resolution")
  ) {
    return {
      title: "The target page could not be reached",
      reason,
      nextStep:
        "Check the URL, redirects, and public access. The hosted scanner cannot open localhost, private-network, or sign-in-only pages.",
    };
  }

  if (normalized.includes("selector")) {
    return {
      title: "The requested scan target was not available",
      reason,
      nextStep:
        "Check that the selector exists after the page finishes rendering, or scan the full page without a selector.",
    };
  }

  return {
    title: diagnostic
      ? "The page loaded, but the accessibility scan stopped"
      : "The scanner stopped before producing a report",
    reason,
    nextStep:
      "Retry once. If it fails again, use the page snapshot below to check redirects, rendered content, and protection pages, or run the CLI locally.",
  };
};

export const ScanStage = ({
  url,
  progress,
  lines,
  reduce,
  status = "scanning",
  error,
  diagnostic,
  onStop,
}: ScanStageProps) => {
  const failed = status === "failed";
  const phase = phaseForProgress(progress);
  const phaseLabel = SCAN_PHASES[phase].label;
  const offset = CIRCUMFERENCE * (1 - Math.min(100, progress) / 100);
  const host = hostOf(url);
  const showStop = !failed && Boolean(onStop);
  const failure = failed ? explainFailure(error, diagnostic) : null;

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

      {failed && failure && (
        <details className={styles.diagnostic} open>
          <summary className={styles.diagnosticSummary}>
            <span>Why the scan failed</span>
            <span className={styles.diagnosticHint}>
              {diagnostic ? "Page snapshot captured" : "No page snapshot available"}
            </span>
          </summary>

          <div className={styles.diagnosticBody}>
            <div className={styles.diagnosticExplanation}>
              <span className={styles.diagnosticKicker}>What happened</span>
              <strong>{failure.title}</strong>
              <p className={styles.diagnosticReason}>{failure.reason}</p>
              <div className={styles.diagnosticAction}>
                <span>Recommended next step</span>
                <p>{failure.nextStep}</p>
              </div>
            </div>

            <dl className={styles.diagnosticGrid}>
              <div>
                <dt>Stopped during</dt>
                <dd>{phaseLabel}</dd>
              </div>
              <div>
                <dt>Last progress</dt>
                <dd>{progress}%</dd>
              </div>
              {diagnostic && (
                <>
                  <div>
                    <dt>HTTP status</dt>
                    <dd>{diagnostic.httpStatus ?? "Unknown"}</dd>
                  </div>
                  <div>
                    <dt>Page title</dt>
                    <dd>{diagnostic.title || "Empty"}</dd>
                  </div>
                  <div>
                    <dt>Final URL</dt>
                    <dd>{diagnostic.finalUrl}</dd>
                  </div>
                  <div>
                    <dt>Requested URL</dt>
                    <dd>{diagnostic.requestedUrl}</dd>
                  </div>
                  <div>
                    <dt>Meta refresh</dt>
                    <dd>{diagnostic.metaRefresh || "Not detected"}</dd>
                  </div>
                  <div>
                    <dt>DOM elements</dt>
                    <dd>{diagnostic.elementCount.toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt>Visible text</dt>
                    <dd>{diagnostic.textLength.toLocaleString()} chars</dd>
                  </div>
                  <div>
                    <dt>Form controls</dt>
                    <dd>{diagnostic.formControlCount.toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt>Captured</dt>
                    <dd>{new Date(diagnostic.capturedAt).toLocaleString("en-US")}</dd>
                  </div>
                </>
              )}
            </dl>

            {diagnostic && (
              <div className={styles.diagnosticPreview}>
                <span>Sanitized HTML preview</span>
                <pre>{diagnostic.htmlPreview || "No HTML was available."}</pre>
              </div>
            )}
          </div>
        </details>
      )}
    </div>
  );
};
