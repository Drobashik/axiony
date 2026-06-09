import type { Severity } from "@/types";

// =====================================================================
// Synthetic accessibility issues for the scan demo (/scan).
// `generateIssues(url)` returns a deterministic-but-varied subset per
// URL — the same URL always produces the same report.
//
// TODO(cloud): replace `generateIssues` with the real cloud scan
// response once the hosted scanner is available.
// =====================================================================

export interface IssueTemplate {
  id: string;
  severity: Severity;
  title: string;
  description: string;
  rule: string;
  wcag: string[];
  nodes: string[];
  fix: string;
  whatHappened?: string;
  whyItMatters?: string;
  suggestedFix?: string;
  beforeCode?: string;
  afterCode?: string;
  /** Optional code snippet illustrating the fix (rendered by /scan). */
  code?: string;
}

export interface Issue extends IssueTemplate {
  /** Stagger delay (ms) for the entrance animation. */
  animationDelay: number;
}

const ISSUE_POOL: IssueTemplate[] = [
  {
    id: "image-alt",
    severity: "critical",
    title: "Images missing alternative text",
    description:
      "Images must have text alternatives that describe their content or purpose. Screen readers cannot convey image content without alt attributes.",
    rule: "wcag-1.1.1",
    wcag: ["1.1.1 Non-text Content (A)"],
    nodes: [
      '<img src="hero-banner.jpg" class="hero__img">',
      '<img src="team-photo.png" loading="lazy">',
      '<img src="logo-footer.svg">',
    ],
    whatHappened:
      "3 images on this page render without an alt attribute, so assistive technology falls back to announcing the file name — or nothing at all.",
    whyItMatters:
      "Screen reader users get no idea what the image shows. For meaningful images (logos, charts, product photos) the information is simply lost; for image-based links or buttons the action becomes impossible to understand.",
    fix: 'Add a descriptive alt attribute to each image. For decorative images, use alt="" to hide them from assistive technology.',
    suggestedFix:
      'Add a concise alt value that conveys the image\'s content or purpose. If an image is purely decorative, use alt="" so screen readers skip it. Never use the file name as the alt text.',
    beforeCode: `<img src="hero-banner.jpg" class="hero__img">`,
    afterCode: `<img
  src="hero-banner.jpg"
  class="hero__img"
  alt="Team collaborating in an open-plan office"
/>

<!-- decorative image: empty alt hides it from screen readers -->
<img src="divider.svg" alt="" />`,
  },
  {
    id: "color-contrast",
    severity: "serious",
    title: "Insufficient color contrast ratio",
    description:
      "Text must have a contrast ratio of at least 4.5:1 against its background for normal text (3:1 for large text). Current ratio: 2.8:1.",
    rule: "wcag-1.4.3",
    wcag: ["1.4.3 Contrast Minimum (AA)"],
    nodes: [
      '<p class="card__meta" style="color: #999">Published 3 days ago</p>',
      '<span class="nav__link--muted">Resources</span>',
    ],
    whatHappened:
      "Muted text such as #999 on a white background measures a 2.8:1 contrast ratio — below the 4.5:1 minimum required for normal-size text.",
    whyItMatters:
      "Low-contrast text is hard or impossible to read for users with low vision or colour-vision deficiency, and for anyone on a low-quality or glary screen. It's one of the most common real-world accessibility barriers.",
    fix: "Increase text color lightness or darken the background to achieve at least a 4.5:1 contrast ratio. Use a contrast checker during design.",
    suggestedFix:
      "Darken the text (or lighten the background) until the ratio is at least 4.5:1 — or 3:1 for text ≥ 24px, or ≥ 19px bold. Verify pairs with a contrast tool and bake the values into your design tokens so it can't regress.",
    beforeCode: `/* 2.8:1 — fails AA */
.card__meta {
  color: #999;
}`,
    afterCode: `/* 7.0:1 — passes AA & AAA */
.card__meta {
  color: #595959;
}`,
  },
  {
    id: "label-missing",
    severity: "critical",
    title: "Form inputs without accessible labels",
    description:
      "Every form input must have an associated label element or an aria-label/aria-labelledby attribute. Unlabeled inputs are unusable with a screen reader.",
    rule: "wcag-1.3.1",
    wcag: ["1.3.1 Info and Relationships (A)", "3.3.2 Labels or Instructions (A)"],
    nodes: [
      '<input type="email" placeholder="Email address" class="subscribe__input">',
      '<input type="search" class="header__search">',
    ],
    whatHappened:
      "2 form fields rely on placeholder text only and have no associated <label>, aria-label, or aria-labelledby.",
    whyItMatters:
      "Placeholders disappear as soon as the user types and aren't reliably announced, so a screen reader reaches an unnamed edit field with no idea what to enter. Voice-control users also can't target the field by name.",
    fix: 'Add a <label for="id"> element or an aria-label attribute to each input. Placeholder text is not a substitute for a label.',
    suggestedFix:
      "Give every input a programmatic name — a visible <label for> is best. When a visible label truly isn't possible, use aria-label. Keep the placeholder as an optional hint, not the label.",
    beforeCode: `<input type="email" placeholder="Email address" />`,
    afterCode: `<label for="email">Email address</label>
<input id="email" type="email" name="email" placeholder="you@company.com" />`,
  },
  {
    id: "keyboard-trap",
    severity: "critical",
    title: "Keyboard focus trap in modal",
    description:
      "A modal dialog traps keyboard focus with no way to close or escape using the keyboard. Users who do not use a mouse cannot exit the dialog.",
    rule: "wcag-2.1.2",
    wcag: ["2.1.2 No Keyboard Trap (A)"],
    nodes: ['<div class="modal__overlay" role="dialog" aria-modal="true">'],
    whatHappened:
      "Focus enters the modal dialog but can't leave it with the keyboard — there's no Escape handler and Tab cycles only inside the overlay.",
    whyItMatters:
      "Keyboard and screen reader users get stuck: they can't reach the rest of the page or close the dialog without a mouse. This is a hard blocker, not an inconvenience.",
    fix: "Ensure Escape key closes the dialog. Trap focus within the modal while open, and restore focus to the trigger element on close.",
    suggestedFix:
      "Close the dialog on Escape, keep focus cycling within it while open (a focus trap by design), and return focus to the element that opened it on close. Prefer a vetted dialog primitive that handles this for you.",
    beforeCode: `<div class="modal__overlay" role="dialog" aria-modal="true">
  <!-- no Escape handler, focus never returns -->
</div>`,
    afterCode: `useEffect(() => {
  const onKey = (e) => e.key === "Escape" && close();
  document.addEventListener("keydown", onKey);
  return () => document.removeEventListener("keydown", onKey);
}, []);
// + trap focus while open, restore focus to the trigger on close`,
  },
  {
    id: "heading-order",
    severity: "moderate",
    title: "Heading levels skipped",
    description:
      "Heading levels are used to create document structure. Skipping from h2 to h4 breaks the logical outline and disorients screen reader users.",
    rule: "wcag-1.3.1",
    wcag: ["1.3.1 Info and Relationships (A)"],
    nodes: [
      '<h4 class="section__sub">Related Articles</h4>',
      '<h4 class="card__title">Featured post</h4>',
    ],
    whatHappened: "Headings jump from <h2> straight to <h4>, skipping the <h3> level.",
    whyItMatters:
      "Screen reader users navigate by heading level to understand and jump around a page. A broken outline hides the relationship between sections and makes the page confusing to scan.",
    fix: "Ensure headings follow a sequential order. Replace h4 with h3 in these contexts, or restructure the content hierarchy.",
    suggestedFix:
      "Choose heading levels to reflect document structure, not visual size — style the appearance with CSS instead. Don't skip levels; the heading after an h2 should be an h2 or h3.",
    beforeCode: `<h2>Features</h2>
<h4>Cloud scanning</h4>`,
    afterCode: `<h2>Features</h2>
<h3>Cloud scanning</h3>`,
  },
  {
    id: "focus-visible",
    severity: "serious",
    title: "Focus indicator not visible",
    description:
      "Interactive elements must have a visible focus indicator when focused via keyboard. CSS outline:none without a replacement fails this criterion.",
    rule: "wcag-2.4.11",
    wcag: ["2.4.11 Focus Appearance (AA)", "2.4.7 Focus Visible (AA)"],
    nodes: [
      '<button class="btn btn--ghost">Learn more</button>',
      '<a href="/pricing" class="nav__link">Pricing</a>',
    ],
    whatHappened:
      "Interactive elements set outline: none with no replacement, so keyboard users get no visible focus indicator.",
    whyItMatters:
      "Keyboard users rely on the focus ring to know where they are on the page. Without it, navigating becomes guesswork — they can't see which control is currently active.",
    fix: "Remove outline:none or replace it with a custom high-contrast focus style. Use :focus-visible to show focus only for keyboard navigation.",
    suggestedFix:
      "Never remove the outline without a replacement. Use :focus-visible to show a clear, high-contrast indicator for keyboard navigation while keeping it off for mouse clicks.",
    beforeCode: `button:focus {
  outline: none;
}`,
    afterCode: `button:focus-visible {
  outline: 2px solid #4c8dff;
  outline-offset: 2px;
}`,
  },
  {
    id: "aria-role",
    severity: "moderate",
    title: "ARIA roles used incorrectly",
    description:
      'The role="button" attribute is applied to non-interactive elements without the required keyboard event handlers, making them inaccessible via keyboard.',
    rule: "wcag-4.1.2",
    wcag: ["4.1.2 Name, Role, Value (A)"],
    nodes: ['<div role="button" class="card__cta" tabindex="0">View project</div>'],
    whatHappened:
      'A <div role="button"> is used as a control but has no keyboard handlers, so it can\'t be activated with Enter or Space.',
    whyItMatters:
      "ARIA changes what assistive tech announces, not how an element behaves. The div sounds like a button but doesn't act like one for keyboard users, so the action is unreachable.",
    fix: 'Replace <div role="button"> with a real <button> element. If a div must be used, add keydown event handlers for Enter and Space keys.',
    suggestedFix:
      'Use a native <button> — it\'s focusable and keyboard-operable for free, with the right role built in. If you must keep the div, add tabindex="0" and handle Enter and Space key events yourself.',
    beforeCode: `<div role="button" class="card__cta" tabindex="0">View project</div>`,
    afterCode: `<button type="button" class="card__cta">View project</button>`,
  },
  {
    id: "link-purpose",
    severity: "minor",
    title: "Ambiguous link text",
    description:
      'Links with generic text like "Read more" or "Click here" are ambiguous when read out of context by a screen reader.',
    rule: "wcag-2.4.4",
    wcag: ["2.4.4 Link Purpose in Context (A)"],
    nodes: [
      '<a href="/posts/123">Read more</a>',
      '<a href="/pricing">Click here</a>',
      '<a href="/about">Learn more</a>',
    ],
    whatHappened:
      'Several links use generic text such as "Read more" or "Click here" that doesn\'t describe where they go.',
    whyItMatters:
      'Screen reader users often pull up a list of every link out of context. A page full of "Read more" is meaningless — there\'s no way to tell the links apart or know their destination.',
    fix: "Use descriptive link text that conveys destination or purpose. Alternatively, use aria-label to provide a more descriptive name.",
    suggestedFix:
      "Write link text that makes sense on its own and names the destination or action. If the visible text has to stay short, add context with aria-label or visually-hidden text.",
    beforeCode: `<a href="/posts/123">Read more</a>`,
    afterCode: `<a href="/posts/123">Read more about cloud scanning</a>

<!-- or keep short visible text + hidden context -->
<a href="/posts/123">Read more<span class="sr-only"> about cloud scanning</span></a>`,
  },
  {
    id: "lang-missing",
    severity: "serious",
    title: "Page language not declared",
    description:
      "The html element must have a lang attribute. Without it, screen readers cannot automatically select the correct voice profile.",
    rule: "wcag-3.1.1",
    wcag: ["3.1.1 Language of Page (A)"],
    nodes: ["<html>  (missing lang attribute)"],
    whatHappened:
      "The root <html> element has no lang attribute, so the page language is undeclared.",
    whyItMatters:
      "Without a declared language a screen reader may use the wrong pronunciation engine, making content sound garbled. It also affects automatic translation and correct hyphenation.",
    fix: 'Add a lang attribute to the html element: <html lang="en">. Use the correct BCP 47 language tag for your content.',
    suggestedFix:
      "Set lang on the <html> element with the correct BCP 47 tag (e.g. en, uk, pt-BR). Mark any inline content in another language with its own lang attribute.",
    beforeCode: `<html>`,
    afterCode: `<html lang="en">`,
  },
  {
    id: "skip-link",
    severity: "moderate",
    title: "No skip navigation link",
    description:
      "Pages without a skip link force keyboard users to tab through all navigation on every page load before reaching the main content.",
    rule: "wcag-2.4.1",
    wcag: ["2.4.1 Bypass Blocks (A)"],
    nodes: ["<body>  (no skip link found)"],
    whatHappened: "There's no “skip to content” link as the first focusable element on the page.",
    whyItMatters:
      "Keyboard and switch users have to Tab through the entire navigation on every page load before reaching the main content. A skip link saves dozens of keystrokes per page.",
    fix: 'Add a visually hidden skip link as the first focusable element: <a href="#main" class="skip-link">Skip to content</a>.',
    suggestedFix:
      "Add a skip link as the very first focusable element, pointing at the main landmark. Keep it visually hidden until it receives focus, then reveal it.",
    beforeCode: `<body>
  <nav>…</nav>
  <main id="main">…</main>
</body>`,
    afterCode: `<body>
  <a href="#main" class="skip-link">Skip to content</a>
  <nav>…</nav>
  <main id="main">…</main>
</body>`,
  },
  {
    id: "empty-button",
    severity: "serious",
    title: "Buttons with no accessible name",
    description:
      "Icon-only buttons must have an accessible name via aria-label or visually hidden text. Without it, the button purpose is unknown to screen reader users.",
    rule: "wcag-4.1.2",
    wcag: ["4.1.2 Name, Role, Value (A)"],
    nodes: [
      '<button class="menu__toggle"><svg>...</svg></button>',
      '<button class="search__clear"><svg>...</svg></button>',
    ],
    whatHappened:
      "Icon-only buttons contain just an <svg> and expose no accessible name, so they're announced as just “button”.",
    whyItMatters:
      "Screen readers can't say what the button does, and voice-control users have no name to activate it. The control is effectively unlabeled and unusable for them.",
    fix: 'Add aria-label="Open menu" to icon-only buttons, or include a visually hidden span inside the button describing its purpose.',
    suggestedFix:
      'Give the icon button a name with aria-label (or visually-hidden text), and hide the decorative icon from assistive tech with aria-hidden="true".',
    beforeCode: `<button class="menu__toggle"><svg>…</svg></button>`,
    afterCode: `<button class="menu__toggle" aria-label="Open menu">
  <MenuIcon aria-hidden="true" />
</button>`,
  },
  {
    id: "motion",
    severity: "minor",
    title: "Animation without reduced-motion support",
    description:
      "Animated content can cause issues for users with vestibular disorders. CSS animations should respect the prefers-reduced-motion media query.",
    rule: "wcag-2.3.3",
    wcag: ["2.3.3 Animation from Interactions (AAA)"],
    nodes: [
      ".hero__bg { animation: drift 8s ease-in-out infinite; }",
      ".card:hover { transition: transform 0.3s; }",
    ],
    whatHappened:
      "Animations run unconditionally and ignore the user's prefers-reduced-motion setting.",
    whyItMatters:
      "Large or looping motion can trigger nausea, dizziness, or migraines for users with vestibular disorders. Honouring the OS setting lets them opt out of motion.",
    fix: "Wrap animations in @media (prefers-reduced-motion: no-preference) or use @media (prefers-reduced-motion: reduce) to disable them.",
    suggestedFix:
      "Gate non-essential motion behind @media (prefers-reduced-motion: no-preference), or disable it under prefers-reduced-motion: reduce. Keep essential motion subtle.",
    beforeCode: `.hero__bg {
  animation: drift 8s ease-in-out infinite;
}`,
    afterCode: `@media (prefers-reduced-motion: reduce) {
  .hero__bg {
    animation: none;
  }
}`,
  },
];

// Cheap deterministic PRNG so each URL always produces the same (but
// varied) report. Good enough for a demo.
const makeRng =
  (seed: number) =>
  (n: number): number => {
    const x = Math.sin(seed * n + n) * 10000;
    return x - Math.floor(x);
  };

export const generateIssues = (url: string): Issue[] => {
  const seed = url.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rng = makeRng(seed);

  const count = 5 + Math.floor(rng(1) * 7);
  const used = new Set<number>();
  const selected: IssueTemplate[] = [];

  for (let i = 0; selected.length < count && i < 50; i += 1) {
    const idx = Math.floor(rng(i + 2) * ISSUE_POOL.length);
    if (!used.has(idx)) {
      used.add(idx);
      selected.push(ISSUE_POOL[idx]);
    }
  }

  return selected.map((issue, i) => ({
    ...issue,
    nodes: issue.nodes.slice(
      0,
      1 + Math.floor(rng(i + 10) * Math.max(issue.nodes.length - 1, 0)) + 1,
    ),
    animationDelay: i * 60,
  }));
};

/** Look up the full issue template by id (used by the dashboard issue
 * detail view to show description, fix, code, and WCAG references). */
export const getIssueTemplate = (id: string): IssueTemplate | undefined =>
  ISSUE_POOL.find((t) => t.id === id);

export type FilterValue = Severity | "all";

export type SeverityCounts = Record<Severity, number>;

// Worst-first order used for summaries, filters and sorting.
export const SEVERITY_ORDER: readonly Severity[] = [
  "critical",
  "serious",
  "moderate",
  "minor",
] as const;

export const SEVERITY_LABEL: Record<Severity, string> = {
  critical: "Critical",
  serious: "Serious",
  moderate: "Moderate",
  minor: "Minor",
};

/** CSS custom-property color per severity (defined in styles/_variables.scss). */
export const SEVERITY_COLOR: Record<Severity, string> = {
  critical: "var(--severity-critical)",
  serious: "var(--severity-serious)",
  moderate: "var(--severity-moderate)",
  minor: "var(--severity-minor)",
};

const SEVERITY_RANK: Record<Severity, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  minor: 3,
};

export const countBySeverity = (issues: Issue[]): SeverityCounts => ({
  critical: issues.filter((i) => i.severity === "critical").length,
  serious: issues.filter((i) => i.severity === "serious").length,
  moderate: issues.filter((i) => i.severity === "moderate").length,
  minor: issues.filter((i) => i.severity === "minor").length,
});

export type SortValue = "severity" | "rule" | "occurrences";

// Returns a new, sorted array (does not mutate the input).
export const sortIssues = (issues: Issue[], sort: SortValue): Issue[] =>
  [...issues].sort((a, b) => {
    if (sort === "rule") return a.rule.localeCompare(b.rule);
    if (sort === "occurrences") return b.nodes.length - a.nodes.length;
    return SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
  });

// ── Scoring (used by /scan) ──────────────────────────────────────────
// Severity-weighted penalty, so the headline score reflects the real
// findings instead of being a fixed number.
export const SEVERITY_WEIGHT: Record<Severity, number> = {
  critical: 10,
  serious: 5,
  moderate: 2,
  minor: 1,
};

export const computeScore = (issues: Issue[]): number => {
  const penalty = issues.reduce(
    (sum, issue) =>
      sum + SEVERITY_WEIGHT[issue.severity] * (1 + Math.min(issue.nodes.length - 1, 3) * 0.1),
    0,
  );
  return Math.max(45, Math.round(100 - penalty));
};

export interface ScoreGrade {
  letter: string;
  label: string;
}

export const scoreGrade = (score: number): ScoreGrade => {
  if (score >= 90) return { letter: "A", label: "Excellent" };
  if (score >= 80) return { letter: "B", label: "Good" };
  if (score >= 70) return { letter: "C", label: "Fair" };
  if (score >= 60) return { letter: "D", label: "Needs work" };
  return { letter: "F", label: "Critical gaps" };
};
