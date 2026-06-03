import { Terminal } from "@/components/ui";
import { SCAN_LINES } from "../data";
import { useTypewriter } from "../hooks/useTypewriter";

interface ScanVizProps {
  start: boolean;
  reduce: boolean;
}

export const ScanViz = ({ start, reduce }: ScanVizProps) => {
  const typewriter = useTypewriter(SCAN_LINES, start && !reduce);
  const lines = reduce ? SCAN_LINES : typewriter.visible;

  return (
    <Terminal
      lines={lines}
      filename="acme-web · GitHub Actions"
      showCursor={!reduce && start && !typewriter.complete}
      animated
    />
  );
};
