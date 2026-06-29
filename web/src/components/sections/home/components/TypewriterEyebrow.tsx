import type { CSSProperties } from "react";

interface TypewriterEyebrowProps {
  className?: string;
  text: string;
}

const classNames = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(" ");

export const TypewriterEyebrow = ({ className, text }: TypewriterEyebrowProps) => {
  const duration = Math.min(1.35, Math.max(0.58, text.length * 0.035));
  const delay = 0.12;

  return (
    <span
      className={classNames(className, "typed-eyebrow")}
      style={
        {
          "--typed-eyebrow-cursor-end": `${delay + duration + 0.12}s`,
          "--typed-eyebrow-delay": `${delay}s`,
          "--typed-eyebrow-duration": `${duration}s`,
          "--typed-eyebrow-steps": text.length,
          "--typed-eyebrow-width": `${text.length}ch`,
        } as CSSProperties
      }
      aria-label={text}
    >
      <span className="typed-eyebrow__text" aria-hidden="true">
        {text}
      </span>
      <span className="typed-eyebrow__cursor" aria-hidden="true" />
    </span>
  );
};
