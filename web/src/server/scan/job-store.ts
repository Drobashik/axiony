import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { toScanReportPayload } from "./adapter";
import type {
  CliScanResult,
  ScanJobSnapshot,
  ScanJobStatus,
  ScanRunnerEvent,
  WcagLevel,
} from "./types";

const JOB_TTL_MS = 30 * 60 * 1000;
const JOB_TIMEOUT_MS = 240 * 1000;
const MAX_LINES = 60;

const PROGRESS_RANGE_BY_MESSAGE: Record<string, readonly [number, number]> = {
  "Launching browser": [6, 12],
  "Opening page": [18, 29],
  "Waiting for page readiness": [34, 48],
  "Retrying with a fresh browser session": [44, 52],
  "Injecting accessibility engine": [53, 64],
  "Validating selector": [62, 72],
  "Running accessibility checks": [74, 87],
  "Processing results": [90, 96],
};

interface MutableScanJob extends ScanJobSnapshot {
  childPid?: number;
}

declare global {
  var __axionyScanJobs: Map<string, MutableScanJob> | undefined;
}

const jobs = globalThis.__axionyScanJobs ?? new Map<string, MutableScanJob>();
globalThis.__axionyScanJobs = jobs;

const now = (): string => new Date().toISOString();

const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomProgressForMessage = (job: MutableScanJob, message: string): number => {
  const range = PROGRESS_RANGE_BY_MESSAGE[message];

  if (!range) {
    return Math.min(96, job.progress + randomInt(1, 4));
  }

  const [min, max] = range;
  const upper = Math.min(max, 96);

  if (job.progress >= upper) {
    return Math.min(96, job.progress + randomInt(0, 2));
  }

  const lower = Math.min(Math.max(job.progress + 1, min), upper);

  return randomInt(lower, upper);
};

const nudgeProgress = (job: MutableScanJob) => {
  if (job.status !== "scanning" || job.progress >= 96) return;
  job.progress = Math.min(96, job.progress + randomInt(1, 3));
  touch(job);
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
});

const touch = (job: MutableScanJob) => {
  job.updatedAt = now();
};

const pushLine = (job: MutableScanJob, line: string) => {
  job.lines.push(line);
  if (job.lines.length > MAX_LINES) {
    job.lines = job.lines.slice(-MAX_LINES);
  }
  touch(job);
};

const markFailed = (job: MutableScanJob, message: string) => {
  job.status = "failed";
  job.error = message;
  job.progress = Math.max(job.progress, 5);
  pushLine(job, `✕ ${message}`);
};

const markComplete = (job: MutableScanJob, result: CliScanResult) => {
  job.status = "complete";
  job.progress = 100;
  job.report = toScanReportPayload(result, job.level);
  pushLine(
    job,
    `✓ Scan complete · ${job.report.issues.length} issue${job.report.issues.length === 1 ? "" : "s"} found`,
  );
};

const cleanupJobs = () => {
  const cutoff = Date.now() - JOB_TTL_MS;

  for (const [jobId, job] of jobs) {
    if (new Date(job.updatedAt).getTime() < cutoff) {
      jobs.delete(jobId);
    }
  }
};

const parseRunnerLine = (line: string): ScanRunnerEvent | null => {
  try {
    const event = JSON.parse(line) as ScanRunnerEvent;
    if (event.type === "progress" || event.type === "result" || event.type === "error") {
      return event;
    }
  } catch {
    return null;
  }

  return null;
};

const handleRunnerEvent = (job: MutableScanJob, event: ScanRunnerEvent) => {
  if (job.status === "complete" || job.status === "failed") return;

  if (event.type === "progress") {
    job.status = "scanning";
    job.progress = randomProgressForMessage(job, event.message);
    pushLine(job, `◈ ${event.message}`);
    return;
  }

  if (event.type === "result") {
    markComplete(job, event.result);
    return;
  }

  markFailed(job, event.message);
};

const startScanProcess = (job: MutableScanJob) => {
  const scriptPath = path.resolve(process.cwd(), "scripts/run-scan-job.cjs");
  const child = spawn(process.execPath, [scriptPath, job.url, "", job.level], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      FORCE_COLOR: "0",
      NO_COLOR: "1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  job.childPid = child.pid;
  job.status = "scanning";
  pushLine(job, "◈ Queued scan worker");

  let stdoutBuffer = "";
  let stderrBuffer = "";

  const timeout = setTimeout(() => {
    if (job.status !== "complete" && job.status !== "failed") {
      child.kill("SIGTERM");
      markFailed(job, "Scan timed out. Try again or scan a smaller page.");
    }
  }, JOB_TIMEOUT_MS);

  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (chunk: string) => {
    stdoutBuffer += chunk;

    let newlineIndex = stdoutBuffer.indexOf("\n");
    while (newlineIndex >= 0) {
      const line = stdoutBuffer.slice(0, newlineIndex).trim();
      stdoutBuffer = stdoutBuffer.slice(newlineIndex + 1);

      if (line) {
        const event = parseRunnerLine(line);
        if (event) handleRunnerEvent(job, event);
      }

      newlineIndex = stdoutBuffer.indexOf("\n");
    }
  });

  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (chunk: string) => {
    stderrBuffer += chunk;
  });

  child.on("error", (error) => {
    clearTimeout(timeout);
    if (job.status !== "complete" && job.status !== "failed") {
      markFailed(job, error.message);
    }
  });

  child.on("close", (code) => {
    clearTimeout(timeout);

    if (job.status === "complete" || job.status === "failed") return;

    if (code === 0) {
      markFailed(job, "Scanner exited without returning a report.");
      return;
    }

    const message = stderrBuffer.trim() || "Scanner failed before returning a report.";
    markFailed(job, message);
  });
};

export const createScanJob = (url: string, level: WcagLevel): ScanJobSnapshot => {
  cleanupJobs();

  const createdAt = now();
  const job: MutableScanJob = {
    jobId: randomUUID(),
    status: "queued" satisfies ScanJobStatus,
    url,
    level,
    progress: randomInt(2, 5),
    lines: [`$ axiony scan ${url} --json`, `  WCAG ${level} · live axe-core scan`],
    createdAt,
    updatedAt: createdAt,
  };

  jobs.set(job.jobId, job);
  startScanProcess(job);

  return snapshot(job);
};

export const getScanJob = (jobId: string): ScanJobSnapshot | undefined => {
  const job = jobs.get(jobId);
  if (job) nudgeProgress(job);
  return job ? snapshot(job) : undefined;
};
