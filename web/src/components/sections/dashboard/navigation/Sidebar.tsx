"use client";

import Link from "next/link";
import { LogoMark, Select } from "@/components/ui";
import cn from "classnames";
import type { BillingPlan } from "@/lib/billing";
import { DashboardTab } from "@/lib/data/dashboard";
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
  projects?: { id: string; host: string }[];
  pages?: { path: string; openIssues: number }[];
  selectedProjectId?: string | null;
  selectedPagePath?: string | null;
  onSelectProject?: (id: string | null) => void;
  onSelectPage?: (path: string | null) => void;
}

const ALL_PROJECTS = "__all__";
const ALL_PAGES = "__all_pages__";

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
        <div className={styles.label}>{projects ? "Project" : "Workspace"}</div>
        {projects ? (
          <div className={styles.scopeControls}>
            <Select
              block
              ariaLabel="Select project"
              value={selectedProjectId ?? ALL_PROJECTS}
              options={[
                { value: ALL_PROJECTS, label: "All projects" },
                ...projects.map((p) => ({ value: p.id, label: p.host })),
              ]}
              onChange={(v) => onSelectProject?.(v === ALL_PROJECTS ? null : v)}
            />
            {selectedProjectId && pages && pages.length > 0 && (
              <div className={styles.pageScope}>
                <div className={styles.scopeLabel}>Page</div>
                <Select
                  block
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
