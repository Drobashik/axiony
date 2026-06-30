import { Section } from "@/components/layout";
import { Button, Container } from "@/components/ui";
import cn from "classnames";
import { TypewriterEyebrow } from "../components/TypewriterEyebrow";
import { FaqList } from "./components/FaqList";
import styles from "./Faq.module.scss";

export const Faq = () => (
  <Section surface id="faq" className={styles.section}>
    <Container>
      <div className={styles.grid}>
        <div className={cn(styles.aside, "reveal-left")}>
          <TypewriterEyebrow className={styles.eyebrow} text="// faq" />
          <h2>
            Your launch
            <br />
            <em className={styles.headingAccent}>checkpoints.</em>
          </h2>
          <p className={styles.asideLead}>
            The questions teams usually ask right before accessibility becomes part of their release
            flow.
          </p>

          <div className={styles.help}>
            <span className={styles.helpLabel}>Still curious?</span>
            <div className={styles.helpLinks}>
              <Button href="/docs" variant="secondary" size="sm">
                Read the docs
              </Button>
              <Button
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                variant="ghost"
                size="sm"
              >
                Ask on GitHub
              </Button>
            </div>
          </div>
        </div>

        <FaqList />
      </div>
    </Container>
  </Section>
);
