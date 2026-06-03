"use client";

import { CSSProperties, Fragment } from "react";
import { Button, Container } from "@/components/ui";
import cn from "classnames";
import styles from "./Hero.module.scss";

const TITLE_LINE_ONE = "Catch accessibility issues";
const TITLE_LINE_TWO = "before your users do.";

const VALUE_POINTS = [
  "Free CLI to start",
  "Scans in CI & the cloud",
  "Regressions can't merge",
] as const;

const HERO_ISSUES: ReadonlyArray<{
  sev: "critical" | "serious" | "moderate";
  rule: string;
  where: string;
}> = [
  { sev: "critical", rule: "color-contrast", where: ".cta-banner" },
  { sev: "serious", rule: "button-name", where: "header" },
  { sev: "moderate", rule: "heading-order", where: "/pricing" },
];

/**
 * Marketing hero. Benefit-led copy + CTAs on the left, an animated
 * "live scan result" card on the right that shows the product at a
 * glance: a score ring, real findings, and a locked baseline.
 *
 * Mounted after the BootGate loader clears, so CSS animations fire
 * naturally on first paint.
 */
export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />

      <Container className={styles.container}>
        <div className={styles.copy}>
          <div className={styles.label}>
            <span className={styles.labelDot} aria-hidden="true" />
            Free open-source CLI · Hosted cloud for teams
          </div>

          <h1 className={styles.title}>
            <RevealLine text={TITLE_LINE_ONE} startDelay={0.15} />
            <br />
            <em className={styles.titleAccent}>
              <RevealLine text={TITLE_LINE_TWO} startDelay={0.45} />
            </em>
          </h1>

          <p className={styles.subtitle}>
            Axiony scans your UI with axe-core in your terminal, your CI, and the
            cloud — then locks a baseline so the issues you fix never come back.
          </p>

          <div className={styles.valuePoints} aria-label="Why Axiony">
            {VALUE_POINTS.map((point) => (
              <span key={point}>{point}</span>
            ))}
          </div>

          <div className={styles.actions}>
            <Button href="/scan" size="lg">
              Start scanning free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Button>
            <Button href="/dashboard" variant="secondary" size="lg">
              View dashboard preview
            </Button>
          </div>
        </div>

        <ScanCard />
      </Container>
    </section>
  );
}

/** Animated product preview: scan sweep → score + findings appear. */
function ScanCard() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={styles.cardHead}>
        <span className={styles.dots}>
          <span />
          <span />
          <span />
        </span>
        <span className={styles.cardCmd}>axiony scan acme.com</span>
        <span className={styles.cardStatus}>complete</span>
      </div>

      <div className={styles.cardBody}>
        <span className={styles.cardBeam} />

        <div className={styles.scoreRow}>
          <div className={styles.ring}>
            <svg viewBox="0 0 80 80" aria-hidden="true">
              <circle className={styles.ringTrack} cx="40" cy="40" r="34" />
              <circle className={styles.ringFill} cx="40" cy="40" r="34" />
            </svg>
            <span className={styles.ringVal}>92</span>
          </div>
          <div className={styles.scoreMeta}>
            <strong>Accessibility score</strong>
            <span className={styles.baselinePill}>
              <LockMark />
              baseline locked
            </span>
            <span className={styles.scoreSub}>+6 since last release</span>
          </div>
        </div>

        <div className={styles.issues}>
          {HERO_ISSUES.map((issue, i) => (
            <div
              key={issue.rule}
              className={styles.issueRow}
              style={{ "--i": i } as CSSProperties}
            >
              <span className={cn(styles.sev, styles[`sev_${issue.sev}`])} />
              <code>{issue.rule}</code>
              <span className={styles.issueWhere}>{issue.where}</span>
            </div>
          ))}
        </div>

        <div className={styles.cardFoot}>
          <span>9 issues · tracked</span>
          <span className={styles.blocked}>2 new · blocked</span>
        </div>
      </div>
    </div>
  );
}

function LockMark() {
  return (
    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

interface RevealLineProps {
  text: string;
  /** Seconds before the first character starts animating. */
  startDelay: number;
}

/** Renders a string as individually illuminating characters. */
function RevealLine({ text, startDelay }: RevealLineProps) {
  const PER_CHAR = 0.025;
  const words = text.split(" ");
  let cumulativeIndex = 0;

  return (
    <>
      {words.map((word, wIdx) => {
        const wordSpans = Array.from(word).map((char, cIdx) => {
          const span = (
            <span
              key={cIdx}
              className={styles.char}
              style={{ animationDelay: `${startDelay + cumulativeIndex * PER_CHAR}s` }}
            >
              {char}
            </span>
          );
          cumulativeIndex += 1;
          return span;
        });

        return (
          <Fragment key={wIdx}>
            <span className={styles.word}>{wordSpans}</span>
            {wIdx < words.length - 1 ? " " : null}
          </Fragment>
        );
      })}
    </>
  );
}
