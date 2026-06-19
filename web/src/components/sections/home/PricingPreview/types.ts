import type { BillingPlan } from "@/lib/billing";
import type { AccentColor } from "@/types";

export interface PricingTier {
  id: BillingPlan;
  name: string;
  audience: string;
  /** From the billing model — kept in sync with the product. */
  priceMonthly: number;
  priceAnnual: number;
  domains: number;
  scans: number;
  /** What this tier adds on top of the one below it. */
  inherits?: string;
  highlights: readonly string[];
  cta: string;
  href: string;
  accent: AccentColor;
  featured?: boolean;
}
