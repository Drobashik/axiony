import { Section } from "@/components/layout";
import { Container } from "@/components/ui";
import cn from "classnames";
import { TypewriterEyebrow } from "../components/TypewriterEyebrow";
import { ProblemExplorer } from "./components/ProblemExplorer";
import styles from "./Problem.module.scss";

export const Problem = () => (
  <Section surface>
    <Container variant="wide">
      <div className={cn(styles.intro, "reveal")}>
        <TypewriterEyebrow className={styles.eyebrow} text="// the problem" />
        <h2 className={styles.heading}>
          You&apos;d fix these fast.
          <br />
          <em className={styles.headingAccent}>They just stay hidden.</em>
        </h2>
        <p className={styles.lead}>
          Accessibility barriers hide in everyday UI. Try the four broken demos, then flip each fix.
        </p>
      </div>

      <ProblemExplorer />
    </Container>
  </Section>
);
