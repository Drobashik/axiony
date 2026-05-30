"use client";

import { Fragment, useEffect, useState } from "react";
import { Container, SectionEyebrow } from "@/components/ui";
import { Section } from "@/components/layout";
import cn from "classnames";
import { STEPS } from "@/lib/data/home";
import styles from "./HowItWorks.module.scss";

const TOTAL_STEPS = STEPS.length;
const ROTATION_MS = 2000;

/**
 * "Up and running in minutes" — animated 4-step progress that
 * auto-advances. Owns the active-step state internally; the data
 * itself is static.
 */
export function HowItWorks() {
  const activeStep = useAutoRotate(TOTAL_STEPS, ROTATION_MS);

  return (
    <Section>
      <Container>
        <header className={cn(styles.intro, "reveal")}>
          <SectionEyebrow>How it works</SectionEyebrow>
          <h2>Up and running in minutes.</h2>
        </header>

        <div className={styles.connectorRow}>
          {STEPS.map((_, i) => (
            <Fragment key={i}>
              <div className={styles.dotWrap}>
                <div className={cn(styles.dot, i === activeStep && styles.dotActive)}>
                  {i < activeStep ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    <span>{String(i + 1).padStart(2, "0")}</span>
                  )}
                </div>
              </div>
              {i < TOTAL_STEPS - 1 && (
                <div className={styles.line}>
                  <div
                    className={styles.fill}
                    style={{ transform: `scaleX(${activeStep > i ? 1 : 0})` }}
                  />
                </div>
              )}
            </Fragment>
          ))}
        </div>

        <ol className={styles.steps}>
          {STEPS.map((step, i) => (
            <li
              key={step.number}
              className={cn(styles.step, i === activeStep && styles.stepActive)}
            >
              <h4>{step.title}</h4>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

/** Cycles a counter from 0 → length-1 every `intervalMs` ms. */
function useAutoRotate(length: number, intervalMs: number): number {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [length, intervalMs]);

  return index;
}
