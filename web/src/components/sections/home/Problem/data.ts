import type { ProblemItem } from "./types";

export const PROBLEMS: readonly ProblemItem[] = [
  {
    rule: "color-contrast",
    sev: "critical",
    title: "Text you can barely read",
    short: "Contrast",
    description: "Low-contrast text is one of the most common accessibility failures on the web.",
    headline: "Can you actually read this?",
    demo: "contrast",
  },
  {
    rule: "button-name",
    sev: "serious",
    title: "Buttons that say nothing",
    short: "Button names",
    description:
      "Icon-only controls that a screen reader can only announce as 'button, button, button.'",
    headline: "What does a screen reader hear?",
    demo: "screenReader",
  },
  {
    rule: "focus-order",
    sev: "serious",
    title: "Things you can't reach without a mouse",
    short: "Keyboard",
    description: "Custom controls that keyboard users tab straight past and can never operate.",
    headline: "Reach 'Pay' using only the keyboard.",
    demo: "keyboard",
  },
  {
    rule: "use-of-color",
    sev: "moderate",
    title: "Meaning hidden in colour",
    short: "Colour-only",
    description: "Status shown only through red and green disappears for colour-blind users.",
    headline: "Which of these services are down?",
    demo: "color",
  },
];
