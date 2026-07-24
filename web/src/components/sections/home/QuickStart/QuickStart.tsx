import { Section } from "@/components/layout";
import { Container } from "@/components/ui";
import cn from "classnames";
import { TypewriterEyebrow } from "../components/TypewriterEyebrow";
import { DeferredHomeWidget } from "../components/DeferredHomeWidget";
import styles from "./QuickStartIntro.module.scss";

export const QuickStart = () => (
  <Section surface id="quickstart" className={styles.section}>
    <Container variant="wide">
      <div className={cn(styles.intro, "reveal")}>
        <TypewriterEyebrow className={styles.eyebrow} text="// quick start" />
        <h2>
          Your first scan,
          <br />
          <em className={styles.headingAccent}>in under a minute.</em>
        </h2>
        <p className={styles.lead}>Free, open-source, no account. Copy a line, paste it, scan.</p>
      </div>

      <DeferredHomeWidget widget="quickstart" />
    </Container>
  </Section>
);
