"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import cn from "classnames";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { GATED_SCORES, RELEASES, START_SCORE, UNGATED_SCORES } from "../data";
import styles from "../Solution.module.scss";

// ── Chart geometry (shared by both cards) ────────────────────────────
const W = 300;
const H = 116;
const PAD = { l: 10, r: 10, t: 16, b: 12 };
const SCORE_MIN = 55;
const SCORE_MAX = 100;

const plotW = W - PAD.l - PAD.r;
const plotH = H - PAD.t - PAD.b;
const n = RELEASES.length; // 10 releases → 11 points

// Delay between auto-shipped releases once the run has started.
const AUTO_STEP_MS = 700;

const x = (index: number) => PAD.l + (index / n) * plotW;
const y = (score: number) => PAD.t + (1 - (score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)) * plotH;

const linePath = (scores: readonly number[]): string =>
  scores.map((s, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(s).toFixed(1)}`).join(" ");

const areaPath = (scores: readonly number[]): string =>
  `${linePath(scores)} L${x(n).toFixed(1)} ${H - PAD.b} L${x(0).toFixed(1)} ${H - PAD.b} Z`;

interface TrackChartProps {
  scores: readonly number[];
  shipped: number;
  tone: "drift" | "ratchet";
}

// The full line is drawn once; a clip-path reveals it release by
// release, so every click "draws" the next segment.
const TrackChart = ({ scores, shipped, tone }: TrackChartProps) => {
  const clip = ((n - shipped) / n) * 100;
  const headX = x(shipped);
  const headY = y(scores[shipped]);

  return (
    <svg className={styles.chart} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <line
        className={styles.chartRef}
        x1={PAD.l}
        y1={y(START_SCORE)}
        x2={W - PAD.r}
        y2={y(START_SCORE)}
      />

      <g
        className={cn(styles.chartDraw, styles[`chart_${tone}`])}
        style={{ clipPath: `inset(0 ${clip}% 0 0)` }}
      >
        <path className={styles.chartArea} d={areaPath(scores)} />
        <path className={styles.chartLine} d={linePath(scores)} />
      </g>

      <g
        className={cn(styles.chartHead, styles[`chartHead_${tone}`])}
        style={{ transform: `translate(${headX}px, ${headY}px)` }}
      >
        <circle r="4.5" />
      </g>
    </svg>
  );
};

// ── Event lines under each chart ─────────────────────────────────────
const plural = (count: number) => (count === 1 ? "issue" : "issues");

const ungatedEvent = (shipped: number): string => {
  if (shipped === 0) return "waiting for the first release…";
  const { ship } = RELEASES[shipped - 1];
  return `v1.${shipped - 1} — ${ship} new ${plural(ship)} live`;
};

const gatedEvent = (shipped: number): string => {
  if (shipped === 0) return "waiting for the first release…";
  const { ship, fix } = RELEASES[shipped - 1];
  return fix > 0
    ? `v1.${shipped - 1} — ${ship} blocked · ${fix} fixed ↑`
    : `v1.${shipped - 1} — ${ship} blocked · exit 1`;
};

export const ReleaseSim = () => {
  const reduce = usePrefersReducedMotion();
  const [shipped, setShipped] = useState(0);
  const [running, setRunning] = useState(false);

  const done = shipped === n;
  const ungated = UNGATED_SCORES[shipped];
  const gated = GATED_SCORES[shipped];
  const ungatedDelta = START_SCORE - UNGATED_SCORES[n];
  const gatedDelta = GATED_SCORES[n] - START_SCORE;

  // Once started, ship the rest automatically — one release at a time —
  // until the run reaches the end, where the button becomes Replay.
  useEffect(() => {
    if (!running || shipped >= n) return undefined;
    const id = window.setTimeout(() => setShipped((count) => Math.min(count + 1, n)), AUTO_STEP_MS);
    return () => window.clearTimeout(id);
  }, [running, shipped]);

  // First click ships v1.0, then the run takes over. Reduced motion skips
  // the timed steps and jumps straight to the outcome.
  const start = () => {
    if (reduce) {
      setShipped(n);
      return;
    }
    setShipped(1);
    setRunning(true);
  };

  const replay = () => {
    setShipped(0);
    setRunning(!reduce);
  };

  return (
    <div className={styles.sim}>
      <div className={styles.simHead}>
        <span className={styles.simLabel}>
          release simulator <span className={styles.simLabelDim}>— same code, two pipelines</span>
        </span>
        <span className={styles.simCount}>
          release {shipped}/{n}
        </span>
      </div>

      <div className={styles.tracks}>
        <div className={styles.track}>
          <div className={styles.trackHead}>
            <code className={styles.trackName}>
              <span className={styles.trackNameFull}>main · unprotected</span>
              <span className={styles.trackNameShort}>unprotected</span>
            </code>
            <strong className={cn(styles.score, ungated <= 70 && styles.score_bad)} key={ungated}>
              {ungated}
            </strong>
          </div>
          <TrackChart scores={UNGATED_SCORES} shipped={shipped} tone="drift" />
          <p className={cn(styles.event, shipped > 0 && styles.event_bad)} aria-hidden="true">
            {ungatedEvent(shipped)}
          </p>
        </div>

        <div className={cn(styles.track, styles.track_gated)}>
          <div className={styles.trackHead}>
            <code className={styles.trackName}>
              <span className={styles.trackNameFull}>main · protected by axiony</span>
              <span className={styles.trackNameShort}>axiony</span>
            </code>
            <strong className={cn(styles.score, gated >= 85 && styles.score_good)} key={gated}>
              {gated}
            </strong>
          </div>
          <TrackChart scores={GATED_SCORES} shipped={shipped} tone="ratchet" />
          <p className={cn(styles.event, shipped > 0 && styles.event_good)} aria-hidden="true">
            {gatedEvent(shipped)}
          </p>
        </div>
      </div>

      <div className={styles.controls}>
        <Button
          type="button"
          onClick={done ? replay : start}
          disabled={running && !done}
          className={styles.shipBtn}
        >
          {done ? "Replay ↺" : running ? "Shipping…" : "Ship v1.0 →"}
        </Button>
        {shipped === 0 && !running && <span className={styles.nudge}>go on — ship all ten</span>}
        {done && (
          <p className={styles.verdict}>
            <span className={styles.verdictDelta}>
              −{ungatedDelta} vs +{gatedDelta} · same ten releases
            </span>
            <span className={styles.verdictNote}>the only difference is the gate</span>
          </p>
        )}
      </div>

      <span className={styles.srOnly} role="status">
        {shipped === 0
          ? ""
          : `Release ${shipped} of ${n}. Score without a gate: ${ungated}. With Axiony: ${gated}.`}
      </span>
    </div>
  );
};
