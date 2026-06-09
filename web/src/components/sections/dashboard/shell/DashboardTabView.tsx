"use client";

import type { DashboardTab } from "@/lib/data/dashboard";
import { IssuesTab } from "../preview/IssuesTab";
import { OverviewTab } from "../preview/OverviewTab";
import { ProjectsTab } from "../preview/ProjectsTab";
import { ComingSoon } from "../shared/ComingSoon";
import { WorkspaceContent } from "../workspace";
import { useDashboardWorkspace } from "./dashboard-workspace-context";

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
  return <ComingSoon title={tab} />;
}
