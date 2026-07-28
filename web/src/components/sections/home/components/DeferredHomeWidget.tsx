"use client";

import { lazy, startTransition, Suspense, useEffect, useRef, useState } from "react";
import cn from "classnames";
import {
  ANCHOR_SCROLL_END_EVENT,
  ANCHOR_SCROLLING_ATTRIBUTE,
} from "@/lib/navigation/anchor-scroll";
import styles from "./DeferredHomeWidget.module.scss";

const WIDGETS = {
  problem: lazy(() =>
    import("../Problem/components/ProblemExplorer").then(({ ProblemExplorer }) => ({
      default: ProblemExplorer,
    })),
  ),
  workflow: lazy(() =>
    import("../ScanWorkflow/components/WorkflowBoard").then(({ WorkflowBoard }) => ({
      default: WorkflowBoard,
    })),
  ),
  quickstart: lazy(() =>
    import("../QuickStart/components/QuickStartFlow").then(({ QuickStartFlow }) => ({
      default: QuickStartFlow,
    })),
  ),
  pricing: lazy(() =>
    import("../PricingPreview/components/PricingPlans").then(({ PricingPlans }) => ({
      default: PricingPlans,
    })),
  ),
  faq: lazy(() =>
    import("../Faq/components/FaqList").then(({ FaqList }) => ({ default: FaqList })),
  ),
} as const;

export type DeferredWidgetName = keyof typeof WIDGETS;

interface DeferredHomeWidgetProps {
  widget: DeferredWidgetName;
}

const WidgetPlaceholder = ({ widget }: DeferredHomeWidgetProps) => (
  <div className={cn(styles.placeholder, styles[widget])} aria-hidden="true">
    <span />
    <span />
    <span />
  </div>
);

export function DeferredHomeWidget({ widget }: DeferredHomeWidgetProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const Widget = WIDGETS[widget];

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const idleWindow = window as unknown as {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    let idleCallback = 0;
    let fallbackTimer = 0;
    let scheduled = false;
    let observer: IntersectionObserver | null = null;

    const activate = () => {
      startTransition(() => setActive(true));
    };

    const schedule = () => {
      if (scheduled) return;
      scheduled = true;

      if (idleWindow.requestIdleCallback) {
        idleCallback = idleWindow.requestIdleCallback(activate, { timeout: 500 });
      } else {
        fallbackTimer = window.setTimeout(activate, 120);
      }
    };

    const cancel = () => {
      if (idleCallback) idleWindow.cancelIdleCallback?.(idleCallback);
      window.clearTimeout(fallbackTimer);
    };

    const isSmallScreen = window.matchMedia("(max-width: 700px)").matches;
    const viewportMargin = isSmallScreen ? 160 : 480;
    const sectionId = host.closest("section")?.id;

    const onAnchorScrollEnd = (event: Event) => {
      if (scheduled) return;

      const targetId = (event as CustomEvent<string>).detail;
      if (sectionId === targetId) {
        schedule();
        observer?.disconnect();
        return;
      }

      observer?.unobserve(host);
      observer?.observe(host);
    };

    if (sectionId && window.location.hash === `#${sectionId}`) {
      schedule();
      return cancel;
    }

    if (!("IntersectionObserver" in window)) {
      schedule();
      return cancel;
    }

    window.addEventListener(ANCHOR_SCROLL_END_EVENT, onAnchorScrollEnd);

    observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        if (document.documentElement.hasAttribute(ANCHOR_SCROLLING_ATTRIBUTE)) return;

        schedule();
        observer?.disconnect();
      },
      {
        rootMargin: `${viewportMargin}px 0px`,
        threshold: 0.01,
      },
    );

    observer.observe(host);
    return () => {
      cancel();
      observer?.disconnect();
      window.removeEventListener(ANCHOR_SCROLL_END_EVENT, onAnchorScrollEnd);
    };
  }, []);

  return (
    <div ref={hostRef} className={styles.host} data-widget={widget}>
      {active ? (
        <Suspense fallback={<WidgetPlaceholder widget={widget} />}>
          <Widget />
        </Suspense>
      ) : (
        <WidgetPlaceholder widget={widget} />
      )}
    </div>
  );
}
