"use client";

import { useState } from "react";
import { Button, Container, Icon, SectionEyebrow } from "@/components/ui";
import { Section } from "@/components/layout";
import cn from "classnames";
import { SOLUTION_LAYERS, type SolutionLayer } from "@/lib/data/home";
import styles from "./Solution.module.scss";

/**
 * The solution section. Lead with the one idea no other a11y tool has —
 * a baseline that can only move forward — shown as a hands-on demo, then
 * the free CLI → paid cloud product layers.
 */
export function Solution() {
  return (
    <Section>
      <Container>
        <div className={cn(styles.intro, "reveal")}>
          <SectionEyebrow>Solution</SectionEyebrow>
          <h2>Accessibility that can only get better.</h2>
          <p className={styles.lead}>
            Other tools hand you a 500-issue report and wish you luck. Axiony
            draws a line — your <strong>baseline</strong> — and blocks every{" "}
            <em>new</em> issue at the pull request. Existing debt is tracked, not
            blocking. So your score moves one way: up.
          </p>
        </div>

        <div className={cn(styles.stageWrap, "reveal")}>
          <BaselineDemo />
        </div>

        <div className={cn(styles.layers, "reveal")}>
          {SOLUTION_LAYERS.map((layer, i) => (
            <LayerCard key={layer.name} layer={layer} index={i} />
          ))}
        </div>

        <div className={cn(styles.cta, "reveal")}>
          <p>
            Start free with the CLI. Upgrade to the cloud when you want it to
            remember, track, and protect what you&apos;ve fixed.
          </p>
          <div className={styles.ctaButtons}>
            <Button href="/docs">Start free with the CLI</Button>
            <Button href="/pricing" variant="secondary">
              See cloud pricing
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// =====================================================================
// Interactive centerpiece — the baseline ratchet
// =====================================================================

const INITIAL_POINTS = [66, 72, 78, 85, 90];
const MAX_POINTS = 9;

function BaselineDemo() {
  const [points, setPoints] = useState<number[]>(INITIAL_POINTS);
  const [blocked, setBlocked] = useState(0);
  const [merged, setMerged] = useState(0);
  const [pr, setPr] = useState(1843);
  const [regressKey, setRegressKey] = useState(0);
  const [mergeKey, setMergeKey] = useState(0);
  const [status, setStatus] = useState<{ kind: "idle" | "merge" | "block"; text: string }>({
    kind: "idle",
    text: "Your baseline is locked. Try to break it — or merge a fix and watch it climb.",
  });

  const baseline = points[points.length - 1];
  const maxed = baseline >= 98;

  const mergeFix = () => {
    const nextPr = pr + 1;
    setPr((p) => p + 1);
    if (maxed) {
      setStatus({ kind: "merge", text: "Baseline is at 98 — your app is basically spotless. 🎉" });
      return;
    }
    setPoints((pts) => {
      const last = pts[pts.length - 1];
      const inc = last >= 96 ? 1 : last >= 90 ? 2 : last >= 80 ? 3 : 4;
      const grown = [...pts, Math.min(98, last + inc)];
      return grown.length > MAX_POINTS ? grown.slice(grown.length - MAX_POINTS) : grown;
    });
    setMerged((m) => m + 1);
    setMergeKey((k) => k + 1);
    setStatus({ kind: "merge", text: `PR #${nextPr} merged — baseline locked higher. It can't slip back.` });
  };

  const tryRegress = () => {
    const nextPr = pr + 1;
    setPr((p) => p + 1);
    setBlocked((b) => b + 1);
    setRegressKey((k) => k + 1);
    setStatus({
      kind: "block",
      text: `Blocked at PR #${nextPr} — this change would reintroduce color-contrast.`,
    });
  };

  return (
    <div className={styles.stage}>
      <div className={styles.stageHeader}>
        <span className={styles.stageLabel}>
          <CloudIcon />
          Axiony Cloud · baseline
        </span>
        <span className={styles.stageTier}>Pro &amp; Team</span>
      </div>

      <p className={styles.stageTitle}>Try to ship a regression.</p>

      <BaselineChart points={points} regressKey={regressKey} mergeKey={mergeKey} />

      <div className={cn(styles.statusLine, styles[`status_${status.kind}`])}>
        {status.kind === "block" ? <ShieldIcon /> : status.kind === "merge" ? <Icon name="check" size={16} /> : <LockIcon />}
        <span>{status.text}</span>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <LockIcon />
          <strong>{baseline}</strong>
          <span>baseline locked</span>
        </div>
        <div className={styles.stat}>
          <ShieldIcon />
          <strong>{blocked}</strong>
          <span>regressions blocked</span>
        </div>
        <div className={styles.stat}>
          <Icon name="check" size={16} className={styles.statCheck} />
          <strong>{merged}</strong>
          <span>fixes merged</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.debtDot} />
          <strong>47</strong>
          <span>existing · tracked</span>
        </div>
      </div>

      <div className={styles.controls}>
        <button type="button" className={styles.tryBtn} onClick={tryRegress}>
          <ShieldIcon />
          Try to ship a regression
        </button>
        <button type="button" className={styles.mergeBtn} onClick={mergeFix}>
          <Icon name="check" size={16} />
          Merge a fix
        </button>
      </div>
    </div>
  );
}

interface ChartProps {
  points: number[];
  regressKey: number;
  mergeKey: number;
}

function BaselineChart({ points, regressKey, mergeKey }: ChartProps) {
  const W = 640;
  const H = 220;
  const PAD = { l: 16, r: 16, t: 20, b: 26 };
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;
  const SMIN = 55;
  const SMAX = 100;
  const n = points.length;

  const x = (i: number) => PAD.l + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const y = (s: number) => PAD.t + (1 - (s - SMIN) / (SMAX - SMIN)) * plotH;

  const coords = points.map((s, i) => [x(i), y(s)] as const);
  const line = coords.map(([cx, cy], i) => `${i ? "L" : "M"}${cx.toFixed(1)} ${cy.toFixed(1)}`).join(" ");
  const area = `${line} L${x(n - 1).toFixed(1)} ${(H - PAD.b).toFixed(1)} L${x(0).toFixed(1)} ${(H - PAD.b).toFixed(1)} Z`;

  const last = points[n - 1];
  const [headX, headY] = coords[n - 1];

  return (
    <svg className={styles.chart} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Accessibility health baseline, currently locked at ${last}`}>
      <g className={styles.grid}>
        {[60, 75, 90].map((s) => (
          <line key={s} x1={PAD.l} y1={y(s)} x2={W - PAD.r} y2={y(s)} />
        ))}
      </g>

      <line className={styles.baseLine} x1={PAD.l} y1={headY} x2={W - PAD.r} y2={headY} />

      <path className={styles.area} d={area} />
      <path className={styles.line} d={line} />

      {coords.slice(0, -1).map(([cx, cy], i) => (
        <circle key={i} className={styles.node} cx={cx} cy={cy} r="3.5" />
      ))}

      {regressKey > 0 && (
        <g key={`r-${regressKey}`} className={styles.ghost}>
          <line x1={headX} y1={headY} x2={headX} y2={y(Math.max(SMIN, last - 18))} />
          <circle cx={headX} cy={y(Math.max(SMIN, last - 18))} r="5" />
          <path
            className={styles.ghostX}
            d={`M${headX - 4} ${y(Math.max(SMIN, last - 18)) - 4}l8 8M${headX + 4} ${y(Math.max(SMIN, last - 18)) - 4}l-8 8`}
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
}

// =====================================================================
// Product layers
// =====================================================================

const LAYER_STEPS = ["Catch it", "Cover it", "Never regress"] as const;

function LayerCard({ layer, index }: { layer: SolutionLayer; index: number }) {
  return (
    <div className={cn(styles.layer, styles[`layer_${layer.accent}`])}>
      <div className={styles.layerTop}>
        <span className={styles.layerStep}>
          {String(index + 1).padStart(2, "0")} · {LAYER_STEPS[index]}
        </span>
        <span className={cn(styles.tier, styles[`tier_${layer.accent}`])}>{layer.tier}</span>
      </div>

      <h3 className={styles.layerName}>{layer.name}</h3>
      <p className={styles.layerDesc}>{layer.audience}</p>

      <span className={styles.limit}>{layer.limit}</span>

      {layer.command && (
        <div className={styles.command}>
          <span className={styles.prompt}>$</span>
          {layer.command}
        </div>
      )}

      {layer.inherits && <p className={styles.inherits}>{layer.inherits}</p>}

      <ul className={styles.points}>
        {layer.points.map((point) => (
          <li key={point}>
            <Icon name="check" size={15} className={styles.pointCheck} />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Inline icons ─────────────────────────────────────────────────────

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l7 3v5c0 4.4-3 8.3-7 9.5-4-1.2-7-5.1-7-9.5V6l7-3z" />
      <path d="M9.2 12l2 2 3.6-3.8" />
    </svg>
  );
}

function CloudIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.6-1.4A3.8 3.8 0 0 1 18 18H7z" />
    </svg>
  );
}
