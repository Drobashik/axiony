"use client";

import Link from "next/link";
import { LogoMark, Select } from "@/components/ui";
import cn from "classnames";
import type { BillingPlan } from "@/lib/billing";
import { DashboardTab } from "@/lib/data/dashboard";
import { ProjectIcon } from "../shared/ProjectIcon";
import { ChevronDownIcon, SignOutIcon, TAB_ICONS } from "./sidebar-icons";
import styles from "./Sidebar.module.scss";

interface NavItem {
  id: DashboardTab;
  label: string;
  badge?: number;
  /** When set, the item renders as a link (e.g. New scan → /scan). */
  href?: string;
  green?: boolean;
}

const SECONDARY: NavItem[] = [
  { id: "reports", label: "Reports" },
  { id: "alerts", label: "Alerts" },
  { id: "team", label: "Team" },
  { id: "settings", label: "Settings" },
];

export interface SidebarProps {
  activeTab: DashboardTab;
  onTabChange(tab: DashboardTab): void;
  /** Mobile: the sidebar renders as an off-canvas drawer; `open` slides it in. */
  open?: boolean;
  /** Workspace + account identity. Defaults keep the public preview's
   * sample persona; the real workspace passes the signed-in user's. */
  workspaceName?: string;
  userName?: string;
  userInitials?: string;
  userPlan?: string;
  issuesBadge?: number;
  /** Render "New scan" as an in-dashboard tab instead of a link to /scan. */
  inlineScan?: boolean;
  onHome?: () => void;
  onSignOut?: () => void;
  billingPlan?: BillingPlan;
  onUpgrade?: (plan?: Exclude<BillingPlan, "free">) => void;
  /** Workspace mode: project switcher that scopes the dashboard. */
  projects?: {
    id: string;
    host: string;
    url?: string;
    iconUrl?: string;
    pageCount: number;
    avgScore: number;
    openIssues: number;
  }[];
  pages?: { path: string; openIssues: number }[];
  selectedProjectId?: string | null;
  selectedPagePath?: string | null;
  onSelectProject?: (id: string | null) => void;
  onSelectPage?: (path: string | null) => void;
}

const ALL_PROJECTS = "__all__";
const ALL_PAGES = "__all_pages__";

const ScopeIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

export function Sidebar({
  activeTab,
  onTabChange,
  open = false,
  workspaceName = "Acme Corp",
  userName = "Jamie Doe",
  userInitials = "JD",
  userPlan = "Pro plan",
  issuesBadge = 12,
  inlineScan = false,
  onHome,
  onSignOut,
  billingPlan,
  onUpgrade,
  projects,
  pages,
  selectedProjectId = null,
  selectedPagePath = null,
  onSelectProject,
  onSelectPage,
}: SidebarProps) {
  const projectCount = projects?.length ?? 0;
  const hasMultipleProjects = projectCount > 1;
  const onlyProject = projectCount === 1 ? projects?.[0] : undefined;
  const primary: NavItem[] = [
    { id: "overview", label: "Overview" },
    { id: "projects", label: "Projects" },
    { id: "issues", label: "Issues", badge: issuesBadge },
    { id: "scan", label: "New scan", href: inlineScan ? undefined : "/scan", green: true },
  ];

  const renderNavItem = (item: NavItem) => {
    if (item.href) {
      return (
        <Link
          key={item.id}
          href={item.href}
          className={styles.item}
          style={item.green ? { color: "var(--green)" } : undefined}
          data-tour={`dashboard-nav-${item.id}`}
        >
          {TAB_ICONS[item.id]} {item.label}
          {item.badge !== undefined && (
            <span className={cn(styles.badge, item.green && styles.badgeGreen)}>{item.badge}</span>
          )}
        </Link>
      );
    }

    return (
      <button
        key={item.id}
        type="button"
        className={cn(styles.item, activeTab === item.id && styles.itemActive)}
        style={item.green ? { color: "var(--green)" } : undefined}
        onClick={() => onTabChange(item.id)}
        data-tour={`dashboard-nav-${item.id}`}
      >
        {TAB_ICONS[item.id]} {item.label}
        {item.badge !== undefined && <span className={styles.badge}>{item.badge}</span>}
      </button>
    );
  };

  return (
    <aside id="dashboard-sidebar" className={cn(styles.sidebar, open && styles.open)}>
      <Link
        href="/"
        className={styles.logo}
        onClick={(event) => {
          if (!onHome) return;
          event.preventDefault();
          onHome();
        }}
      >
        <LogoMark size={22} />
        Axiony
      </Link>

      <div className={styles.section}>
        <div className={styles.label}>
          {projects ? (hasMultipleProjects ? "Scope" : "Project") : "Workspace"}
        </div>
        {projects ? (
          <div className={styles.scopeControls}>
            {hasMultipleProjects ? (
              <Select
                block
                floating
                menuMinWidth={300}
                ariaLabel="Select project scope"
                value={selectedProjectId ?? ALL_PROJECTS}
                options={[
                  {
                    value: ALL_PROJECTS,
                    label: "All projects",
                    hint: `${projectCount} projects`,
                    icon: <ScopeIcon />,
                  },
                  ...projects.map((project) => ({
                    value: project.id,
                    label: project.host,
                    hint: `${project.avgScore} score · ${project.openIssues} open`,
                    icon: (
                      <ProjectIcon
                        host={project.host}
                        url={project.url}
                        iconUrl={project.iconUrl}
                        size={18}
                      />
                    ),
                  })),
                ]}
                onChange={(value) => onSelectProject?.(value === ALL_PROJECTS ? null : value)}
              />
            ) : onlyProject ? (
              <div className={styles.singleProject}>
                <ProjectIcon
                  host={onlyProject.host}
                  url={onlyProject.url}
                  iconUrl={onlyProject.iconUrl}
                  size={29}
                />
                <span className={styles.singleProjectCopy}>
                  <strong>{onlyProject.host}</strong>
                  <span>
                    {onlyProject.pageCount} {onlyProject.pageCount === 1 ? "page" : "pages"} ·{" "}
                    {onlyProject.openIssues} open
                  </span>
                </span>
              </div>
            ) : (
              <div className={styles.noProject}>No projects yet</div>
            )}
            {selectedProjectId && pages && pages.length > 1 && (
              <div className={styles.pageScope}>
                <div className={styles.scopeLabel}>Page</div>
                <Select
                  block
                  floating
                  menuMinWidth={260}
                  ariaLabel="Select page"
                  value={selectedPagePath ?? ALL_PAGES}
                  options={[
                    { value: ALL_PAGES, label: "All pages" },
                    ...pages.map((page) => ({
                      value: page.path,
                      label: page.path,
                      hint: `${page.openIssues} open`,
                    })),
                  ]}
                  onChange={(v) => onSelectPage?.(v === ALL_PAGES ? null : v)}
                />
              </div>
            )}
          </div>
        ) : (
          <select className={styles.workspace} aria-label="Workspace">
            <option>{workspaceName}</option>
            <option>Personal</option>
          </select>
        )}
        {billingPlan === "pro" && onUpgrade && (
          <button type="button" className={styles.upgradeCard} onClick={() => onUpgrade("team")}>
            <span className={styles.upgradeKicker}>Pro plan</span>
            <span className={styles.upgradeTitle}>Unlock Team</span>
            <span className={styles.upgradeText}>Members, roles, PR checks</span>
          </button>
        )}
        {primary.map(renderNavItem)}
      </div>

      <div className={styles.section}>
        <div className={styles.label}>Settings</div>
        {SECONDARY.map(renderNavItem)}
      </div>

      <div className={styles.footer}>
        <div className={styles.user}>
          <div className={styles.avatar}>{userInitials}</div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{userName}</div>
            <div className={styles.userPlan}>{userPlan}</div>
          </div>
          {onSignOut ? (
            <button
              type="button"
              className={styles.signOut}
              onClick={onSignOut}
              aria-label="Sign out"
              title="Sign out"
            >
              <SignOutIcon />
            </button>
          ) : (
            <ChevronDownIcon />
          )}
        </div>
      </div>
    </aside>
  );
}
