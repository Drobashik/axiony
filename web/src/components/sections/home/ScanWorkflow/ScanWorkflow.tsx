"use client";

import { useEffect, useRef, useState } from "react";
import { Section } from "@/components/layout";
import { Container, SectionEyebrow } from "@/components/ui";
import cn from "classnames";
import { WorkflowStage } from "./components/WorkflowStage";
import { WorkflowStepper } from "./components/WorkflowStepper";
import { STEP_MS, STEPS } from "./data";
import { useInViewOnce } from "./hooks/useInViewOnce";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";
import styles from "./ScanWorkflow.module.scss";

export const ScanWorkflow = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInViewOnce(ref);
  const reduce = usePrefersReducedMotion();
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!inView || reduce || !auto) return undefined;

    const id = window.setInterval(
      () => setActive((current) => (current + 1) % STEPS.length),
      STEP_MS,
    );
    return () => window.clearInterval(id);
  }, [auto, inView, reduce]);

  const select = (index: number) => {
    setActive(index);
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
              The free CLI gives developers instant feedback locally and in CI. Axiony Cloud adds
              scheduled site-wide scans with full history, then a shared workspace wired into
              GitHub, GitLab and Slack.
            </p>
          </div>

          <WorkflowStepper active={active} onSelect={select} steps={STEPS} />
          <WorkflowStage active={active} inView={inView} reduce={reduce} step={step} />

          <p className={styles.hint}>
            {auto ? "Auto-playing — tap any step to take over" : "Step through the workflow above"}
          </p>
        </div>
      </Container>
    </Section>
  );
};
