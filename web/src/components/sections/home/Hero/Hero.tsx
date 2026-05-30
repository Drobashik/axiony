"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { Button, Container, Terminal, TerminalLine } from "@/components/ui";
import cn from "classnames";
import { HERO_TERMINAL_LINES } from "@/lib/data/hero-terminal";
import styles from "./Hero.module.scss";

const TITLE_LINE_ONE = "Accessibility testing for";
const TITLE_LINE_TWO = "modern product teams.";

/** Decorative dots that appear after the scan beam crosses the hero. */
const SCAN_MARKERS: ReadonlyArray<{
  top: string;
  left: string;
  delay: number;
  variant: "critical" | "serious" | "moderate" | "minor";
}> = [
  { top: "18%", left: "12%", delay: 1.0, variant: "critical" },
  { top: "32%", left: "84%", delay: 1.15, variant: "moderate" },
  { top: "58%", left: "9%", delay: 1.3, variant: "serious" },
  { top: "70%", left: "88%", delay: 1.45, variant: "minor" },
  { top: "44%", left: "92%", delay: 1.6, variant: "moderate" },
  { top: "82%", left: "16%", delay: 1.75, variant: "minor" },
];

/**
 * Marketing hero — full "scan in progress → scan complete" choreography.
 *
 * The component is mounted *after* the BootGate's loading screen has
 * cleared, so all CSS animations fire naturally on first paint. No
 * external readiness flag is needed.
 *
 * Sequence:
 *   1. The grid + orbs swell in.
 *   2. A scan beam sweeps from top to bottom of the section once.
 *   3. Title characters illuminate one after another with a brief
 *      blue glow, as if the scan beam is illuminating each letter.
 *   4. Subtitle / actions / terminal cascade in beneath the title.
 *   5. Floating severity markers fade in like real scan results.
 */
export function Hero() {
  const lines = useTypewriter(HERO_TERMINAL_LINES);

  return (
    <section className={styles.hero}>
      <div className={styles.grid} aria-hidden="true" />
      <span className={cn(styles.orb, styles.orbA)} aria-hidden="true" />
      <span className={cn(styles.orb, styles.orbB)} aria-hidden="true" />
      <span className={cn(styles.orb, styles.orbC)} aria-hidden="true" />

      {/* The scan beam — a horizontal blue glow that sweeps top→bottom
          through the hero exactly once on mount. */}
      <span className={styles.scanBeam} aria-hidden="true" />

      {/* Severity markers that fade in after the beam clears. */}
      <div className={styles.markerContainer}>
        {SCAN_MARKERS.map((marker, i) => (
          <span
            key={i}
            className={cn(styles.marker, styles[`marker_${marker.variant}`])}
            // The marker plays two animations (fade-in + float). Both
            // reference `--marker-delay` so a single value drives both.
            style={
              {
                top: marker.top,
                left: marker.left,
                "--marker-delay": `${marker.delay}s`,
              } as React.CSSProperties
            }
            aria-hidden="true"
          />
        ))}
      </div>

      <Container className={styles.container}>
        <div className={styles.label}>
          <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
            <circle cx="4" cy="4" r="3" fill="currentColor" />
          </svg>
          v0.3.0 preview · MIT-licensed open source
        </div>

        <h1 className={styles.title}>
          <RevealLine text={TITLE_LINE_ONE} startDelay={0.15} />
          <br />
          <em className={styles.titleAccent}>
            <RevealLine text={TITLE_LINE_TWO} startDelay={0.4} />
          </em>
        </h1>

        <p className={styles.subtitle}>
          A small, focused CLI that scans URLs, raw HTML and individual React
          components with axe-core — in your terminal, in CI, or anywhere a
          headless browser can run.
        </p>

        <div className={styles.actions}>
          <Button href="/scan" size="lg">
            Start scanning free
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Button>
          <Button href="/dashboard" variant="secondary" size="lg">
            View dashboard →
          </Button>
        </div>

        <div className={styles.terminalWrap}>
          <Terminal
            lines={lines.visible}
            filename="axiony — bash"
            showCursor={!lines.complete}
            animated
          />
        </div>
      </Container>
    </section>
  );
}

interface RevealLineProps {
  text: string;
  /** Seconds before the first character starts animating. */
  startDelay: number;
}

/**
 * Renders a string as individually animated characters. Words are
 * wrapped in `inline-block` containers so they never break mid-letter,
 * with a regular space between them so natural line-wrapping still
 * works.
 */
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
              style={{
                animationDelay: `${startDelay + cumulativeIndex * PER_CHAR}s`,
              }}
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

interface TypewriterState {
  visible: TerminalLine[];
  complete: boolean;
}

/**
 * Plays back terminal lines one at a time so the hero terminal feels
 * alive. The hook starts ticking on mount; the small lead-in matches
 * the time it takes the terminal frame to scale in.
 */
function useTypewriter(lines: TerminalLine[]): TypewriterState {
  const [visible, setVisible] = useState<TerminalLine[]>([]);
  const [complete, setComplete] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    let timeoutId: number | undefined;

    const advance = () => {
      const i = indexRef.current;
      if (i >= lines.length) {
        setComplete(true);
        return;
      }
      setVisible((prev) => [...prev, lines[i]]);
      const delay = i < 3 ? 80 : i < 8 ? 120 : 100;
      indexRef.current = i + 1;
      timeoutId = window.setTimeout(advance, delay);
    };

    timeoutId = window.setTimeout(advance, 800);
    return () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [lines]);

  return { visible, complete };
}
