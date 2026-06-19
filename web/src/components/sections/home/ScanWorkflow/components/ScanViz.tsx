import { Terminal } from "@/components/ui";
import cn from "classnames";
import { SCAN_LINES } from "../data";
import { useTypewriter } from "../hooks/useTypewriter";
import styles from "../ScanWorkflow.module.scss";

interface ScanVizProps {
  start: boolean;
  reduce: boolean;
}

export const ScanViz = ({ start, reduce }: ScanVizProps) => {
  const typewriter = useTypewriter(SCAN_LINES, start && !reduce);
  const lines = reduce ? SCAN_LINES : typewriter.visible;

  return (
    <div className={styles.cli}>
      {/* The live terminal types line by line, so it grows — and on a phone
          the long lines wrap, so it grows a lot. A hidden full-output copy
          reserves that final (wrapped) height up front, so the panel never
          grows as it types or as you switch tabs → no jump on mobile. */}
      <div className={styles.cliTermStack}>
        <Terminal
          className={cn(styles.cliTerm, styles.cliTermGhost)}
          lines={SCAN_LINES}
          filename="acme-web · GitHub Actions"
          showCursor
        />
        <Terminal
          className={styles.cliTerm}
          lines={lines}
          filename="acme-web · GitHub Actions"
          showCursor={!reduce && start && !typewriter.complete}
          animated
        />
      </div>
      <div className={styles.cliFoot}>
        <span className={styles.cliTag}>free &amp; open-source · runs in any CI</span>
        <span className={cn(styles.handNote, styles.handNoteGreen)}>no account needed</span>
      </div>
    </div>
  );
};
