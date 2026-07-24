import { Section } from "@/components/layout";
import { Container } from "@/components/ui";
import cn from "classnames";
import { TypewriterEyebrow } from "../components/TypewriterEyebrow";
import { DeferredHomeWidget } from "../components/DeferredHomeWidget";
import styles from "./PricingPreviewIntro.module.scss";

export const PricingPreview = () => (
  <Section id="pricing" className={styles.section}>
    <Container>
      <div className={cn(styles.intro, "reveal")}>
        <TypewriterEyebrow className={styles.eyebrow} text="// pricing" />
        <h2>
          Free to start.
          <br />
          <em className={styles.headingAccent}>Then add cloud, CI, and your team.</em>
        </h2>
        <p className={styles.lead}>
          The open-source CLI is free. Paid adds cloud scans, CI checks, and team workflows —
          metered by domains and scans, not seats.
        </p>
      </div>

      <DeferredHomeWidget widget="pricing" />
    </Container>
  </Section>
);
