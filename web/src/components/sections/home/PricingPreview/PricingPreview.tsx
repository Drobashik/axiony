import { Section } from "@/components/layout";
import { Button, Container, SectionEyebrow } from "@/components/ui";
import cn from "classnames";
import { TierCard } from "./components/TierCard";
import { PRICING_TIERS } from "./data";
import styles from "./PricingPreview.module.scss";

export const PricingPreview = () => (
  <Section id="pricing">
    <Container>
      <div className={cn(styles.intro, "reveal")}>
        <SectionEyebrow>Pricing</SectionEyebrow>
        <h2>Start free. Upgrade when the team grows.</h2>
        <p className={styles.lead}>
          The CLI is free and open-source today. The cloud tiers below are planned — no credit card
          to get started.
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
