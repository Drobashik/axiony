"use client";

import { useState } from "react";
import { ProjectIcon } from "@/components/sections/dashboard/shared/ProjectIcon";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { pageLabel } from "@/lib/workspace";
import type { JustCreated, Workspace } from "@/lib/workspace";
import type { DashboardTab } from "@/lib/data/dashboard";
import { PageHealthTable } from "./components/PageHealthTable";
import { ProjectActivity } from "./components/ProjectActivity";
import { ProjectFocus } from "./components/ProjectFocus";
import { ProjectHealthHero } from "./components/ProjectHealthHero";
import { ProjectInsights } from "./components/ProjectInsights";
import { buildProjectOverviewModel } from "./utils";
import styles from "./WorkspaceOverview.module.scss";

interface WorkspaceOverviewProps {
  workspace: Workspace;
  selectedPagePath?: string | null;
  onTab: (tab: DashboardTab) => void;
  onSelectPage?: (path: string | null) => void;
}

const Celebration = ({ created, onDismiss }: { created: JustCreated; onDismiss: () => void }) => (
  <section className={styles.celebration}>
    <ProjectIcon host={created.host} iconUrl={created.iconUrl} size={42} />
    <div>
      <span className={styles.celebrationKicker}>
        {created.kind === "project" ? "Project created" : "Page added"}
      </span>
      <h2>{created.kind === "project" ? created.host : pageLabel(created.host, created.path)}</h2>
      <p>
        Baseline saved. Future scans will now show fixes, regressions, and score movement without
        losing this starting point.
      </p>
    </div>
    <button type="button" onClick={onDismiss} aria-label="Dismiss project created message">
      ×
    </button>
  </section>
);

export const WorkspaceOverview = ({
  workspace,
  selectedPagePath = null,
  onTab,
  onSelectPage,
}: WorkspaceOverviewProps) => {
  const reduceMotion = usePrefersReducedMotion();
  const model = buildProjectOverviewModel(workspace, selectedPagePath);
  const [dismissedCreatedKey, setDismissedCreatedKey] = useState<string | null>(null);

  if (!model) return null;

  const created = workspace.onboarding.justCreated;
  const createdKey = created ? `${created.kind}:${created.host}:${created.path}` : null;
  const justCreated = createdKey && dismissedCreatedKey !== createdKey ? created : null;
  const goToNextAction = () => onTab(model.nextAction.target);

  return (
    <div className={styles.overview}>
      {justCreated && (
        <Celebration
          created={justCreated}
          onDismiss={() => createdKey && setDismissedCreatedKey(createdKey)}
        />
      )}

      <ProjectHealthHero
        model={model}
        onScan={() => onTab("scan")}
        onShowProject={onSelectPage ? () => onSelectPage(null) : undefined}
      />
      <ProjectFocus
        model={model}
        reduceMotion={reduceMotion}
        onNextAction={goToNextAction}
        onIssues={() => onTab("issues")}
      />
      <ProjectInsights model={model} />
      <PageHealthTable
        model={model}
        onOpenPage={onSelectPage ? (path) => onSelectPage(path) : undefined}
        onScan={() => onTab("scan")}
      />
      <ProjectActivity model={model} onScan={() => onTab("scan")} />
    </div>
  );
};
