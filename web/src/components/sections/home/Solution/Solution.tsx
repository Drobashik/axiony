import { Badge, Container, SectionEyebrow } from "@/components/ui";
import { Section } from "@/components/layout";
import cn from "classnames";
import { REPORT_ROWS, SOLUTIONS } from "@/lib/data/home";
import styles from "./Solution.module.scss";

/** Two-column "everything in one platform" + report card preview. */
export function Solution() {
  return (
    <Section>
      <Container>
        <div className={cn(styles.intro, "reveal")}>
          <SectionEyebrow>The solution</SectionEyebrow>
          <h2>
            One platform for your<br />
            entire team&apos;s a11y workflow.
          </h2>
        </div>

        <div className={styles.grid}>
          <div className={cn(styles.list, "reveal-left")}>
            {SOLUTIONS.map((item) => (
              <div key={item.title} className={styles.row}>
                <div className={styles.icon}>{item.icon}</div>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={cn(styles.report, "reveal-right")}>
            <div className={styles.reportHeader}>
              <span className={styles.reportFile}>axiony-report.json</span>
              <Badge severity="critical">3 critical</Badge>
              <Badge severity="serious">5 serious</Badge>
            </div>
            {REPORT_ROWS.map((row) => (
              <div key={row.issue} className={styles.reportRow}>
                <Badge severity={row.severity} />
                <div>
                  <div className={styles.issue}>{row.issue}</div>
                  <div className={styles.desc}>{row.description}</div>
                  <div className={styles.node}>{row.node}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
