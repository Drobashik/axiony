import { Section } from "@/components/layout";
import { Container } from "@/components/ui";
import cn from "classnames";
import { ScanWorkflowPlayer } from "./components/ScanWorkflowPlayer";
import styles from "./ScanWorkflow.module.scss";

export const ScanWorkflow = () => (
  <Section id="workflow" className={styles.workflow}>
    <Container>
      <div className={cn(styles.header, "reveal")}>
        <span className={styles.eyebrow}>{"// from your terminal to your team"}</span>
        <h2>
          Run it free in your terminal —
          <br />
          <em className={styles.headingAccent}>then share one baseline with the team.</em>
        </h2>
        <p>
          The CLI is free and runs in any pipeline. The cloud remembers everything — scheduled
          scans, full history, an AI fix for every issue. And one shared baseline keeps the whole
          team&apos;s score moving the same way: up.
        </p>
      </div>

      <ScanWorkflowPlayer />
    </Container>
  </Section>
);
