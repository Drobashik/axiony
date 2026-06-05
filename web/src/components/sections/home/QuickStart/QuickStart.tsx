import { Section } from "@/components/layout";
import { Button, Container, SectionEyebrow } from "@/components/ui";
import cn from "classnames";
import { CommandLine } from "./components/CommandLine";
import { STEPS } from "./data";
import styles from "./QuickStart.module.scss";

export const QuickStart = () => (
  <Section surface id="quickstart">
    <Container>
      <div className={cn(styles.intro, "reveal")}>
        <SectionEyebrow>Quick start</SectionEyebrow>
        <h2>Your first scan, in under a minute.</h2>
        <p className={styles.lead}>Free, open-source, no account. Copy, paste, scan.</p>
      </div>

      <div className={cn(styles.grid, "reveal")}>
        {STEPS.map((step) => (
          <article key={step.n} className={cn(styles.step, styles[`accent_${step.accent}`])}>
            <div className={styles.stepHead}>
              <span className={styles.num}>{step.n}</span>
              <span className={styles.title}>{step.title}</span>
            </div>
            <CommandLine command={step.command} />
            <p className={styles.note}>{step.note}</p>
          </article>
        ))}
      </div>

      <div className={cn(styles.footer, "reveal")}>
        <span className={styles.npx}>
          No install needed — <code>{"npx axiony-cli scan <url>"}</code>
        </span>
        <Button href="/docs" variant="secondary">
          Read the docs →
        </Button>
      </div>
    </Container>
  </Section>
);
