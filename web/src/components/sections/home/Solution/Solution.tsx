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
        <h2>Stop treating accessibility like a cleanup project.</h2>
        <p className={styles.lead}>
          Most tools hand you a 500-issue report and wish you luck. Axiony makes accessibility a{" "}
          <strong>continuous workflow</strong> instead. Your first scan becomes a{" "}
          <strong>baseline</strong> — existing issues are tracked as known debt, never blocking a
          release. From there, every <em>new</em> issue is flagged before it merges, and the whole
          team watches the score climb, release after release.
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
          Start free with the CLI. Add the cloud when you want it to remember, track, and protect
          what your team has fixed.
        </p>
        <div className={styles.ctaButtons}>
          <Button href="/docs">Start cloud scanning</Button>
          <Button href="/pricing" variant="secondary">
            See cloud pricing
          </Button>
        </div>
      </div>
    </Container>
  </Section>
);
