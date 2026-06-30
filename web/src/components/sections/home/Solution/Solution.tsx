import { Section } from "@/components/layout";
import { Button, Container, Icon } from "@/components/ui";
import cn from "classnames";
import { TypewriterEyebrow } from "../components/TypewriterEyebrow";
import { FixCommandCenter } from "./components/FixCommandCenter";
import { SOLUTION_STATS, SOLUTION_STEPS } from "./data";
import styles from "./Solution.module.scss";

export const Solution = () => (
  <Section className={styles.section}>
    <Container variant="wide">
      <div className={styles.hero}>
        <div className={cn(styles.intro, "reveal")}>
          <TypewriterEyebrow className={styles.eyebrow} text="// the fix" />
          <h2 className={styles.heading}>
            Fix accessibility like
            <br />
            <em className={styles.headingAccent}>a product workflow.</em>
          </h2>
          <p className={styles.lead}>
            Axiony connects scans, AI fixes, issue tracking, GitHub/GitLab checks, and a dashboard
            that shows whether your baseline is actually improving.
          </p>
          <div className={styles.heroActions}>
            <Button href="/scan" size="lg">
              Scan your site now
              <Icon name="arrow" size={16} />
            </Button>
            <Button href="#pricing" variant="secondary" size="lg">
              See pricing
            </Button>
          </div>
        </div>

        <div className={cn(styles.statGrid, "reveal d1")} aria-label="Axiony product highlights">
          {SOLUTION_STATS.map((stat) => (
            <article key={stat.value} className={styles.statCard}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </article>
          ))}
        </div>
      </div>

      <div className={cn(styles.commandReveal, "reveal d2")}>
        <FixCommandCenter />
      </div>

      <ol className={cn(styles.steps, "reveal d3")} aria-label="How Axiony helps teams fix issues">
        {SOLUTION_STEPS.map((step) => (
          <li key={step.tag} className={styles.step}>
            <code className={styles.stepTag}>{step.tag}</code>
            <strong>{step.title}</strong>
            <span>{step.text}</span>
          </li>
        ))}
      </ol>
    </Container>
  </Section>
);
