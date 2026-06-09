import type { Metadata } from "next";
import { DashboardTabView } from "@/components/sections/dashboard";

export const metadata: Metadata = { title: "Projects" };

export default function Page() {
  return <DashboardTabView tab="projects" />;
}
