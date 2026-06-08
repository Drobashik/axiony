"use client";

import { useState } from "react";
import {
  ComingSoon,
  IssuesTab,
  OverviewTab,
  PreviewBanner,
  ProjectsTab,
  Sidebar,
  Topbar,
} from "@/components/sections/dashboard";
import { DashboardTab } from "@/lib/data/dashboard";
import styles from "./page.module.scss";

const COMING_SOON_TABS: DashboardTab[] = ["reports", "alerts", "team", "settings"];

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

/**
 * Dashboard preview. Lives outside the marketing layout group because it
 * brings its own shell: a preview banner + sidebar + topbar + content, with
 * no marketing nav/footer.
 *
 * The real dashboard sits behind auth; this public route renders the same
 * shell on static sample data so visitors can explore it. The loading
 * screen is provided by the root-level BootGate.
 */
export default function DashboardPage() {
  const [tab, setTab] = useState<DashboardTab>("overview");

  return (
    <div className={styles.page}>
      <PreviewBanner />

      <div className={styles.shell}>
        <Sidebar activeTab={tab} onTabChange={setTab} />

        <div className={styles.main}>
          <Topbar activeTab={tab} />
          <div className={styles.content}>
            {tab === "overview" && <OverviewTab />}
            {tab === "projects" && <ProjectsTab />}
            {tab === "issues" && <IssuesTab />}
            {COMING_SOON_TABS.includes(tab) && <ComingSoon title={tab} icon={PLACEHOLDER_ICON} />}
          </div>
        </div>
      </div>
    </div>
  );
}
