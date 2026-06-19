"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { STEP_MS, STEPS } from "../data";
import { useInViewOnce } from "../hooks/useInViewOnce";
import { WorkflowStage } from "./WorkflowStage";
import { WorkflowStepper } from "./WorkflowStepper";
import styles from "../ScanWorkflow.module.scss";

export const ScanWorkflowPlayer = () => {
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

  return (
    <div ref={ref}>
      <WorkflowStepper active={active} onSelect={select} steps={STEPS} />
      <WorkflowStage active={active} inView={inView} reduce={reduce} steps={STEPS} />

      <p className={styles.hint}>
        {auto ? "Auto-playing — tap any step to take over" : "Step through the workflow above"}
      </p>
    </div>
  );
};
