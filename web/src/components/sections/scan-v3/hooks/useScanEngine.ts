"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TerminalLine } from "@/components/ui";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { computeScore, countBySeverity, generateIssues } from "@/lib/scan/issues";
import { buildScanLines } from "@/lib/scan/script";
import { normalizeUrl } from "@/lib/scan/url";
import { SCAN_PHASES } from "../data";
import type { ScanReport, StudioState, WcagLevel } from "../types";

const LINE_MS = 150;
const START_DELAY_MS = 160;
const RESULT_DELAY_MS = 620;

// Map scan progress (0–100) onto the four stage phases.
export const phaseForProgress = (progress: number): number => {
  if (progress < 25) return 0;
  if (progress < 55) return 1;
  if (progress < 92) return 2;
  return Math.min(3, SCAN_PHASES.length - 1);
};

export interface ScanEngine {
  status: StudioState;
  url: string;
  lines: TerminalLine[];
  progress: number;
  report: ScanReport | null;
  reduce: boolean;
  start: (rawUrl: string, level: WcagLevel) => void;
  reset: () => void;
}

// Owns the idle → scanning → results lifecycle: plays back the terminal
// log, advances progress, then computes a deterministic report.
//
// TODO(cloud): replace the timer-driven playback + `generateIssues` with
// a real request to the cloud scan API, advancing progress from the job.
export const useScanEngine = (): ScanEngine => {
  const reduce = usePrefersReducedMotion();
  const [status, setStatus] = useState<StudioState>("idle");
  const [url, setUrl] = useState("");
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState<ScanReport | null>(null);

  const timers = useRef<number[]>([]);
  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);
  useEffect(() => clearTimers, [clearTimers]);

  const start = useCallback(
    (rawUrl: string, level: WcagLevel) => {
      const target = normalizeUrl(rawUrl);
      if (!target) return;

      clearTimers();
      setUrl(target);
      setReport(null);
      setLines([]);
      setProgress(0);
      setStatus("scanning");

      const built = buildScanLines(target);
      const step = reduce ? 28 : LINE_MS;
      const startDelay = reduce ? 40 : START_DELAY_MS;
      const resultDelay = reduce ? 120 : RESULT_DELAY_MS;
      const last = built.length - 1;

      built.forEach((line, i) => {
        timers.current.push(
          window.setTimeout(() => {
            setLines((prev) => [...prev, line]);
            setProgress(Math.round((i / last) * 100));

            if (i === last) {
              timers.current.push(
                window.setTimeout(() => {
                  const issues = generateIssues(target);
                  setReport({
                    url: target,
                    level,
                    scannedAt: new Date(),
                    issues,
                    counts: countBySeverity(issues),
                    score: computeScore(issues),
                  });
                  setStatus("results");
                }, resultDelay),
              );
            }
          }, startDelay + i * step),
        );
      });
    },
    [clearTimers, reduce],
  );

  const reset = useCallback(() => {
    clearTimers();
    setStatus("idle");
    setLines([]);
    setProgress(0);
    setReport(null);
  }, [clearTimers]);

  return { status, url, lines, progress, report, reduce, start, reset };
};
