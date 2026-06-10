"use client";

import { useSyncExternalStore } from "react";

// Mock anonymous scan metering. When this moves server-side, keep the
// component-facing functions and replace the storage reads/writes with API calls.
const GUEST_SCAN_KEY = "axiony.guest_scans.mock";
const CHANGE_EVENT = "axiony:guest-scans-change";
export const GUEST_SCAN_LIMIT = 1;

interface GuestScanUsage {
  scansUsed: number;
  lastScannedUrl?: string;
  lastScannedAt?: string;
}

const emptyUsage = (): GuestScanUsage => ({ scansUsed: 0 });
const isBrowser = (): boolean => typeof window !== "undefined";

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function normalizeUsage(usage: Partial<GuestScanUsage> | null): GuestScanUsage {
  if (!usage) return emptyUsage();

  return {
    scansUsed: Math.max(0, Math.floor(Number(usage.scansUsed) || 0)),
    lastScannedUrl: usage.lastScannedUrl,
    lastScannedAt: usage.lastScannedAt,
  };
}

function notify() {
  if (isBrowser()) window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function readGuestScanUsage(): GuestScanUsage {
  if (!isBrowser()) return emptyUsage();
  const raw = localStorage.getItem(GUEST_SCAN_KEY);
  const usage = normalizeUsage(safeParse<GuestScanUsage>(raw));
  const normalizedRaw = JSON.stringify(usage);
  if (raw !== normalizedRaw) {
    try {
      localStorage.setItem(GUEST_SCAN_KEY, normalizedRaw);
    } catch {
      /* local mock metering is non-critical */
    }
  }
  return usage;
}

function writeGuestScanUsage(usage: GuestScanUsage): GuestScanUsage {
  const next = normalizeUsage(usage);
  if (isBrowser()) {
    try {
      localStorage.setItem(GUEST_SCAN_KEY, JSON.stringify(next));
    } catch {
      /* local mock metering is non-critical */
    }
  }
  notify();
  return next;
}

export function remainingGuestScans(usage = readGuestScanUsage()): number {
  return Math.max(0, GUEST_SCAN_LIMIT - usage.scansUsed);
}

export function canUseGuestScan(usage = readGuestScanUsage()): boolean {
  return remainingGuestScans(usage) > 0;
}

export function recordGuestScan(url: string): GuestScanUsage {
  const current = readGuestScanUsage();
  return writeGuestScanUsage({
    scansUsed: current.scansUsed + 1,
    lastScannedUrl: url,
    lastScannedAt: new Date().toISOString(),
  });
}

const serverSnapshot = emptyUsage();
let guestRaw: string | null | undefined = undefined;
let guestValue: GuestScanUsage = serverSnapshot;

function guestSnapshot(): GuestScanUsage {
  if (!isBrowser()) return serverSnapshot;
  const raw = localStorage.getItem(GUEST_SCAN_KEY);
  if (raw !== guestRaw) {
    guestValue = normalizeUsage(safeParse<GuestScanUsage>(raw));
    const normalizedRaw = JSON.stringify(guestValue);
    if (raw !== normalizedRaw) {
      try {
        localStorage.setItem(GUEST_SCAN_KEY, normalizedRaw);
      } catch {
        /* local mock metering is non-critical */
      }
    }
    guestRaw = normalizedRaw;
  }
  return guestValue;
}

function subscribeGuestUsage(callback: () => void): () => void {
  if (!isBrowser()) return () => {};
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useGuestScanUsage() {
  const usage = useSyncExternalStore(subscribeGuestUsage, guestSnapshot, () => serverSnapshot);
  return {
    ready: true,
    usage,
    limit: GUEST_SCAN_LIMIT,
    remaining: remainingGuestScans(usage),
  };
}
