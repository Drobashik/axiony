"use client";

import { useState } from "react";
import cn from "classnames";
import { SEVERITY_LABEL, SEVERITY_ORDER } from "@/lib/scan/issues";
import { pageModel, projectModel, relativeTime, runFollowupScan } from "@/lib/workspace";
import type { Project, Workspace } from "@/lib/workspace";
import type { Severity } from "@/types";
import { RefreshIcon } from "@/components/sections/scan-v3/components/icons";
import { ScoreRing, colorForScore } from "../ScoreRing";
import styles from "./Workspace.module.scss";

const SEVERITY_COLOR: Record<Severity, string> = {
  critical: "var(--severity-critical)",
  serious: "var(--severity-serious)",
  moderate: "var(--severity-moderate)",
  minor: "var(--severity-minor)",
};

const ProjectCard = ({
  project,
  onOpen,
  onOpenPage,
}: {
  project: Project;
  onOpen: () => void;
  onOpenPage: (path: string) => void;
}) => {
  const [scanning, setScanning] = useState<string | null>(null);
  const pm = projectModel(project);

  const rescan = (path: string) => {
    if (scanning) return;
    setScanning(path);
    window.setTimeout(() => {
      runFollowupScan(project.host, path);
      setScanning(null);
    }, 1000);
  };

  return (
    <article className={styles.projectCard}>
      <button type="button" className={cn(styles.projectTop, styles.projectOpen)} onClick={onOpen}>
        <span className={styles.projectId}>
          <span className={styles.projectName}>
            {project.host}
            <span className={styles.projectArrow} aria-hidden="true">
              →
            </span>
          </span>
          <span className={styles.projectUrl}>
            {pm.pageCount} {pm.pageCount === 1 ? "page" : "pages"} · {pm.openIssues} open
          </span>
        </span>
        <ScoreRing score={pm.avgScore} size={50} />
      </button>

      <div className={styles.projectSeverities}>
        {SEVERITY_ORDER.map((s) => (
          <span key={s} className={styles.sevChip}>
            <span className={styles.sevDot} style={{ background: SEVERITY_COLOR[s] }} />
            {pm.counts[s]} {SEVERITY_LABEL[s]}
          </span>
        ))}
      </div>

      <ul className={styles.pageList}>
        {project.pages.map((page) => {
          const m = pageModel(page);
          const busy = scanning === page.path;
          return (
            <li key={page.id} className={styles.pageRow}>
              <button
                type="button"
                className={styles.pagePath}
                title={page.url}
                onClick={() => onOpenPage(page.path)}
              >
                {page.path}
              </button>
              <span className={styles.pageScore} style={{ color: colorForScore(m.latestScore) }}>
                {m.latestScore}
              </span>
              <span className={styles.pageMeta}>{m.openIssues} open</span>
              <span className={styles.pageMeta}>{relativeTime(m.lastScannedAt)}</span>
              <button
                type="button"
                className={styles.pageRescan}
                onClick={() => rescan(page.path)}
                disabled={scanning !== null}
                aria-busy={busy}
              >
                <RefreshIcon size={12} className={busy ? styles.spin : undefined} />
                {busy ? "Scanning…" : "Re-scan"}
              </button>
            </li>
          );
        })}
      </ul>
    </article>
  );
};

interface WorkspaceProjectsProps {
  workspace: Workspace;
  onTab: (tab: "overview") => void;
  onSelectProject: (id: string | null) => void;
  onSelectPage: (path: string | null) => void;
}

export const WorkspaceProjects = ({
  workspace,
  onTab,
  onSelectProject,
  onSelectPage,
}: WorkspaceProjectsProps) => {
  if (workspace.projects.length === 0) return null;

  const openProject = (id: string) => {
    onSelectProject(id);
    onSelectPage(null);
    onTab("overview");
  };

  const openPage = (projectId: string, path: string) => {
    onSelectProject(projectId);
    onSelectPage(path);
    onTab("overview");
  };

  return (
    <div className={styles.tabWrap}>
      <header className={styles.tabHead}>
        <h2>Projects</h2>
        <p>
          One project per domain, one page per path — scanning a new URL never overwrites an
          existing one. Open a project to focus the dashboard on it.
        </p>
      </header>

      <div
        className={cn(
          styles.projectGrid,
          workspace.projects.length === 1 && styles.projectGridSingle,
        )}
      >
        {workspace.projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onOpen={() => openProject(project.id)}
            onOpenPage={(path) => openPage(project.id, path)}
          />
        ))}
      </div>
    </div>
  );
};
