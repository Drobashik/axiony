import type { Prisma, ScanJob } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { IssueStatus, PendingScan } from "@/lib/workspace/types";
import type { ScanDiagnostic, ScanJobSnapshot, ScanReportPayload, WcagLevel } from "./types";

const REPORT_TTL_MS = 1000 * 60 * 60 * 24 * 30;

const addMs = (date: Date, ms: number): Date => new Date(date.getTime() + ms);

const json = (value: unknown): Prisma.InputJsonValue => value as Prisma.InputJsonValue;

const stringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

const reportPayload = (value: unknown): ScanReportPayload | undefined => {
  if (!value || typeof value !== "object") return undefined;

  const report = value as Partial<ScanReportPayload>;
  if (
    typeof report.url !== "string" ||
    typeof report.level !== "string" ||
    typeof report.scannedAt !== "string" ||
    !Array.isArray(report.issues) ||
    typeof report.score !== "number"
  ) {
    return undefined;
  }

  return report as ScanReportPayload;
};

const diagnosticPayload = (value: unknown): ScanDiagnostic | undefined => {
  if (!value || typeof value !== "object" || !("diagnostic" in value)) return undefined;
  const diagnostic = (value as { diagnostic?: unknown }).diagnostic;
  if (!diagnostic || typeof diagnostic !== "object") return undefined;

  const payload = diagnostic as Partial<ScanDiagnostic>;
  if (
    typeof payload.capturedAt !== "string" ||
    typeof payload.requestedUrl !== "string" ||
    typeof payload.finalUrl !== "string" ||
    typeof payload.title !== "string" ||
    typeof payload.textLength !== "number" ||
    typeof payload.elementCount !== "number" ||
    typeof payload.formControlCount !== "number" ||
    typeof payload.htmlPreview !== "string"
  ) {
    return undefined;
  }

  return payload as ScanDiagnostic;
};

export const isScanJobSnapshot = (value: unknown): value is ScanJobSnapshot => {
  if (!value || typeof value !== "object") return false;

  const job = value as Partial<ScanJobSnapshot>;
  return (
    typeof job.jobId === "string" &&
    typeof job.status === "string" &&
    typeof job.url === "string" &&
    typeof job.level === "string" &&
    typeof job.progress === "number" &&
    Array.isArray(job.lines) &&
    typeof job.createdAt === "string" &&
    typeof job.updatedAt === "string"
  );
};

const hostFromUrl = (url: string): string => {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return (
      url
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split("/")[0] || url
    );
  }
};

const pathFromUrl = (url: string): string => {
  try {
    const path = new URL(url).pathname || "/";
    return path.length > 1 ? path.replace(/\/+$/, "") : "/";
  } catch {
    const match = url.replace(/^https?:\/\//, "").match(/\/.*/);
    const path = match ? match[0] : "/";
    return path.length > 1 ? path.replace(/\/+$/, "") : "/";
  }
};

export const toClientScanJob = (job: ScanJob): ScanJobSnapshot => ({
  jobId: job.id,
  status: job.status as ScanJobSnapshot["status"],
  url: job.url,
  level: job.level as WcagLevel,
  progress: job.progress,
  lines: stringArray(job.lines),
  createdAt: job.createdAt.toISOString(),
  updatedAt: job.updatedAt.toISOString(),
  report: reportPayload(job.report),
  error: job.error ?? undefined,
  diagnostic: diagnosticPayload(job.report),
});

const reportData = (userId: string, job: ScanJob, report: ScanReportPayload) => ({
  userId,
  scanJobId: job.id,
  url: report.url,
  host: hostFromUrl(report.url),
  path: pathFromUrl(report.url),
  level: report.level,
  score: report.score,
  total: report.issues.length,
  counts: json(report.counts),
  report: json(report),
  scannedAt: new Date(report.scannedAt),
});

export const persistUserScanReport = async (
  userId: string,
  job: ScanJob,
  report: ScanReportPayload,
): Promise<void> => {
  const data = reportData(userId, job, report);

  await prisma.userScanReport.upsert({
    where: { scanJobId: job.id },
    create: data,
    update: {
      url: data.url,
      host: data.host,
      path: data.path,
      level: data.level,
      score: data.score,
      total: data.total,
      counts: data.counts,
      report: data.report,
      scannedAt: data.scannedAt,
    },
  });
};

export const createPersistedScanJob = async (
  userId: string,
  normalizedUrl: string,
  level: WcagLevel,
  remoteJob: ScanJobSnapshot,
): Promise<ScanJobSnapshot> => {
  const now = new Date();
  const complete = remoteJob.status === "complete";
  const failed = remoteJob.status === "failed";
  const report = complete ? remoteJob.report : undefined;

  const job = await prisma.scanJob.create({
    data: {
      userId,
      url: remoteJob.url || normalizedUrl,
      normalizedUrl,
      level,
      status: remoteJob.status,
      progress: remoteJob.progress,
      lines: json(remoteJob.lines),
      report: report
        ? json(report)
        : remoteJob.diagnostic
          ? json({ diagnostic: remoteJob.diagnostic })
          : undefined,
      error: remoteJob.error,
      scannerJobId: remoteJob.jobId,
      completedAt: complete || failed ? now : undefined,
      expiresAt: addMs(now, REPORT_TTL_MS),
    },
  });

  if (report) {
    await persistUserScanReport(userId, job, report);
  }

  return toClientScanJob(job);
};

export const getPersistedScanJob = async (userId: string, jobId: string): Promise<ScanJob | null> =>
  prisma.scanJob.findFirst({
    where: {
      id: jobId,
      userId,
    },
  });

export const syncPersistedScanJob = async (
  userId: string,
  job: ScanJob,
  remoteJob: ScanJobSnapshot,
): Promise<ScanJobSnapshot> => {
  const complete = remoteJob.status === "complete";
  const failed = remoteJob.status === "failed";
  const report = complete ? remoteJob.report : undefined;

  const updated = await prisma.scanJob.update({
    where: { id: job.id },
    data: {
      status: remoteJob.status,
      progress: remoteJob.progress,
      lines: json(remoteJob.lines),
      report: report
        ? json(report)
        : remoteJob.diagnostic
          ? json({ diagnostic: remoteJob.diagnostic })
          : undefined,
      error: remoteJob.error,
      scannerJobId: remoteJob.jobId,
      completedAt: complete || failed ? new Date() : job.completedAt,
    },
  });

  if (report) {
    await persistUserScanReport(userId, updated, report);
  }

  return toClientScanJob(updated);
};

export const failPersistedScanJob = async (
  job: ScanJob,
  message: string,
): Promise<ScanJobSnapshot> => {
  const lines = stringArray(job.lines);
  const lastLine = lines[lines.length - 1];
  const failedLines = lastLine?.includes(message) ? lines : [...lines, `✕ ${message}`];

  const updated = await prisma.scanJob.update({
    where: { id: job.id },
    data: {
      status: "failed",
      progress: Math.max(job.progress, 5),
      lines: json(failedLines),
      error: message,
      completedAt: new Date(),
    },
  });

  return toClientScanJob(updated);
};

export const latestUserScanReports = async (userId: string, limit = 20) =>
  prisma.userScanReport.findMany({
    where: { userId },
    orderBy: { scannedAt: "desc" },
    take: limit,
  });

export const deleteUserScanReportsByHost = async (userId: string, host: string) => {
  const [reports] = await prisma.$transaction([
    prisma.userScanReport.deleteMany({
      where: {
        userId,
        host,
      },
    }),
    prisma.userIssueState.deleteMany({
      where: {
        userId,
        host,
      },
    }),
  ]);

  return reports;
};

const toClientIssueState = (state: {
  host: string;
  path: string;
  issueKey: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  host: state.host,
  path: state.path,
  issueKey: state.issueKey,
  status: state.status,
  createdAt: state.createdAt.toISOString(),
  updatedAt: state.updatedAt.toISOString(),
});

export const listUserIssueStates = async (userId: string) => {
  const states = await prisma.userIssueState.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  return states.map(toClientIssueState);
};

export const upsertUserIssueState = async ({
  userId,
  host,
  path,
  issueKey,
  status,
  createdAt,
}: {
  userId: string;
  host: string;
  path: string;
  issueKey: string;
  status: IssueStatus;
  createdAt?: Date;
}) => {
  const state = await prisma.userIssueState.upsert({
    where: {
      userId_host_path_issueKey: {
        userId,
        host,
        path,
        issueKey,
      },
    },
    create: {
      userId,
      host,
      path,
      issueKey,
      status,
      createdAt,
    },
    update: {
      status,
    },
  });

  return toClientIssueState(state);
};

const pendingToReportPayload = (pending: PendingScan): ScanReportPayload => ({
  url: pending.url,
  level: pending.level,
  scannedAt: pending.scannedAt,
  score: pending.score,
  counts: pending.counts,
  issues: pending.issues.map((issue, index) => ({
    id: issue.id,
    severity: issue.severity,
    title: issue.title,
    description: issue.description ?? issue.title,
    rule: issue.rule,
    wcag: issue.wcag ?? [],
    nodes:
      issue.nodes && issue.nodes.length > 0
        ? issue.nodes
        : [`${issue.count} affected element${issue.count === 1 ? "" : "s"}`],
    fix:
      issue.fix ??
      issue.suggestedFix ??
      "Review the affected element and apply the recommended accessibility fix.",
    whatHappened: issue.whatHappened,
    whyItMatters: issue.whyItMatters,
    suggestedFix: issue.suggestedFix ?? issue.fix,
    beforeCode: issue.beforeCode,
    afterCode: issue.afterCode,
    code: issue.code,
    animationDelay: index * 60,
  })),
});

export const importPendingScanReport = async (
  userId: string,
  pending: PendingScan,
): Promise<ScanJobSnapshot> => {
  const scannedAt = new Date(pending.scannedAt);
  const existing = await prisma.userScanReport.findFirst({
    where: {
      userId,
      url: pending.url,
      scannedAt,
    },
    include: {
      scanJob: true,
    },
  });

  if (existing?.scanJob) {
    return toClientScanJob(existing.scanJob);
  }

  const report = pendingToReportPayload(pending);
  const lines = [
    `$ axiony scan ${pending.url} --json`,
    `  WCAG ${pending.level} · imported guest baseline`,
    `✓ Scan imported · ${report.issues.length} issue${report.issues.length === 1 ? "" : "s"} found`,
  ];

  const job = await prisma.scanJob.create({
    data: {
      userId,
      url: pending.url,
      normalizedUrl: pending.url,
      level: pending.level,
      status: "complete",
      progress: 100,
      lines: json(lines),
      report: json(report),
      completedAt: scannedAt,
      createdAt: scannedAt,
      expiresAt: addMs(new Date(), REPORT_TTL_MS),
    },
  });

  await persistUserScanReport(userId, job, report);

  return toClientScanJob(job);
};
