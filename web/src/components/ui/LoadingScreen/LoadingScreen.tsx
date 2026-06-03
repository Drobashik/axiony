"use client";

import { useEffect, useState } from "react";
import cn from "classnames";
import { LogoLockup } from "../LogoMark";
import styles from "./LoadingScreen.module.scss";

export interface LoadingScreenProps {
  onDone?: () => void;
  durationMs?: number;
}

type Phase = "enter" | "visible" | "exit";

const statusForProgress = (progress: number): string => {
  if (progress < 35) return "Initializing scanner...";
  if (progress < 65) return "Loading WCAG ruleset...";
  if (progress < 90) return "Preparing workspace...";
  return "Ready";
};

export const LoadingScreen = ({
  onDone,
  durationMs = 2000,
}: LoadingScreenProps) => {
  const [phase, setPhase] = useState<Phase>("enter");
  const [progress, setProgress] = useState(0);

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

      <div className={cn(styles.logoWrap, styles.logoReady)}>
        <LogoLockup markSize={86} />
      </div>

      <div className={cn(styles.progress, styles.progressReady)}>
        <div className={styles.bar}>
          <div className={styles.fill} style={{ width: `${progress}%` }} />
        </div>
        <div className={styles.status}>{status}</div>
      </div>
    </div>
  );
};
