"use client";

import { useEffect, useRef, useState } from "react";
import cn from "classnames";
import type { TerminalLine } from "@/components/ui";
import styles from "../ScanStudio.module.scss";

// The braille spinner everyone recognises from `npm install`.
const SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const BAR_CELLS = 22;
const BAR_CELLS_MOBILE = 14;

const lineText = (line: TerminalLine): string => line.map((token) => token.text).join("");

interface ScanConsoleProps {
  lines: TerminalLine[];
  progress: number;
  phaseLabel: string;
  host: string;
  reduce: boolean;
  failed: boolean;
}

type StepState = "done" | "active" | "failed";

/**
 * An `npm install`-style live console: completed steps tick green, the running
 * step carries a braille spinner, and a bracketed progress gauge fills below.
 */
export const ScanConsole = ({
  lines,
  progress,
  phaseLabel,
  host,
  reduce,
  failed,
}: ScanConsoleProps) => {
  const [frame, setFrame] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [barCells, setBarCells] = useState(BAR_CELLS);
  const startRef = useRef<number | null>(null);

  // Shorten the progress gauge on phones so it never overflows the console.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 500px)");
    const apply = () => setBarCells(mq.matches ? BAR_CELLS_MOBILE : BAR_CELLS);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Spin the cursor while the scan is live.
  useEffect(() => {
    if (reduce || failed) return;
    const id = window.setInterval(() => setFrame((value) => (value + 1) % SPINNER.length), 90);
    return () => window.clearInterval(id);
  }, [reduce, failed]);

  // Count elapsed time, like npm's `… in 4s`.
  useEffect(() => {
    if (failed) return;
    if (startRef.current === null) startRef.current = Date.now();
    const tick = () => setElapsed((Date.now() - (startRef.current ?? Date.now())) / 1000);
    tick();
    const id = window.setInterval(tick, 200);
    return () => window.clearInterval(id);
  }, [failed]);

  const raw = lines.map(lineText);
  const command =
    raw
      .find((line) => line.startsWith("$ "))
      ?.slice(2)
      .trim() ?? "";
  const subtitle = raw.find((line) => line.trim().startsWith("WCAG"))?.trim() ?? "";
  const steps = raw.filter((line) => line.startsWith("◈")).map((line) => line.replace(/^◈\s*/, ""));
  const errorLine = raw.find((line) => line.startsWith("✕"))?.replace(/^✕\s*/, "") ?? "";

  const spinner = reduce ? "⠿" : SPINNER[frame];
  const lastIndex = steps.length - 1;
  const filled = Math.max(0, Math.min(barCells, Math.round((progress / 100) * barCells)));

  const stepState = (index: number): StepState => {
    const isLast = index === lastIndex;
    if (failed) return isLast ? "failed" : "done";
    return isLast ? "active" : "done";
  };

  return (
    <div className={cn(styles.console2, failed && styles.console2Failed)}>
      <div className={styles.console2Bar}>
        <span className={styles.console2Dots} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className={styles.console2Title}>axiony@scan · {host || "cloud"}</span>
        <span className={styles.console2Clock}>{failed ? "halted" : `${elapsed.toFixed(1)}s`}</span>
      </div>

      <div className={styles.console2Body}>
        {command && (
          <p className={styles.c2line}>
            <span className={styles.c2prompt}>❯</span>
            <span className={styles.c2cmd}>{command}</span>
          </p>
        )}
        {subtitle && <p className={cn(styles.c2line, styles.c2dim)}>{subtitle}</p>}

        <ul className={styles.c2steps}>
          {steps.map((step, index) => {
            const state = stepState(index);
            return (
              <li key={`${index}-${step}`} className={cn(styles.c2step, styles[`c2step_${state}`])}>
                <span className={styles.c2glyph} aria-hidden="true">
                  {state === "active" ? spinner : state === "failed" ? "✕" : "✓"}
                </span>
                <span className={styles.c2text}>{step}</span>
                {state === "done" && <span className={styles.c2ok}>done</span>}
              </li>
            );
          })}
        </ul>

        {failed ? (
          <p className={cn(styles.c2line, styles.c2error)}>
            <span className={styles.c2glyph} aria-hidden="true">
              ✕
            </span>
            <span className={styles.c2text}>{errorLine || "Scan interrupted"}</span>
          </p>
        ) : (
          <p className={styles.c2gauge} aria-hidden="true">
            <span className={styles.c2bracket}>⸨</span>
            <span className={styles.c2fill}>{"█".repeat(filled)}</span>
            <span className={styles.c2track}>{"░".repeat(barCells - filled)}</span>
            <span className={styles.c2bracket}>⸩</span>
            <span className={styles.c2spin}>{spinner}</span>
            <span className={styles.c2pct}>{progress}%</span>
            <span className={styles.c2phase}>{phaseLabel.toLowerCase()}</span>
          </p>
        )}
      </div>
    </div>
  );
};
