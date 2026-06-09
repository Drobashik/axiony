"use client";

import { Button, Icon } from "@/components/ui";
import { planDefinition } from "@/lib/billing";
import type { BillingPlan } from "@/lib/billing";
import styles from "./BillingGate.module.scss";

interface BillingGateProps {
  requiredPlan: Exclude<BillingPlan, "free">;
  title: string;
  text: string;
  features: string[];
  onUpgrade: (plan: Exclude<BillingPlan, "free">) => void;
}

export const BillingGate = ({
  requiredPlan,
  title,
  text,
  features,
  onUpgrade,
}: BillingGateProps) => {
  const plan = planDefinition(requiredPlan);

  return (
    <section className={styles.gate}>
      <span className={styles.icon} aria-hidden="true">
        <Icon name={requiredPlan === "team" ? "team" : "bolt"} size={24} />
      </span>
      <span className={styles.kicker}>{plan.name} feature</span>
      <h2>{title}</h2>
      <p>{text}</p>
      <div className={styles.features}>
        {features.map((feature) => (
          <span key={feature}>
            <Icon name="check" size={13} />
            {feature}
          </span>
        ))}
      </div>
      <Button onClick={() => onUpgrade(requiredPlan)}>
        Upgrade to {plan.name}
        <Icon name="arrow" size={14} />
      </Button>
    </section>
  );
};

interface ScannerUpgradeCardProps {
  onUpgrade: (plan: Exclude<BillingPlan, "free">) => void;
}

export const ScannerUpgradeCard = ({ onUpgrade }: ScannerUpgradeCardProps) => (
  <aside className={styles.scannerCard}>
    <div>
      <span className={styles.kicker}>Unlock Pro scanner</span>
      <h3>Automate the work after each scan</h3>
      <p>
        Schedule recurring scans, keep full history, export reports, and get alerts when a page
        regresses.
      </p>
    </div>
    <div className={styles.scannerActions}>
      <Button size="sm" onClick={() => onUpgrade("pro")}>
        Upgrade
      </Button>
      <Button size="sm" variant="secondary" onClick={() => onUpgrade("team")}>
        Compare Team
      </Button>
    </div>
  </aside>
);
