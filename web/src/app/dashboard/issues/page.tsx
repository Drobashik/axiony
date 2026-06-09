import type { Metadata } from "next";
import { DashboardTabView } from "@/components/sections/dashboard";

export const metadata: Metadata = { title: "Issues" };

export default function Page() {
  return <DashboardTabView tab="issues" />;
}
