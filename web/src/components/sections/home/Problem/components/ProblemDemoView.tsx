import { ColorDemo } from "../demos/ColorDemo";
import { ContrastDemo } from "../demos/ContrastDemo";
import { KeyboardDemo } from "../demos/KeyboardDemo";
import { ScreenReaderDemo } from "../demos/ScreenReaderDemo";
import type { ProblemDemo } from "../types";

interface ProblemDemoViewProps {
  demo: ProblemDemo;
}

export const ProblemDemoView = ({ demo }: ProblemDemoViewProps) => {
  if (demo === "contrast") return <ContrastDemo />;
  if (demo === "screenReader") return <ScreenReaderDemo />;
  if (demo === "keyboard") return <KeyboardDemo />;

  return <ColorDemo />;
};
