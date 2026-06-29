import { Section } from "@/components/layout";
import { Button, Container, Icon } from "@/components/ui";
import cn from "classnames";
import { TypewriterEyebrow } from "../components/TypewriterEyebrow";
import { ReleaseSim } from "./components/ReleaseSim";
import { SOLUTION_STEPS } from "./data";
import styles from "./Solution.module.scss";

export const Solution = () => (
  <Section>
    <Container>
      <div className={cn(styles.intro, "reveal")}>
        <TypewriterEyebrow className={styles.eyebrow} text="// the fix" />
        <h2 className={styles.heading}>
          Your score gets one new rule:
          <br />
          <em className={styles.headingAccent}>it only goes up.</em>
        </h2>
        <p className={styles.lead}>
          The first scan locks today as your baseline — old issues become tracked debt, new ones
          don&apos;t merge. Below are the same ten releases shipped twice, with the gate and
          without. Press the button and watch them drift apart.
        </p>
      </div>

      <div className="reveal">
        <ReleaseSim />
      </div>

      <ol className={cn(styles.steps, "reveal")} aria-label="How the baseline works">
        {SOLUTION_STEPS.map((step) => (
          <li key={step.tag} className={styles.step}>
            <code className={styles.stepTag}>{step.tag}</code>
            <span className={styles.stepText}>{step.text}</span>
          </li>
        ))}
      </ol>

      <div className={cn(styles.cta, "reveal")}>
        <div className={styles.ctaButtons}>
          <Button href="/scan">
            Scan your site now
            <Icon name="arrow" size={16} />
          </Button>
          <Button href="#pricing" variant="secondary">
            See pricing
          </Button>
        </div>
      </div>
    </Container>
  </Section>
);
