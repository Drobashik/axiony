import { randomUUID } from "node:crypto";
import { config } from "../config";
import { toScanReportPayload } from "../scan/adapter";
import { scanUrl } from "../scan/run-url";
import type {
  CliScanResult,
  JobStats,
  MutableScanJob,
  ScanJobSnapshot,
  WcagLevel,
} from "../types";
import { randomInt, randomProgressForMessage } from "./progress";

const JOB_TTL_MS = 30 * 60 * 1000;
const MAX_LINES = 60;

const jobs = new Map<string, MutableScanJob>();
const queue: string[] = [];
let activeCount = 0;

const now = (): string => new Date().toISOString();

const touch = (job: MutableScanJob): void => {
  job.updatedAt = now();
};

const snapshot = (job: MutableScanJob): ScanJobSnapshot => ({
  jobId: job.jobId,
  status: job.status,
  url: job.url,
  level: job.level,
  progress: job.progress,
  lines: [...job.lines],
  createdAt: job.createdAt,
  updatedAt: job.updatedAt,
  report: job.report,
  error: job.error,
  diagnostic: job.diagnostic,
});

const pushLine = (job: MutableScanJob, line: string): void => {
  job.lines.push(line);
  if (job.lines.length > MAX_LINES) {
    job.lines = job.lines.slice(-MAX_LINES);
  }
  touch(job);
};

const markFailed = (job: MutableScanJob, error: unknown): void => {
  const message = error instanceof Error ? error.message : "Scan failed.";
  const diagnostic =
    error &&
    typeof error === "object" &&
    "diagnostic" in error &&
    typeof error.diagnostic === "object"
      ? error.diagnostic
      : undefined;

  job.status = "failed";
  job.error = message;
  job.diagnostic = diagnostic as MutableScanJob["diagnostic"];
  job.progress = Math.max(job.progress, 5);
  pushLine(job, `✕ ${message}`);
};

const markComplete = (job: MutableScanJob, result: CliScanResult): void => {
  job.status = "complete";
  job.progress = 100;
  job.report = toScanReportPayload(result, job.level);
  pushLine(
    job,
    `✓ Scan complete · ${job.report.issues.length} issue${job.report.issues.length === 1 ? "" : "s"} found`,
  );
};

const cleanupJobs = (): void => {
  const cutoff = Date.now() - JOB_TTL_MS;

  for (const [jobId, job] of jobs) {
    if (new Date(job.updatedAt).getTime() < cutoff) {
      jobs.delete(jobId);
    }
  }
};

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  let timeout: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(
      () =>
        reject(new Error("Scan timed out. Try again or scan a smaller page.")),
      ms,
    );
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeout) clearTimeout(timeout);
  });
};

const runJob = async (job: MutableScanJob): Promise<void> => {
  job.status = "scanning";
  pushLine(job, "◈ Launching scan worker");

  try {
    const result = await withTimeout(
      scanUrl(job.url, {
        level: job.level,
        onProgressPrint: (message) => {
          if (job.status === "complete" || job.status === "failed") return;
          job.progress = randomProgressForMessage(job, message);
          pushLine(job, `◈ ${message}`);
        },
      }),
      config.jobTimeoutMs,
    );

    markComplete(job, result);
  } catch (error) {
    markFailed(job, error);
  } finally {
    activeCount = Math.max(0, activeCount - 1);
    runNext();
  }
};

const runNext = (): void => {
  while (activeCount < config.concurrency && queue.length > 0) {
    const jobId = queue.shift();
    const job = jobId ? jobs.get(jobId) : undefined;
    if (!job || job.status !== "queued") continue;

    activeCount += 1;
    void runJob(job);
  }
};

export const createScanJob = (
  url: string,
  level: WcagLevel,
): ScanJobSnapshot => {
  cleanupJobs();

  const createdAt = now();
  const job: MutableScanJob = {
    jobId: randomUUID(),
    status: "queued",
    url,
    level,
    progress: randomInt(2, 5),
    lines: [
      `$ axiony scan ${url} --json`,
      `  WCAG ${level} · live axe-core scan`,
    ],
    createdAt,
    updatedAt: createdAt,
  };

  jobs.set(job.jobId, job);
  queue.push(job.jobId);
  runNext();

  return snapshot(job);
};

export const getScanJob = (jobId: string): ScanJobSnapshot | undefined => {
  const job = jobs.get(jobId);
  return job ? snapshot(job) : undefined;
};

export const stats = (): JobStats => ({
  active: activeCount,
  queued: queue.length,
  total: jobs.size,
  concurrency: config.concurrency,
});
