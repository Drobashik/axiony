import { Metadata } from "next";
import { ReactNode } from "react";
import { DashboardShell } from "@/components/sections/dashboard";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s — Axiony Dashboard",
  },
  description:
    "Your Axiony workspace — accessibility score, tracked debt, scan history, and team activity. The public route runs on sample data.",
};

/**
 * Dashboard layout. Renders the persistent shell (sidebar + topbar) once; the
 * routed tab pages under /dashboard/* fill the content area. No marketing
 * nav/footer — the dashboard brings its own chrome.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
