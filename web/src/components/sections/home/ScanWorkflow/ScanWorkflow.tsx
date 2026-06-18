import { Section } from "@/components/layout";
import { Container, SectionEyebrow } from "@/components/ui";
import cn from "classnames";
import { ScanWorkflowPlayer } from "./components/ScanWorkflowPlayer";
import styles from "./ScanWorkflow.module.scss";

export const ScanWorkflow = () => (
  <Section id="workflow" className={styles.workflow}>
    <Container>
      <div className={cn(styles.header, "reveal")}>
        <SectionEyebrow>Workflow</SectionEyebrow>
        <h2>Start free in your terminal. Scale to the whole team.</h2>
        <p>
          The free CLI gives developers instant feedback locally and in CI. Axiony Cloud adds
          scheduled site-wide scans with full history, then a shared workspace wired into GitHub,
          GitLab and Slack.
        </p>
      </div>

      <ScanWorkflowPlayer />
    </Container>
  </Section>
);
