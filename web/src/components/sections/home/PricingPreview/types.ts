import type { AccentColor } from "@/types";

export interface PricingTier {
  name: string;
  price: string;
  period: string;
  audience: string;
  limit: string;
  features: readonly string[];
  inherits?: string;
  cta: string;
  featured?: boolean;
  planned?: boolean;
  accent: AccentColor;
}
