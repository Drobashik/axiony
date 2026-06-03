import { useEffect, useRef, useState } from "react";
import type { TerminalLine } from "@/components/ui";
import type { TypewriterState } from "../types";

export const useTypewriter = (lines: TerminalLine[], shouldStart: boolean): TypewriterState => {
  const [visible, setVisible] = useState<TerminalLine[]>([]);
  const [complete, setComplete] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!shouldStart || complete) return undefined;

    let timeoutId: number | undefined;

    const advance = () => {
      const index = indexRef.current;

      if (index >= lines.length) {
        setComplete(true);
        return;
      }

      setVisible((current) => [...current, lines[index]]);
      indexRef.current = index + 1;
      timeoutId = window.setTimeout(advance, index < 3 ? 90 : 70);
    };

    timeoutId = window.setTimeout(advance, 160);

    return () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [complete, lines, shouldStart]);

  return { visible, complete };
};
