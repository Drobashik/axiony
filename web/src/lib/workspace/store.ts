"use client";

import { useSyncExternalStore } from "react";
import type { Severity } from "@/types";
import {
  countsFromIssues,
  hostFromUrl,
  initialsFromName,
  issuePersistenceKey,
  pathFromUrl,
  scoreFromIssues,
} from "./derive";
import type {
  IssueStatus,
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
      issueKey?: string;
      createdAt?: string;
    }>;
  };
}

interface PersistedIssueStateRow {
  host?: string;
  path?: string;
  issueKey?: string;
  status?: unknown;
  createdAt?: string | Date;
  updatedAt?: string | Date;
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
  const issueKey = normalizeKeyPart(issue.issueKey);
  const templateId = normalizeKeyPart(issue.templateId);
  const rule = normalizeKeyPart(issue.rule);
  const title = normalizeKeyPart(issue.title);
  const firstNode = normalizeKeyPart(issue.nodes?.[0]);
  const id = normalizeKeyPart(issue.id);

  if (issueKey) keys.push(`issue-key:${issueKey}`);
  if (rule && firstNode) keys.push(`rule-node:${rule}|${firstNode}`);
  if (id && firstNode) keys.push(`id-node:${id}|${firstNode}`);
  if (rule && title) keys.push(`rule-title:${rule}|${title}`);
  if (templateId && firstNode) keys.push(`template-node:${templateId}|${firstNode}`);
  if (templateId) keys.push(`template:${templateId}`);
  if (id) keys.push(`id:${id}`);
  if (rule) keys.push(`rule:${rule}`);

  return keys;
};

interface MatchableIssue {
  issue: TrackedIssue;
  matched: boolean;
}

const createIssueMatcher = (issues: TrackedIssue[]) => {
  const matchable = issues.map<MatchableIssue>((issue) => ({ issue, matched: false }));
  const byKey = new Map<string, MatchableIssue[]>();

  for (const entry of matchable) {
    for (const key of issueIdentityKeys(entry.issue)) {
      const bucket = byKey.get(key);
      if (bucket) bucket.push(entry);
      else byKey.set(key, [entry]);
    }
  }

  const consume = (issue: TrackedIssue): TrackedIssue | null => {
    for (const key of issueIdentityKeys(issue)) {
      const match = byKey.get(key)?.find((entry) => !entry.matched);
      if (match) {
        match.matched = true;
        return match.issue;
      }
    }
    return null;
  };

  return {
    consume,
    unmatched: () => matchable.filter((entry) => !entry.matched).map((entry) => entry.issue),
  };
};

const mergeIssueTriage = (nextIssues: TrackedIssue[], previousIssues: TrackedIssue[]) => {
  const matcher = createIssueMatcher(previousIssues);
  const issues = nextIssues.map((issue) => {
    const previous = matcher.consume(issue);
    return previous
      ? {
          ...issue,
          id: previous.id,
          issueKey: previous.issueKey ?? issue.issueKey,
          status: previous.status,
          createdAt: previous.createdAt ?? issue.createdAt,
        }
      : issue;
  });

  return { issues, resolvedIssues: matcher.unmatched() };
};

const regressionTitles = (nextIssues: TrackedIssue[], baselineIssues: TrackedIssue[]): string[] => {
  const matcher = createIssueMatcher(baselineIssues);
  return nextIssues.filter((issue) => !matcher.consume(issue)).map((issue) => issue.title);
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
    resolvedIssues: [],
    regressions: [],
    scannedAt: pending.scannedAt,
  };
}

function pageFromPending(pending: PendingScan): ProjectPage {
  const issues = pending.issues.map((issue) => withIssueTracking(issue, pending.scannedAt));

  return {
    id: randomId(),
    path: pending.path,
    url: pending.url,
    level: pending.level,
    baseline: {
      score: pending.score,
      counts: pending.counts,
      total: pending.total,
      issues,
      createdAt: pending.scannedAt,
    },
    open: [...issues],
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
  const previousIssues = page.open;
  const trackedIssues = pending.issues.map((issue) => withIssueTracking(issue, pending.scannedAt));
  const { issues: nextIssues, resolvedIssues } = mergeIssueTriage(trackedIssues, previousIssues);
  const resolvedNow = resolvedIssues.map((issue) => ({ ...issue, status: "resolved" as const }));

  page.open = nextIssues;
  page.scans.push({
    id: randomId(),
    score: pending.score,
    counts: pending.counts,
    total: pending.total,
    resolved: resolvedNow.length,
    resolvedIssues: resolvedNow,
    regressions: regressionTitles(pending.issues, page.baseline.issues),
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

const isIssueStatus = (value: unknown): value is IssueStatus =>
  value === "open" || value === "in-progress" || value === "resolved" || value === "ignored";

const isoFromDateLike = (value: string | Date | undefined): string | undefined => {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : undefined;
};

const withIssueTracking = (issue: TrackedIssue, createdAt: string): TrackedIssue => {
  const tracked = {
    ...issue,
    createdAt: issue.createdAt ?? createdAt,
  };

  return {
    ...tracked,
    issueKey: tracked.issueKey ?? issuePersistenceKey(tracked),
  };
};

const issueStateMapKey = (host: string, path: string, issueKey: string): string =>
  `${host}::${path}::${issueKey}`;

const trackedIssueFromReport = (
  issue: NonNullable<NonNullable<PersistedScanReportRow["report"]>["issues"]>[number],
  index: number,
  createdAt: string,
): TrackedIssue => {
  const nodes = Array.isArray(issue.nodes) ? issue.nodes : [];
  const rule = issue.rule || "unknown-rule";

  const tracked: TrackedIssue = {
    issueKey: typeof issue.issueKey === "string" ? issue.issueKey : undefined,
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
    createdAt: isoFromDateLike(issue.createdAt) ?? createdAt,
  };

  return withIssueTracking(tracked, createdAt);
};

const pendingFromPersistedReport = (row: PersistedScanReportRow): PendingScan | null => {
  const report = row.report;
  const url = report?.url || row.url;
  const level = report?.level || row.level;
  const scannedAt = report?.scannedAt || row.scannedAt;

  if (!url || !isWcagLevel(level) || !scannedAt || !Number.isFinite(Date.parse(scannedAt))) {
    return null;
  }

  const createdAt = new Date(scannedAt).toISOString();
  const issues = Array.isArray(report?.issues)
    ? report.issues.map((issue, index) => trackedIssueFromReport(issue, index, createdAt))
    : [];

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

const issueStateLookup = (rows: PersistedIssueStateRow[]): Map<string, PersistedIssueStateRow> => {
  const map = new Map<string, PersistedIssueStateRow>();

  for (const row of rows) {
    if (
      typeof row.host === "string" &&
      typeof row.path === "string" &&
      typeof row.issueKey === "string" &&
      isIssueStatus(row.status)
    ) {
      map.set(issueStateMapKey(row.host, row.path, row.issueKey), row);
    }
  }

  return map;
};

const applyIssueState = (
  host: string,
  path: string,
  issue: TrackedIssue,
  states: Map<string, PersistedIssueStateRow>,
  options: { keepResolved?: boolean } = {},
): TrackedIssue => {
  const tracked = withIssueTracking(issue, issue.createdAt ?? now());
  const state = states.get(
    issueStateMapKey(host, path, tracked.issueKey ?? issuePersistenceKey(tracked)),
  );

  if (!state) return tracked;

  const createdAt = isoFromDateLike(state.createdAt) ?? tracked.createdAt;
  return {
    ...tracked,
    status: options.keepResolved
      ? "resolved"
      : isIssueStatus(state.status)
        ? state.status
        : tracked.status,
    createdAt,
  };
};

const applyIssueStates = (ws: Workspace, rows: PersistedIssueStateRow[]): void => {
  const states = issueStateLookup(rows);
  if (states.size === 0) return;

  for (const project of ws.projects) {
    for (const page of project.pages) {
      page.baseline.issues = page.baseline.issues.map((issue) =>
        applyIssueState(project.host, page.path, issue, states),
      );
      page.open = page.open.map((issue) => applyIssueState(project.host, page.path, issue, states));
      page.scans = page.scans.map((scan) => ({
        ...scan,
        resolvedIssues: scan.resolvedIssues?.map((issue) =>
          applyIssueState(project.host, page.path, issue, states, { keepResolved: true }),
        ),
      }));
    }
  }
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
  let issueStates: PersistedIssueStateRow[];
  try {
    const response = await fetch("/api/scans/reports", { cache: "no-store" });
    if (!response.ok) return createWorkspace(account, null);
    const body = (await response.json()) as {
      reports?: PersistedScanReportRow[];
      issueStates?: PersistedIssueStateRow[];
    };
    rows = Array.isArray(body.reports) ? body.reports : [];
    issueStates = Array.isArray(body.issueStates) ? body.issueStates : [];
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

  applyIssueStates(ws, issueStates);
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
