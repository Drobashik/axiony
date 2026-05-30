import { Container, SectionEyebrow } from "@/components/ui";
import { Section } from "@/components/layout";
import cn from "classnames";
import { USE_CASES } from "@/lib/data/home";
import styles from "./UseCases.module.scss";

export function UseCases() {
  return (
    <Section surface>
      <Container>
        <header className={cn(styles.intro, "reveal")}>
          <SectionEyebrow>Use cases</SectionEyebrow>
          <h2>Built for every team.</h2>
        </header>

        <div className={styles.grid}>
          {USE_CASES.map((item, i) => (
            <article
              key={item.title}
              className={cn(styles.card, "reveal", `d${(i % 3) + 1}`)}
            >
              <div className={styles.icon}>{item.icon}</div>
              <h4>{item.title}</h4>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
