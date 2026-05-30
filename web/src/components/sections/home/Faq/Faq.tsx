import { Container, FaqList, SectionEyebrow } from "@/components/ui";
import { Section } from "@/components/layout";
import cn from "classnames";
import { FAQS } from "@/lib/data/home";
import styles from "./Faq.module.scss";

export function Faq() {
  return (
    <Section surface>
      <Container variant="narrow">
        <header className={cn(styles.intro, "reveal")}>
          <SectionEyebrow>FAQ</SectionEyebrow>
          <h2>Common questions.</h2>
        </header>
        <FaqList items={[...FAQS]} />
      </Container>
    </Section>
  );
}
