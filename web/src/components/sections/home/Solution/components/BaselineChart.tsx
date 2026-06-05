import styles from "../Solution.module.scss";

interface BaselineChartProps {
  points: number[];
  regressKey: number;
  mergeKey: number;
}

const W = 640;
const H = 220;
const PAD = { l: 16, r: 16, t: 20, b: 26 };
const SMIN = 55;
const SMAX = 100;

export const BaselineChart = ({ points, regressKey, mergeKey }: BaselineChartProps) => {
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;
  const n = points.length;

  const x = (index: number) => PAD.l + (n <= 1 ? plotW / 2 : (index / (n - 1)) * plotW);
  const y = (score: number) => PAD.t + (1 - (score - SMIN) / (SMAX - SMIN)) * plotH;

  const coords = points.map((score, index) => [x(index), y(score)] as const);
  const line = coords
    .map(([cx, cy], index) => `${index ? "L" : "M"}${cx.toFixed(1)} ${cy.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${x(n - 1).toFixed(1)} ${(H - PAD.b).toFixed(1)} L${x(0).toFixed(1)} ${(H - PAD.b).toFixed(1)} Z`;

  const last = points[n - 1];
  const [headX, headY] = coords[n - 1];
  const regressionY = y(Math.max(SMIN, last - 18));

  return (
    <svg
      className={styles.chart}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Accessibility score, currently ${last} out of 100`}
    >
      <g className={styles.grid}>
        {[60, 75, 90].map((score) => (
          <line key={score} x1={PAD.l} y1={y(score)} x2={W - PAD.r} y2={y(score)} />
        ))}
      </g>

      <line className={styles.baseLine} x1={PAD.l} y1={headY} x2={W - PAD.r} y2={headY} />

      <path className={styles.area} d={area} />
      <path className={styles.line} d={line} />

      {coords.slice(0, -1).map(([cx, cy], index) => (
        <circle key={index} className={styles.node} cx={cx} cy={cy} r="3.5" />
      ))}

      {regressKey > 0 && (
        <g key={`r-${regressKey}`} className={styles.ghost}>
          <line x1={headX} y1={headY} x2={headX} y2={regressionY} />
          <circle cx={headX} cy={regressionY} r="5" />
          <path
            className={styles.ghostX}
            d={`M${headX - 4} ${regressionY - 4}l8 8M${headX + 4} ${regressionY - 4}l-8 8`}
          />
        </g>
      )}

      <g key={`h-${mergeKey}`} className={styles.head}>
        <circle className={styles.headPulse} cx={headX} cy={headY} r="6" />
        <circle className={styles.headDot} cx={headX} cy={headY} r="6" />
        <text className={styles.headLabel} x={headX} y={headY - 13} textAnchor="middle">
          {last}
        </text>
      </g>
    </svg>
  );
};
