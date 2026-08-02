"use client";

import Link from "next/link";
import { LogoMark } from "@/components/ui";
import cn from "classnames";
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
  userName?: string;
  userInitials?: string;
  userPlan?: string;
  issuesBadge?: number;
  /** Render "New scan" as an in-dashboard tab instead of a link to /scan. */
  inlineScan?: boolean;
  onHome?: () => void;
  onSignOut?: () => void;
}

export function Sidebar({
  activeTab,
  onTabChange,
  open = false,
  userName = "Jamie Doe",
  userInitials = "JD",
  userPlan = "Pro plan",
  issuesBadge = 12,
  inlineScan = false,
  onHome,
  onSignOut,
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
          if (!onHome) {
            return;
          }

          event.preventDefault();
          onHome();
        }}
      >
        <span className={styles.logoTile} aria-hidden="true">
          <LogoMark size={25} />
        </span>
        <span className={styles.logoCopy}>
          <strong>Axiony</strong>
          <small>accessibility workflow</small>
        </span>
      </Link>

      <div className={styles.section}>{primary.map(renderNavItem)}</div>

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
