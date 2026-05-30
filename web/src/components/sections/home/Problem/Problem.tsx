import { Container, SectionEyebrow } from "@/components/ui";
import { Section } from "@/components/layout";
import cn from "classnames";
import { PROBLEMS } from "@/lib/data/home";
import styles from "./Problem.module.scss";

/** "Accessibility debt compounds quietly" — 4-up problem grid. */
export function Problem() {
  return (
    <Section surface>
      <Container>
        <div className={cn(styles.intro, "reveal")}>
          <SectionEyebrow>The problem</SectionEyebrow>
          <h2>Accessibility debt compounds quietly.</h2>
          <p className={styles.lead}>
            Most teams discover accessibility issues after launch — during audits,
            legal reviews, or user complaints.
          </p>
        </div>

        {/* The whole grid is a single reveal target — fading the
            container as one block keeps the cell dividers from
            flickering, which used to happen when each item animated
            its own transform inside the grid. */}
        <div className={cn(styles.grid, "reveal")}>
          {PROBLEMS.map((item, i) => (
            <article
              key={item.number}
              className={cn(styles.item, styles.itemReveal)}
              style={{ animationDelay: `${0.1 + i * 0.08}s` }}
            >
              <div className={styles.number}>{item.number}</div>
              <h4>{item.title}</h4>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
