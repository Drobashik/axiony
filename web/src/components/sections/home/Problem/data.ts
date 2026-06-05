import type { ProblemItem } from "./types";

export const PROBLEMS: readonly ProblemItem[] = [
  {
    number: "01",
    title: "Text you can barely read",
    description: "Low-contrast text is one of the most common accessibility failures on the web.",
    headline: "Can you actually read this?",
    spec: "color-contrast",
    demo: "contrast",
  },
  {
    number: "02",
    title: "Buttons that say nothing",
    description:
      "Icon-only controls that a screen reader can only announce as 'button, button, button.'",
    headline: "What does a screen reader hear?",
    spec: "button-name",
    demo: "screenReader",
  },
  {
    number: "03",
    title: "Things you can't reach without a mouse",
    description: "Custom controls that keyboard users tab straight past and can never operate.",
    headline: "Reach 'Pay' using only the keyboard.",
    spec: "focus-order",
    demo: "keyboard",
  },
  {
    number: "04",
    title: "Meaning hidden in colour",
    description: "Status shown only through red and green disappears for colour-blind users.",
    headline: "Which of these services are down?",
    spec: "WCAG 1.4.1",
    demo: "color",
  },
];
