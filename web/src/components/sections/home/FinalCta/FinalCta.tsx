import { Button, Container, SectionEyebrow, Tag } from "@/components/ui";
import cn from "classnames";
import styles from "./FinalCta.module.scss";

export const FinalCta = () => (
  <section className={styles.cta}>
    <div className={styles.glow} aria-hidden="true" />
    <Container className={cn(styles.inner, "reveal")}>
      <SectionEyebrow className={styles.eyebrow}>Get started today</SectionEyebrow>
      <h2>
        Make accessibility part of<br />
        how your team ships.
      </h2>
      <p className={styles.lead}>
        Start free in your terminal today. Add cloud dashboards, scheduled scans,
        and pull-request checks as your team grows — no credit card required.
      </p>
      <div className={styles.actions}>
        <Button href="/scan" size="lg">Start cloud scanning</Button>
        <Button href="/dashboard" variant="secondary" size="lg">Preview the dashboard</Button>
      </div>
      <div className={styles.tags}>
        <Tag>✓ Free, open-source CLI</Tag>
        <Tag>✓ No credit card</Tag>
        <Tag>✓ Cloud in development</Tag>
      </div>
    </Container>
  </section>
);
