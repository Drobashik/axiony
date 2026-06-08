"use client";

import { useEffect, useState } from "react";
import styles from "./ScoreRing.module.scss";

export interface ScoreRingProps {
  score: number;
  size?: number;
}

/**
 * Animated circular progress dial. Picks a color band based on the
 * final score so the ring stays consistent with the score's grade.
 */
export function ScoreRing({ score, size = 48 }: ScoreRingProps) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const color = colorForScore(score);

  const [drawn, setDrawn] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 900;
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDrawn(eased * score);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className={styles.ring} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 48 48" className={styles.svg}>
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="var(--border-default)"
          strokeWidth="4"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - drawn / 100)}
          strokeLinecap="round"
        />
      </svg>
      <div className={styles.value} style={{ color }}>
        {Math.round(drawn)}
      </div>
    </div>
  );
}

export function colorForScore(score: number): string {
  if (score >= 80) return "var(--green)";
  if (score >= 60) return "oklch(0.75 0.15 80)";
  return "oklch(0.72 0.20 20)";
}
