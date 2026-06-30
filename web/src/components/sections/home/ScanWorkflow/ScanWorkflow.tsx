import { Section } from "@/components/layout";
import { Container } from "@/components/ui";
import cn from "classnames";
import { TypewriterEyebrow } from "../components/TypewriterEyebrow";
import { WorkflowBoard } from "./components/WorkflowBoard";
import styles from "./ScanWorkflow.module.scss";

export const ScanWorkflow = () => (
  <Section id="workflow" className={styles.workflow}>
    <Container variant="wide">
      <div className={cn(styles.header, "reveal")}>
        <TypewriterEyebrow className={styles.eyebrow} text="// from your terminal to your team" />
        <h2>
          Run, review, fix
          <br />
          <em className={styles.headingAccent}>without losing context.</em>
        </h2>
        <p>
          Start from the CLI, CI, or Cloud. Axiony saves the baseline, turns findings into dashboard
          work, and gates regressions in every PR.
        </p>
      </div>

      <WorkflowBoard />
    </Container>
  </Section>
);
