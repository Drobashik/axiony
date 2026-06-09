"use client";

import { Button, Icon } from "@/components/ui";
import type { DashboardTab } from "@/lib/data/dashboard";
import type { Workspace } from "@/lib/workspace";
import { ComingSoon } from "../ComingSoon";
import { WorkspaceOverview } from "./WorkspaceOverview";
import { WorkspaceProjects } from "./WorkspaceProjects";
import { WorkspaceIssues } from "./WorkspaceIssues";
import { WorkspaceScan } from "./WorkspaceScan";
import styles from "./Workspace.module.scss";

const COMING_SOON: DashboardTab[] = ["reports", "alerts", "team", "settings"];

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

// Per-tab "scan first" empty states for a brand-new workspace.
const EMPTY_COPY: Partial<Record<DashboardTab, { title: string; text: string }>> = {
  overview: {
    title: "Run your first scan",
    text: "Scan a site to create your baseline — your score, tracked debt, and trend all show up here.",
  },
  projects: {
    title: "No projects yet",
    text: "Run a scan to start tracking your first site as a project.",
  },
  issues: {
    title: "No issues tracked yet",
    text: "Run a scan to capture your accessibility issues as tracked debt.",
  },
};

const ScanEmpty = ({ tab, onScan }: { tab: DashboardTab; onScan: () => void }) => {
  const copy = EMPTY_COPY[tab] ?? EMPTY_COPY.overview;
  return (
    <div className={styles.activation}>
      <span className={styles.activationIcon} aria-hidden="true">
        <Icon name="scan" size={26} />
      </span>
      <h2 className={styles.activationTitle}>{copy?.title}</h2>
      <p className={styles.activationText}>{copy?.text}</p>
      <Button size="lg" onClick={onScan}>
        <Icon name="scan" size={16} />
        Run a scan
      </Button>
    </div>
  );
};

interface WorkspaceContentProps {
  workspace: Workspace;
  selectedProjectId: string | null;
  selectedPagePath: string | null;
  tab: DashboardTab;
  onTab: (tab: DashboardTab) => void;
  onSelectProject: (id: string | null) => void;
  onSelectPage: (path: string | null) => void;
}

export const WorkspaceContent = ({
  workspace,
  selectedProjectId,
  selectedPagePath,
  tab,
  onTab,
  onSelectProject,
  onSelectPage,
}: WorkspaceContentProps) => {
  // The scanner sees the full workspace (scanning isn't scoped).
  if (tab === "scan") {
    return <WorkspaceScan workspace={workspace} onTab={onTab} />;
  }

  // No projects yet → data tabs show a "scan first" empty state with a link
  // to the scanner; the coming-soon tabs keep their own placeholder.
  if (workspace.projects.length === 0) {
    if (COMING_SOON.includes(tab)) return <ComingSoon title={tab} icon={PLACEHOLDER_ICON} />;
    return <ScanEmpty tab={tab} onScan={() => onTab("scan")} />;
  }

  // Overview + Issues respect the project/page switchers; Projects always lists all.
  const scopedProjects = selectedProjectId
    ? workspace.projects
        .filter((p) => p.id === selectedProjectId)
        .map((project) =>
          selectedPagePath
            ? { ...project, pages: project.pages.filter((page) => page.path === selectedPagePath) }
            : project,
        )
        .filter((project) => project.pages.length > 0)
    : workspace.projects;
  const scoped = selectedProjectId ? { ...workspace, projects: scopedProjects } : workspace;

  if (tab === "overview") return <WorkspaceOverview workspace={scoped} onTab={onTab} />;
  if (tab === "projects")
    return (
      <WorkspaceProjects
        workspace={workspace}
        onTab={onTab}
        onSelectProject={onSelectProject}
        onSelectPage={onSelectPage}
      />
    );
  if (tab === "issues") return <WorkspaceIssues workspace={scoped} />;
  if (COMING_SOON.includes(tab)) return <ComingSoon title={tab} icon={PLACEHOLDER_ICON} />;

  return <WorkspaceOverview workspace={scoped} onTab={onTab} />;
};
