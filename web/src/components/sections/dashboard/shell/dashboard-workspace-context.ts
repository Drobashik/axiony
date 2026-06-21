"use client";

import { createContext, useContext } from "react";
import type { BillingPlan, BillingState } from "@/lib/billing";
import type { DashboardTab } from "@/lib/data/dashboard";
import type { WorkspaceState } from "@/lib/workspace";

export type NavigationGuard = () => boolean;

export interface DashboardContextValue extends WorkspaceState {
  /** The project the dashboard is scoped to, or null for "all projects". */
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  /** The page path inside the selected project, or null for "all pages". */
  selectedPagePath: string | null;
  setSelectedPagePath: (path: string | null) => void;
  billing: BillingState;
  openUpgrade: (plan?: Exclude<BillingPlan, "free">) => void;
  navigateTab: (tab: DashboardTab) => void;
  setNavigationGuard: (guard: NavigationGuard | null) => void;
  refreshWorkspace: () => Promise<void>;
}

const DEFAULT_BILLING: BillingState = {
  plan: "free",
  cycle: "monthly",
  status: "active",
  startedAt: "mock-free",
  renewalAt: null,
  usage: {
    periodStart: "2026-01-01T00:00:00.000Z",
    periodEnd: "2099-01-01T00:00:00.000Z",
    scansUsed: 0,
    scannedDomains: [],
  },
};

/**
 * Shares the workspace + selected project read by the (persistent) dashboard
 * shell with each routed tab page, so navigating between /dashboard/* routes
 * doesn't refetch reports or flash between preview/workspace modes.
 */
export const DashboardWorkspaceContext = createContext<DashboardContextValue>({
  ready: false,
  workspace: null,
  selectedProjectId: null,
  setSelectedProjectId: () => {},
  selectedPagePath: null,
  setSelectedPagePath: () => {},
  billing: DEFAULT_BILLING,
  openUpgrade: () => {},
  navigateTab: () => {},
  setNavigationGuard: () => {},
  refreshWorkspace: async () => {},
});

export const useDashboardWorkspace = (): DashboardContextValue =>
  useContext(DashboardWorkspaceContext);
