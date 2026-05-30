"use client";

import { useEffect, useState } from "react";
import cn from "classnames";
import styles from "./LoadingScreen.module.scss";

export interface LoadingScreenProps {
  /** Called once the exit animation has finished. */
  onDone?: () => void;
  /** Total time the screen stays visible (ms). */
  durationMs?: number;
}

type Phase = "enter" | "visible" | "exit";

/**
 * Boot screen shown briefly on the home and dashboard pages.
 *
 * Three concentric rings, a glowing logo with a scan-line sweep, a
 * gradient progress bar and a status caption that walks through three
 * phases. The whole component owns its lifecycle — when finished it
 * fires `onDone()` so the caller can hide it.
 */
export function LoadingScreen({
  onDone,
  durationMs = 2000,
}: LoadingScreenProps) {
  const [phase, setPhase] = useState<Phase>("enter");
  const [progress, setProgress] = useState(0);

  // Drive a slightly-randomised progress counter that always ends at 100.
  useEffect(() => {
    let current = 0;
    const id = window.setInterval(() => {
      current += Math.random() * 18 + 4;
      if (current >= 100) {
        current = 100;
        window.clearInterval(id);
      }
      setProgress(Math.min(current, 100));
    }, 80);
    return () => window.clearInterval(id);
  }, []);

  // Phase machine: enter → visible → exit → onDone.
  useEffect(() => {
    const enterDelay = 200;
    const exitDelay = Math.max(durationMs - 500, enterDelay + 200);
    const doneDelay = durationMs;

    const t1 = window.setTimeout(() => setPhase("visible"), enterDelay);
    const t2 = window.setTimeout(() => setPhase("exit"), exitDelay);
    const t3 = window.setTimeout(() => onDone?.(), doneDelay);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [durationMs, onDone]);

  const hidden = phase === "exit";
  const status = statusForProgress(progress);

  return (
    <div
      className={cn(styles.screen, hidden && styles.hidden)}
      role="status"
      aria-live="polite"
      aria-label="Loading Axiony"
    >
      {/* Ambient rings + radial glow */}
      <div className={styles.rings} aria-hidden="true">
        {[300, 460, 620].map((size, i) => (
          <span
            key={size}
            className={styles.ring}
            style={{
              width: size,
              height: size,
              borderColor: `oklch(0.62 0.22 240 / ${0.1 - i * 0.025})`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${3 + i * 0.8}s`,
            }}
          />
        ))}
        <span className={styles.glow} />
      </div>

      {/* Logo + scan line */}
      <div className={cn(styles.logoWrap, styles.logoReady)}>
        <div className={styles.logo}>
          <svg
            width="30"
            height="30"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 13L8 3L13 13"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn(styles.stroke, styles.strokeMain)}
              style={{ strokeDashoffset: 0 }}
            />
            <path
              d="M5.5 9.5H10.5"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              className={cn(styles.stroke, styles.strokeBar)}
              style={{ strokeDashoffset: 0 }}
            />
          </svg>
          <span className={styles.scan} aria-hidden="true" />
        </div>
        <div className={styles.wordmark}>Axiony</div>
      </div>

      {/* Progress + status */}
      <div className={cn(styles.progress, styles.progressReady)}>
        <div className={styles.bar}>
          <div className={styles.fill} style={{ width: `${progress}%` }} />
        </div>
        <div className={styles.status}>{status}</div>
      </div>
    </div>
  );
}

function statusForProgress(progress: number): string {
  if (progress < 35) return "Initializing scanner...";
  if (progress < 65) return "Loading WCAG ruleset...";
  if (progress < 90) return "Preparing workspace...";
  return "Ready";
}
