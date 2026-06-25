import { Button, Container, Icon } from "@/components/ui";
import { WorkspaceCta } from "../WorkspaceCta";
import cn from "classnames";
import styles from "./FinalCta.module.scss";

const REASSURANCES = ["Free, open-source CLI", "No credit card", "Cloud in development"] as const;

export const FinalCta = () => (
  <section className={styles.cta}>
    <div className={styles.glow} aria-hidden="true" />
    <Container className={cn(styles.inner, "reveal")}>
      <span className={styles.eyebrow}>{"// get started today"}</span>
      <h2>
        Make accessibility part of
        <br />
        <em className={styles.headingAccent}>how your team ships.</em>
      </h2>
      <p className={styles.lead}>
        Start free in your terminal today. Add cloud dashboards, scheduled scans, and pull-request
        checks as your team grows — no credit card.
      </p>

      <div className={styles.actions}>
        <Button href="/scan" size="lg">
          Scan your site now
          <Icon name="arrow" size={16} />
        </Button>
        <WorkspaceCta />
      </div>

      <ul className={styles.checks}>
        {REASSURANCES.map((item) => (
          <li key={item}>
            <Icon name="check" size={15} />
            {item}
          </li>
        ))}
      </ul>
    </Container>
  </section>
);
