"use client";

import { useState } from "react";
import { Section } from "@/components/layout";
import { Container, SectionEyebrow } from "@/components/ui";
import cn from "classnames";
import { ProblemDemoView } from "./components/ProblemDemoView";
import { PROBLEMS } from "./data";
import styles from "./Problem.module.scss";

export const Problem = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeProblem = PROBLEMS[activeIndex];

  return (
    <Section surface>
      <Container>
        <div className={cn(styles.intro, "reveal")}>
          <SectionEyebrow>Problem</SectionEyebrow>
          <h2>Most accessibility problems are invisible — until you feel them.</h2>
          <p className={styles.lead}>
            Over a billion people navigate software with a disability, and the
            barriers they hit rarely surface in a design review. So try four of
            the most common ones yourself — each is a real issue Axiony helps
            teams catch.
          </p>
        </div>

        <div className={cn(styles.explorer, "reveal")}>
          <div
            className={styles.list}
            role="group"
            aria-label="Common accessibility problems to try"
          >
            {PROBLEMS.map((item, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={item.number}
                  type="button"
                  className={cn(styles.item, isActive && styles.item_active)}
                  onClick={() => setActiveIndex(index)}
                  aria-pressed={isActive}
                >
                  <span className={styles.number}>{item.number}</span>
                  <span className={styles.itemCopy}>
                    <strong>{item.title}</strong>
                    <span>{item.description}</span>
                  </span>
                  <span className={styles.itemArrow} aria-hidden="true">
                    →
                  </span>
                </button>
              );
            })}
          </div>

          <div className={styles.panel}>
            <div key={activeIndex} className={styles.panelInner}>
              <div className={styles.panelHeader}>
                <span className={styles.tryHint}>
                  <span className={styles.tryDot} aria-hidden="true" />
                  Live demo · interact with it
                </span>
                <span className={styles.spec}>{activeProblem.spec}</span>
              </div>

              <h3 className={styles.headline}>{activeProblem.headline}</h3>
              <ProblemDemoView demo={activeProblem.demo} />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};
