import { Section } from "@/components/layout";
import { Button, Container, SectionEyebrow } from "@/components/ui";
import cn from "classnames";
import { BaselineDemo } from "./components/BaselineDemo";
import { LayerCard } from "./components/LayerCard";
import { SOLUTION_LAYERS } from "./data";
import styles from "./Solution.module.scss";

export const Solution = () => (
  <Section>
    <Container>
      <div className={cn(styles.intro, "reveal")}>
        <SectionEyebrow>Solution</SectionEyebrow>
        <h2>Accessibility that can only get better.</h2>
        <p className={styles.lead}>
          Other tools hand you a 500-issue report and wish you luck. Axiony
          draws a line — your <strong>baseline</strong> — and blocks every{" "}
          <em>new</em> issue at the pull request. Existing debt is tracked, not
          blocking. So your score moves one way: up.
        </p>
      </div>

      <div className={cn(styles.stageWrap, "reveal")}>
        <BaselineDemo />
      </div>

      <div className={cn(styles.layers, "reveal")}>
        {SOLUTION_LAYERS.map((layer, index) => (
          <LayerCard key={layer.name} layer={layer} index={index} />
        ))}
      </div>

      <div className={cn(styles.cta, "reveal")}>
        <p>
          Start free with the CLI. Upgrade to the cloud when you want it to
          remember, track, and protect what you&apos;ve fixed.
        </p>
        <div className={styles.ctaButtons}>
          <Button href="/docs">Start free with the CLI</Button>
          <Button href="/pricing" variant="secondary">
            See cloud pricing
          </Button>
        </div>
      </div>
    </Container>
  </Section>
);
