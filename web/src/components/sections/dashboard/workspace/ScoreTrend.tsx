"use client";

import { useState } from "react";
import { colorForScore } from "../ScoreRing";
import styles from "./Workspace.module.scss";

interface ScoreTrendProps {
  scores: number[];
  baseline: number;
}

const W = 600;
const H = 150;
const PAD_X = 12;
const PAD_TOP = 18;
const PAD_BOTTOM = 18;
const MIN = 40; // headroom below the score floor (45)
const MAX = 100;

const clamp = (v: number) => Math.max(MIN, Math.min(MAX, v));

/**
 * Compact accessibility-score trend. Always renders — a single baseline
 * point reads as a flat line, follow-up scans extend it into a curve.
 */
export const ScoreTrend = ({ scores, baseline }: ScoreTrendProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const n = scores.length;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_TOP - PAD_BOTTOM;

  const xAt = (i: number) => (n <= 1 ? W / 2 : PAD_X + (i / (n - 1)) * innerW);
  const yAt = (v: number) => PAD_TOP + (1 - (clamp(v) - MIN) / (MAX - MIN)) * innerH;

  const latest = scores[n - 1] ?? baseline;
  const color = colorForScore(latest);
  const pts = scores.map((v, i) => ({ x: xAt(i), y: yAt(v) }));
  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  const area =
    n > 1
      ? `${line} L${pts[n - 1].x.toFixed(1)} ${H - PAD_BOTTOM} L${pts[0].x.toFixed(1)} ${
          H - PAD_BOTTOM
        } Z`
      : "";
  const baseY = yAt(baseline);
  const activePoint = activeIndex === null ? null : pts[activeIndex];
  const activeScore = activeIndex === null ? null : scores[activeIndex];

  return (
    <div className={styles.trendWrap}>
      <div className={styles.trendNumbers} aria-hidden="true">
        <span>
          Latest <strong>{latest}</strong>
        </span>
        <span>
          Baseline <strong>{baseline}</strong>
        </span>
      </div>

      <svg
        className={styles.trendSvg}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Accessibility score trend — currently ${latest} out of 100`}
      >
        <defs>
          <linearGradient id="scoreTrendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {[100, 80, 60].map((g) => (
          <line
            key={g}
            className={styles.trendGrid}
            x1={PAD_X}
            x2={W - PAD_X}
            y1={yAt(g)}
            y2={yAt(g)}
          />
        ))}

        <line className={styles.trendBaseline} x1={PAD_X} x2={W - PAD_X} y1={baseY} y2={baseY} />

        {area && <path d={area} fill="url(#scoreTrendFill)" />}
        {n > 1 && (
          <path
            d={line}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        )}

        {pts.map((p, i) => (
          <circle
            key={i}
            className={styles.trendPoint}
            cx={p.x}
            cy={p.y}
            r={i === n - 1 ? 5 : 3.5}
            fill={i === n - 1 ? color : "var(--bg-surface)"}
            stroke={color}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            tabIndex={0}
            role="img"
            aria-label={`Scan ${i + 1}: score ${scores[i]}`}
            onBlur={() => setActiveIndex(null)}
            onFocus={() => setActiveIndex(i)}
            onMouseEnter={() => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(null)}
          />
        ))}
      </svg>

      {activePoint && activeScore !== null && (
        <div
          className={styles.trendTooltip}
          style={{
            left: `${(activePoint.x / W) * 100}%`,
            top: `calc(34px + ${(activePoint.y / H) * 100}%)`,
          }}
        >
          <strong>{activeScore}</strong>
          Scan {Number(activeIndex) + 1}
          {activeScore !== baseline && (
            <>
              <br />
              {activeScore > baseline ? "+" : ""}
              {activeScore - baseline} vs baseline
            </>
          )}
        </div>
      )}
    </div>
  );
};
