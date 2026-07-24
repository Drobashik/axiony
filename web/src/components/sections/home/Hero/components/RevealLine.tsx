import { Fragment } from "react";
import styles from "../Hero.module.scss";

interface RevealLineProps {
  text: string;
  startDelay: number;
}

export const RevealLine = ({ text, startDelay }: RevealLineProps) => {
  const perChar = 0.012;
  const words = text.split(" ");
  let cumulativeIndex = 0;

  return (
    <>
      {words.map((word, wordIndex) => {
        const wordSpans = Array.from(word).map((char, charIndex) => {
          const span = (
            <span
              key={charIndex}
              className={styles.char}
              style={{ animationDelay: `${startDelay + cumulativeIndex * perChar}s` }}
            >
              {char}
            </span>
          );

          cumulativeIndex += 1;
          return span;
        });

        return (
          <Fragment key={wordIndex}>
            <span className={styles.word}>{wordSpans}</span>
            {wordIndex < words.length - 1 ? " " : null}
          </Fragment>
        );
      })}
    </>
  );
};
