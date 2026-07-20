"use client";

import { useEffect } from "react";
import cn from "classnames";
import { LogoLockup } from "../LogoMark";
import styles from "./LoadingScreen.module.scss";

export interface LoadingScreenProps {
  onDone?: () => void;
  ready?: boolean;
}

export const LoadingScreen = ({ onDone, ready = false }: LoadingScreenProps) => {
  useEffect(() => {
    if (!ready) return;

    // Let the completed bar/status reach one painted frame, then reveal the
    // already-rendered page immediately—no minimum timeout or delayed exit.
    const frame = window.requestAnimationFrame(() => onDone?.());
    return () => window.cancelAnimationFrame(frame);
  }, [onDone, ready]);

  const status = ready ? "Ready" : "Loading Axiony...";

  return (
    <div className={styles.screen} role="status" aria-live="polite" aria-label="Loading Axiony">
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

      <div className={cn(styles.progress, styles.progressReady, ready && styles.progressComplete)}>
        <div className={styles.bar}>
          <div className={styles.fill} />
        </div>
        <div className={styles.status}>{status}</div>
      </div>
    </div>
  );
};
