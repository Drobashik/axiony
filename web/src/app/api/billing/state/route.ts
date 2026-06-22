import { NextResponse } from "next/server";
import type { BillingCycle, BillingPlan } from "@/lib/billing/types";
import { getServerUserId } from "@/server/auth/session";
import { getUserBillingState, setUserBillingState } from "@/server/billing/state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PLANS = new Set<BillingPlan>(["free", "pro", "team"]);
const CYCLES = new Set<BillingCycle>(["monthly", "annual"]);

export const GET = async () => {
  const userId = await getServerUserId();

  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  return NextResponse.json(await getUserBillingState(userId));
};

export const PATCH = async (request: Request) => {
  const userId = await getServerUserId();

  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = (await request.json()) as { plan?: unknown; cycle?: unknown };
  const plan = typeof body.plan === "string" ? body.plan : "";
  const cycle = typeof body.cycle === "string" ? body.cycle : "monthly";

  if (!PLANS.has(plan as BillingPlan)) {
    return NextResponse.json({ error: "Choose a valid billing plan." }, { status: 400 });
  }

  if (!CYCLES.has(cycle as BillingCycle)) {
    return NextResponse.json({ error: "Choose a valid billing cycle." }, { status: 400 });
  }

  const billing = await setUserBillingState(userId, {
    plan: plan as BillingPlan,
    cycle: cycle as BillingCycle,
  });

  return NextResponse.json(billing);
};
