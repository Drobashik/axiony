"use client";

import { useState } from "react";
import { Section } from "@/components/layout";
import { Container } from "@/components/ui";
import cn from "classnames";
import { ProblemDemoView } from "./components/ProblemDemoView";
import { PROBLEMS } from "./data";
import styles from "./Problem.module.scss";

export const Problem = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fixed, setFixed] = useState<boolean[]>(() => PROBLEMS.map(() => false));

  const activeProblem = PROBLEMS[activeIndex];
  const fixedCount = fixed.filter(Boolean).length;
  const allFixed = fixedCount === PROBLEMS.length;

  // Once a visitor fixes a bug it stays fixed — breaking it again on
  // purpose shouldn't take the win away.
  const markFixed = () => {
    setFixed((prev) => {
      if (prev[activeIndex]) return prev;
      const next = [...prev];
      next[activeIndex] = true;
      return next;
    });
  };

  return (
    <Section surface>
      <Container>
        <div className={cn(styles.intro, "reveal")}>
          <span className={styles.eyebrow}>{"// the problem"}</span>
          <h2 className={styles.heading}>
            You&apos;d fix these bugs in a minute.
            <br />
            <em className={styles.headingAccent}>You just never see them.</em>
          </h2>
          <p className={styles.lead}>
            Over a billion people browse with a disability — and hit walls like these every day. The
            four demos below are broken on purpose. Try each one, then flip the fix.
          </p>
        </div>

        <div className={cn(styles.explorer, "reveal")}>
          <div className={styles.rail}>
            <div
              className={styles.list}
              role="group"
              aria-label="Four common accessibility bugs — pick one to try"
            >
              {PROBLEMS.map((item, index) => {
                const isActive = index === activeIndex;
                const isFixed = fixed[index];

                return (
                  <button
                    key={item.rule}
                    type="button"
                    className={cn(
                      styles.item,
                      isActive && styles.item_active,
                      isFixed && styles.item_fixed,
                    )}
                    onClick={() => setActiveIndex(index)}
                    aria-pressed={isActive}
                  >
                    <span className={styles.itemTop}>
                      <span
                        className={cn(styles.sevDot, styles[`sev_${item.sev}`])}
                        aria-hidden="true"
                      />
                      <code className={styles.rule}>{item.rule}</code>
                      <span className={styles.state} aria-hidden="true">
                        {isFixed ? "✓" : "✗"}
                      </span>
                      {isFixed && <span className={styles.srOnly}>fixed</span>}
                    </span>
                    {/* Exactly one of these is rendered per breakpoint; display:none
                        keeps the hidden one out of the accessibility tree too. */}
                    <strong className={styles.titleFull}>{item.title}</strong>
                    <strong className={styles.titleShort}>{item.short}</strong>
                    <span className={styles.itemDesc}>{item.description}</span>
                  </button>
                );
              })}
            </div>

            <p className={styles.score} role="status">
              {allFixed ? (
                <>
                  <span className={styles.scoreDone}>✓ exit 0 — all four fixed</span>
                  <span className={styles.scoreThanks}>your users thank you</span>
                </>
              ) : (
                <>
                  <span className={styles.scoreCount}>
                    {fixedCount}/{PROBLEMS.length} fixed
                  </span>
                  <span className={styles.scoreHint}>
                    {fixedCount === 0 ? "go on, fix one" : "keep going"}
                  </span>
                </>
              )}
            </p>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelChrome}>
              <span className={styles.chromeDots} aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <code className={styles.chromeTitle}>{activeProblem.rule} — live demo</code>
              {fixed[activeIndex] ? (
                <span className={cn(styles.chromeBadge, styles.chromeBadge_fixed)}>✓ fixed</span>
              ) : (
                <span className={styles.chromeBadge}>
                  <i aria-hidden="true" />
                  broken
                </span>
              )}
            </div>

            <div key={activeIndex} className={styles.panelInner}>
              <h3 className={styles.headline}>{activeProblem.headline}</h3>
              <ProblemDemoView demo={activeProblem.demo} onFixed={markFixed} />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};
