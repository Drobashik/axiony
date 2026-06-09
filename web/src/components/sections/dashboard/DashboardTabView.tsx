"use client";

import type { DashboardTab } from "@/lib/data/dashboard";
import { ComingSoon } from "./ComingSoon";
import { IssuesTab } from "./IssuesTab";
import { OverviewTab } from "./OverviewTab";
import { ProjectsTab } from "./ProjectsTab";
import { WorkspaceContent } from "./workspace";
import { useDashboardWorkspace } from "./dashboard-workspace-context";

const PLACEHOLDER_ICON = (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M4 9h16M9 4v16" />
  </svg>
);

/**
 * Renders one dashboard tab. A saved workspace gets the personalized view;
 * otherwise the public, sample-data preview. The shell supplies the
 * workspace via context, so this stays in sync without re-reading storage.
 */
export function DashboardTabView({ tab }: { tab: DashboardTab }) {
  const {
    workspace,
    selectedProjectId,
    setSelectedProjectId,
    selectedPagePath,
    setSelectedPagePath,
    billing,
    openUpgrade,
    navigateTab,
    setNavigationGuard,
  } = useDashboardWorkspace();

  if (workspace) {
    return (
      <WorkspaceContent
        workspace={workspace}
        selectedProjectId={selectedProjectId}
        selectedPagePath={selectedPagePath}
        tab={tab}
        onTab={navigateTab}
        onSelectProject={setSelectedProjectId}
        onSelectPage={setSelectedPagePath}
        billing={billing}
        onUpgrade={openUpgrade}
        setNavigationGuard={setNavigationGuard}
      />
    );
  }

  // Public preview (sample data).
  if (tab === "overview") return <OverviewTab />;
  if (tab === "projects") return <ProjectsTab />;
  if (tab === "issues") return <IssuesTab />;
  return <ComingSoon title={tab} icon={PLACEHOLDER_ICON} />;
}
