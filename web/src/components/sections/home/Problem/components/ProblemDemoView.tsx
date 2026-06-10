import { ColorDemo } from "../demos/ColorDemo";
import { ContrastDemo } from "../demos/ContrastDemo";
import { KeyboardDemo } from "../demos/KeyboardDemo";
import { ScreenReaderDemo } from "../demos/ScreenReaderDemo";
import type { ProblemDemo } from "../types";

interface ProblemDemoViewProps {
  demo: ProblemDemo;
  /** Called once the visitor flips the demo into its fixed state. */
  onFixed: () => void;
}

export const ProblemDemoView = ({ demo, onFixed }: ProblemDemoViewProps) => {
  if (demo === "contrast") return <ContrastDemo onFixed={onFixed} />;
  if (demo === "screenReader") return <ScreenReaderDemo onFixed={onFixed} />;
  if (demo === "keyboard") return <KeyboardDemo onFixed={onFixed} />;

  return <ColorDemo onFixed={onFixed} />;
};
