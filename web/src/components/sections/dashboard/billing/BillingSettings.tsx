"use client";

import { Button, Icon } from "@/components/ui";
import {
  entitlementsForPlan,
  formatPlanPrice,
  planDefinition,
  remainingScans,
  resetBilling,
} from "@/lib/billing";
import type { BillingPlan, BillingState } from "@/lib/billing";
import type { Workspace } from "@/lib/workspace";
import styles from "./BillingSettings.module.scss";

interface BillingSettingsProps {
  billing: BillingState;
  workspace: Workspace;
  onUpgrade: (plan: Exclude<BillingPlan, "free">) => void;
  onStartTutorial: () => void;
}

const renewalLabel = (iso: string | null): string => {
  if (!iso) return "No renewal";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(iso),
  );
};

const percentUsed = (used: number, limit: number): number =>
  Math.min(100, Math.round((used / Math.max(1, limit)) * 100));

export const BillingSettings = ({
  billing,
  workspace,
  onUpgrade,
  onStartTutorial,
}: BillingSettingsProps) => {
  const plan = planDefinition(billing.plan);
  const entitlements = entitlementsForPlan(billing.plan);
  const scansLeft = remainingScans(billing);
  const scanPercent = percentUsed(billing.usage.scansUsed, entitlements.monthlyScans);
  const domainPercent = percentUsed(workspace.projects.length, entitlements.domainLimit);
  const paid = billing.plan !== "free";

  return (
    <div className={styles.wrap} data-tour="settings-panel">
      <header className={styles.head}>
        <span className={styles.kicker}>Subscription</span>
        <h2>Plan and billing</h2>
        <p>
          This is a mock subscription state stored locally. It mirrors where Stripe or another
          billing API can plug in later.
        </p>
      </header>

      <section className={styles.tutorialPanel}>
        <div className={styles.tutorialIcon} aria-hidden="true">
          <Icon name="selector" size={17} />
        </div>
        <div className={styles.tutorialCopy}>
          <span className={styles.kicker}>Tutorial</span>
          <h3>Replay the dashboard walkthrough</h3>
          <p>Run the guided tour again any time you want to revisit the scan and triage flow.</p>
        </div>
        <Button variant="secondary" onClick={onStartTutorial}>
          Replay tutorial
          <Icon name="arrow" size={14} />
        </Button>
      </section>

      <section className={styles.current}>
        <div>
          <span className={styles.currentLabel}>Current plan</span>
          <h3>{plan.name}</h3>
          <p>{plan.limit}</p>
        </div>
        <div className={styles.price}>
          {formatPlanPrice(billing.plan, billing.cycle)}
          <span>{paid ? (billing.cycle === "annual" ? " / year" : " / month") : " forever"}</span>
        </div>
      </section>

      <div className={styles.metaGrid}>
        <span>
          <strong>Status</strong>
          {billing.status}
        </span>
        <span>
          <strong>Billing cycle</strong>
          {billing.cycle}
        </span>
        <span>
          <strong>Renews</strong>
          {renewalLabel(billing.renewalAt)}
        </span>
        <span>
          <strong>Usage resets</strong>
          {renewalLabel(billing.usage.periodEnd)}
        </span>
        <span>
          <strong>Checkout</strong>
          {billing.checkoutId ?? "Not started"}
        </span>
      </div>

      <section className={styles.usagePanel}>
        <div className={styles.usageHead}>
          <h3>Plan limits</h3>
          <span>{renewalLabel(billing.usage.periodEnd)} reset</span>
        </div>
        <div className={styles.usageGrid}>
          <article className={styles.usageCard}>
            <div className={styles.usageTopline}>
              <span>Monthly scans</span>
              <strong>{scanPercent}%</strong>
            </div>
            <div className={styles.usageBar} aria-hidden="true">
              <span style={{ width: `${scanPercent}%` }} />
            </div>
            <p>
              {billing.usage.scansUsed.toLocaleString()} used of{" "}
              {entitlements.monthlyScans.toLocaleString()}
              {paid && ` · ${scansLeft.toLocaleString()} left`}
            </p>
          </article>
          <article className={styles.usageCard}>
            <div className={styles.usageTopline}>
              <span>Domain projects</span>
              <strong>{domainPercent}%</strong>
            </div>
            <div className={styles.usageBar} aria-hidden="true">
              <span style={{ width: `${domainPercent}%` }} />
            </div>
            <p>
              {workspace.projects.length.toLocaleString()} saved of{" "}
              {entitlements.domainLimit.toLocaleString()}
            </p>
          </article>
        </div>
      </section>

      <section className={styles.next}>
        <div>
          <h3>{paid ? "Need more collaboration?" : "Ready to unlock the cloud workflow?"}</h3>
          <p>
            {billing.plan === "team"
              ? "Team is the highest mock tier. You can reset to Free for testing."
              : "Upgrade locally to preview the gated dashboard, scanner, and collaboration flows."}
          </p>
        </div>
        <div className={styles.actions}>
          {billing.plan === "free" && (
            <>
              <Button onClick={() => onUpgrade("pro")}>
                Upgrade to Pro
                <Icon name="arrow" size={14} />
              </Button>
              <Button variant="secondary" onClick={() => onUpgrade("team")}>
                Compare Team
              </Button>
            </>
          )}
          {billing.plan === "pro" && (
            <Button onClick={() => onUpgrade("team")}>
              Upgrade to Team
              <Icon name="arrow" size={14} />
            </Button>
          )}
          {paid && (
            <Button variant="secondary" onClick={resetBilling}>
              Reset to Free
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};
