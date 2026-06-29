import { Section } from "@/components/layout";
import { Container } from "@/components/ui";
import cn from "classnames";
import { TypewriterEyebrow } from "../components/TypewriterEyebrow";
import { PricingPlans } from "./components/PricingPlans";
import styles from "./PricingPreview.module.scss";

export const PricingPreview = () => (
  <Section id="pricing">
    <Container>
      <div className={cn(styles.intro, "reveal")}>
        <TypewriterEyebrow className={styles.eyebrow} text="// pricing" />
        <h2>
          Free to start.
          <br />
          <em className={styles.headingAccent}>Then pay by domains, not per seat.</em>
        </h2>
        <p className={styles.lead}>
          Every plan meters the same two things — domains you track and scans you run. The CLI is
          free and open-source today; upgrade anytime for hosted dashboards, scheduled scans, and
          team workflows.
        </p>
      </div>

      <PricingPlans />
    </Container>
  </Section>
);
