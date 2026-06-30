"use client";

import { useEffect, useRef, useState } from "react";
import type { AnimationEvent, CSSProperties } from "react";
import cn from "classnames";
import { Icon } from "@/components/ui";
import {
  AI_PATCH_LINES,
  PR_CHECKS,
  RUN_SUMMARY,
  SCAN_SEQUENCE,
  WORKFLOW_ACTIVITY,
  WORKFLOW_COLUMNS,
  WORKFLOW_METRICS,
  WORKFLOW_TABS,
} from "../data";
import type { ScanLine } from "../data";
import styles from "../ScanWorkflow.module.scss";

type WorkflowTab = (typeof WORKFLOW_TABS)[number];
type WorkflowTabKey = WorkflowTab["key"];

const AUTO_TAB_MS = 5600;

const TabStatus = ({ tab }: { tab: WorkflowTab }) => (
  <span className={cn(styles.flowStatus, styles[`flowStatus_${tab.accent}`])}>
    <span aria-hidden="true" />
    {tab.status}
  </span>
);

const SCAN_GLYPHS: Record<ScanLine["type"], string> = {
  cmd: "$",
  muted: "",
  run: "✓",
  ok: "✓",
  warn: "!",
  add: "+",
  remove: "−",
  done: "→",
};

const ScanTerminal = ({ active }: { active: boolean }) => {
  const [step, setStep] = useState(0);
  const [reduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const wasActiveRef = useRef(false);

  useEffect(() => {
    if (!active) {
      wasActiveRef.current = false;
      return;
    }

    const justActivated = !wasActiveRef.current;
    wasActiveRef.current = true;

    // Reduced motion: skip the stream and reveal the finished scan.
    if (reduced) {
      const frame = requestAnimationFrame(() => setStep(SCAN_SEQUENCE.length));
      return () => cancelAnimationFrame(frame);
    }

    // Restart from the top each time the Run tab becomes active.
    if (justActivated && step !== 0) {
      const frame = requestAnimationFrame(() => setStep(0));
      return () => cancelAnimationFrame(frame);
    }

    // Stream the lines once, then hold on the final frame — no loop.
    if (step >= SCAN_SEQUENCE.length) return;

    const next = window.setTimeout(() => setStep((value) => value + 1), SCAN_SEQUENCE[step].delay);

    return () => window.clearTimeout(next);
  }, [step, active, reduced]);

  const lines = SCAN_SEQUENCE.slice(0, step);
  const running = !reduced && step < SCAN_SEQUENCE.length;

  return (
    <div
      className={styles.scanTerm}
      role="img"
      aria-label="Axiony CLI scanning a site and generating an AI fix"
    >
      {lines.map((line, index) => {
        const isLast = index === lines.length - 1;
        const showSpinner = line.type === "run" && isLast && running;

        return (
          <code
            key={`${line.type}-${index}`}
            className={cn(styles.scanLine, styles[`scan_${line.type}`])}
          >
            <span className={styles.scanGlyph} aria-hidden="true">
              {showSpinner ? <i className={styles.scanSpinner} /> : SCAN_GLYPHS[line.type]}
            </span>
            <span className={styles.scanText}>
              {line.text}
              {isLast && running && <i className={styles.scanCaret} aria-hidden="true" />}
            </span>
          </code>
        );
      })}
    </div>
  );
};

const RunPanel = ({ active }: { active: boolean }) => (
  <div className={styles.runGrid}>
    <section className={styles.terminalPanel} aria-label="Axiony CLI scan output">
      <div className={styles.terminalChrome}>
        <div className={styles.terminalDots} aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <code>terminal · axiony scan</code>
        <span className={styles.terminalBadge}>live baseline run</span>
      </div>
      <ScanTerminal active={active} />
    </section>

    <section className={styles.runSummary} aria-label="Scan summary">
      {RUN_SUMMARY.map((item) => (
        <article key={item.label} className={styles.summaryCard}>
          <strong>{item.value}</strong>
          <span>{item.label}</span>
        </article>
      ))}
      <div className={styles.integrationStrip}>
        <span>GitHub Action</span>
        <span>GitLab CI</span>
        <span>Cloud schedule</span>
      </div>
    </section>
  </div>
);

const ReviewPanel = () => (
  <div className={styles.reviewGrid}>
    <section className={styles.kanban} aria-label="Issue kanban board">
      {WORKFLOW_COLUMNS.map((column) => (
        <div key={column.title} className={styles.kanbanColumn}>
          <div className={styles.columnHead}>
            <span>{column.title}</span>
            <code>{column.count}</code>
          </div>

          <div className={styles.columnCards}>
            {column.cards.map((card) => (
              <article
                key={`${column.title}-${card.rule}-${card.title}`}
                className={cn(styles.issueCard, styles[`issue_${card.tone}`])}
              >
                <div className={styles.issueTop}>
                  <code>{card.rule}</code>
                  {card.ai && (
                    <span>
                      <Icon name="bolt" size={12} />
                      AI fix
                    </span>
                  )}
                </div>
                <strong>{card.title}</strong>
                <div className={styles.issueMeta}>
                  <span>{card.owner}</span>
                  <span>{card.meta}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      ))}
    </section>

    <aside className={styles.sidePanel} aria-label="Workflow activity and integrations">
      <TrendBlock />
      <ActivityBlock />
    </aside>
  </div>
);

const FixPanel = () => (
  <div className={styles.fixGrid}>
    <section className={styles.aiPatchPanel}>
      <div className={styles.aiPatchHead}>
        <span>
          <Icon name="bolt" size={16} />
        </span>
        <div>
          <code>AI fix ready</code>
          <h4>Button name issue becomes a reviewable patch.</h4>
        </div>
      </div>

      <div className={styles.aiReason}>
        <span>Why it failed</span>
        <p>Screen readers hear only “button”. The fix adds a stable accessible name.</p>
      </div>

      <pre className={styles.patch} aria-label="AI suggested code patch">
        {AI_PATCH_LINES.map((line) => (
          <code key={`${line.type}-${line.code}`} className={styles[`patch_${line.type}`]}>
            <span>{line.type === "add" ? "+" : line.type === "remove" ? "-" : " "}</span>
            {line.code}
          </code>
        ))}
      </pre>
    </section>

    <aside className={styles.fixSide}>
      <div className={styles.sideBlock}>
        <div className={styles.sideHead}>
          <span>PR checks</span>
          <code>after re-scan</code>
        </div>
        <div className={styles.prList}>
          {PR_CHECKS.map((check) => (
            <article key={`${check.name}-${check.title}`} className={styles.prCard}>
              <span>{check.name}</span>
              <strong>{check.title}</strong>
              <small>{check.detail}</small>
            </article>
          ))}
        </div>
      </div>
      <TrendBlock compact />
    </aside>
  </div>
);

const TREND_LINE_PATH = "M12 88 L58 82 L104 84 L150 63 L196 54 L248 34";

const TrendBlock = ({ compact }: { compact?: boolean }) => (
  <div className={cn(styles.sideBlock, compact && styles.sideBlock_compact)}>
    <div className={styles.sideHead}>
      <span>Baseline trend</span>
      <code>last 7 days</code>
    </div>
    <svg className={styles.trendChart} viewBox="0 0 260 118" aria-hidden="true">
      <path className={styles.trendGrid} d="M12 28H248M12 62H248M12 96H248" />
      <path
        className={styles.trendArea}
        d="M12 88 L58 82 L104 84 L150 63 L196 54 L248 34 L248 106 L12 106 Z"
      />
      <path className={styles.trendLine} d={TREND_LINE_PATH} />
      {/* Cycled "live data" pulse — a short glow travels the line on a loop. */}
      <path className={styles.trendPulse} d={TREND_LINE_PATH} pathLength={100} />
      <circle className={styles.trendDot} cx="248" cy="34" r="5" />
    </svg>
    <div className={styles.trendMeta}>
      <strong>84 → 92</strong>
      <span>new issues blocked, fixed work counted</span>
    </div>
  </div>
);

const ActivityBlock = () => (
  <div className={styles.sideBlock}>
    <div className={styles.sideHead}>
      <span>Activity</span>
      <code>live</code>
    </div>
    <div className={styles.activityList}>
      {WORKFLOW_ACTIVITY.map((item) => (
        <article
          key={`${item.source}-${item.title}`}
          className={cn(styles.activityItem, styles[`activity_${item.tone}`])}
        >
          <span>{item.source}</span>
          <strong>{item.title}</strong>
          <small>{item.detail}</small>
        </article>
      ))}
    </div>
  </div>
);

export const WorkflowBoard = () => {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [activeKey, setActiveKey] = useState<WorkflowTabKey>("run");
  const [cycleKey, setCycleKey] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const isInViewRef = useRef(false);
  const activeTab = WORKFLOW_TABS.find((tab) => tab.key === activeKey) ?? WORKFLOW_TABS[0];
  const cycleClass = cycleKey % 2 === 0 ? styles.flowTab_cycleA : styles.flowTab_cycleB;

  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      isInViewRef.current = true;
      const frame = globalThis.requestAnimationFrame(() => {
        setActiveKey("run");
        setCycleKey((key) => key + 1);
        setIsInView(true);
      });
      return () => globalThis.cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const nextInView = entry.isIntersecting;

        if (nextInView && !isInViewRef.current) {
          setActiveKey("run");
          setCycleKey((key) => key + 1);
        }

        isInViewRef.current = nextInView;
        setIsInView(nextInView);
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const selectTab = (key: WorkflowTabKey) => {
    setActiveKey(key);
    setCycleKey((cycle) => cycle + 1);
  };

  const handleTabProgressEnd = (event: AnimationEvent<HTMLSpanElement>, tabKey: WorkflowTabKey) => {
    if (!event.animationName.includes("tabProgress")) return;
    if (!isInView || isPaused || tabKey !== activeKey) return;

    setCycleKey((key) => key + 1);
    setActiveKey((current) => {
      const index = WORKFLOW_TABS.findIndex((tab) => tab.key === current);
      return WORKFLOW_TABS[(index + 1) % WORKFLOW_TABS.length].key;
    });
  };

  return (
    <div
      ref={boardRef}
      className={cn(styles.boardWrap, (isPaused || !isInView) && styles.boardWrap_paused)}
      style={{ "--workflow-tab-ms": `${AUTO_TAB_MS}ms` } as CSSProperties}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        const nextTarget = event.relatedTarget;
        if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
          setIsPaused(false);
        }
      }}
    >
      <div className={styles.flowTabs} role="tablist" aria-label="Axiony workflow">
        {WORKFLOW_TABS.map((tab) => {
          const isActive = tab.key === activeKey;

          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              id={`workflow-tab-${tab.key}`}
              aria-selected={isActive}
              aria-controls={`workflow-panel-${tab.key}`}
              className={cn(
                styles.flowTab,
                styles[`flowTab_${tab.accent}`],
                isActive && styles.flowTab_active,
                isActive && cycleClass,
              )}
              onClick={() => selectTab(tab.key)}
            >
              <code>{tab.n}</code>
              <span className={styles.flowTabCopy}>
                <strong>{tab.label}</strong>
                <small>{tab.title}</small>
              </span>
              <span
                className={styles.flowTabProgress}
                aria-hidden="true"
                onAnimationEnd={(event) => handleTabProgressEnd(event, tab.key)}
              />
            </button>
          );
        })}
      </div>

      <div className={styles.workspacePreview}>
        <div className={styles.workspaceTop}>
          <div className={styles.workspaceCopyStack}>
            {WORKFLOW_TABS.map((tab) => {
              const isActive = tab.key === activeKey;

              return (
                <div
                  key={tab.key}
                  className={cn(styles.workspaceCopy, isActive && styles.workspaceCopy_active)}
                  aria-hidden={!isActive}
                >
                  <span className={styles.workspaceKicker}>acme · accessibility workspace</span>
                  <h3>{tab.title}</h3>
                  <p>{tab.text}</p>
                </div>
              );
            })}
          </div>
          <TabStatus tab={activeTab} />
        </div>

        <div className={styles.metricGrid}>
          {WORKFLOW_METRICS.map((metric) => (
            <div key={metric.label} className={cn(styles.metric, styles[`metric_${metric.tone}`])}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </div>
          ))}
        </div>

        <div className={styles.flowPanel}>
          {WORKFLOW_TABS.map((tab) => {
            const isActive = tab.key === activeKey;

            return (
              <div
                key={tab.key}
                id={`workflow-panel-${tab.key}`}
                role="tabpanel"
                aria-labelledby={`workflow-tab-${tab.key}`}
                aria-hidden={!isActive}
                className={cn(styles.flowPanelItem, isActive && styles.flowPanelItem_active)}
              >
                {tab.key === "run" && <RunPanel active={isInView && isActive} />}
                {tab.key === "review" && <ReviewPanel />}
                {tab.key === "fix" && <FixPanel />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
