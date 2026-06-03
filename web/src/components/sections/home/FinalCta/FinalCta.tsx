import { Button, Container, SectionEyebrow, Tag } from "@/components/ui";
import cn from "classnames";
import styles from "./FinalCta.module.scss";

export const FinalCta = () => (
  <section className={styles.cta}>
    <div className={styles.glow} aria-hidden="true" />
    <Container className={cn(styles.inner, "reveal")}>
      <SectionEyebrow className={styles.eyebrow}>Get started today</SectionEyebrow>
      <h2>
        Your team&apos;s accessibility<br />
        command center.
      </h2>
      <p className={styles.lead}>
        Monitor URLs, scan components, fix issues together — free to start, no credit
        card required.
      </p>
      <div className={styles.actions}>
        <Button href="/scan" size="lg">Start scanning free</Button>
        <Button href="/dashboard" variant="secondary" size="lg">View dashboard demo</Button>
      </div>
      <div className={styles.tags}>
        <Tag>✓ Free tier available</Tag>
        <Tag>✓ No credit card</Tag>
        <Tag>✓ CLI + web dashboard</Tag>
      </div>
    </Container>
  </section>
);
