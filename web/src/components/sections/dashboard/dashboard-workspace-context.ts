"use client";

import { createContext, useContext } from "react";
import type { WorkspaceState } from "@/lib/workspace";

export interface DashboardContextValue extends WorkspaceState {
  /** The project the dashboard is scoped to, or null for "all projects". */
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  /** The page path inside the selected project, or null for "all pages". */
  selectedPagePath: string | null;
  setSelectedPagePath: (path: string | null) => void;
}

/**
 * Shares the workspace + selected project read by the (persistent) dashboard
 * shell with each routed tab page, so navigating between /dashboard/* routes
 * doesn't re-read localStorage or flash between preview/workspace modes.
 */
export const DashboardWorkspaceContext = createContext<DashboardContextValue>({
  ready: false,
  workspace: null,
  selectedProjectId: null,
  setSelectedProjectId: () => {},
  selectedPagePath: null,
  setSelectedPagePath: () => {},
});

export const useDashboardWorkspace = (): DashboardContextValue =>
  useContext(DashboardWorkspaceContext);
