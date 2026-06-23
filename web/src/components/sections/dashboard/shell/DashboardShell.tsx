"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { planDefinition, useBilling } from "@/lib/billing";
import type { BillingPlan } from "@/lib/billing";
import { startRouteLoading } from "@/lib/navigation/route-loading";
import {
  importPendingScanToServer,
  readPendingScan,
  restoreWorkspaceFromServer,
  signOut,
} from "@/lib/workspace";
import type { WorkspaceState } from "@/lib/workspace";
import { signOut as authSignOut, useSession } from "@/lib/auth-client";
import type { DashboardTab } from "@/lib/data/dashboard";
import { UpgradeDialog } from "../billing";
import { Sidebar } from "../navigation/Sidebar";
import { Topbar } from "../navigation/Topbar";
import { PreviewBanner } from "../preview/PreviewBanner";
import { DashboardTutorial } from "../workspace/DashboardTutorial";
import { DashboardWorkspaceContext } from "./dashboard-workspace-context";
import type { NavigationGuard } from "./dashboard-workspace-context";
import { SignOutDialog } from "./SignOutDialog";
import styles from "./DashboardShell.module.scss";

const VALID_TABS: DashboardTab[] = [
  "overview",
  "projects",
  "issues",
  "scan",
  "reports",
  "alerts",
  "team",
  "settings",
];
const TUTORIAL_STORAGE_PREFIX = "axiony.dashboard_tutorial";
const OPEN_ISSUE_STATUSES = new Set(["open", "in-progress"]);

/** Derive the active tab from /dashboard/<tab> (root = overview). */
const tabFromPath = (pathname: string): DashboardTab => {
  const seg = pathname.split("/")[2] ?? "";
  return (VALID_TABS as string[]).includes(seg) ? (seg as DashboardTab) : "overview";
};

/**
 * Persistent dashboard chrome: sidebar + topbar (+ preview banner) around the
 * routed tab content. Stays mounted across tab navigations, and shares the
 * workspace + selected project with each page via context.
 */
export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<WorkspaceState>({ ready: false, workspace: null });
  const billingState = useBilling();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedPagePath, setSelectedPagePath] = useState<string | null>(null);
  const [upgradePlan, setUpgradePlan] = useState<Exclude<BillingPlan, "free"> | null>(null);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [signOutUserName, setSignOutUserName] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [navigationGuard, setNavigationGuardValue] = useState<NavigationGuard | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tutorialDismissed, setTutorialDismissed] = useState(true);
  const { ready, workspace } = state;
  const { ready: billingReady, billing } = billingState;
  const tab = tabFromPath(pathname);
  const tutorialStorageKey = useMemo(() => {
    if (!workspace) return null;
    const owner = workspace.account.email || workspace.account.name || "workspace";
    return `${TUTORIAL_STORAGE_PREFIX}.${owner}.${billing.plan}`;
  }, [billing.plan, workspace]);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  useEffect(() => {
    if (!sidebarOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen]);

  // Build the dashboard workspace from Neon reports. OAuth returns directly
  // here, so this also imports any guest scan waiting to become the baseline.
  const { data: session, isPending: sessionPending } = useSession();
  const sessionUser = session?.user;
  const sessionEmail = sessionUser?.email;
  const sessionName = sessionUser?.name;
  const refreshWorkspace = useCallback(async () => {
    if (!sessionEmail) {
      setState({ ready: true, workspace: null });
      return;
    }

    const identity = { name: sessionName ?? sessionEmail, email: sessionEmail };
    const workspace = await restoreWorkspaceFromServer(identity);
    setState({ ready: true, workspace });
  }, [sessionEmail, sessionName]);

  useEffect(() => {
    if (sessionPending || signingOut) return;

    void (async () => {
      const pendingScan = readPendingScan();
      await importPendingScanToServer(pendingScan);
      await refreshWorkspace();
    })();
  }, [refreshWorkspace, sessionPending, signingOut]);

  const canNavigate = useCallback(
    () => (navigationGuard ? navigationGuard() : true),
    [navigationGuard],
  );
  const setNavigationGuard = useCallback((guard: NavigationGuard | null) => {
    setNavigationGuardValue(() => guard);
  }, []);
  const rememberTutorial = useCallback(
    (status: "completed" | "skipped") => {
      try {
        if (tutorialStorageKey) window.localStorage.setItem(tutorialStorageKey, status);
      } catch {
        // Losing this preference is harmless; the dashboard itself still works.
      }
      setTutorialDismissed(true);
      setTutorialOpen(false);
    },
    [tutorialStorageKey],
  );
  const startDashboardTutorial = useCallback(() => {
    setSidebarOpen(false);
    setTutorialOpen(true);
  }, []);
  const skipDashboardTutorial = useCallback(() => rememberTutorial("skipped"), [rememberTutorial]);
  const go = useCallback(
    (next: DashboardTab) => {
      setSidebarOpen(false);
      if (next === tab) return;
      if (!canNavigate()) return;
      startRouteLoading();
      router.push(`/dashboard/${next}`);
    },
    [canNavigate, router, tab],
  );
  const goHome = useCallback(() => {
    if (!canNavigate()) return;
    startRouteLoading();
    router.push("/");
  }, [canNavigate, router]);
  const handleSelectProject = useCallback((id: string | null) => {
    setSelectedProjectId(id);
    setSelectedPagePath(null);
  }, []);
  const openUpgrade = useCallback(
    (plan: Exclude<BillingPlan, "free"> = "pro") => setUpgradePlan(plan),
    [],
  );
  const requestSignOut = useCallback(() => {
    if (!canNavigate()) return;
    if (!workspace) return;
    setSidebarOpen(false);
    setSignOutUserName(workspace.account.name || workspace.account.email);
    setSignOutOpen(true);
  }, [canNavigate, workspace]);
  const closeSignOut = useCallback(() => {
    setSignOutOpen(false);
    setSignOutUserName(null);
  }, []);
  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    try {
      await authSignOut(); // clear the BetterAuth server session (cookie)
      signOut(); // clear pending scan + legacy client workspace key
      startRouteLoading();
      router.replace("/");
    } catch (error) {
      console.error("Unable to sign out", error);
      setSigningOut(false);
      closeSignOut();
    }
  }, [closeSignOut, router]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (!tutorialStorageKey) {
        setTutorialDismissed(true);
        setTutorialOpen(false);
        return;
      }

      let dismissed = true;
      try {
        dismissed = Boolean(window.localStorage.getItem(tutorialStorageKey));
      } catch {
        dismissed = true;
      }

      setTutorialDismissed(dismissed);
      setTutorialOpen(false);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [tutorialStorageKey]);

  useEffect(() => {
    if (tutorialDismissed || !workspace || workspace.projects.length === 0) return;

    const frame = window.requestAnimationFrame(() => setTutorialOpen(true));
    return () => window.cancelAnimationFrame(frame);
  }, [tutorialDismissed, workspace]);

  // First client tick before auth/billing/report state is ready — keep it
  // neutral so preview/workspace modes don't flash.
  if (!ready || !billingReady) return <div className={styles.page} aria-busy="true" />;

  // Ignore a stale selection (e.g. project removed) → treat as "all".
  const effectiveProjectId = workspace?.projects.some((p) => p.id === selectedProjectId)
    ? selectedProjectId
    : null;
  const selectedProject = workspace?.projects.find((p) => p.id === effectiveProjectId);
  const effectivePagePath =
    selectedProject && selectedProject.pages.some((page) => page.path === selectedPagePath)
      ? selectedPagePath
      : null;

  // Open-issue count for the sidebar badge, scoped to the selected project/page.
  const scopedProjects =
    workspace && effectiveProjectId
      ? workspace.projects.filter((p) => p.id === effectiveProjectId)
      : (workspace?.projects ?? []);
  const scopedPages = scopedProjects
    .flatMap((p) => p.pages)
    .filter((page) => !effectivePagePath || page.path === effectivePagePath);
  const openIssueCount = scopedPages.reduce(
    (sum, page) => sum + page.open.filter((issue) => OPEN_ISSUE_STATUSES.has(issue.status)).length,
    0,
  );

  return (
    <DashboardWorkspaceContext.Provider
      value={{
        ...state,
        selectedProjectId: effectiveProjectId,
        setSelectedProjectId: handleSelectProject,
        selectedPagePath: effectivePagePath,
        setSelectedPagePath,
        billing,
        openUpgrade,
        navigateTab: go,
        startDashboardTutorial,
        setNavigationGuard,
        refreshWorkspace,
      }}
    >
      <div className={styles.page}>
        {!workspace && <PreviewBanner />}

        <div className={styles.shell}>
          {sidebarOpen && (
            <button
              type="button"
              className={styles.scrim}
              aria-label="Close menu"
              onClick={closeSidebar}
            />
          )}

          <Sidebar
            open={sidebarOpen}
            activeTab={tab}
            onTabChange={go}
            onHome={goHome}
            userName={workspace ? workspace.account.name || workspace.account.email : undefined}
            userInitials={workspace ? workspace.account.initials : undefined}
            userPlan={workspace ? `${planDefinition(billing.plan).name} plan` : undefined}
            issuesBadge={workspace ? openIssueCount : undefined}
            inlineScan={workspace !== null}
            onSignOut={workspace ? requestSignOut : undefined}
            billingPlan={workspace ? billing.plan : undefined}
            onUpgrade={workspace ? openUpgrade : undefined}
            projects={workspace?.projects.map((p) => ({ id: p.id, host: p.host }))}
            pages={selectedProject?.pages.map((page) => ({
              path: page.path,
              openIssues: page.open.filter((issue) => OPEN_ISSUE_STATUSES.has(issue.status)).length,
            }))}
            selectedProjectId={effectiveProjectId}
            selectedPagePath={effectivePagePath}
            onSelectProject={handleSelectProject}
            onSelectPage={setSelectedPagePath}
          />

          <div className={styles.main}>
            <Topbar
              activeTab={tab}
              onHome={goHome}
              onNewScan={workspace ? () => go("scan") : undefined}
              billingPlan={workspace ? billing.plan : undefined}
              onUpgrade={workspace ? openUpgrade : undefined}
              menuOpen={sidebarOpen}
              onMenuToggle={() => setSidebarOpen((open) => !open)}
            />
            <div className={styles.content}>{children}</div>
          </div>
        </div>

        {upgradePlan && (
          <UpgradeDialog
            currentPlan={billing.plan}
            initialPlan={upgradePlan}
            onClose={() => setUpgradePlan(null)}
          />
        )}
        {signOutOpen && signOutUserName && (
          <SignOutDialog
            userName={signOutUserName}
            onClose={closeSignOut}
            onConfirm={handleSignOut}
          />
        )}
        {workspace && (
          <DashboardTutorial
            open={tutorialOpen}
            plan={billing.plan}
            activeTab={tab}
            onNavigate={go}
            onSkip={skipDashboardTutorial}
            onComplete={() => rememberTutorial("completed")}
          />
        )}
      </div>
    </DashboardWorkspaceContext.Provider>
  );
}
