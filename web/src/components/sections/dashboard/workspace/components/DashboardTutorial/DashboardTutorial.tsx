"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import cn from "classnames";
import { Icon } from "@/components/ui";
import type { BillingPlan } from "@/lib/billing";
import type { DashboardTab } from "@/lib/data/dashboard";
import styles from "./DashboardTutorial.module.scss";

interface TutorialStep {
  id: string;
  tab: DashboardTab;
  target: string;
  kicker: string;
  title: string;
  text: string;
  hint: string;
  primaryLabel?: string;
  advanceOnTargetClick?: boolean;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
  viewportWidth: number;
  viewportHeight: number;
}

interface CardPosition {
  left: number;
  top: number;
  width: number;
  maxHeight: number;
  placement: "above" | "below" | "center" | "mobile";
}

interface DashboardTutorialProps {
  open: boolean;
  plan: BillingPlan;
  activeTab: DashboardTab;
  onNavigate: (tab: DashboardTab) => void;
  onSkip: () => void;
  onComplete: () => void;
}

const TARGET_ATTR = "data-tour";
const CARD_MAX_WIDTH = 380;
const CARD_FALLBACK_HEIGHT = 340;
const CARD_GAP = 14;
const CARD_REVEAL_DELAY_MS = 180;
const VIEWPORT_GUTTER = 16;
const TARGET_GUTTER = 8;
const MOBILE_BREAKPOINT = 640;

const TOUR_STEPS: Record<BillingPlan, TutorialStep[]> = {
  free: [
    {
      id: "overview",
      tab: "overview",
      target: "overview-summary",
      kicker: "Start here",
      title: "Read the workspace pulse",
      text: "This area tells you how many pages are tracked, the average score, open issues, and regressions caught.",
      hint: "Use it as the first checkpoint after every scan.",
    },
    {
      id: "trend",
      tab: "overview",
      target: "overview-trends",
      kicker: "Progress",
      title: "Watch score and issue movement",
      text: "The chart shows whether repeated scans are improving or creating new debt for the latest tracked page.",
      hint: "Re-scan the same URL to extend this history.",
    },
    {
      id: "open-issues-nav",
      tab: "overview",
      target: "dashboard-nav-issues",
      kicker: "Next click",
      title: "Open Issues",
      text: "Issues is where you review the actual accessibility work instead of only looking at the score.",
      hint: "Click the highlighted sidebar item, or use Next.",
      primaryLabel: "Open Issues",
      advanceOnTargetClick: true,
    },
    {
      id: "issues-table",
      tab: "issues",
      target: "issues-table",
      kicker: "Triage",
      title: "Open a row for details",
      text: "Click any issue row to see the affected element, WCAG rule, why it matters, and the suggested fix.",
      hint: "Start with Critical and Serious issues before polishing smaller ones.",
    },
    {
      id: "resolved-filter",
      tab: "issues",
      target: "issues-filters",
      kicker: "History",
      title: "Check resolved issues",
      text: "After a follow-up scan, fixed issues stay available under the Resolved filter instead of disappearing.",
      hint: "This is how you prove progress over time.",
    },
    {
      id: "scan-nav",
      tab: "issues",
      target: "dashboard-nav-scan",
      kicker: "Next click",
      title: "Run a follow-up scan",
      text: "The scanner saves another history point for the same URL, so Axiony can compare it against the baseline.",
      hint: "Click New scan, or use Next.",
      primaryLabel: "Open Scanner",
      advanceOnTargetClick: true,
    },
    {
      id: "scan-runner",
      tab: "scan",
      target: "scan-runner",
      kicker: "Scanner",
      title: "Scan the same URL again",
      text: "Paste a URL or pick a recent page, then run the scan. Results save automatically into this workspace.",
      hint: "When you finish, you can replay this walkthrough any time from Settings.",
      primaryLabel: "Finish",
    },
  ],
  pro: [
    {
      id: "overview",
      tab: "overview",
      target: "overview-summary",
      kicker: "Baseline",
      title: "Start with the saved baseline",
      text: "Known issues are tracked as existing debt, so future scans can focus your attention on what changed.",
      hint: "Use the overview before deciding what to fix next.",
    },
    {
      id: "issues-nav",
      tab: "overview",
      target: "dashboard-nav-issues",
      kicker: "Next click",
      title: "Move into issue triage",
      text: "Open Issues to inspect details, set status, and keep regression work separate from known debt.",
      hint: "Click the highlighted sidebar item, or use Next.",
      primaryLabel: "Open Issues",
      advanceOnTargetClick: true,
    },
    {
      id: "issues-table",
      tab: "issues",
      target: "issues-table",
      kicker: "Triage",
      title: "Use details and status together",
      text: "Each row opens a fix-focused detail view, while the status field keeps the work organized.",
      hint: "Use In progress for issues you are actively fixing.",
    },
    {
      id: "scan-nav",
      tab: "issues",
      target: "dashboard-nav-scan",
      kicker: "Regression loop",
      title: "Re-scan after a fix",
      text: "Run the same URL after a code change to see resolved issues and any new regressions.",
      hint: "Click New scan, or use Next.",
      primaryLabel: "Open Scanner",
      advanceOnTargetClick: true,
    },
    {
      id: "scan-runner",
      tab: "scan",
      target: "scan-runner",
      kicker: "Scanner",
      title: "Capture the follow-up result",
      text: "Axiony saves the new scan into the page history and compares it against the baseline.",
      hint: "The result updates trends, resolved history, and open issue totals.",
    },
    {
      id: "settings-nav",
      tab: "scan",
      target: "dashboard-nav-settings",
      kicker: "Plan control",
      title: "Open Settings",
      text: "Settings is where plan limits, usage, and upgrade state live while you test the product flow.",
      hint: "Click Settings, or use Next.",
      primaryLabel: "Open Settings",
      advanceOnTargetClick: true,
    },
    {
      id: "settings",
      tab: "settings",
      target: "settings-panel",
      kicker: "Usage",
      title: "Watch limits before they surprise you",
      text: "Check scan usage and domain usage here before you hit a plan limit in the middle of work.",
      hint: "You can replay this walkthrough any time from this Settings page.",
      primaryLabel: "Finish",
    },
  ],
  team: [
    {
      id: "overview",
      tab: "overview",
      target: "overview-summary",
      kicker: "Shared context",
      title: "Start with one source of truth",
      text: "The overview gives the team the same numbers for tracked pages, open debt, and regression movement.",
      hint: "Use it before standups, QA review, or release decisions.",
    },
    {
      id: "team-nav",
      tab: "overview",
      target: "dashboard-nav-team",
      kicker: "Next click",
      title: "Open Team",
      text: "Team is where shared ownership and collaboration workflows live in the dashboard.",
      hint: "Click Team, or use Next.",
      primaryLabel: "Open Team",
      advanceOnTargetClick: true,
    },
    {
      id: "team",
      tab: "team",
      target: "feature-page",
      kicker: "Collaboration",
      title: "Bring the work to the right people",
      text: "Use the team workflow to think about owners, roles, and review responsibilities instead of one-person tracking.",
      hint: "This keeps accessibility work from becoming invisible.",
    },
    {
      id: "issues-nav",
      tab: "team",
      target: "dashboard-nav-issues",
      kicker: "Next click",
      title: "Open Issues for ownership",
      text: "The Issues tab is still the operating table: details, severity, assignee signal, and status live there.",
      hint: "Click Issues, or use Next.",
      primaryLabel: "Open Issues",
      advanceOnTargetClick: true,
    },
    {
      id: "issues-table",
      tab: "issues",
      target: "issues-table",
      kicker: "Ownership",
      title: "Route important work first",
      text: "Open rows for details and use status to keep critical fixes moving through the team workflow.",
      hint: "Critical and Serious issues should get the clearest owner.",
    },
    {
      id: "alerts-nav",
      tab: "issues",
      target: "dashboard-nav-alerts",
      kicker: "Next click",
      title: "Open Alerts",
      text: "Alerts turn repeated manual checking into a focused signal when regressions appear.",
      hint: "Click Alerts, or use Next.",
      primaryLabel: "Open Alerts",
      advanceOnTargetClick: true,
    },
    {
      id: "alerts",
      tab: "alerts",
      target: "feature-page",
      kicker: "Release signal",
      title: "Route regressions into review",
      text: "Alerts help the team react to newly introduced issues without treating all known baseline debt as urgent.",
      hint: "This keeps release conversations cleaner.",
    },
    {
      id: "scan-nav",
      tab: "alerts",
      target: "dashboard-nav-scan",
      kicker: "Next click",
      title: "Return to scanning",
      text: "When a fix is ready, run the page again to update history and prove what changed.",
      hint: "Click New scan, or use Next.",
      primaryLabel: "Open Scanner",
      advanceOnTargetClick: true,
    },
    {
      id: "scan-runner",
      tab: "scan",
      target: "scan-runner",
      kicker: "Scanner",
      title: "Close the loop with a re-scan",
      text: "The follow-up scan updates open issues, resolved history, and trend data for the whole workspace.",
      hint: "That is the core team loop. You can replay this walkthrough any time from Settings.",
      primaryLabel: "Finish",
    },
  ],
};

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(value, Math.max(min, max)));

const rectsAreClose = (a: TargetRect | null, b: TargetRect | null): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;

  return (
    Math.abs(a.top - b.top) < 0.5 &&
    Math.abs(a.left - b.left) < 0.5 &&
    Math.abs(a.width - b.width) < 0.5 &&
    Math.abs(a.height - b.height) < 0.5 &&
    a.viewportWidth === b.viewportWidth &&
    a.viewportHeight === b.viewportHeight
  );
};

const getTarget = (target: string): HTMLElement | null =>
  document.querySelector<HTMLElement>(`[${TARGET_ATTR}="${target}"]`);

const SCROLL_KEYS = new Set([" ", "PageUp", "PageDown", "Home", "End", "ArrowUp", "ArrowDown"]);

const rectForElement = (element: HTMLElement): TargetRect => {
  const rect = element.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const left = clamp(
    rect.left - TARGET_GUTTER,
    VIEWPORT_GUTTER,
    viewportWidth - VIEWPORT_GUTTER - 24,
  );
  const top = clamp(
    rect.top - TARGET_GUTTER,
    VIEWPORT_GUTTER,
    viewportHeight - VIEWPORT_GUTTER - 24,
  );
  const right = clamp(rect.right + TARGET_GUTTER, left + 24, viewportWidth - VIEWPORT_GUTTER);
  const bottom = clamp(rect.bottom + TARGET_GUTTER, top + 24, viewportHeight - VIEWPORT_GUTTER);
  const width = right - left;
  const height = bottom - top;

  return { top, left, width, height, viewportWidth, viewportHeight };
};

const cardPositionFor = (target: TargetRect | null, cardHeight: number): CardPosition => {
  const viewportWidth = typeof window === "undefined" ? 1024 : window.innerWidth;
  const viewportHeight = typeof window === "undefined" ? 768 : window.innerHeight;
  const mobile = viewportWidth <= MOBILE_BREAKPOINT;
  const gutter = mobile ? 12 : VIEWPORT_GUTTER;
  const width = mobile
    ? viewportWidth - gutter * 2
    : Math.min(CARD_MAX_WIDTH, viewportWidth - gutter * 2);
  const maxHeight = Math.max(180, viewportHeight - gutter * 2);
  const safeHeight = clamp(cardHeight || CARD_FALLBACK_HEIGHT, 180, maxHeight);

  if (mobile) {
    return {
      width,
      maxHeight,
      left: gutter,
      top: viewportHeight - safeHeight - gutter,
      placement: "mobile",
    };
  }

  if (!target) {
    return {
      width,
      maxHeight,
      left: (viewportWidth - width) / 2,
      top: clamp((viewportHeight - safeHeight) / 2, gutter, viewportHeight - safeHeight - gutter),
      placement: "center",
    };
  }

  const left = clamp(
    target.left + target.width / 2 - width / 2,
    gutter,
    target.viewportWidth - width - gutter,
  );
  const belowTop = target.top + target.height + CARD_GAP;
  const aboveTop = target.top - safeHeight - CARD_GAP;
  const canFitBelow = belowTop + safeHeight <= target.viewportHeight - gutter;
  const canFitAbove = aboveTop >= gutter;

  if (canFitBelow) {
    return {
      width,
      maxHeight,
      left,
      top: belowTop,
      placement: "below",
    };
  }

  if (canFitAbove) {
    return {
      width,
      maxHeight,
      left,
      top: aboveTop,
      placement: "above",
    };
  }

  const belowSpace = target.viewportHeight - (target.top + target.height);
  const preferBelow = belowSpace >= target.top;
  const preferredTop = preferBelow ? belowTop : aboveTop;

  return {
    width,
    maxHeight,
    left,
    top: clamp(preferredTop, gutter, target.viewportHeight - safeHeight - gutter),
    placement: preferBelow ? "below" : "above",
  };
};

export const DashboardTutorial = ({
  open,
  plan,
  activeTab,
  onNavigate,
  onSkip,
  onComplete,
}: DashboardTutorialProps) => {
  const steps = TOUR_STEPS[plan];
  const cardRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(0);
  const [target, setTarget] = useState<TargetRect | null>(null);
  const [cardTarget, setCardTarget] = useState<TargetRect | null>(null);
  const [cardHeight, setCardHeight] = useState(CARD_FALLBACK_HEIGHT);
  const [cardVisible, setCardVisible] = useState(false);
  const current = steps[index] ?? steps[0];
  const isLast = index === steps.length - 1;
  const card = useMemo(() => cardPositionFor(cardTarget, cardHeight), [cardHeight, cardTarget]);

  const goNext = useCallback(() => {
    if (isLast) {
      onComplete();
      return;
    }
    setIndex((value) => Math.min(value + 1, steps.length - 1));
  }, [isLast, onComplete, steps.length]);

  const goBack = useCallback(() => {
    setIndex((value) => Math.max(value - 1, 0));
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (open) return;

    const frame = window.requestAnimationFrame(() => {
      setIndex(0);
      setTarget(null);
      setCardTarget(null);
      setCardVisible(false);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const frame = window.requestAnimationFrame(() => {
      setTarget(null);
      setCardTarget(null);
      setCardVisible(false);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [current.id, current.target, open]);

  useEffect(() => {
    if (!open || activeTab === current.tab) return;
    onNavigate(current.tab);
  }, [activeTab, current.tab, onNavigate, open]);

  useEffect(() => {
    if (!open || activeTab !== current.tab) return;

    let frame = 0;
    let scrollIdleTimer: number | null = null;
    let cardRevealTimer: number | null = null;
    let latestRect: TargetRect | null = null;
    let didScroll = false;
    const revealCard = () => {
      if (cardRevealTimer !== null) window.clearTimeout(cardRevealTimer);
      cardRevealTimer = window.setTimeout(() => setCardVisible(true), CARD_REVEAL_DELAY_MS);
    };
    const publishRect = (nextRect: TargetRect | null, reason: "layout" | "resize" | "scroll") => {
      latestRect = nextRect;
      setTarget((currentRect) => (rectsAreClose(currentRect, nextRect) ? currentRect : nextRect));

      if (reason !== "scroll") {
        setCardTarget((currentRect) =>
          rectsAreClose(currentRect, nextRect) ? currentRect : nextRect,
        );
        revealCard();
        return;
      }

      if (scrollIdleTimer !== null) window.clearTimeout(scrollIdleTimer);
      scrollIdleTimer = window.setTimeout(() => {
        setCardTarget((currentRect) =>
          rectsAreClose(currentRect, latestRect) ? currentRect : latestRect,
        );
      }, 120);
    };
    const measure = (reason: "layout" | "resize" | "scroll") => {
      const element = getTarget(current.target);

      if (!element) {
        publishRect(null, reason);
        return;
      }

      if (!didScroll) {
        didScroll = true;
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        element.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "center",
          inline: "center",
        });
      }

      frame = window.requestAnimationFrame(() => {
        publishRect(rectForElement(element), reason);
      });
    };
    const scheduleMeasure = (reason: "layout" | "resize" | "scroll") => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => measure(reason));
    };
    const onResize = () => scheduleMeasure("resize");
    const onScroll = () => scheduleMeasure("scroll");

    frame = window.requestAnimationFrame(() => {
      frame = window.requestAnimationFrame(() => measure("layout"));
    });

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);

    const observer =
      "ResizeObserver" in window ? new ResizeObserver(() => scheduleMeasure("layout")) : null;
    observer?.observe(document.body);

    return () => {
      window.cancelAnimationFrame(frame);
      if (scrollIdleTimer !== null) window.clearTimeout(scrollIdleTimer);
      if (cardRevealTimer !== null) window.clearTimeout(cardRevealTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
      observer?.disconnect();
    };
  }, [activeTab, current.tab, current.target, open]);

  useEffect(() => {
    if (!open || !mounted) return;

    let frame = 0;
    const measure = () => {
      const node = cardRef.current;
      if (!node) return;

      const nextHeight = Math.ceil(node.getBoundingClientRect().height);
      setCardHeight((currentHeight) =>
        Math.abs(currentHeight - nextHeight) > 1 ? nextHeight : currentHeight,
      );
    };
    const scheduleMeasure = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(measure);
    };

    frame = window.requestAnimationFrame(measure);
    window.addEventListener("resize", scheduleMeasure);

    const observer = "ResizeObserver" in window ? new ResizeObserver(scheduleMeasure) : null;
    if (cardRef.current) observer?.observe(cardRef.current);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", scheduleMeasure);
      observer?.disconnect();
    };
  }, [current.id, mounted, open]);

  useEffect(() => {
    if (!open || activeTab !== current.tab || !current.advanceOnTargetClick) return;

    const element = getTarget(current.target);
    if (!element) return;

    element.addEventListener("click", goNext, true);
    return () => element.removeEventListener("click", goNext, true);
  }, [activeTab, current, goNext, open]);

  useEffect(() => {
    if (!open) return;

    const allowInsideCard = (target: EventTarget | null): boolean =>
      target instanceof Node && Boolean(cardRef.current?.contains(target));
    const preventBackgroundWheel = (event: WheelEvent) => {
      if (allowInsideCard(event.target)) return;
      event.preventDefault();
    };
    const preventBackgroundTouch = (event: TouchEvent) => {
      if (allowInsideCard(event.target)) return;
      event.preventDefault();
    };
    const preventBackgroundKeyboardScroll = (event: KeyboardEvent) => {
      if (!SCROLL_KEYS.has(event.key) || allowInsideCard(event.target)) return;
      event.preventDefault();
    };
    const htmlOverscroll = document.documentElement.style.overscrollBehavior;
    const bodyOverscroll = document.body.style.overscrollBehavior;

    document.documentElement.style.overscrollBehavior = "none";
    document.body.style.overscrollBehavior = "none";
    window.addEventListener("wheel", preventBackgroundWheel, { capture: true, passive: false });
    window.addEventListener("touchmove", preventBackgroundTouch, {
      capture: true,
      passive: false,
    });
    window.addEventListener("keydown", preventBackgroundKeyboardScroll, true);

    return () => {
      document.documentElement.style.overscrollBehavior = htmlOverscroll;
      document.body.style.overscrollBehavior = bodyOverscroll;
      window.removeEventListener("wheel", preventBackgroundWheel, true);
      window.removeEventListener("touchmove", preventBackgroundTouch, true);
      window.removeEventListener("keydown", preventBackgroundKeyboardScroll, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onSkip();
      if (event.key === "ArrowRight") goNext();
      if (event.key === "ArrowLeft") goBack();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goBack, goNext, onSkip, open]);

  if (!mounted || !open) return null;

  const progress = Math.round(((index + 1) / steps.length) * 100);
  const cardStyle = {
    "--tour-card-left": `${card.left}px`,
    "--tour-card-top": `${card.top}px`,
    "--tour-card-width": `${card.width}px`,
    "--tour-card-max-height": `${card.maxHeight}px`,
  } as CSSProperties;

  return createPortal(
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="tour-title">
      {target ? (
        <>
          <span
            className={styles.shade}
            style={{ top: 0, left: 0, right: 0, height: target.top }}
          />
          <span
            className={styles.shade}
            style={{
              top: target.top + target.height,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
          <span
            className={styles.shade}
            style={{ top: target.top, left: 0, width: target.left, height: target.height }}
          />
          <span
            className={styles.shade}
            style={{
              top: target.top,
              left: target.left + target.width,
              right: 0,
              height: target.height,
            }}
          />
          <span
            className={styles.ring}
            style={{
              top: target.top,
              left: target.left,
              width: target.width,
              height: target.height,
            }}
            aria-hidden="true"
          />
        </>
      ) : (
        <span className={styles.backdrop} />
      )}

      <section
        ref={cardRef}
        className={cn(
          styles.card,
          card.placement === "above" && styles.cardAbove,
          card.placement === "mobile" && styles.cardMobile,
          card.placement === "center" && styles.cardCenter,
          !cardVisible && styles.cardHidden,
        )}
        style={cardStyle}
      >
        <div className={styles.cardTop}>
          <span className={styles.icon} aria-hidden="true">
            <Icon name="selector" size={16} />
          </span>
          <span className={styles.kicker}>{current.kicker}</span>
          <span className={styles.count}>
            {index + 1}/{steps.length}
          </span>
        </div>

        <h2 id="tour-title">{current.title}</h2>
        <p>{current.text}</p>

        <div className={styles.hint}>
          <span>Tip</span>
          {current.hint}
        </div>

        <div className={styles.progress} aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.skip} onClick={onSkip}>
            Skip
          </button>
          <div className={styles.stepActions}>
            <button
              type="button"
              className={styles.secondary}
              onClick={goBack}
              disabled={index === 0}
            >
              Back
            </button>
            <button type="button" className={styles.primary} onClick={goNext}>
              {current.primaryLabel ?? (isLast ? "Finish" : "Next")}
              <Icon name={isLast ? "check" : "arrow"} size={13} />
            </button>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
};
