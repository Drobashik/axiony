import { Container, SectionEyebrow } from "@/components/ui";
import { Section } from "@/components/layout";
import cn from "classnames";
import { TESTIMONIALS } from "@/lib/data/home";
import styles from "./Testimonials.module.scss";

const ACCENT_TO_VAR = {
  blue:   "var(--blue)",
  green:  "var(--green)",
  violet: "var(--violet)",
} as const;

export function Testimonials() {
  return (
    <Section>
      <Container>
        <header className={cn(styles.intro, "reveal")}>
          <SectionEyebrow>What teams say</SectionEyebrow>
          <h2>Developers love Axiony.</h2>
        </header>

        <div className={styles.grid}>
          {TESTIMONIALS.map((t, i) => (
            <figure
              key={t.name}
              className={cn(styles.card, "reveal", `d${i + 1}`)}
            >
              <div className={styles.quoteMark} aria-hidden="true">❝</div>
              <blockquote className={styles.quote}>“{t.quote}”</blockquote>
              <figcaption className={styles.author}>
                <span
                  className={styles.avatar}
                  style={{
                    background: `${ACCENT_TO_VAR[t.accent]}22`,
                    color: ACCENT_TO_VAR[t.accent],
                  }}
                >
                  {t.initials}
                </span>
                <span className={styles.meta}>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </Section>
  );
}
