"use client";

import { useSyncExternalStore } from "react";
import type { BillingCycle, BillingPlan, BillingState, BillingUsage } from "./types";

const BILLING_KEY = "axiony.billing.mock";
const CHANGE_EVENT = "axiony:billing-change";

const isBrowser = (): boolean => typeof window !== "undefined";
const now = (): string => new Date().toISOString();
const randomId = (): string => Math.random().toString(36).slice(2, 10);

const addMonths = (date: Date, months: number): Date => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

const usagePeriod = (from = new Date()): Pick<BillingUsage, "periodStart" | "periodEnd"> => ({
  periodStart: from.toISOString(),
  periodEnd: addMonths(from, 1).toISOString(),
});

const emptyUsage = (): BillingUsage => ({
  ...usagePeriod(),
  scansUsed: 0,
  scannedDomains: [],
});

const renewalDate = (cycle: BillingCycle): string => {
  const date = new Date();
  date.setMonth(date.getMonth() + (cycle === "annual" ? 12 : 1));
  return date.toISOString();
};

const freeState = (): BillingState => ({
  plan: "free",
  cycle: "monthly",
  status: "active",
  startedAt: "mock-free",
  renewalAt: null,
  usage: emptyUsage(),
});

const normalizeDomain = (host: string): string =>
  host
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0] ?? "";

const usageExpired = (usage: BillingUsage): boolean => {
  const end = new Date(usage.periodEnd).getTime();
  return Number.isNaN(end) || end <= Date.now();
};

const normalizeUsage = (usage?: Partial<BillingUsage>): BillingUsage => {
  if (!usage?.periodStart || !usage.periodEnd || usageExpired(usage as BillingUsage)) {
    return emptyUsage();
  }

  return {
    periodStart: usage.periodStart,
    periodEnd: usage.periodEnd,
    scansUsed: Math.max(0, Math.floor(Number(usage.scansUsed) || 0)),
    scannedDomains: Array.from(
      new Set((usage.scannedDomains ?? []).map(normalizeDomain).filter(Boolean)),
    ),
  };
};

const normalizeBilling = (state: Partial<BillingState> | null): BillingState => {
  const fallback = freeState();
  if (!state) return fallback;

  return {
    plan: state.plan ?? fallback.plan,
    cycle: state.cycle ?? fallback.cycle,
    status: state.status ?? fallback.status,
    startedAt: state.startedAt ?? fallback.startedAt,
    renewalAt: state.renewalAt ?? fallback.renewalAt,
    checkoutId: state.checkoutId,
    usage: normalizeUsage(state.usage),
  };
};

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

export function readBilling(): BillingState {
  if (!isBrowser()) return freeState();
  const raw = localStorage.getItem(BILLING_KEY);
  const billing = normalizeBilling(safeParse<BillingState>(raw));
  const normalizedRaw = JSON.stringify(billing);
  if (raw !== normalizedRaw) {
    try {
      localStorage.setItem(BILLING_KEY, normalizedRaw);
    } catch {
      /* local mock billing is non-critical */
    }
  }
  return billing;
}

function writeBilling(state: BillingState): BillingState {
  const billing = normalizeBilling(state);
  if (isBrowser()) {
    try {
      localStorage.setItem(BILLING_KEY, JSON.stringify(billing));
    } catch {
      /* local mock billing is non-critical */
    }
  }
  notify();
  return billing;
}

export function upgradePlan(plan: Exclude<BillingPlan, "free">, cycle: BillingCycle): BillingState {
  const current = readBilling();
  return writeBilling({
    ...current,
    plan,
    cycle,
    status: "active",
    startedAt: now(),
    renewalAt: renewalDate(cycle),
    checkoutId: `mock_${randomId()}`,
  });
}

export function resetBilling(): BillingState {
  if (isBrowser()) localStorage.removeItem(BILLING_KEY);
  notify();
  return freeState();
}

export function recordScanUsage(host: string): BillingState {
  const current = readBilling();
  const domain = normalizeDomain(host);
  const scannedDomains = domain
    ? Array.from(new Set([...current.usage.scannedDomains, domain]))
    : current.usage.scannedDomains;

  return writeBilling({
    ...current,
    usage: {
      ...current.usage,
      scansUsed: current.usage.scansUsed + 1,
      scannedDomains,
    },
  });
}

// A single, stable reference React can reuse for the server render and the
// first client paint — returning a fresh object each call makes
// useSyncExternalStore think the store keeps changing (infinite-loop warning).
const serverBillingSnapshot = freeState();

// getServerSnapshot must return the *same* reference every call.
function getServerBillingSnapshot(): BillingState {
  return serverBillingSnapshot;
}

let billingRaw: string | null | undefined = undefined;
let billingValue: BillingState = serverBillingSnapshot;

function billingSnapshot(): BillingState {
  if (!isBrowser()) return serverBillingSnapshot;
  const raw = localStorage.getItem(BILLING_KEY);
  if (raw !== billingRaw) {
    billingValue = normalizeBilling(safeParse<BillingState>(raw));
    const normalizedRaw = JSON.stringify(billingValue);
    if (raw !== normalizedRaw) {
      try {
        localStorage.setItem(BILLING_KEY, normalizedRaw);
      } catch {
        /* local mock billing is non-critical */
      }
    }
    billingRaw = normalizedRaw;
  }
  return billingValue;
}

function subscribeBilling(callback: () => void): () => void {
  if (!isBrowser()) return () => {};
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export interface BillingHookState {
  ready: boolean;
  billing: BillingState;
}

export function useBilling(): BillingHookState {
  const billing = useSyncExternalStore(subscribeBilling, billingSnapshot, getServerBillingSnapshot);

  return { ready: true, billing };
}
