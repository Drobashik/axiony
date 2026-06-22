"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { blank, txt } from "@/components/ui/Terminal";
import type { TerminalLine } from "@/components/ui";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { normalizeUrl } from "@/lib/scan/url";
import { SCAN_PHASES } from "../data";
import type { ScanReport, StudioState, WcagLevel } from "../types";

const POLL_MS = 750;
const SCANNER_WAKEUP_DELAYS = [0, 1_500, 2_500, 4_000, 6_000, 8_000, 10_000, 12_000] as const;
const SCANNER_WAKEUP_MESSAGE = "Scanner is waking up.";

const randomInitialProgress = (): number => Math.floor(Math.random() * 4) + 2;

type ApiScanJobStatus = "queued" | "scanning" | "complete" | "failed";

interface ApiScanReport extends Omit<ScanReport, "scannedAt"> {
  scannedAt: string;
}

interface ApiScanJob {
  jobId: string;
  status: ApiScanJobStatus;
  url: string;
  level: WcagLevel;
  progress: number;
  lines: string[];
  report?: ApiScanReport;
  error?: string;
}

const getErrorMessage = async (response: Response): Promise<string> => {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? "Scan request failed.";
  } catch {
    return "Scan request failed.";
  }
};

const isRetryableScannerWakeup = (status: number, message: string): boolean => {
  const normalized = message.toLowerCase();

  return (
    status === 502 ||
    status === 504 ||
    (status === 503 && !normalized.includes("not configured")) ||
    normalized.includes("temporarily unavailable") ||
    normalized.includes("waking up") ||
    normalized.includes("bad gateway")
  );
};

const wait = (ms: number, signal: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Scan cancelled.", "AbortError"));
      return;
    }

    const timeout = window.setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    const onAbort = () => {
      window.clearTimeout(timeout);
      reject(new DOMException("Scan cancelled.", "AbortError"));
    };

    signal.addEventListener("abort", onAbort, { once: true });
  });

const commandLine = (line: string): TerminalLine => {
  if (!line.startsWith("$ ")) return [txt(line, "cmd")];

  return [txt("$", "prompt"), txt(" "), txt(line.slice(2), "cmd")];
};

const toTerminalLine = (line: string): TerminalLine => {
  if (!line.trim()) return blank;
  if (line.startsWith("$ ")) return commandLine(line);
  if (line.includes("✕")) return [txt(line, "error")];
  if (line.includes("✓")) return [txt(line, "success")];
  if (line.toLowerCase().includes("warning")) return [txt(line, "warn")];
  if (line.includes("WCAG")) return [txt(line, "dim")];
  return [txt(line, "output")];
};

const toReport = (report: ApiScanReport): ScanReport => ({
  ...report,
  scannedAt: new Date(report.scannedAt),
});

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
  error: string | null;
  reduce: boolean;
  start: (rawUrl: string, level: WcagLevel) => void;
  reset: () => void;
}

// Owns the idle → scanning → results lifecycle. The real scan runs on the
// backend; this hook starts a job and polls its progress.
export const useScanEngine = (): ScanEngine => {
  const reduce = usePrefersReducedMotion();
  const [status, setStatus] = useState<StudioState>("idle");
  const [url, setUrl] = useState("");
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState<ScanReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pollTimer = useRef<number | null>(null);
  const activeJob = useRef<string | null>(null);
  const abortController = useRef<AbortController | null>(null);
  const scanRunId = useRef(0);

  const clearPolling = useCallback(() => {
    if (pollTimer.current !== null) {
      window.clearTimeout(pollTimer.current);
      pollTimer.current = null;
    }
    abortController.current?.abort();
    abortController.current = null;
  }, []);

  useEffect(() => clearPolling, [clearPolling]);

  const fail = useCallback((target: string, message: string) => {
    setUrl(target);
    setStatus("failed");
    setProgress((current) => Math.max(current, 5));
    setReport(null);
    setError(message);
    setLines((prev) => [...prev, toTerminalLine(`✕ ${message}`)]);
  }, []);

  const appendConsoleLine = useCallback((line: string) => {
    setLines((prev) => [...prev, toTerminalLine(line)]);
  }, []);

  const waitForScannerWakeup = useCallback(
    async (runId: number) => {
      const ensureCurrentRun = (signal?: AbortSignal) => {
        if (signal?.aborted || scanRunId.current !== runId) {
          throw new DOMException("Scan cancelled.", "AbortError");
        }
      };

      let wakingAnnounced = false;

      ensureCurrentRun();
      appendConsoleLine("◈ Checking scanner service");
      setProgress((current) => Math.max(current, 5));

      for (let attempt = 0; attempt < SCANNER_WAKEUP_DELAYS.length; attempt += 1) {
        const controller = new AbortController();
        abortController.current = controller;

        const delay = SCANNER_WAKEUP_DELAYS[attempt];
        if (delay > 0) {
          await wait(delay, controller.signal);
        }
        ensureCurrentRun(controller.signal);

        const response = await fetch("/api/scans/health", {
          cache: "no-store",
          signal: controller.signal,
        });
        ensureCurrentRun(controller.signal);

        if (response.ok) {
          appendConsoleLine("✓ Scanner is ready");
          setProgress((current) => Math.max(current, 10));
          return;
        }

        const message = await getErrorMessage(response);
        const retryable = isRetryableScannerWakeup(response.status, message);

        if (!retryable || attempt === SCANNER_WAKEUP_DELAYS.length - 1) {
          throw new Error(
            retryable ? "Scanner is still waking up. Try again in a minute." : message,
          );
        }

        if (!wakingAnnounced) {
          appendConsoleLine(`◈ ${SCANNER_WAKEUP_MESSAGE}`);
          wakingAnnounced = true;
        } else {
          appendConsoleLine("◈ Retrying scanner health check");
        }

        setProgress((current) => Math.max(current, Math.min(22, 8 + attempt * 2)));
      }
    },
    [appendConsoleLine],
  );

  const applyJob = useCallback(
    (job: ApiScanJob) => {
      setUrl(job.url);
      setProgress(job.progress);
      setLines(job.lines.map(toTerminalLine));

      if (job.status === "complete" && job.report) {
        clearPolling();
        activeJob.current = null;
        setReport(toReport(job.report));
        setError(null);
        setStatus("results");
        return;
      }

      if (job.status === "failed") {
        clearPolling();
        activeJob.current = null;
        setReport(null);
        setError(job.error ?? "Scan failed.");
        setStatus("failed");
        return;
      }

      setReport(null);
      setError(null);
      setStatus("scanning");
    },
    [clearPolling],
  );

  const pollJob = useCallback(
    async function pollJob(jobId: string) {
      if (activeJob.current !== jobId) return;

      abortController.current = new AbortController();

      try {
        const response = await fetch(`/api/scans/${jobId}`, {
          signal: abortController.current.signal,
        });

        if (!response.ok) {
          throw new Error(await getErrorMessage(response));
        }

        const job = (await response.json()) as ApiScanJob;
        if (activeJob.current !== jobId) return;

        applyJob(job);

        if (job.status === "queued" || job.status === "scanning") {
          pollTimer.current = window.setTimeout(() => {
            void pollJob(jobId);
          }, POLL_MS);
        }
      } catch (pollError) {
        if (pollError instanceof DOMException && pollError.name === "AbortError") return;
        if (activeJob.current !== jobId) return;

        const message =
          pollError instanceof Error ? pollError.message : "Could not read scan status.";
        clearPolling();
        activeJob.current = null;
        fail(url, message);
      }
    },
    [applyJob, clearPolling, fail, url],
  );

  const start = useCallback(
    (rawUrl: string, level: WcagLevel) => {
      const target = normalizeUrl(rawUrl);
      if (!target) return;

      clearPolling();
      const runId = scanRunId.current + 1;
      scanRunId.current = runId;
      setUrl(target);
      setReport(null);
      setError(null);
      setLines([]);
      setProgress(randomInitialProgress());
      setStatus("scanning");

      const initialLines = [
        `$ axiony scan ${target} --json`,
        `  WCAG ${level} · starting live axe-core scan`,
      ];
      setLines(initialLines.map(toTerminalLine));

      void (async () => {
        try {
          await waitForScannerWakeup(runId);
          if (scanRunId.current !== runId) return;

          abortController.current = new AbortController();

          const response = await fetch("/api/scans", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: target, level }),
            signal: abortController.current.signal,
          });

          if (!response.ok) {
            throw new Error(await getErrorMessage(response));
          }

          const job = (await response.json()) as ApiScanJob;
          if (scanRunId.current !== runId) return;

          activeJob.current = job.jobId;
          applyJob(job);

          pollTimer.current = window.setTimeout(
            () => {
              void pollJob(job.jobId);
            },
            reduce ? 250 : POLL_MS,
          );
        } catch (startError) {
          if (startError instanceof DOMException && startError.name === "AbortError") return;
          if (scanRunId.current !== runId) return;

          const message =
            startError instanceof Error ? startError.message : "Could not start scan.";
          activeJob.current = null;
          fail(target, message);
        }
      })();
    },
    [applyJob, clearPolling, fail, pollJob, reduce, waitForScannerWakeup],
  );

  const reset = useCallback(() => {
    scanRunId.current += 1;
    clearPolling();
    activeJob.current = null;
    setStatus("idle");
    setLines([]);
    setProgress(0);
    setReport(null);
    setError(null);
  }, [clearPolling]);

  return { status, url, lines, progress, report, error, reduce, start, reset };
};
