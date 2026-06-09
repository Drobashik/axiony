import type { Metadata } from "next";
import { DashboardTabView } from "@/components/sections/dashboard";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return <DashboardTabView tab="settings" />;
}
