import { Button, Icon } from "@/components/ui";
import cn from "classnames";
import type { PricingTier } from "../types";
import styles from "../PricingPreview.module.scss";

interface TierCardProps {
  tier: PricingTier;
}

export const TierCard = ({ tier }: TierCardProps) => (
  <article
    className={cn(
      styles.card,
      styles[`card_${tier.accent}`],
      tier.featured && styles.featured,
    )}
  >
    {tier.featured && <span className={styles.popular}>Most popular</span>}

    <div className={styles.head}>
      <span className={styles.name}>
        {tier.name}
        {tier.planned && <span className={styles.planned}>Planned</span>}
      </span>
      <span className={styles.audience}>{tier.audience}</span>
    </div>

    <div className={styles.priceRow}>
      <span className={styles.price}>{tier.price}</span>
      <span className={styles.period}>{tier.period}</span>
    </div>

    <span className={styles.limit}>{tier.limit}</span>

    <Button href="/pricing" variant={tier.featured ? "primary" : "secondary"} block>
      {tier.cta}
    </Button>

    <ul className={styles.features}>
      {tier.inherits && <li className={styles.inherits}>{tier.inherits}</li>}
      {tier.features.map((feature) => (
        <li key={feature}>
          <Icon name="check" size={15} className={styles.check} />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  </article>
);
