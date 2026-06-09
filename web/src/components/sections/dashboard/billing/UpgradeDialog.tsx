"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import cn from "classnames";
import { Button, Icon } from "@/components/ui";
import {
  PLAN_DEFINITIONS,
  canAccessPlan,
  formatPlanPrice,
  planDefinition,
  upgradePlan,
} from "@/lib/billing";
import type { BillingCycle, BillingPlan } from "@/lib/billing";
import styles from "./UpgradeDialog.module.scss";

interface UpgradeDialogProps {
  currentPlan: BillingPlan;
  initialPlan?: Exclude<BillingPlan, "free">;
  onClose: () => void;
}

type Step = "plans" | "confirm" | "success";

const CloseIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const CHECK_ICON = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const UpgradeDialog = ({
  currentPlan,
  initialPlan = "pro",
  onClose,
}: UpgradeDialogProps) => {
  const [step, setStep] = useState<Step>("plans");
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [selectedPlan, setSelectedPlan] = useState<Exclude<BillingPlan, "free">>(initialPlan);
  const [processing, setProcessing] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const selected = planDefinition(selectedPlan);
  const price = formatPlanPrice(selectedPlan, cycle);

  const unlockedFeatures = useMemo(
    () =>
      selected.features
        .filter((feature) => !canAccessPlan(currentPlan, feature.tier))
        .map((feature) => feature.label),
    [currentPlan, selected.features],
  );

  useEffect(() => {
    dialogRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const confirmUpgrade = () => {
    if (processing) return;
    setProcessing(true);
    window.setTimeout(() => {
      upgradePlan(selectedPlan, cycle);
      setProcessing(false);
      setStep("success");
    }, 650);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label="Upgrade Axiony plan"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.head}>
          <div>
            <span className={styles.kicker}>Mock checkout</span>
            <h2 className={styles.title}>
              {step === "success" ? `${selected.name} is active` : "Upgrade Axiony"}
            </h2>
            <p className={styles.lead}>
              {step === "success"
                ? "Your workspace now uses the selected mock subscription. No payment was charged."
                : "Compare plans, choose what unlocks your workflow, and activate a local mock subscription."}
            </p>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </header>

        {step === "plans" && (
          <>
            <div className={styles.cycle} role="group" aria-label="Billing cycle">
              {(["monthly", "annual"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={cn(styles.cycleButton, cycle === value && styles.cycleActive)}
                  onClick={() => setCycle(value)}
                >
                  {value === "monthly" ? "Monthly" : "Annual"}
                  {value === "annual" && <span>Save 17%</span>}
                </button>
              ))}
            </div>

            <div className={styles.plans}>
              {PLAN_DEFINITIONS.map((plan) => {
                const current = plan.id === currentPlan;
                const selectable = plan.id !== "free";
                const selectedThis = plan.id === selectedPlan;
                const annualEquivalent = Math.round(plan.priceAnnual / 12);

                return (
                  <button
                    key={plan.id}
                    type="button"
                    className={cn(
                      styles.plan,
                      styles[`plan_${plan.accent}`],
                      selectedThis && styles.planSelected,
                      current && styles.planCurrent,
                    )}
                    onClick={() =>
                      selectable && setSelectedPlan(plan.id as Exclude<BillingPlan, "free">)
                    }
                    disabled={!selectable}
                  >
                    <span className={styles.planTop}>
                      <span>
                        <span className={styles.planName}>{plan.name}</span>
                        <span className={styles.planAudience}>{plan.audience}</span>
                      </span>
                      {current && <span className={styles.currentPill}>Current</span>}
                      {plan.featured && !current && (
                        <span className={styles.bestPill}>Best fit</span>
                      )}
                    </span>
                    <span className={styles.planPrice}>
                      {formatPlanPrice(plan.id, cycle)}
                      <span>
                        {plan.id === "free"
                          ? " forever"
                          : cycle === "annual"
                            ? " / year"
                            : " / month"}
                      </span>
                    </span>
                    {plan.id !== "free" && cycle === "annual" && (
                      <span className={styles.planHint}>
                        About ${annualEquivalent}/month billed yearly
                      </span>
                    )}
                    <span className={styles.planLimit}>{plan.limit}</span>
                    <span className={styles.featureList}>
                      {plan.features.map((feature) => (
                        <span key={feature.label} className={styles.feature}>
                          {CHECK_ICON}
                          {feature.label}
                        </span>
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>

            <footer className={styles.actions}>
              <Button variant="secondary" onClick={onClose}>
                Not now
              </Button>
              <Button onClick={() => setStep("confirm")}>
                Continue with {selected.name}
                <Icon name="arrow" size={14} />
              </Button>
            </footer>
          </>
        )}

        {step === "confirm" && (
          <div className={styles.confirm}>
            <section className={styles.summary}>
              <span className={styles.summaryLabel}>Selected plan</span>
              <span className={styles.summaryPlan}>{selected.name}</span>
              <span className={styles.summaryPrice}>
                {price}
                <span>{cycle === "annual" ? " / year" : " / month"}</span>
              </span>
              <span className={styles.summaryNote}>
                This is a local mock checkout. No card is collected and no external billing request
                is sent.
              </span>
            </section>

            <section className={styles.unlocks}>
              <span className={styles.summaryLabel}>Unlocks now</span>
              {(unlockedFeatures.length > 0
                ? unlockedFeatures
                : selected.features.map((f) => f.label)
              ).map((feature) => (
                <span key={feature} className={styles.unlockItem}>
                  {CHECK_ICON}
                  {feature}
                </span>
              ))}
            </section>

            <footer className={styles.actions}>
              <Button variant="secondary" onClick={() => setStep("plans")} disabled={processing}>
                Back
              </Button>
              <Button onClick={confirmUpgrade} disabled={processing}>
                {processing ? "Activating..." : `Activate ${selected.name}`}
              </Button>
            </footer>
          </div>
        )}

        {step === "success" && (
          <div className={styles.success}>
            <span className={styles.successIcon}>
              <Icon name="check" size={24} />
            </span>
            <h3>{selected.name} features are unlocked</h3>
            <p>
              Reports, alerts, collaboration gates, and scanner add-ons now reflect your mock
              subscription locally.
            </p>
            <Button onClick={onClose}>Back to dashboard</Button>
          </div>
        )}
      </div>
    </div>
  );
};
