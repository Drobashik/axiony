import type { Metadata } from "next";
import { DashboardTabView } from "@/components/sections/dashboard";

export const metadata: Metadata = { title: "Reports" };

export default function Page() {
  return <DashboardTabView tab="reports" />;
}
