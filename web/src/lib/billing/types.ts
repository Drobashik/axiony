export type BillingPlan = "free" | "pro" | "team";
export type BillingCycle = "monthly" | "annual";
export type BillingStatus = "active" | "trialing";

export interface BillingUsage {
  periodStart: string;
  periodEnd: string;
  scansUsed: number;
  scannedDomains: string[];
}

export interface BillingState {
  plan: BillingPlan;
  cycle: BillingCycle;
  status: BillingStatus;
  startedAt: string;
  renewalAt: string | null;
  checkoutId?: string;
  usage: BillingUsage;
}

export interface PlanEntitlements {
  domainLimit: number;
  monthlyScans: number;
  issueManagement: boolean;
  reports: boolean;
  alerts: boolean;
  teamWorkspace: boolean;
}

export interface PlanFeature {
  label: string;
  tier: BillingPlan;
}

export interface PlanDefinition {
  id: BillingPlan;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  audience: string;
  limit: string;
  cta: string;
  accent: "green" | "blue" | "violet";
  featured?: boolean;
  entitlements: PlanEntitlements;
  features: PlanFeature[];
}
