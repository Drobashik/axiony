import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Dashboard preview",
  description:
    "Explore an interactive preview of the Axiony dashboard — project scores, accessibility issue trends, and team activity, running on sample data.",
};

/**
 * Bare layout for the dashboard route — intentionally has no marketing
 * nav/footer because the dashboard provides its own shell.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
