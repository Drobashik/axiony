import { DashboardTabView } from "@/components/sections/dashboard";

/** /dashboard → the overview tab (also reachable at /dashboard/overview). */
export default function DashboardPage() {
  return <DashboardTabView tab="overview" />;
}
