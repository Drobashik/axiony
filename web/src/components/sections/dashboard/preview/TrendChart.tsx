"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { TREND_DATASETS, TREND_WEEKS } from "@/lib/data/dashboard";
import styles from "./TrendChart.module.scss";

const WIDTH = 600;
const HEIGHT = 120;
const PADDING = 16;

const LINE_DURATION_MS = 1200;
const STAGGER_MS = 150;

/**
 * Multi-series line chart for the dashboard overview.
 *
 * Lines are drawn progressively by animating each path's
 * `strokeDashoffset` from its measured total length down to zero.
 * Measuring the path with `getTotalLength()` is what makes the
 * animation feel natural — the line literally traces itself out
 * regardless of the data shape — and it works for any viewBox.
 */
export function TrendChart() {
  const idPrefix = useId().replace(/:/g, "-");
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const [lengths, setLengths] = useState<number[]>([]);
  const [animated, setAnimated] = useState(false);

  const allValues = TREND_DATASETS.flatMap((d) => d.values);
  const maxValue = Math.max(...allValues) + 4;
  const xStep = (WIDTH - PADDING * 2) / (TREND_WEEKS.length - 1);
  const yScale = (v: number) => PADDING + (HEIGHT - PADDING * 2) * (1 - v / maxValue);

  /** Build an `M … L …` path for the polyline of a single dataset. */
  const linePath = (values: number[]): string =>
    values.map((v, i) => `${i === 0 ? "M" : "L"} ${PADDING + i * xStep} ${yScale(v)}`).join(" ");

  // Measure each path on mount so we can use the real length as the
  // stroke-dasharray. Using `useLayoutEffect` makes sure the
  // measurement happens before paint so the line never flashes.
  useLayoutEffect(() => {
    const measured = pathRefs.current.map((path) => path?.getTotalLength() ?? 0);
    setLengths(measured);
  }, []);

  // Once we have the lengths, kick off the animation on the next frame
  // so the browser has a chance to apply the initial `dashoffset`
  // (= length) before transitioning it to zero.
  useEffect(() => {
    if (lengths.length === 0) return;
    const id = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(id);
  }, [lengths]);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT + 32}`}
      className={styles.svg}
      role="img"
      aria-label="Issues trend over the last 8 weeks"
    >
      <defs>
        {TREND_DATASETS.map((dataset) => (
          <linearGradient
            key={dataset.label}
            id={`${idPrefix}-grad-${dataset.label}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor={dataset.color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={dataset.color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>

      {/* Background grid lines + Y labels */}
      {[0, maxValue / 3, (maxValue * 2) / 3, maxValue].map((value, i) => (
        <g key={i}>
          <line
            x1={PADDING}
            y1={yScale(value)}
            x2={WIDTH - PADDING}
            y2={yScale(value)}
            stroke="var(--border-subtle)"
            strokeWidth="1"
          />
          <text
            x={PADDING - 4}
            y={yScale(value) + 4}
            textAnchor="end"
            fontSize="9"
            fill="var(--text-muted)"
          >
            {Math.round(value)}
          </text>
        </g>
      ))}

      {/* Area fills + animated lines + dots */}
      {TREND_DATASETS.map((dataset, datasetIndex) => {
        const path = linePath(dataset.values);
        const lastX = PADDING + (TREND_WEEKS.length - 1) * xStep;
        const areaPath = `${path} L ${lastX} ${HEIGHT - PADDING} L ${PADDING} ${HEIGHT - PADDING} Z`;
        const length = lengths[datasetIndex] ?? 0;
        const lineDelay = datasetIndex * STAGGER_MS;

        return (
          <g key={dataset.label}>
            <path
              d={areaPath}
              fill={`url(#${idPrefix}-grad-${dataset.label})`}
              className={styles.area}
              style={{ animationDelay: `${lineDelay}ms` }}
            />
            <path
              ref={(el) => {
                pathRefs.current[datasetIndex] = el;
              }}
              d={path}
              fill="none"
              stroke={dataset.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.line}
              style={{
                strokeDasharray: length || undefined,
                strokeDashoffset: animated ? 0 : length,
                transition: animated
                  ? `stroke-dashoffset ${LINE_DURATION_MS}ms cubic-bezier(0.2, 0, 0, 1) ${lineDelay}ms`
                  : "none",
              }}
            />
            {dataset.values.map((value, pointIndex) => {
              const isLatest = pointIndex === dataset.values.length - 1;
              const targetOpacity = isLatest ? 1 : 0.45;
              // Dots show up after the line that owns them has had
              // time to draw past their position.
              const lineEndsAt = lineDelay + LINE_DURATION_MS;
              const dotDelay = lineEndsAt - 200 + pointIndex * 40;

              return (
                <circle
                  key={pointIndex}
                  cx={PADDING + pointIndex * xStep}
                  cy={yScale(value)}
                  r={isLatest ? 4 : 2.5}
                  fill={dataset.color}
                  className={styles.dot}
                  style={
                    {
                      "--dot-opacity": targetOpacity,
                      animationDelay: `${dotDelay}ms`,
                    } as React.CSSProperties
                  }
                />
              );
            })}
          </g>
        );
      })}

      {/* X-axis labels */}
      {TREND_WEEKS.map((label, i) => (
        <text
          key={label}
          x={PADDING + i * xStep}
          y={HEIGHT + 28}
          textAnchor="middle"
          fontSize="9"
          fill="var(--text-muted)"
        >
          {label}
        </text>
      ))}
    </svg>
  );
}
