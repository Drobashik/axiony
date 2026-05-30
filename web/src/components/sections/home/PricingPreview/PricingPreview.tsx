import { Button, Container, SectionEyebrow } from "@/components/ui";
import { Section } from "@/components/layout";
import cn from "classnames";
import { PRICING_PREVIEW } from "@/lib/data/home";
import styles from "./PricingPreview.module.scss";

export function PricingPreview() {
  return (
    <Section surface>
      <Container className={cn(styles.center, "reveal")}>
        <SectionEyebrow>Pricing</SectionEyebrow>
        <h2 className={styles.heading}>Start free. Scale when ready.</h2>
        <p className={styles.lead}>
          No credit card required. Upgrade when your team grows.
        </p>

        <div className={styles.cards}>
          {PRICING_PREVIEW.map((plan) => (
            <article
              key={plan.name}
              className={cn(styles.card, plan.featured && styles.featured)}
            >
              <div className={styles.name} data-featured={plan.featured}>{plan.name}</div>
              <div className={styles.price}>
                {plan.price}
                <span>{plan.period}</span>
              </div>
              <div className={styles.desc}>{plan.description}</div>
              <Button
                href="/pricing"
                variant={plan.featured ? "primary" : "secondary"}
                block
              >
                Get started
              </Button>
            </article>
          ))}
        </div>

        <div className={styles.viewAll}>
          <Button href="/pricing" variant="ghost">View full pricing →</Button>
        </div>
      </Container>
    </Section>
  );
}
