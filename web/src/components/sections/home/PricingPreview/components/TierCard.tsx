import { Button, Icon } from "@/components/ui";
import cn from "classnames";
import type { BillingCycle } from "@/lib/billing";
import type { PricingTier } from "../types";
import styles from "../PricingPreview.module.scss";

interface TierCardProps {
  tier: PricingTier;
  cycle: BillingCycle;
  action?: {
    cta: string;
    href: string;
  };
  actionPending?: boolean;
}

const formatScans = (count: number) => (count >= 1000 ? `${count / 1000}k` : `${count}`);

export const TierCard = ({ tier, cycle, action, actionPending = false }: TierCardProps) => {
  const free = tier.priceMonthly === 0;
  const annual = cycle === "annual";
  const tierAction = action ?? { cta: tier.cta, href: tier.href };
  const buttonVariant = tier.featured ? "primary" : "secondary";

  // Always show a per-month figure — it's the most comparable; annual just
  // shows the cheaper monthly-equivalent and how it's billed.
  const perMonth = free ? 0 : annual ? Math.round(tier.priceAnnual / 12) : tier.priceMonthly;
  const sub = free
    ? "free forever · no card"
    : annual
      ? `billed $${tier.priceAnnual}/yr · save 17%`
      : "billed monthly";

  return (
    <article
      className={cn(styles.card, styles[`card_${tier.accent}`], tier.featured && styles.featured)}
    >
      <div className={styles.head}>
        <span className={styles.name}>{tier.name}</span>
        <span className={styles.audience}>{tier.audience}</span>
      </div>

      <div className={styles.priceRow}>
        <span className={styles.price}>${perMonth}</span>
        <span className={styles.period}>{free ? "forever" : "/ mo"}</span>
      </div>
      <span className={styles.sub}>{sub}</span>

      {/* The two things every plan meters — domains and scans, front and centre. */}
      <div className={styles.meter}>
        <span className={styles.meterItem}>
          <strong>{tier.domains}</strong>
          {tier.domains === 1 ? "domain" : "domains"}
        </span>
        <span className={styles.meterDivider} aria-hidden="true" />
        <span className={styles.meterItem}>
          <strong>{formatScans(tier.scans)}</strong>
          scans / mo
        </span>
      </div>

      {actionPending ? (
        <Button variant={buttonVariant} block disabled className={styles.ctaPending}>
          Manage current plan
        </Button>
      ) : (
        <Button href={tierAction.href} variant={buttonVariant} block>
          {tierAction.cta}
        </Button>
      )}

      <ul className={styles.features}>
        {tier.inherits && <li className={styles.inherits}>{tier.inherits}</li>}
        {tier.highlights.map((highlight) => (
          <li key={highlight}>
            <Icon name="check" size={15} className={styles.check} />
            <span>{highlight}</span>
          </li>
        ))}
      </ul>
    </article>
  );
};
