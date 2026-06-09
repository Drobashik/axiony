"use client";

import { Button, Icon } from "@/components/ui";
import type { DashboardTab } from "@/lib/data/dashboard";
import { canAccessPlan, canManageIssues } from "@/lib/billing";
import type { BillingPlan, BillingState } from "@/lib/billing";
import type { Workspace } from "@/lib/workspace";
import type { IconName } from "@/types";
import { ComingSoon } from "../ComingSoon";
import { BillingGate, BillingSettings } from "../billing";
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
  billing: BillingState;
  onUpgrade: (plan?: Exclude<BillingPlan, "free">) => void;
  setNavigationGuard: (guard: (() => boolean) | null) => void;
}

interface FeaturePageProps {
  title: string;
  kicker: string;
  text: string;
  cards: Array<{ icon: IconName; title: string; text: string }>;
}

const FeaturePage = ({ title, kicker, text, cards }: FeaturePageProps) => (
  <div className={styles.featurePage}>
    <header className={styles.featureHero}>
      <span className={styles.scanKicker}>{kicker}</span>
      <h2>{title}</h2>
      <p>{text}</p>
    </header>
    <div className={styles.featureGrid}>
      {cards.map((card) => (
        <article key={card.title} className={styles.valueCard}>
          <span className={styles.valueIcon} data-tone="blue">
            <Icon name={card.icon} size={17} />
          </span>
          <span className={styles.valueTitle}>{card.title}</span>
          <span className={styles.valueText}>{card.text}</span>
        </article>
      ))}
    </div>
  </div>
);

export const WorkspaceContent = ({
  workspace,
  selectedProjectId,
  selectedPagePath,
  tab,
  onTab,
  onSelectProject,
  onSelectPage,
  billing,
  onUpgrade,
  setNavigationGuard,
}: WorkspaceContentProps) => {
  // The scanner sees the full workspace (scanning isn't scoped).
  if (tab === "scan") {
    return (
      <WorkspaceScan
        workspace={workspace}
        onTab={onTab}
        billing={billing}
        onUpgrade={onUpgrade}
        setNavigationGuard={setNavigationGuard}
      />
    );
  }

  // No projects yet → data tabs show a "scan first" empty state with a link
  // to the scanner; subscription/product tabs still render useful gated content.
  if (workspace.projects.length === 0 && !COMING_SOON.includes(tab)) {
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
  if (tab === "issues")
    return (
      <WorkspaceIssues
        workspace={scoped}
        canControlIssues={canManageIssues(billing)}
        onUpgrade={onUpgrade}
      />
    );
  if (tab === "reports") {
    if (!canAccessPlan(billing.plan, "pro")) {
      return (
        <BillingGate
          requiredPlan="pro"
          title="Export polished accessibility reports"
          text="Turn scans into stakeholder-ready reports with history, issue details, and shareable summaries."
          features={["Exportable reports", "Full scan history", "Comparison snapshots"]}
          onUpgrade={onUpgrade}
        />
      );
    }
    return (
      <FeaturePage
        kicker="Pro reports"
        title="Reports are unlocked"
        text="Generate mock report packs from your saved projects, scan history, and tracked issues."
        cards={[
          {
            icon: "report",
            title: "Executive summary",
            text: "Score, debt, regressions, and trend context ready for stakeholders.",
          },
          {
            icon: "bolt",
            title: "Issue appendix",
            text: "Every issue keeps its affected elements, suggested fix, and WCAG reference.",
          },
          {
            icon: "ci",
            title: "Before / after",
            text: "Compare follow-up scans to baseline without losing triage state.",
          },
        ]}
      />
    );
  }

  if (tab === "alerts") {
    if (!canAccessPlan(billing.plan, "pro")) {
      return (
        <BillingGate
          requiredPlan="pro"
          title="Catch regressions with alerts"
          text="Pro unlocks scheduled scans and email alerts when new accessibility issues appear."
          features={["Scheduled scans", "Email alerts", "Regression-only notifications"]}
          onUpgrade={onUpgrade}
        />
      );
    }
    return (
      <FeaturePage
        kicker="Pro alerts"
        title="Alerts are unlocked"
        text="Mock alert rules show how Axiony will notify your team when a page regresses."
        cards={[
          {
            icon: "scan",
            title: "Daily scheduled scan",
            text: "Run every morning across tracked project pages.",
          },
          {
            icon: "bolt",
            title: "Regression alerts",
            text: "Only notify when a new issue appears outside the baseline.",
          },
          {
            icon: "report",
            title: "Weekly digest",
            text: "Summarize score movement, resolved issues, and open debt.",
          },
        ]}
      />
    );
  }

  if (tab === "team") {
    if (!canAccessPlan(billing.plan, "team")) {
      return (
        <BillingGate
          requiredPlan="team"
          title="Bring the team into accessibility"
          text="Team unlocks collaboration, ownership, integrations, and review workflows for product and engineering."
          features={["Members and roles", "PR/MR comments", "Shared baselines", "Slack alerts"]}
          onUpgrade={onUpgrade}
        />
      );
    }
    return (
      <FeaturePage
        kicker="Team workspace"
        title="Team collaboration is unlocked"
        text="Mock team controls show how shared ownership, review comments, and routing will work."
        cards={[
          {
            icon: "team",
            title: "Members and roles",
            text: "Invite product, QA, design, and engineering to one workspace.",
          },
          {
            icon: "ci",
            title: "PR checks",
            text: "Route new issues into review without blocking known baseline debt.",
          },
          {
            icon: "bolt",
            title: "Ownership routing",
            text: "Assign issues by project, page, severity, or code owner.",
          },
        ]}
      />
    );
  }

  if (tab === "settings")
    return <BillingSettings billing={billing} workspace={workspace} onUpgrade={onUpgrade} />;
  if (COMING_SOON.includes(tab)) return <ComingSoon title={tab} icon={PLACEHOLDER_ICON} />;

  return <WorkspaceOverview workspace={scoped} onTab={onTab} />;
};
