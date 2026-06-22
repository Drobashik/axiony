"use client";

import { useSyncExternalStore } from "react";
import type { Severity } from "@/types";
import {
  countsFromIssues,
  hostFromUrl,
  initialsFromName,
  pathFromUrl,
  scoreFromIssues,
} from "./derive";
import type {
  PendingScan,
  Project,
  ProjectPage,
  ScanRecord,
  TrackedIssue,
  Workspace,
  WorkspaceAccount,
} from "./types";

// Pending guest scans live briefly in localStorage so OAuth/email auth can
// finish and import that one result into the account. Saved reports are loaded
// from Neon via /api/scans/reports.
const PENDING_KEY = "axiony.pending_scan";
const LEGACY_WORKSPACE_KEY = "axiony.workspace";
const LEGACY_AUTH_KEY = "axiony.auth.mock";
const CHANGE_EVENT = "axiony:workspace-change";
const VERSION = 3;

const isBrowser = (): boolean => typeof window !== "undefined";
const now = (): string => new Date().toISOString();
const randomId = (): string => Math.random().toString(36).slice(2, 9);

interface PersistedScanReportRow {
  url?: string;
  host?: string;
  path?: string;
  level?: unknown;
  score?: number;
  total?: number;
  counts?: PendingScan["counts"];
  scannedAt?: string;
  report?: {
    url?: string;
    level?: unknown;
    scannedAt?: string;
    score?: number;
    counts?: PendingScan["counts"];
    issues?: Array<{
      id?: string;
      title?: string;
      severity?: unknown;
      rule?: string;
      description?: string;
      wcag?: string[];
      nodes?: string[];
      fix?: string;
      whatHappened?: string;
      whyItMatters?: string;
      suggestedFix?: string;
      beforeCode?: string;
      afterCode?: string;
      code?: string;
    }>;
  };
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function notify() {
  if (isBrowser()) window.dispatchEvent(new Event(CHANGE_EVENT));
}

const normalizeKeyPart = (value: string | undefined): string =>
  (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");

const issueIdentityKeys = (issue: TrackedIssue): string[] => {
  const keys: string[] = [];
  const templateId = normalizeKeyPart(issue.templateId);
  const rule = normalizeKeyPart(issue.rule);
  const title = normalizeKeyPart(issue.title);
  const firstNode = normalizeKeyPart(issue.nodes?.[0]);
  const id = normalizeKeyPart(issue.id);

  if (templateId) keys.push(`template:${templateId}`);
  if (rule && title) keys.push(`rule-title:${rule}|${title}`);
  if (rule && firstNode) keys.push(`rule-node:${rule}|${firstNode}`);
  if (rule) keys.push(`rule:${rule}`);
  if (id) keys.push(`id:${id}`);

  return keys;
};

const issueKeySet = (issues: TrackedIssue[]): Set<string> =>
  new Set(issues.flatMap(issueIdentityKeys));

const hasIssueMatch = (keys: Set<string>, issue: TrackedIssue): boolean =>
  issueIdentityKeys(issue).some((key) => keys.has(key));

const mergeIssueTriage = (
  nextIssues: TrackedIssue[],
  previousIssues: TrackedIssue[],
): TrackedIssue[] => {
  const previousByKey = new Map<string, TrackedIssue>();

  for (const issue of previousIssues) {
    for (const key of issueIdentityKeys(issue)) {
      if (!previousByKey.has(key)) previousByKey.set(key, issue);
    }
  }

  return nextIssues.map((issue) => {
    const previous = issueIdentityKeys(issue)
      .map((key) => previousByKey.get(key))
      .find((match): match is TrackedIssue => Boolean(match));

    return previous ? { ...issue, id: previous.id, status: previous.status } : issue;
  });
};

// ── Pending scan (scan page → signup / save) ─────────────────────────
export function writePendingScan(scan: PendingScan): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(scan));
  } catch {
    /* storage may be unavailable — the user can still scan */
  }
  notify();
}

export function readPendingScan(): PendingScan | null {
  if (!isBrowser()) return null;
  return safeParse<PendingScan>(localStorage.getItem(PENDING_KEY));
}

export function clearPendingScan(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(PENDING_KEY);
  notify();
}

export async function importPendingScanToServer(pending: PendingScan | null): Promise<boolean> {
  if (!isBrowser() || !pending) return false;

  try {
    const response = await fetch("/api/scans/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pending }),
    });
    if (response.ok) clearPendingScan();
    return response.ok;
  } catch {
    /* keep the pending scan so the next authenticated dashboard load can retry */
    return false;
  }
}

function clearLegacyWorkspaceStorage(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(LEGACY_WORKSPACE_KEY);
  try {
    sessionStorage.removeItem(LEGACY_AUTH_KEY);
  } catch {
    /* ignore */
  }
}

export function signOut(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(PENDING_KEY);
  clearLegacyWorkspaceStorage();
  notify();
}

// ── Builders ─────────────────────────────────────────────────────────
function baselineScanRecord(pending: PendingScan): ScanRecord {
  return {
    id: randomId(),
    score: pending.score,
    counts: pending.counts,
    total: pending.total,
    resolved: 0,
    regressions: [],
    scannedAt: pending.scannedAt,
  };
}

function pageFromPending(pending: PendingScan): ProjectPage {
  return {
    id: randomId(),
    path: pending.path,
    url: pending.url,
    level: pending.level,
    baseline: {
      score: pending.score,
      counts: pending.counts,
      total: pending.total,
      issues: pending.issues,
      createdAt: pending.scannedAt,
    },
    open: [...pending.issues],
    scans: [baselineScanRecord(pending)],
  };
}

function projectFromPending(pending: PendingScan): Project {
  return {
    id: randomId(),
    host: pending.host,
    createdAt: pending.scannedAt,
    pages: [pageFromPending(pending)],
  };
}

/** Record a real follow-up scan on a page by diffing fresh issues. */
function addScanToPage(page: ProjectPage, pending: PendingScan): void {
  const baselineKeys = issueKeySet(page.baseline.issues);
  const previousIssues = page.open;
  const nextKeys = issueKeySet(pending.issues);
  const nextIssues = mergeIssueTriage(pending.issues, previousIssues);

  page.open = nextIssues;
  page.scans.push({
    id: randomId(),
    score: pending.score,
    counts: pending.counts,
    total: pending.total,
    resolved: previousIssues.filter((issue) => !hasIssueMatch(nextKeys, issue)).length,
    regressions: pending.issues
      .filter((issue) => !hasIssueMatch(baselineKeys, issue))
      .map((i) => i.title),
    scannedAt: pending.scannedAt,
  });
}

/**
 * Apply a saved scan to a workspace without overwriting anything:
 *   new domain → new project · new path → new page · same path → follow-up.
 */
function applyScan(ws: Workspace, pending: PendingScan): void {
  const project = ws.projects.find((p) => p.host === pending.host);

  if (!project) {
    ws.projects.push(projectFromPending(pending));
    ws.onboarding.justCreated = { kind: "project", host: pending.host, path: pending.path };
    ws.onboarding.steps.baseline = true;
    return;
  }

  const page = project.pages.find((pg) => pg.path === pending.path);
  if (!page) {
    project.pages.push(pageFromPending(pending));
    ws.onboarding.justCreated = { kind: "page", host: pending.host, path: pending.path };
    return;
  }

  addScanToPage(page, pending);
}

function emptySteps() {
  return { baseline: false, connect: false, ci: false, invite: false };
}

function createWorkspace(account: WorkspaceAccount, pending: PendingScan | null): Workspace {
  if (pending) {
    return {
      version: VERSION,
      account,
      projects: [projectFromPending(pending)],
      onboarding: {
        justCreated: { kind: "project", host: pending.host, path: pending.path },
        steps: { ...emptySteps(), baseline: true },
      },
    };
  }
  return {
    version: VERSION,
    account,
    projects: [],
    onboarding: { justCreated: null, steps: emptySteps() },
  };
}

const isSeverity = (value: unknown): value is Severity =>
  value === "critical" || value === "serious" || value === "moderate" || value === "minor";

const isWcagLevel = (value: unknown): value is PendingScan["level"] =>
  value === "A" || value === "AA" || value === "AAA";

const trackedIssueFromReport = (
  issue: NonNullable<NonNullable<PersistedScanReportRow["report"]>["issues"]>[number],
  index: number,
): TrackedIssue => {
  const nodes = Array.isArray(issue.nodes) ? issue.nodes : [];
  const rule = issue.rule || "unknown-rule";

  return {
    id: issue.id || `${rule}-${index}`,
    title: issue.title || rule,
    severity: isSeverity(issue.severity) ? issue.severity : "minor",
    rule,
    count: Math.max(1, nodes.length),
    status: "open",
    description: issue.description,
    wcag: Array.isArray(issue.wcag) ? issue.wcag : [],
    nodes,
    fix: issue.fix,
    whatHappened: issue.whatHappened,
    whyItMatters: issue.whyItMatters,
    suggestedFix: issue.suggestedFix,
    beforeCode: issue.beforeCode,
    afterCode: issue.afterCode,
    code: issue.code,
  };
};

const pendingFromPersistedReport = (row: PersistedScanReportRow): PendingScan | null => {
  const report = row.report;
  const url = report?.url || row.url;
  const level = report?.level || row.level;
  const scannedAt = report?.scannedAt || row.scannedAt;
  const issues = Array.isArray(report?.issues) ? report.issues.map(trackedIssueFromReport) : [];

  if (!url || !isWcagLevel(level) || !scannedAt || !Number.isFinite(Date.parse(scannedAt))) {
    return null;
  }

  const counts = report?.counts || row.counts || countsFromIssues(issues);
  const score =
    typeof report?.score === "number" ? report.score : (row.score ?? scoreFromIssues(issues));

  return {
    url,
    host: row.host || hostFromUrl(url),
    path: row.path || pathFromUrl(url),
    level,
    score,
    counts,
    total: typeof row.total === "number" ? row.total : issues.length,
    issues,
    scannedAt,
  };
};

const hasScanRecord = (ws: Workspace, pending: PendingScan): boolean => {
  const page = ws.projects
    .find((project) => project.host === pending.host)
    ?.pages.find((projectPage) => projectPage.path === pending.path);

  return Boolean(page?.scans.some((scan) => scan.scannedAt === pending.scannedAt));
};

export async function restoreWorkspaceFromServer(
  identity: AuthIdentity,
): Promise<Workspace | null> {
  if (!isBrowser()) return null;
  clearLegacyWorkspaceStorage();

  const account: WorkspaceAccount = {
    name: identity.name.trim(),
    email: identity.email.trim(),
    initials: initialsFromName(identity.name || identity.email),
    createdAt: now(),
  };

  let rows: PersistedScanReportRow[];
  try {
    const response = await fetch("/api/scans/reports", { cache: "no-store" });
    if (!response.ok) return createWorkspace(account, null);
    const body = (await response.json()) as { reports?: PersistedScanReportRow[] };
    rows = Array.isArray(body.reports) ? body.reports : [];
  } catch {
    return createWorkspace(account, null);
  }

  const scans = rows
    .map(pendingFromPersistedReport)
    .filter((scan): scan is PendingScan => Boolean(scan))
    .sort((a, b) => a.scannedAt.localeCompare(b.scannedAt));

  const ws = createWorkspace(account, null);
  if (scans.length === 0) return ws;

  for (const pending of scans) {
    if (!hasScanRecord(ws, pending)) applyScan(ws, pending);
  }

  ws.onboarding.justCreated = null;
  return ws;
}

export interface AuthIdentity {
  name: string;
  email: string;
}

export interface WorkspaceState {
  ready: boolean;
  workspace: Workspace | null;
}

// ── Pending-scan subscription (read-only, hydration-safe) ────────────
let pendingRaw: string | null = null;
let pendingValue: PendingScan | null = null;

function pendingSnapshot(): PendingScan | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(PENDING_KEY);
  if (raw !== pendingRaw) {
    pendingRaw = raw;
    pendingValue = safeParse<PendingScan>(raw);
  }
  return pendingValue;
}

function subscribePending(callback: () => void): () => void {
  if (!isBrowser()) return () => {};
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/** Reactive, SSR-safe read of the pending scan (server snapshot is null). */
export function usePendingScan(): PendingScan | null {
  return useSyncExternalStore(subscribePending, pendingSnapshot, () => null);
}
