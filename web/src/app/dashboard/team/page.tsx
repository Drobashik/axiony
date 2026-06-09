import type { Metadata } from "next";
import { DashboardTabView } from "@/components/sections/dashboard";

export const metadata: Metadata = { title: "Team" };

export default function Page() {
  return <DashboardTabView tab="team" />;
}
