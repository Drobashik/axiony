"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import cn from "classnames";
import { SEVERITY_COLOR, SEVERITY_LABEL, SEVERITY_ORDER } from "@/lib/scan/issues";
import type { TrendPoint } from "@/lib/workspace";
import { colorForScore } from "../shared/ScoreRing";
import styles from "./Workspace.module.scss";

type Metric = "score" | "issues";

interface TrendChartProps {
  points: TrendPoint[];
  baselineScore: number;
  baselineTotal: number;
  reduce?: boolean;
}

const W = 640;
const H = 150;
const PAD_X = 12;
const PAD_T = 14;
const PAD_B = 12;
const INNER_W = W - PAD_X * 2;
const INNER_H = H - PAD_T - PAD_B;

const METRICS: { id: Metric; label: string; caption: string }[] = [
  { id: "score", label: "Score", caption: "Accessibility score · 0–100" },
  { id: "issues", label: "Issues", caption: "Open issues by severity" },
];

const shortDate = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });

const niceCeil = (peak: number): number => (peak <= 4 ? 4 : Math.ceil(peak / 2) * 2);

interface Line {
  key: string;
  color: string;
  pts: { x: number; y: number }[];
  path: string;
  area?: string;
}

interface Chart {
  lines: Line[];
  ticks: number[];
  baseY: number | null;
  yAt: (v: number) => number;
  xAt: (i: number) => number;
  n: number;
}

export const TrendChart = ({ points, baselineScore, baselineTotal, reduce }: TrendChartProps) => {
  const [metric, setMetric] = useState<Metric>("score");
  const [active, setActive] = useState<number | null>(null);
  const isScore = metric === "score";

  const chart = useMemo<Chart>(() => {
    const n = points.length;
    const xAt = (i: number) => (n <= 1 ? PAD_X + INNER_W / 2 : PAD_X + (i / (n - 1)) * INNER_W);

    const scoreMode = metric === "score";
    let max: number;
    let ticks: number[];
    if (scoreMode) {
      max = 100;
      ticks = [100, 80, 60, 40, 0];
    } else {
      const peak = Math.max(0, ...points.flatMap((p) => SEVERITY_ORDER.map((s) => p.counts[s])));
      max = niceCeil(peak);
      ticks = Array.from(new Set([max, Math.round(max / 2), 0]));
    }

    const yAt = (v: number) => PAD_T + (1 - Math.max(0, Math.min(max, v)) / (max || 1)) * INNER_H;

    const toLine = (key: string, color: string, values: number[], withArea: boolean): Line => {
      const pts = values.map((v, i) => ({ x: xAt(i), y: yAt(v) }));
      const path = pts
        .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
        .join(" ");
      const area =
        withArea && n > 1
          ? `${path} L${pts[n - 1].x.toFixed(1)} ${H - PAD_B} L${pts[0].x.toFixed(1)} ${H - PAD_B} Z`
          : undefined;
      return { key, color, pts, path, area };
    };

    const lines = scoreMode
      ? [
          toLine(
            "score",
            colorForScore(points[n - 1]?.score ?? baselineScore),
            points.map((p) => p.score),
            true,
          ),
        ]
      : SEVERITY_ORDER.map((s) =>
          toLine(
            s,
            SEVERITY_COLOR[s],
            points.map((p) => p.counts[s]),
            false,
          ),
        );

    return { lines, ticks, baseY: scoreMode ? yAt(baselineScore) : null, yAt, xAt, n };
  }, [metric, points, baselineScore]);

  const { lines, ticks, baseY, yAt, xAt, n } = chart;
  const last = points[n - 1];
  const baseValue = isScore ? baselineScore : baselineTotal;
  const nowValue = isScore ? (last?.score ?? baselineScore) : (last?.total ?? baselineTotal);
  const delta = nowValue - baseValue;
  const improved = isScore ? delta > 0 : delta < 0;

  const labelIndices = useMemo(() => {
    if (n <= 4) return points.map((_, i) => i);
    return Array.from(new Set([0, Math.round((n - 1) / 3), Math.round((2 * (n - 1)) / 3), n - 1]));
  }, [n, points]);

  const colBound = (i: number) => {
    const left = i === 0 ? PAD_X : (xAt(i - 1) + xAt(i)) / 2;
    const right = i === n - 1 ? W - PAD_X : (xAt(i) + xAt(i + 1)) / 2;
    return { x: left, w: Math.max(1, right - left) };
  };

  const anchorY = active === null ? 0 : Math.min(...lines.map((l) => l.pts[active].y));
  const tipLeft = active === null ? 0 : Math.max(16, Math.min(84, (xAt(active) / W) * 100));
  const fillId = `trendFill-${metric}`;

  return (
    <div className={styles.trend}>
      <div className={styles.trendHead}>
        <div className={styles.trendTabs} role="tablist" aria-label="Metric">
          {METRICS.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={metric === m.id}
              className={cn(styles.trendTab, metric === m.id && styles.trendTabOn)}
              onClick={() => {
                setMetric(m.id);
                setActive(null);
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className={styles.trendStat}>
          <span
            className={styles.trendStatNow}
            style={{ color: isScore ? lines[0].color : undefined }}
          >
            {nowValue}
          </span>
          {n > 1 && (
            <span
              className={cn(
                styles.trendStatDelta,
                delta === 0 ? styles.trendFlat : improved ? styles.trendUp : styles.trendDown,
              )}
            >
              {delta === 0 ? "±0" : `${delta > 0 ? "+" : ""}${delta}`}
            </span>
          )}
        </div>
      </div>

      <p className={styles.trendCaption}>{METRICS.find((m) => m.id === metric)?.caption}</p>

      <div className={styles.trendPlot}>
        <div className={styles.trendYAxis} aria-hidden="true">
          {ticks.map((t) => (
            <span key={t} className={styles.trendYTick} style={{ top: `${(yAt(t) / H) * 100}%` }}>
              {t}
            </span>
          ))}
        </div>

        <div className={styles.trendCanvas}>
          <svg
            key={metric}
            className={cn(styles.trendSvg, !reduce && styles.trendEnter)}
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={`${isScore ? "Score" : "Open issues"} trend — currently ${nowValue}`}
            onMouseLeave={() => setActive(null)}
          >
            <defs>
              <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lines[0].color} stopOpacity="0.26" />
                <stop offset="100%" stopColor={lines[0].color} stopOpacity="0" />
              </linearGradient>
            </defs>

            {ticks.map((t) => (
              <line
                key={t}
                className={styles.trendGrid}
                x1={PAD_X}
                x2={W - PAD_X}
                y1={yAt(t)}
                y2={yAt(t)}
              />
            ))}

            {baseY !== null && (
              <line
                className={styles.trendBaseline}
                x1={PAD_X}
                x2={W - PAD_X}
                y1={baseY}
                y2={baseY}
              />
            )}

            {active !== null && (
              <line
                className={styles.trendGuide}
                x1={xAt(active)}
                x2={xAt(active)}
                y1={PAD_T}
                y2={H - PAD_B}
              />
            )}

            {lines.map(
              (l) => l.area && <path key={`${l.key}-a`} d={l.area} fill={`url(#${fillId})`} />,
            )}

            {n > 1 &&
              lines.map((l) => (
                <path
                  key={`${l.key}-l`}
                  d={l.path}
                  fill="none"
                  stroke={l.color}
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              ))}

            {lines.map((l) =>
              l.pts.map((p, i) => {
                const on = i === active;
                const lead = i === n - 1;
                return (
                  <circle
                    key={`${l.key}-${i}`}
                    cx={p.x}
                    cy={p.y}
                    r={on ? 5.5 : lead ? 4 : 3}
                    fill={on || lead ? l.color : "var(--bg-surface)"}
                    stroke={l.color}
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                );
              }),
            )}

            {points.map((p, i) => {
              const b = colBound(i);
              return (
                <rect
                  key={`hit-${i}`}
                  className={styles.trendHit}
                  x={b.x}
                  y={PAD_T}
                  width={b.w}
                  height={INNER_H}
                  tabIndex={0}
                  role="img"
                  aria-label={`${shortDate(p.scannedAt)}: ${isScore ? `score ${p.score}` : `${p.total} open issues`}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                />
              );
            })}
          </svg>

          {active !== null && (
            <div
              className={styles.trendTip}
              style={{ left: `${tipLeft}%`, top: `${(anchorY / H) * 100}%` }}
            >
              <span className={styles.tipDate}>{shortDate(points[active].scannedAt)}</span>
              {isScore ? (
                <>
                  <span className={styles.tipBig} style={{ color: lines[0].color }}>
                    {points[active].score}
                  </span>
                  {points[active].score !== baselineScore && (
                    <span className={styles.tipNote}>
                      {points[active].score > baselineScore ? "+" : ""}
                      {points[active].score - baselineScore} vs baseline
                    </span>
                  )}
                </>
              ) : (
                <ul className={styles.tipList}>
                  {SEVERITY_ORDER.map((s) => (
                    <li key={s} className={styles.tipRow}>
                      <span
                        className={styles.tipDot}
                        style={{ background: SEVERITY_COLOR[s] }}
                        aria-hidden="true"
                      />
                      <span className={styles.tipLabel}>{SEVERITY_LABEL[s]}</span>
                      <span className={styles.tipVal}>{points[active].counts[s]}</span>
                    </li>
                  ))}
                  <li className={cn(styles.tipRow, styles.tipTotal)}>
                    <span className={styles.tipLabel}>Total</span>
                    <span className={styles.tipVal}>{points[active].total}</span>
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>

        <div className={styles.trendXAxis} aria-hidden="true">
          {labelIndices.map((i) => (
            <span
              key={i}
              className={styles.trendXTick}
              style={
                {
                  left: `${(xAt(i) / W) * 100}%`,
                  "--shift": i === 0 ? "0%" : i === n - 1 ? "-100%" : "-50%",
                } as CSSProperties
              }
            >
              {shortDate(points[i].scannedAt)}
            </span>
          ))}
        </div>
      </div>

      {!isScore && (
        <ul className={styles.trendLegend}>
          {SEVERITY_ORDER.map((s) => (
            <li key={s} className={styles.trendLegendItem}>
              <span
                className={styles.trendLegendDot}
                style={{ background: SEVERITY_COLOR[s] }}
                aria-hidden="true"
              />
              <span className={styles.trendLegendLabel}>{SEVERITY_LABEL[s]}</span>
              <span className={styles.trendLegendVal}>{last?.counts[s] ?? 0}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
