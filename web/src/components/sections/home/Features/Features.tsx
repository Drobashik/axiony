import { Container, Icon, SectionEyebrow } from "@/components/ui";
import { Section } from "@/components/layout";
import cn from "classnames";
import { FEATURES } from "@/lib/data/home";
import styles from "./Features.module.scss";

const ACCENT_TO_BORDER: Record<"blue" | "green" | "violet", string> = {
  blue:   "var(--blue-border)",
  green:  "oklch(0.72 0.18 145 / 0.30)",
  violet: "oklch(0.62 0.20 290 / 0.30)",
};

const ACCENT_TO_COLOR: Record<"blue" | "green" | "violet", string> = {
  blue:   "var(--blue)",
  green:  "var(--green)",
  violet: "var(--violet)",
};

export function Features() {
  return (
    <Section surface id="features">
      <Container>
        <div className={cn(styles.intro, "reveal")}>
          <SectionEyebrow>Features</SectionEyebrow>
          <h2>Everything your team needs.</h2>
          <p className={styles.lead}>
            From solo CLI usage to enterprise-scale team workflows, Axiony covers it all.
          </p>
        </div>

        <div className={styles.grid}>
          {FEATURES.map((feature, i) => (
            <article
              key={feature.title}
              className={cn(styles.card, "reveal", `d${(i % 3) + 1}`)}
            >
              <div
                className={styles.iconWrap}
                style={{
                  background: `var(--${feature.accent}-dim)`,
                  borderColor: ACCENT_TO_BORDER[feature.accent],
                }}
              >
                <Icon name={feature.icon} size={18} color={ACCENT_TO_COLOR[feature.accent]} />
              </div>
              <h4>{feature.title}</h4>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
