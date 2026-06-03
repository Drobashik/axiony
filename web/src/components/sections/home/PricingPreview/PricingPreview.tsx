import { Button, Container, Icon, SectionEyebrow } from "@/components/ui";
import { Section } from "@/components/layout";
import cn from "classnames";
import { PRICING_TIERS, type PricingTier } from "@/lib/data/home";
import styles from "./PricingPreview.module.scss";

export function PricingPreview() {
  return (
    <Section id="pricing">
      <Container>
        <div className={cn(styles.intro, "reveal")}>
          <SectionEyebrow>Pricing</SectionEyebrow>
          <h2>Start free. Upgrade when the team grows.</h2>
          <p className={styles.lead}>
            The CLI is free and open-source today. The cloud tiers below are
            planned — no credit card to get started.
          </p>
        </div>

        <div className={cn(styles.grid, "reveal")}>
          {PRICING_TIERS.map((tier) => (
            <TierCard key={tier.name} tier={tier} />
          ))}
        </div>

        <div className={cn(styles.viewAll, "reveal")}>
          <Button href="/pricing" variant="ghost">
            See full pricing →
          </Button>
        </div>
      </Container>
    </Section>
  );
}

function TierCard({ tier }: { tier: PricingTier }) {
  return (
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
}
