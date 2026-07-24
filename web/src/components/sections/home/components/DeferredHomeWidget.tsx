"use client";

import { lazy, startTransition, Suspense, useEffect, useRef, useState } from "react";
import cn from "classnames";
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
      requestIdleCallback?: (callback: IdleRequestCallback) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    let idleCallback = 0;
    let fallbackTimer = 0;

    const activate = () => {
      startTransition(() => setActive(true));
    };

    const schedule = () => {
      if (idleWindow.requestIdleCallback) {
        idleCallback = idleWindow.requestIdleCallback(activate);
      } else {
        fallbackTimer = window.setTimeout(activate, 120);
      }
    };

    const cancel = () => {
      if (idleCallback) idleWindow.cancelIdleCallback?.(idleCallback);
      window.clearTimeout(fallbackTimer);
    };

    const sectionId = host.closest("section")?.id;
    if (sectionId && window.location.hash === `#${sectionId}`) {
      schedule();
      return cancel;
    }

    if (!("IntersectionObserver" in window)) {
      schedule();
      return cancel;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        schedule();
        observer.disconnect();
      },
      {
        rootMargin: window.matchMedia("(max-width: 700px)").matches ? "160px 0px" : "480px 0px",
        threshold: 0.01,
      },
    );

    observer.observe(host);
    return () => {
      cancel();
      observer.disconnect();
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
