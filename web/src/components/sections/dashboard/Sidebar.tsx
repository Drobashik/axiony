"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { LogoMark } from "@/components/ui";
import cn from "classnames";
import { DashboardTab } from "@/lib/data/dashboard";
import styles from "./Sidebar.module.scss";

interface NavItem {
  id: DashboardTab;
  label: string;
  badge?: number;
  /** When set, the item renders as a link (e.g. New scan → /scan). */
  href?: string;
  green?: boolean;
}

const PRIMARY: NavItem[] = [
  { id: "overview", label: "Overview" },
  { id: "projects", label: "Projects" },
  { id: "issues", label: "Issues", badge: 12 },
  { id: "scan", label: "New scan", href: "/scan", green: true },
];

const SECONDARY: NavItem[] = [
  { id: "reports", label: "Reports" },
  { id: "alerts", label: "Alerts" },
  { id: "team", label: "Team" },
  { id: "settings", label: "Settings" },
];

const ICONS: Record<DashboardTab, ReactNode> = {
  overview: (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
  projects: (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
    </svg>
  ),
  issues: (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  scan: (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  ),
  reports: (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
    </svg>
  ),
  alerts: (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  ),
  team: (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  settings: (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
};

export interface SidebarProps {
  activeTab: DashboardTab;
  onTabChange(tab: DashboardTab): void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const renderNavItem = (item: NavItem) => {
    if (item.href) {
      return (
        <Link
          key={item.id}
          href={item.href}
          className={styles.item}
          style={item.green ? { color: "var(--green)" } : undefined}
        >
          {ICONS[item.id]} {item.label}
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
        onClick={() => onTabChange(item.id)}
      >
        {ICONS[item.id]} {item.label}
        {item.badge !== undefined && <span className={styles.badge}>{item.badge}</span>}
      </button>
    );
  };

  return (
    <aside className={styles.sidebar}>
      <Link href="/" className={styles.logo}>
        <LogoMark size={22} />
        Axiony
      </Link>

      <div className={styles.section}>
        <div className={styles.label}>Workspace</div>
        <select className={styles.workspace}>
          <option>Acme Corp</option>
          <option>Personal</option>
        </select>
        {PRIMARY.map(renderNavItem)}
      </div>

      <div className={styles.section}>
        <div className={styles.label}>Settings</div>
        {SECONDARY.map(renderNavItem)}
      </div>

      <div className={styles.footer}>
        <div className={styles.user}>
          <div className={styles.avatar}>JD</div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>Jamie Doe</div>
            <div className={styles.userPlan}>Pro plan</div>
          </div>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
    </aside>
  );
}
