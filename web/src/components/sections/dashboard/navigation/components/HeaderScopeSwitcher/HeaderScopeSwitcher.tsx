"use client";

import { Select } from "@/components/ui";
import type { SelectOption } from "@/components/ui";
import type { DashboardTab } from "@/lib/data/dashboard";
import { projectModel } from "@/lib/workspace";
import type { Project, ProjectPage, Workspace } from "@/lib/workspace";
import { ProjectIcon } from "../../../shared/ProjectIcon";
import styles from "./HeaderScopeSwitcher.module.scss";

const ALL_PROJECTS = "__all_projects__";
const ALL_PAGES = "__all_pages__";

const TAB_LABELS: Record<DashboardTab, string> = {
  overview: "Overview",
  projects: "Projects",
  issues: "Issues",
  scan: "Scanner",
  reports: "Reports",
  alerts: "Alerts",
  team: "Team",
  settings: "Settings",
};

const plural = (value: number, word: string): string => `${value} ${word}${value === 1 ? "" : "s"}`;

const openIssueCount = (page: ProjectPage): number =>
  page.open.filter((issue) => issue.status !== "resolved" && issue.status !== "ignored").length;

const PortfolioIcon = ({ compact = false }: { compact?: boolean }) => (
  <span className={styles.portfolioIcon} data-compact={compact || undefined} aria-hidden="true">
    <span />
    <span />
    <span />
    <span />
  </span>
);

interface HeaderScopeSwitcherProps {
  workspace?: Workspace | null;
  selectedProject?: Project;
  selectedPage?: ProjectPage;
  activeTab: DashboardTab;
  onSelectProject?: (projectId: string | null) => void;
  onSelectPage?: (pagePath: string | null) => void;
}

export const HeaderScopeSwitcher = ({
  workspace,
  selectedProject,
  selectedPage,
  activeTab,
  onSelectProject,
  onSelectPage,
}: HeaderScopeSwitcherProps) => {
  const projects = workspace?.projects ?? [];
  const projectCount = projects.length;
  const pageCount = projects.reduce((sum, project) => sum + project.pages.length, 0);

  const canSwitchProjects = projectCount > 1 && Boolean(onSelectProject);
  const canSwitchPages = Boolean(
    selectedProject && selectedProject.pages.length > 1 && onSelectPage,
  );

  let scopeTitle = "Dashboard preview";

  if (workspace) {
    scopeTitle = projectCount > 0 ? "All projects" : "Your workspace";
  }

  if (selectedProject) {
    scopeTitle = selectedProject.host;
  }

  let scopeMeta = TAB_LABELS[activeTab];

  if (workspace && projectCount > 0) {
    scopeMeta = `${plural(projectCount, "project")} · ${plural(pageCount, "page")}`;
  }

  if (selectedProject) {
    scopeMeta = `${plural(selectedProject.pages.length, "page")} · ${TAB_LABELS[activeTab]}`;
  }

  if (selectedPage) {
    scopeMeta = `${selectedPage.path} · ${TAB_LABELS[activeTab]}`;
  }

  const projectOptions: SelectOption[] = [
    {
      value: ALL_PROJECTS,
      label: "All projects",
      hint: `${plural(projectCount, "project")} · ${plural(pageCount, "page")}`,
      icon: <PortfolioIcon compact />,
    },
    ...projects.map((project) => {
      const model = projectModel(project);

      return {
        value: project.id,
        label: project.host,
        hint: `${model.avgScore} score · ${model.openIssues} open`,
        icon: (
          <ProjectIcon
            host={project.host}
            url={project.pages[0]?.url}
            iconUrl={project.iconUrl}
            size={27}
          />
        ),
      };
    }),
  ];

  const pageOptions: SelectOption[] = selectedProject
    ? [
        { value: ALL_PAGES, label: "All pages" },
        ...selectedProject.pages.map((page) => ({
          value: page.path,
          label: page.path,
          hint: `${openIssueCount(page)} open`,
        })),
      ]
    : [];

  const pageScopeControl =
    canSwitchPages && selectedProject ? (
      <>
        <Select
          floating
          menuMinWidth={250}
          className={styles.pageSelect}
          ariaLabel="Select page scope"
          value={selectedPage?.path ?? ALL_PAGES}
          options={pageOptions}
          onChange={(value) => onSelectPage?.(value === ALL_PAGES ? null : value)}
        />
        <span aria-hidden="true">·</span>
        <span>{TAB_LABELS[activeTab]}</span>
      </>
    ) : (
      <span>{scopeMeta}</span>
    );

  return (
    <div className={styles.context}>
      {canSwitchProjects ? (
        <div className={styles.switcherBody}>
          <Select
            floating
            menuMinWidth={320}
            className={styles.projectSelect}
            ariaLabel="Select project scope"
            value={selectedProject?.id ?? ALL_PROJECTS}
            options={projectOptions}
            onChange={(value) => onSelectProject?.(value === ALL_PROJECTS ? null : value)}
          />

          <div className={styles.scopeMeta}>{pageScopeControl}</div>
        </div>
      ) : (
        <>
          <span className={styles.contextIcon}>
            {selectedProject ? (
              <ProjectIcon
                host={selectedProject.host}
                url={selectedPage?.url ?? selectedProject.pages[0]?.url}
                iconUrl={selectedProject.iconUrl}
                size={31}
              />
            ) : (
              <PortfolioIcon />
            )}
          </span>
          <div className={styles.contextCopy}>
            <strong>{scopeTitle}</strong>
            <div className={styles.staticMeta}>{pageScopeControl}</div>
          </div>
        </>
      )}
    </div>
  );
};
