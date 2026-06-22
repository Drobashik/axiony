"use client";

import { useState, useSyncExternalStore } from "react";
import cn from "classnames";
import { PLAN_ORDER, planDefinition, useBilling } from "@/lib/billing";
import type { BillingCycle, BillingPlan } from "@/lib/billing";
import { useSession } from "@/lib/auth-client";
import { PRICING_TIERS } from "../data";
import type { PricingTier } from "../types";
import { TierCard } from "./TierCard";
import styles from "../PricingPreview.module.scss";

const DASHBOARD_BILLING_HREF = "/dashboard/settings";

const subscribeHydration = () => () => {};
const clientHydrationSnapshot = () => true;
const serverHydrationSnapshot = () => false;

const actionForTier = (
  tier: PricingTier,
  signedIn: boolean,
  currentPlan: BillingPlan,
): { cta: string; href: string } => {
  if (!signedIn) return { cta: tier.cta, href: tier.href };

  if (tier.id === currentPlan) {
    return { cta: "Manage current plan", href: DASHBOARD_BILLING_HREF };
  }

  if (PLAN_ORDER[tier.id] < PLAN_ORDER[currentPlan]) {
    return { cta: "Included in your plan", href: DASHBOARD_BILLING_HREF };
  }

  return { cta: `Upgrade to ${tier.name}`, href: DASHBOARD_BILLING_HREF };
};

export const PricingPlans = () => {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    clientHydrationSnapshot,
    serverHydrationSnapshot,
  );
  const { data: session } = useSession();
  const { billing } = useBilling();
  const signedIn = hydrated && Boolean(session?.user);
  const currentPlan = hydrated ? billing.plan : "free";
  const currentPlanName = planDefinition(currentPlan).name;

  return (
    <div className={cn(styles.plans, "reveal")}>
      {signedIn && (
        <div className={styles.accountNote} role="status">
          <span>Signed in</span>
          <strong>{currentPlanName} plan</strong>
        </div>
      )}

      <div className={styles.cycle} role="group" aria-label="Billing cycle">
        {(["monthly", "annual"] as const).map((value) => (
          <button
            key={value}
            type="button"
            className={cn(styles.cycleBtn, cycle === value && styles.cycleActive)}
            onClick={() => setCycle(value)}
            aria-pressed={cycle === value}
          >
            {value === "monthly" ? "Monthly" : "Annual"}
            {value === "annual" && <span className={styles.save}>save 17%</span>}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {PRICING_TIERS.map((tier) => (
          <TierCard
            key={tier.id}
            tier={tier}
            cycle={cycle}
            action={actionForTier(tier, signedIn, currentPlan)}
          />
        ))}
      </div>
    </div>
  );
};
