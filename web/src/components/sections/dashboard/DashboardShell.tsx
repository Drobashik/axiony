"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useWorkspace } from "@/lib/workspace";
import type { DashboardTab } from "@/lib/data/dashboard";
import { PreviewBanner } from "./PreviewBanner";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { DashboardWorkspaceContext } from "./dashboard-workspace-context";
import styles from "./DashboardShell.module.scss";

const VALID_TABS: DashboardTab[] = [
  "overview",
  "projects",
  "issues",
  "scan",
  "reports",
  "alerts",
  "team",
  "settings",
];

/** Derive the active tab from /dashboard/<tab> (root = overview). */
const tabFromPath = (pathname: string): DashboardTab => {
  const seg = pathname.split("/")[2] ?? "";
  return (VALID_TABS as string[]).includes(seg) ? (seg as DashboardTab) : "overview";
};

/**
 * Persistent dashboard chrome: sidebar + topbar (+ preview banner) around the
 * routed tab content. Stays mounted across tab navigations, and shares the
 * workspace + selected project with each page via context.
 */
export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const state = useWorkspace();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedPagePath, setSelectedPagePath] = useState<string | null>(null);
  const { ready, workspace } = state;
  const tab = tabFromPath(pathname);

  // First client tick before localStorage is read — keep it neutral so the
  // preview/workspace modes don't flash.
  if (!ready) return <div className={styles.page} aria-busy="true" />;

  // Ignore a stale selection (e.g. project removed) → treat as "all".
  const effectiveProjectId = workspace?.projects.some((p) => p.id === selectedProjectId)
    ? selectedProjectId
    : null;
  const selectedProject = workspace?.projects.find((p) => p.id === effectiveProjectId);
  const effectivePagePath =
    selectedProject && selectedProject.pages.some((page) => page.path === selectedPagePath)
      ? selectedPagePath
      : null;

  // Open-issue count for the sidebar badge, scoped to the selected project/page.
  const scopedProjects =
    workspace && effectiveProjectId
      ? workspace.projects.filter((p) => p.id === effectiveProjectId)
      : (workspace?.projects ?? []);
  const scopedPages = scopedProjects
    .flatMap((p) => p.pages)
    .filter((page) => !effectivePagePath || page.path === effectivePagePath);
  const openIssueCount = scopedPages.reduce((sum, page) => sum + page.open.length, 0);

  const go = (next: DashboardTab) => router.push(`/dashboard/${next}`);
  const handleSelectProject = (id: string | null) => {
    setSelectedProjectId(id);
    setSelectedPagePath(null);
  };
  const handleSignOut = () => {
    signOut();
    router.push("/");
  };

  return (
    <DashboardWorkspaceContext.Provider
      value={{
        ...state,
        selectedProjectId: effectiveProjectId,
        setSelectedProjectId: handleSelectProject,
        selectedPagePath: effectivePagePath,
        setSelectedPagePath,
      }}
    >
      <div className={styles.page}>
        {!workspace && <PreviewBanner />}

        <div className={styles.shell}>
          <Sidebar
            activeTab={tab}
            onTabChange={go}
            userName={workspace ? workspace.account.name || workspace.account.email : undefined}
            userInitials={workspace ? workspace.account.initials : undefined}
            userPlan={workspace ? "Free plan" : undefined}
            issuesBadge={workspace ? openIssueCount : undefined}
            inlineScan={workspace !== null}
            onSignOut={workspace ? handleSignOut : undefined}
            projects={workspace?.projects.map((p) => ({ id: p.id, host: p.host }))}
            pages={selectedProject?.pages.map((page) => ({
              path: page.path,
              openIssues: page.open.length,
            }))}
            selectedProjectId={effectiveProjectId}
            selectedPagePath={effectivePagePath}
            onSelectProject={handleSelectProject}
            onSelectPage={setSelectedPagePath}
          />

          <div className={styles.main}>
            <Topbar activeTab={tab} onNewScan={workspace ? () => go("scan") : undefined} />
            <div className={styles.content}>{children}</div>
          </div>
        </div>
      </div>
    </DashboardWorkspaceContext.Provider>
  );
}
