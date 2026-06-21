import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { entitlementsForPlan } from "@/lib/billing/plans";
import type {
  BillingCycle,
  BillingPlan,
  BillingState,
  BillingStatus,
  BillingUsage,
} from "@/lib/billing/types";

const BILLING_PLANS = new Set<BillingPlan>(["free", "pro", "team"]);
const BILLING_CYCLES = new Set<BillingCycle>(["monthly", "annual"]);
const BILLING_STATUSES = new Set<BillingStatus>(["active", "trialing"]);

export class ScanLimitError extends Error {
  status = 402;

  constructor(message: string) {
    super(message);
    this.name = "ScanLimitError";
  }
}

const isBillingPlan = (value: unknown): value is BillingPlan =>
  typeof value === "string" && BILLING_PLANS.has(value as BillingPlan);

const isBillingCycle = (value: unknown): value is BillingCycle =>
  typeof value === "string" && BILLING_CYCLES.has(value as BillingCycle);

const isBillingStatus = (value: unknown): value is BillingStatus =>
  typeof value === "string" && BILLING_STATUSES.has(value as BillingStatus);

const addMonths = (date: Date, months: number): Date => {
  const next = new Date(date);
  next.setUTCMonth(next.getUTCMonth() + months);
  return next;
};

export const currentBillingPeriod = (
  from = new Date(),
): Pick<BillingUsage, "periodStart" | "periodEnd"> => {
  const start = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), 1));
  const end = addMonths(start, 1);

  return {
    periodStart: start.toISOString(),
    periodEnd: end.toISOString(),
  };
};

const normalizeDomain = (host: string): string =>
  host
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0] ?? "";

const renewalDate = (cycle: BillingCycle): Date =>
  addMonths(new Date(), cycle === "annual" ? 12 : 1);

const freeStartedAt = "server-free";

export const getUserBillingState = async (userId: string): Promise<BillingState> => {
  const billing = await prisma.userBilling.findUnique({
    where: { userId },
  });
  const period = currentBillingPeriod();
  const periodStart = new Date(period.periodStart);
  const periodEnd = new Date(period.periodEnd);

  const [scansUsed, domains] = await Promise.all([
    prisma.scanJob.count({
      where: {
        userId,
        status: "complete",
        completedAt: {
          gte: periodStart,
          lt: periodEnd,
        },
      },
    }),
    prisma.userScanReport.findMany({
      where: {
        userId,
        createdAt: {
          gte: periodStart,
          lt: periodEnd,
        },
      },
      select: { host: true },
      distinct: ["host"],
    }),
  ]);

  const plan = isBillingPlan(billing?.plan) ? billing.plan : "free";
  const cycle = isBillingCycle(billing?.cycle) ? billing.cycle : "monthly";
  const status = isBillingStatus(billing?.status) ? billing.status : "active";

  return {
    plan,
    cycle,
    status,
    startedAt: billing?.startedAt.toISOString() ?? freeStartedAt,
    renewalAt: billing?.renewalAt?.toISOString() ?? null,
    checkoutId: billing?.checkoutId ?? undefined,
    usage: {
      ...period,
      scansUsed,
      scannedDomains: domains.map(({ host }) => normalizeDomain(host)).filter(Boolean),
    },
  };
};

export const setUserBillingState = async (
  userId: string,
  input: { plan: BillingPlan; cycle?: BillingCycle },
): Promise<BillingState> => {
  const cycle = input.cycle ?? "monthly";
  const paid = input.plan !== "free";

  await prisma.userBilling.upsert({
    where: { userId },
    create: {
      userId,
      plan: input.plan,
      cycle,
      status: "active",
      startedAt: new Date(),
      renewalAt: paid ? renewalDate(cycle) : null,
      checkoutId: paid ? `mock_${randomUUID()}` : null,
    },
    update: {
      plan: input.plan,
      cycle,
      status: "active",
      startedAt: new Date(),
      renewalAt: paid ? renewalDate(cycle) : null,
      checkoutId: paid ? `mock_${randomUUID()}` : null,
    },
  });

  return getUserBillingState(userId);
};

export const assertUserCanStartScan = async (userId: string): Promise<BillingState> => {
  const billing = await getUserBillingState(userId);
  const limit = entitlementsForPlan(billing.plan).monthlyScans;

  if (billing.usage.scansUsed >= limit) {
    throw new ScanLimitError(
      `${billing.plan === "free" ? "Free" : billing.plan} includes ${limit.toLocaleString()} hosted scans this month. Upgrade to keep scanning.`,
    );
  }

  return billing;
};
