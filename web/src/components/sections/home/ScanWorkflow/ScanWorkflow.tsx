"use client";

import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import { Section } from "@/components/layout";
import { Container, Icon, SectionEyebrow, Terminal, blank, txt } from "@/components/ui";
import type { TerminalLine } from "@/components/ui";
import cn from "classnames";
import styles from "./ScanWorkflow.module.scss";

// Free-CLI scan output for step 1.
const SCAN_LINES: TerminalLine[] = [
  [txt("$", "prompt"), txt(" "), txt("npx axiony-cli scan https://acme.com --ci", "cmd")],
  [txt("  Axiony CLI v0.3.0 · axe-core + Playwright · free & open-source", "dim")],
  blank,
  [txt("  ✓ Loaded page · waited for stable DOM", "output")],
  [txt("  ✓ Ran axe-core ruleset · 142 checks", "success")],
  blank,
  [txt("  9 issues found", "output")],
  [txt("  ├─ ", "dim"), txt("2 critical", "error"), txt("   color-contrast, button-name", "output")],
  [txt("  ├─ ", "dim"), txt("4 serious", "warn"), txt("    link-name, label", "output")],
  [txt("  └─ ", "dim"), txt("3 moderate", "blue"), txt("   heading-order", "output")],
  blank,
  [txt("  Exit 1", "warn"), txt("  · fails the build, blocks the merge", "dim")],
];

interface StepDef {
  key: string;
  n: string;
  title: string;
  tag: string;
  accent: "green" | "blue" | "violet";
  caption: string;
}

const STEPS: readonly StepDef[] = [
  {
    key: "scan",
    n: "01",
    title: "Scan in CI",
    tag: "CLI · Free",
    accent: "green",
    caption:
      "Every push runs the free, open-source CLI in your pipeline. It scans the real DOM with axe-core and fails the build on new issues — no account needed.",
  },
  {
    key: "site",
    n: "02",
    title: "Scan the whole site",
    tag: "Cloud · Pro",
    accent: "blue",
    caption:
      "Axiony Cloud scans your whole site on a schedule, keeps full history so you can compare any two runs, emails alerts on regressions — and suggests an AI fix for every issue.",
  },
  {
    key: "team",
    n: "03",
    title: "Roll out to the team",
    tag: "Cloud · Team",
    accent: "violet",
    caption:
      "Connect GitHub and GitLab for CI/CD status checks and PR / MR comments, share baselines across branches, route issues to owners, and get AI PR comments plus Slack alerts.",
  },
];

const STEP_MS = 5600;

export function ScanWorkflow() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInViewOnce(ref);
  const reduce = usePrefersReducedMotion();
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!inView || reduce || !auto) return undefined;
    const id = window.setInterval(() => setActive((a) => (a + 1) % STEPS.length), STEP_MS);
    return () => window.clearInterval(id);
  }, [inView, reduce, auto]);

  const select = (i: number) => {
    setActive(i);
    setAuto(false);
  };

  const step = STEPS[active];

  return (
    <Section id="workflow" className={styles.workflow}>
      <Container>
        <div ref={ref}>
          <div className={cn(styles.header, "reveal")}>
            <SectionEyebrow>Workflow</SectionEyebrow>
            <h2>Start free in your terminal. Scale to the whole team.</h2>
            <p>
              The free CLI gives developers instant feedback locally and in CI. Axiony
              Cloud adds scheduled site-wide scans with full history, then a shared
              workspace wired into GitHub, GitLab and Slack.
            </p>
          </div>

          <div className={cn(styles.stepper, "reveal")} role="tablist" aria-label="Axiony workflow steps">
            {STEPS.map((s, i) => (
              <button
                key={s.key}
                type="button"
                role="tab"
                id={`wf-tab-${i}`}
                aria-selected={i === active}
                aria-controls="wf-panel"
                className={cn(
                  styles.step,
                  styles[`step_${s.accent}`],
                  i === active && styles.step_active,
                  i < active && styles.step_done,
                )}
                onClick={() => select(i)}
              >
                <span className={styles.stepNum}>
                  {i < active ? <Icon name="check" size={16} /> : s.n}
                </span>
                <span className={styles.stepText}>
                  <strong>{s.title}</strong>
                  <span>{s.tag}</span>
                </span>
              </button>
            ))}
          </div>

          <div
            id="wf-panel"
            role="tabpanel"
            aria-labelledby={`wf-tab-${active}`}
            className={cn(styles.stage, styles[`stage_${step.accent}`], "reveal")}
          >
            <p key={`cap-${active}`} className={styles.caption}>
              {step.caption}
            </p>
            <div key={`viz-${active}`} className={styles.viz}>
              {active === 0 && <ScanViz start={inView} reduce={reduce} />}
              {active === 1 && <ScannerViz />}
              {active === 2 && <TeamViz />}
            </div>
          </div>

          <p className={styles.hint}>
            {auto ? "Auto-playing — tap any step to take over" : "Step through the workflow above"}
          </p>
        </div>
      </Container>
    </Section>
  );
}

// ── Step 1 · Scan (free CLI) ─────────────────────────────────────────
function ScanViz({ start, reduce }: { start: boolean; reduce: boolean }) {
  const tw = useTypewriter(SCAN_LINES, start && !reduce);
  const lines = reduce ? SCAN_LINES : tw.visible;
  return (
    <Terminal
      lines={lines}
      filename="acme-web · GitHub Actions"
      showCursor={!reduce && start && !tw.complete}
      animated
    />
  );
}

// ── Step 2 · Hosted web scanner ──────────────────────────────────────
const HISTORY = [
  { when: "Today · 09:14", trigger: "on deploy", score: 92, delta: "+2", dir: "up" },
  { when: "Yesterday", trigger: "scheduled", score: 90, delta: "0", dir: "flat" },
  { when: "Sun · 02:00", trigger: "scheduled", score: 90, delta: "−1", dir: "down" },
  { when: "Fri · 14:20", trigger: "manual", score: 91, delta: "+3", dir: "up" },
] as const;

const STORED = [
  { sev: "critical", rule: "color-contrast", where: ".cta-banner", status: "Open", tone: "open", ai: true },
  { sev: "serious", rule: "link-name", where: "footer nav", status: "Assigned", tone: "assigned", ai: true },
  { sev: "moderate", rule: "heading-order", where: "/pricing", status: "Snoozed", tone: "snoozed", ai: false },
] as const;

function ScannerViz() {
  return (
    <div className={styles.scanner}>
      <div className={styles.targetBar}>
        <span className={styles.target}>
          <Icon name="globe" size={15} />
          acme.com
          <span className={styles.pages}>47 pages</span>
        </span>
        <span className={styles.schedule}>
          <ClockMark />
          Daily · 02:00
        </span>
        <span className={styles.scanNow}>Scan now</span>
      </div>

      <div className={styles.block}>
        <div className={styles.blockHead}>
          <span>Scan history</span>
          <span className={styles.blockMeta}>kept for every run</span>
        </div>
        <div className={styles.history}>
          {HISTORY.map((h) => (
            <div key={h.when} className={styles.histRow}>
              <span className={styles.histWhen}>{h.when}</span>
              <span className={styles.histTrigger}>{h.trigger}</span>
              <span className={styles.histScore}>{h.score}</span>
              <span className={cn(styles.histDelta, styles[`d_${h.dir}`])}>{h.delta}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.block}>
        <div className={styles.blockHead}>
          <span>Stored issues</span>
          <span className={styles.blockMeta}>7 open · saved across runs</span>
        </div>
        <div className={styles.stored}>
          {STORED.map((s) => (
            <div key={s.rule} className={styles.storedRow}>
              <span className={cn(styles.sev, styles[`sev_${s.sev}`])} />
              <code>{s.rule}</code>
              <span className={styles.where}>{s.where}</span>
              <span className={styles.storedRight}>
                {s.ai && (
                  <span className={styles.aiFix}>
                    <SparkleMark />
                    AI fix
                  </span>
                )}
                <span className={cn(styles.statusPill, styles[`st_${s.tone}`])}>{s.status}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Step 3 · Team workspace ──────────────────────────────────────────
const INTEGRATIONS = [
  { key: "gh", name: "GitHub", detail: "Status checks + PR comments · 3 repos", Logo: GitHubMark, brand: "gh" },
  { key: "gl", name: "GitLab", detail: "MR checks + comments · 2 projects", Logo: GitLabMark, brand: "gl" },
  { key: "sl", name: "Slack", detail: "Live alerts to #a11y-alerts", Logo: SlackMark, brand: "sl" },
] as const;

const TEAM_OPTS = [
  "AI comments in pull requests",
  "Shared baselines",
  "Branch & commit tracking",
  "Team members & roles",
  "CI/CD status checks",
  "Higher scan limits",
] as const;

function TeamViz() {
  return (
    <div className={styles.team}>
      <div className={styles.teamHead}>
        <div>
          <span className={styles.dashKicker}>Acme · team workspace</span>
          <strong>Connected &amp; in sync</strong>
        </div>
        <span className={styles.avatars} aria-hidden="true">
          {["MC", "AP", "SK"].map((a) => (
            <span key={a} className={styles.avatar}>
              {a}
            </span>
          ))}
          <span className={cn(styles.avatar, styles.avatarMore)}>+5</span>
        </span>
      </div>

      <div className={styles.integrations}>
        {INTEGRATIONS.map(({ key, name, detail, Logo, brand }) => (
          <div key={key} className={styles.integration}>
            <span className={cn(styles.intLogo, styles[`brand_${brand}`])}>
              <Logo />
            </span>
            <span className={styles.intText}>
              <strong>{name}</strong>
              <span>{detail}</span>
            </span>
            <span className={styles.connected}>
              <span className={styles.connDot} />
              Connected
            </span>
          </div>
        ))}
      </div>

      <div className={styles.teamOpts}>
        {TEAM_OPTS.map((o) => (
          <span key={o} className={styles.opt}>
            <Icon name="check" size={13} className={styles.optCheck} />
            {o}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Inline glyphs & brand marks ──────────────────────────────────────
function ClockMark() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function SparkleMark() {
  return (
    <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor" aria-hidden="true">
      <path d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6z" />
      <path d="M19 14l.9 2.6L22 17l-2.1.8L19 20l-.9-2.2L16 17l2.1-.4z" />
    </svg>
  );
}

function GitHubMark() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
      <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56 0-.27-.01-1-.02-1.96-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5z" />
    </svg>
  );
}

function GitLabMark() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path fill="#E24329" d="M12 22 16.2 9H7.8z" />
      <path fill="#FC6D26" d="M12 22 7.8 9H2zM12 22 16.2 9H22z" />
      <path fill="#FCA326" d="M2 9 3.3 4 7.8 9zM22 9 20.7 4 16.2 9z" />
    </svg>
  );
}

function SlackMark() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <rect x="9.1" y="2.4" width="3.4" height="10" rx="1.7" fill="#36C5F0" />
      <rect x="11.5" y="11.5" width="10" height="3.4" rx="1.7" fill="#2EB67D" />
      <rect x="11.5" y="11.5" width="3.4" height="10" rx="1.7" fill="#ECB22E" />
      <rect x="2.5" y="9.1" width="10" height="3.4" rx="1.7" fill="#E01E5A" />
    </svg>
  );
}

// ── Hooks ────────────────────────────────────────────────────────────
interface TypewriterState {
  visible: TerminalLine[];
  complete: boolean;
}

function useTypewriter(lines: TerminalLine[], shouldStart: boolean): TypewriterState {
  const [visible, setVisible] = useState<TerminalLine[]>([]);
  const [complete, setComplete] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!shouldStart || complete) return undefined;

    let timeoutId: number | undefined;

    const advance = () => {
      const i = indexRef.current;
      if (i >= lines.length) {
        setComplete(true);
        return;
      }
      setVisible((prev) => [...prev, lines[i]]);
      const delay = i < 3 ? 90 : 70;
      indexRef.current = i + 1;
      timeoutId = window.setTimeout(advance, delay);
    };

    timeoutId = window.setTimeout(advance, 160);
    return () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [complete, lines, shouldStart]);

  return { visible, complete };
}

function useInViewOnce(ref: RefObject<HTMLElement | null>): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || visible) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -22% 0px", threshold: 0.2 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, visible]);

  return visible;
}

function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduce;
}
