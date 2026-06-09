"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { Severity } from "@/types";
import { countsFromIssues, initialsFromName, scoreFromIssues } from "./derive";
import type {
  IssueStatus,
  OnboardingStepId,
  PendingScan,
  Project,
  ProjectPage,
  ScanRecord,
  TrackedIssue,
  Workspace,
  WorkspaceAccount,
} from "./types";

// =====================================================================
// Mock persistence for the multi-project workspace.
// ---------------------------------------------------------------------
// Everything lives in localStorage. To go real, replace the read/write
// helpers — the component-facing functions (`completeAuth`, `saveScan`,
// `runFollowupScan`, `useWorkspace`…) keep the same signatures.
// =====================================================================

const PENDING_KEY = "axiony.pending_scan";
const WORKSPACE_KEY = "axiony.workspace";
const AUTH_KEY = "axiony.auth.mock";
const CHANGE_EVENT = "axiony:workspace-change";
const VERSION = 3;

const isBrowser = (): boolean => typeof window !== "undefined";
const now = (): string => new Date().toISOString();
const randomId = (): string => Math.random().toString(36).slice(2, 9);

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
    /* storage may be unavailable — non-fatal for the mock */
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

// ── Workspace read / write ───────────────────────────────────────────
export function readWorkspace(): Workspace | null {
  if (!isBrowser()) return null;
  const ws = safeParse<Workspace>(localStorage.getItem(WORKSPACE_KEY));
  return ws && ws.version === VERSION ? ws : null;
}

function writeWorkspace(ws: Workspace): Workspace {
  if (isBrowser()) {
    try {
      localStorage.setItem(WORKSPACE_KEY, JSON.stringify(ws));
    } catch {
      /* ignore */
    }
  }
  notify();
  return ws;
}

export function hasWorkspace(): boolean {
  return readWorkspace() !== null;
}

export function signOut(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(WORKSPACE_KEY);
  localStorage.removeItem(PENDING_KEY);
  try {
    sessionStorage.removeItem(AUTH_KEY);
  } catch {
    /* ignore */
  }
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
    scannedAt: now(),
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
      createdAt: now(),
    },
    open: [...pending.issues],
    scans: [baselineScanRecord(pending)],
  };
}

function projectFromPending(pending: PendingScan): Project {
  return {
    id: randomId(),
    host: pending.host,
    createdAt: now(),
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
    scannedAt: now(),
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

// ── Component-facing actions ─────────────────────────────────────────
export interface AuthIdentity {
  name: string;
  email: string;
}

/** Login/signup success — ensure a workspace exists and fold in any scan. */
export function completeAuth(identity: AuthIdentity): Workspace {
  const account: WorkspaceAccount = {
    name: identity.name.trim(),
    email: identity.email.trim(),
    initials: initialsFromName(identity.name || identity.email),
    createdAt: now(),
  };

  const pending = readPendingScan();
  const existing = readWorkspace();

  if (!existing) {
    const ws = createWorkspace(account, pending);
    clearPendingScan();
    return writeWorkspace(ws);
  }

  existing.account = { ...existing.account, ...account, createdAt: existing.account.createdAt };
  if (pending) {
    applyScan(existing, pending);
    clearPendingScan();
  }
  return writeWorkspace(existing);
}

/** Save a scan straight into the existing workspace (logged-in flow). */
export function saveScan(pending: PendingScan): Workspace | null {
  const ws = readWorkspace();
  if (!ws) return null;
  applyScan(ws, pending);
  return writeWorkspace(ws);
}

// Plausible new issues a follow-up scan might surface (regressions).
const REGRESSION_POOL: Omit<TrackedIssue, "id" | "count" | "status">[] = [
  {
    title: "New image missing alt text",
    severity: "serious",
    rule: "wcag-1.1.1",
    templateId: "image-alt",
  },
  {
    title: "Icon button lost its accessible name",
    severity: "critical",
    rule: "wcag-4.1.2",
    templateId: "empty-button",
  },
  {
    title: "Contrast regressed on primary CTA",
    severity: "serious",
    rule: "wcag-1.4.3",
    templateId: "color-contrast",
  },
  {
    title: "New form field without a label",
    severity: "critical",
    rule: "wcag-1.3.1",
    templateId: "label-missing",
  },
  {
    title: "Focus outline removed on links",
    severity: "serious",
    rule: "wcag-2.4.11",
    templateId: "focus-visible",
  },
];

const SEVERITY_EASE: Record<Severity, number> = { minor: 0, moderate: 1, serious: 2, critical: 3 };

/**
 * Simulate a scheduled re-scan of one page: resolve a couple of easy wins
 * and, sometimes, surface a regression — so progress and regression
 * protection are visible on the user's own data (real scans are
 * deterministic per URL, so this is how the demo shows movement).
 */
export function runFollowupScan(host: string, path: string): Workspace | null {
  const ws = readWorkspace();
  const page = ws?.projects.find((p) => p.host === host)?.pages.find((pg) => pg.path === path);
  if (!ws || !page) return ws ?? null;

  const open = [...page.open].sort((a, b) => SEVERITY_EASE[a.severity] - SEVERITY_EASE[b.severity]);
  // 0–2 easy wins resolved; combined with the regression chance below a
  // re-scan can move the score up, down, or not at all.
  const resolveCount = Math.min(open.length, Math.floor(Math.random() * 3));
  const resolved = open.splice(0, resolveCount);

  const regressions: string[] = [];
  if (Math.random() < 0.5) {
    const candidate = REGRESSION_POOL.find((r) => !open.some((i) => i.title === r.title));
    if (candidate) {
      open.push({ ...candidate, id: `reg-${randomId()}`, count: 1, status: "open" });
      regressions.push(candidate.title);
    }
  }

  const counts = countsFromIssues(open);
  page.open = open.map((i) => ({ ...i }));
  page.scans.push({
    id: randomId(),
    score: scoreFromIssues(open),
    counts,
    total: open.length,
    resolved: resolved.length,
    regressions,
    scannedAt: now(),
  });

  return writeWorkspace(ws);
}

export function setIssueStatus(
  host: string,
  path: string,
  issueId: string,
  status: IssueStatus,
): void {
  const ws = readWorkspace();
  const page = ws?.projects.find((p) => p.host === host)?.pages.find((pg) => pg.path === path);
  const issue = page?.open.find((i) => i.id === issueId);
  if (!ws || !issue) return;
  issue.status = status;
  writeWorkspace(ws);
}

export function markCreatedSeen(): void {
  const ws = readWorkspace();
  if (!ws || !ws.onboarding.justCreated) return;
  ws.onboarding.justCreated = null;
  writeWorkspace(ws);
}

export function setOnboardingStep(step: OnboardingStepId, value: boolean): void {
  const ws = readWorkspace();
  if (!ws) return;
  ws.onboarding.steps[step] = value;
  writeWorkspace(ws);
}

// ── React binding ────────────────────────────────────────────────────
export interface WorkspaceState {
  ready: boolean;
  workspace: Workspace | null;
}

/** Subscribe to the workspace; re-reads on any local mutation or cross-tab change. */
export function useWorkspace(): WorkspaceState {
  const [state, setState] = useState<WorkspaceState>({ ready: false, workspace: null });

  useEffect(() => {
    const read = () => setState({ ready: true, workspace: readWorkspace() });
    read();
    window.addEventListener(CHANGE_EVENT, read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(CHANGE_EVENT, read);
      window.removeEventListener("storage", read);
    };
  }, []);

  return state;
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
