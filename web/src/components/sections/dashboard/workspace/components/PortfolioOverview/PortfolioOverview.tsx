"use client";

import { useMemo, useState } from "react";
import type { Workspace } from "@/lib/workspace";
import { PortfolioHealthCards } from "./components/PortfolioHealthCards";
import { PortfolioHeader } from "./components/PortfolioHeader";
import { PortfolioInsights } from "./components/PortfolioInsights";
import { ProjectHealthTable } from "./components/ProjectHealthTable";
import type { WindowDays } from "./types";
import { buildPortfolioOverviewModel } from "./utils";
import styles from "./PortfolioOverview.module.scss";

interface PortfolioOverviewProps {
  workspace: Workspace;
  onProjects: () => void;
  onIssues: () => void;
  onScan: () => void;
  onOpenProject: (projectId: string) => void;
}

export const PortfolioOverview = ({
  workspace,
  onProjects,
  onIssues,
  onScan,
  onOpenProject,
}: PortfolioOverviewProps) => {
  const [windowDays, setWindowDays] = useState<WindowDays>(7);
  const model = useMemo(
    () => buildPortfolioOverviewModel(workspace, windowDays),
    [windowDays, workspace],
  );

  if (!model) return null;

  return (
    <div className={styles.portfolio}>
      <PortfolioHeader
        model={model}
        windowDays={windowDays}
        onWindowChange={setWindowDays}
        onProjects={onProjects}
      />

      <div className={styles.heroGrid}>
        <PortfolioHealthCards
          model={model}
          windowDays={windowDays}
          onProjects={onProjects}
          onOpenProject={onOpenProject}
        />
      </div>

      <ProjectHealthTable
        model={model}
        windowDays={windowDays}
        onProjects={onProjects}
        onOpenProject={onOpenProject}
      />

      <div className={styles.lowerGrid}>
        <PortfolioInsights
          model={model}
          windowDays={windowDays}
          onIssues={onIssues}
          onScan={onScan}
        />
      </div>
    </div>
  );
};
