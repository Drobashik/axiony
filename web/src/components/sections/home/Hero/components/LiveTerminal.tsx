import { useEffect, useState } from "react";
import cn from "classnames";
import { SCAN_COMMAND, TERMINAL_SCRIPT } from "../data";
import type { TerminalLine } from "../data";
import { GitPullRequestIcon, ReplayIcon } from "./icons";
import styles from "../Hero.module.scss";

// ── Playback state ───────────────────────────────────────────────────
// The whole demo is one precomputed timeline: type the command, stream
// the script lines, pop the PR card, then show the replay control.

interface Progress {
  typed: number;
  shown: number;
  pr: boolean;
  done: boolean;
}

const IDLE: Progress = { typed: 0, shown: 0, pr: false, done: false };

const FINISHED: Progress = {
  typed: SCAN_COMMAND.length,
  shown: TERMINAL_SCRIPT.length,
  pr: true,
  done: true,
};

const START_PAUSE_MS = 520;
const TYPE_INTERVAL_MS = 34;
const PR_CARD_DELAY_MS = 430;
const SETTLE_DELAY_MS = 340;

const LINE_MARKS: Partial<Record<TerminalLine["kind"], string>> = {
  info: "▸",
  success: "✓",
  error: "✗",
  exit: "✗",
};

// Today's real date — the headline promises "today", the terminal keeps it.
// Only rendered after mount (lines stream in via timeouts), so there is no
// SSR/client mismatch to worry about.
const BASELINE_DATE = new Date()
  .toLocaleDateString("en-US", { month: "short", day: "numeric" })
  .toLowerCase();

const ScriptLine = ({ line }: { line: TerminalLine }) => {
  if (line.kind === "section") {
    return (
      <div className={styles.termSection}>
        {line.text}
        {line.withDate ? ` · locked ${BASELINE_DATE}` : null}
      </div>
    );
  }

  if (line.kind === "finding") {
    return (
      <div className={styles.termLine}>
        <span className={styles.termMark}>
          <i className={cn(styles.sevDot, styles[`sev_${line.sev}`])} />
        </span>
        <span className={cn(styles.sevName, styles[`sevText_${line.sev}`])}>{line.sev}</span>
        <code className={styles.termRule}>{line.rule}</code>
        <span className={styles.termAside}>{line.where}</span>
      </div>
    );
  }

  return (
    <div className={styles.termLine}>
      <span className={cn(styles.termMark, styles[`mark_${line.kind}`])}>
        {LINE_MARKS[line.kind]}
      </span>
      <span className={cn(styles.termText, line.kind === "exit" && styles.exitText)}>
        {line.text}
        {line.kind === "exit" && line.aside ? (
          <span className={styles.exitAside}> {line.aside}</span>
        ) : null}
      </span>
      {line.kind !== "exit" && line.aside ? (
        <span className={styles.termAside}>{line.aside}</span>
      ) : null}
    </div>
  );
};

export const LiveTerminal = () => {
  const [runId, setRunId] = useState(0);
  const [progress, setProgress] = useState<Progress>(IDLE);

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const schedule = (at: number, apply: (prev: Progress) => Progress) => {
      timeouts.push(setTimeout(() => setProgress(apply), at));
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      schedule(0, () => FINISHED);
      return () => timeouts.forEach(clearTimeout);
    }

    let at = START_PAUSE_MS;

    for (let typed = 1; typed <= SCAN_COMMAND.length; typed += 1) {
      at += TYPE_INTERVAL_MS;
      const chars = typed;
      schedule(at, (prev) => ({ ...prev, typed: chars }));
    }

    TERMINAL_SCRIPT.forEach((line, index) => {
      at += line.delay;
      schedule(at, (prev) => ({ ...prev, shown: index + 1 }));
    });

    at += PR_CARD_DELAY_MS;
    schedule(at, (prev) => ({ ...prev, pr: true }));

    at += SETTLE_DELAY_MS;
    schedule(at, (prev) => ({ ...prev, done: true }));

    return () => timeouts.forEach(clearTimeout);
  }, [runId]);

  const replay = () => {
    setProgress(IDLE);
    setRunId((id) => id + 1);
  };

  const commandTyped = progress.typed === SCAN_COMMAND.length;

  return (
    <div className={styles.terminalWrap}>
      <div className={styles.annotation} aria-hidden="true">
        same command runs in your CI
        {/* Hand-drawn arrow: a short swoop from the note that stops just
            above the terminal window and points down at it */}
        <svg className={styles.annotationArrow} viewBox="0 0 108 40" fill="none">
          <path
            className={styles.annotationCurve}
            pathLength={1}
            d="M100 5 C 72 14, 40 12, 16 34"
          />
          <path className={styles.annotationHead} d="M27 30 L16 34 L22 22" />
        </svg>
      </div>

      <div className={styles.terminal}>
        <div className={styles.termHead}>
          <span className={styles.dots} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className={styles.termTitle}>acme — axiony</span>
          {progress.done ? (
            <button type="button" className={styles.termReplay} onClick={replay}>
              <ReplayIcon />
              replay
            </button>
          ) : (
            <span className={styles.termLive} aria-hidden="true">
              <i />
              scanning
            </span>
          )}
        </div>

        <div className={styles.termBody} aria-hidden="true">
          <div className={styles.termLine}>
            <span className={styles.termPrompt}>$</span>
            <span className={styles.termCmd}>
              {SCAN_COMMAND.slice(0, progress.typed)}
              {!commandTyped && <span className={styles.termCaret} />}
            </span>
          </div>

          {TERMINAL_SCRIPT.slice(0, progress.shown).map((line, index) => (
            <ScriptLine key={index} line={line} />
          ))}

          {progress.done && (
            <div className={styles.termLine}>
              <span className={styles.termPrompt}>$</span>
              <span className={styles.termCaret} />
            </div>
          )}
        </div>
      </div>

      <div className={cn(styles.prCard, progress.pr && styles.prCardVisible)} aria-hidden="true">
        <div className={styles.prTop}>
          <GitPullRequestIcon />
          <span className={styles.prRef}>PR #214 · fix/header-nav</span>
          <span className={styles.prBadge}>blocked</span>
        </div>
        <div className={styles.prRow}>
          <span className={styles.prX}>✗</span>
          <code>axiony / a11y-gate</code>
          <span className={styles.prMsg}>2 new issues</span>
        </div>
      </div>
    </div>
  );
};
