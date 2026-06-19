"use client";

import { useState } from "react";
import cn from "classnames";
import type { BillingCycle } from "@/lib/billing";
import { PRICING_TIERS } from "../data";
import { TierCard } from "./TierCard";
import styles from "../PricingPreview.module.scss";

export const PricingPlans = () => {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  return (
    <div className={cn(styles.plans, "reveal")}>
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
          <TierCard key={tier.id} tier={tier} cycle={cycle} />
        ))}
      </div>
    </div>
  );
};
