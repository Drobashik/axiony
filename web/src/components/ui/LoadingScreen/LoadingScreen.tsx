"use client";

import { useEffect, useState } from "react";
import cn from "classnames";
import { LogoLockup } from "../LogoMark";
import styles from "./LoadingScreen.module.scss";

export interface LoadingScreenProps {
  onDone?: () => void;
  ready?: boolean;
}

type Phase = "enter" | "visible" | "exit";

const EXIT_MS = 500;

export const LoadingScreen = ({ onDone, ready = false }: LoadingScreenProps) => {
  const [phase, setPhase] = useState<Phase>("enter");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setPhase("visible"));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!ready) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const doneDelay = reduceMotion ? 0 : EXIT_MS;
    let timer = 0;

    const frame = window.requestAnimationFrame(() => {
      setPhase("exit");
      timer = window.setTimeout(() => onDone?.(), doneDelay);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [onDone, ready]);

  const hidden = phase === "exit";
  const visible = phase !== "enter";
  const status = ready ? "Ready" : "Loading Axiony...";

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

      <div className={cn(styles.logoWrap, visible && styles.logoReady)}>
        <LogoLockup markSize={86} />
      </div>

      <div
        className={cn(
          styles.progress,
          visible && styles.progressReady,
          ready && styles.progressComplete,
        )}
      >
        <div className={styles.bar}>
          <div className={styles.fill} />
        </div>
        <div className={styles.status}>{status}</div>
      </div>
    </div>
  );
};
