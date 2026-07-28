import type { BillingPlan } from "@/lib/billing";
import type { AccentColor } from "@/types";

export interface PricingTier {
  id: BillingPlan;
  name: string;
  audience: string;
  priceMonthly: number;
  priceAnnual: number;
  domains: number;
  scans: number;
  inherits?: string;
  highlights: readonly string[];
  cta: string;
  href: string;
  accent: AccentColor;
  featured?: boolean;
}
