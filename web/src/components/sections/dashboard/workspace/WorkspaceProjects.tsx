"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import cn from "classnames";
import { remainingScans } from "@/lib/billing";
import type { BillingPlan, BillingState } from "@/lib/billing";
import { SEVERITY_COLOR, SEVERITY_LABEL, SEVERITY_ORDER } from "@/lib/scan/issues";
import { pageModel, projectModel, relativeTime } from "@/lib/workspace";
import type { Project, ProjectPage, Workspace } from "@/lib/workspace";
import { RefreshIcon } from "@/components/sections/scan/components/icons";
import { ScoreRing, colorForScore } from "../shared/ScoreRing";
import styles from "./Workspace.module.scss";

const nextPlan = (plan: BillingPlan): Exclude<BillingPlan, "free"> | null => {
  if (plan === "free") return "pro";
  if (plan === "pro") return "team";
  return null;
};

const ProjectCard = ({
  project,
  billing,
  onOpen,
  onOpenPage,
  onRequestRemove,
  onOpenScanner,
  onUpgrade,
  removing,
}: {
  project: Project;
  billing: BillingState;
  onOpen: () => void;
  onOpenPage: (path: string) => void;
  onRequestRemove: () => void;
  onOpenScanner: (url: string) => void;
  onUpgrade: (plan?: Exclude<BillingPlan, "free">) => void;
  removing: boolean;
}) => {
  const [pageToRescan, setPageToRescan] = useState<ProjectPage | null>(null);
  const pm = projectModel(project);
  const scansLeft = remainingScans(billing);
  const upgradeTarget = nextPlan(billing.plan);

  const requestRescan = (page: ProjectPage) => {
    if (scansLeft <= 0) {
      if (upgradeTarget) onUpgrade(upgradeTarget);
      return;
    }

    setPageToRescan(page);
  };

  const confirmRescan = () => {
    if (!pageToRescan) return;
    const url = pageToRescan.url;
    setPageToRescan(null);
    onOpenScanner(url);
  };

  return (
    <>
      <article className={styles.projectCard}>
        <div className={styles.projectTop}>
          <button type="button" className={styles.projectIdentityButton} onClick={onOpen}>
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
          </button>
          <div className={styles.projectActions}>
            <ScoreRing score={pm.avgScore} size={50} />
            <button
              type="button"
              className={styles.projectRemove}
              onClick={onRequestRemove}
              aria-label={`Remove ${project.host}`}
              disabled={removing}
            >
              <TrashIcon />
            </button>
          </div>
        </div>

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
                  onClick={() => requestRescan(page)}
                >
                  <RefreshIcon size={12} />
                  Re-scan
                </button>
              </li>
            );
          })}
        </ul>
      </article>

      {pageToRescan &&
        createPortal(
          <div
            className={styles.confirmOverlay}
            role="presentation"
            onClick={() => setPageToRescan(null)}
          >
            <div
              className={styles.confirmDialog}
              role="dialog"
              aria-modal="true"
              aria-labelledby={`rescan-page-title-${project.id}`}
              aria-describedby={`rescan-page-copy-${project.id}`}
              onClick={(event) => event.stopPropagation()}
            >
              <span className={styles.confirmIcon} aria-hidden="true">
                <WarningIcon />
              </span>
              <h3 id={`rescan-page-title-${project.id}`}>Re-scan this URL?</h3>
              <p className={styles.confirmUrl}>{pageToRescan.url}</p>
              <p id={`rescan-page-copy-${project.id}`}>
                This URL already has scan history. Open the scanner and run it again to add another
                history point.
              </p>
              <div className={styles.confirmActions}>
                <button
                  type="button"
                  className={styles.confirmCancel}
                  onClick={() => setPageToRescan(null)}
                >
                  Keep history
                </button>
                <button type="button" className={styles.confirmDanger} onClick={confirmRescan}>
                  Open scanner
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

const WarningIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
    <path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
  </svg>
);

const TrashIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v5M14 11v5" />
  </svg>
);

interface WorkspaceProjectsProps {
  workspace: Workspace;
  billing: BillingState;
  onTab: (tab: "overview" | "scan") => void;
  onSelectProject: (id: string | null) => void;
  onSelectPage: (path: string | null) => void;
  onUpgrade: (plan?: Exclude<BillingPlan, "free">) => void;
  refreshWorkspace: () => Promise<void>;
}

export const WorkspaceProjects = ({
  workspace,
  billing,
  onTab,
  onSelectProject,
  onSelectPage,
  onUpgrade,
  refreshWorkspace,
}: WorkspaceProjectsProps) => {
  const [projectToRemove, setProjectToRemove] = useState<Project | null>(null);
  const [removingProjectId, setRemovingProjectId] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
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

  const openScanner = (projectId: string, page: ProjectPage) => {
    onSelectProject(projectId);
    onSelectPage(page.path);
    onTab("scan");
  };

  const confirmRemove = async () => {
    if (!projectToRemove) return;
    setRemoveError(null);
    setRemovingProjectId(projectToRemove.id);

    try {
      const response = await fetch(
        `/api/scans/reports?host=${encodeURIComponent(projectToRemove.host)}`,
        { method: "DELETE" },
      );

      if (!response.ok) throw new Error("Delete failed");

      await refreshWorkspace();
      setProjectToRemove(null);
      onSelectProject(null);
      onSelectPage(null);
    } catch {
      setRemoveError("Could not remove this project. Please try again.");
    } finally {
      setRemovingProjectId(null);
    }
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
            billing={billing}
            onOpen={() => openProject(project.id)}
            onOpenPage={(path) => openPage(project.id, path)}
            onRequestRemove={() => setProjectToRemove(project)}
            onOpenScanner={(url) => {
              const page = project.pages.find((candidate) => candidate.url === url);
              if (page) openScanner(project.id, page);
              else onTab("scan");
            }}
            onUpgrade={onUpgrade}
            removing={removingProjectId === project.id}
          />
        ))}
      </div>

      {projectToRemove &&
        createPortal(
          <div
            className={styles.confirmOverlay}
            role="presentation"
            onClick={() => setProjectToRemove(null)}
          >
            <div
              className={styles.confirmDialog}
              role="dialog"
              aria-modal="true"
              aria-labelledby="remove-project-title"
              onClick={(event) => event.stopPropagation()}
            >
              <span className={styles.confirmIcon} aria-hidden="true">
                <TrashIcon />
              </span>
              <h3 id="remove-project-title">Remove {projectToRemove.host}?</h3>
              <p>
                This removes the domain project, all saved pages, scan history, and every issue
                attached to it.
              </p>
              {removeError && <p className={styles.confirmUrl}>{removeError}</p>}
              <div className={styles.confirmActions}>
                <button
                  type="button"
                  className={styles.confirmCancel}
                  onClick={() => setProjectToRemove(null)}
                  disabled={removingProjectId !== null}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.confirmDanger}
                  onClick={confirmRemove}
                  disabled={removingProjectId !== null}
                >
                  {removingProjectId ? "Removing..." : "Remove project"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};
