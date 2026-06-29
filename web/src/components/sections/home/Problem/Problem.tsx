import { Section } from "@/components/layout";
import { Container } from "@/components/ui";
import cn from "classnames";
import { TypewriterEyebrow } from "../components/TypewriterEyebrow";
import { ProblemExplorer } from "./components/ProblemExplorer";
import styles from "./Problem.module.scss";

export const Problem = () => (
  <Section surface>
    <Container>
      <div className={cn(styles.intro, "reveal")}>
        <TypewriterEyebrow className={styles.eyebrow} text="// the problem" />
        <h2 className={styles.heading}>
          You&apos;d fix these bugs in a minute.
          <br />
          <em className={styles.headingAccent}>You just never see them.</em>
        </h2>
        <p className={styles.lead}>
          Over a billion people browse with a disability — and hit walls like these every day. The
          four demos below are broken on purpose. Try each one, then flip the fix.
        </p>
      </div>

      <ProblemExplorer />
    </Container>
  </Section>
);
