import type { CliScanIssue } from "../types";

interface RepairCopy {
  title: string;
  description: string;
  whatHappened: string;
  whyItMatters: string;
  suggestedFix: string;
  beforeCode: string;
  afterCode: string;
}

type RepairFactory = (
  issue: CliScanIssue,
  context: RepairContext,
) => RepairCopy;

interface RepairContext {
  count: number;
  firstNode: string;
}

const affected = (count: number): string =>
  `${count} affected element${count === 1 ? "" : "s"}`;

const docs = (issue: CliScanIssue): string =>
  issue.helpUrl ? ` Axe guidance: ${issue.helpUrl}` : "";

const catalog: Record<string, RepairFactory> = {
  "image-alt": (_issue, { count, firstNode }) => ({
    title: "Images need alternative text",
    description:
      "Informative images must expose a text alternative, and decorative images should be hidden from assistive technology.",
    whatHappened: `${affected(count)} render without useful alt text.`,
    whyItMatters:
      "Screen reader users miss the meaning or purpose of the image. If the image is inside a link or button, the action can become impossible to understand.",
    suggestedFix:
      'Add a concise alt attribute for meaningful images. For decorative images, use alt="" so screen readers skip them.',
    beforeCode: firstNode,
    afterCode: '<img src="..." alt="Describe the image purpose" />',
  }),
  "color-contrast": (_issue, { count, firstNode }) => ({
    title: "Text contrast is too low",
    description:
      "Text needs enough contrast against its background to stay readable for users with low vision or color-vision differences.",
    whatHappened: `${affected(count)} fail the minimum contrast ratio.`,
    whyItMatters:
      "Low-contrast content can be difficult or impossible to read, especially on dim screens, bright environments, or for users with low vision.",
    suggestedFix:
      "Darken the text, lighten the background, or adjust the design token until normal text reaches 4.5:1 contrast and large text reaches 3:1.",
    beforeCode: firstNode,
    afterCode: "/* Example direction */\n.text {\n  color: #595959;\n}",
  }),
  label: (_issue, { count, firstNode }) => ({
    title: "Form fields need accessible labels",
    description:
      "Every input needs a programmatic name from a visible label, aria-label, or aria-labelledby.",
    whatHappened: `${affected(count)} do not expose a usable label.`,
    whyItMatters:
      "Screen reader and voice-control users need field names to understand what to enter and how to target the control.",
    suggestedFix:
      "Prefer a visible <label> connected with htmlFor/id. Use aria-label only when a visible label is not possible.",
    beforeCode: firstNode,
    afterCode:
      '<label for="email">Email address</label>\n<input id="email" type="email" />',
  }),
  "button-name": (_issue, { count, firstNode }) => ({
    title: "Buttons need an accessible name",
    description:
      "Icon-only or empty buttons must expose a name through visible text, aria-label, or visually hidden text.",
    whatHappened: `${affected(count)} are announced without a useful button name.`,
    whyItMatters:
      "Assistive technology cannot tell users what the button does, and voice-control users cannot activate it by name.",
    suggestedFix:
      "Add visible text when possible. For icon-only buttons, add aria-label and hide decorative SVGs with aria-hidden.",
    beforeCode: firstNode,
    afterCode:
      '<button aria-label="Open menu">\n  <svg aria-hidden="true">...</svg>\n</button>',
  }),
  "link-name": (_issue, { count, firstNode }) => ({
    title: "Links need descriptive text",
    description:
      "Links must expose text that describes their destination or action when read out of context.",
    whatHappened: `${affected(count)} do not have a useful accessible name.`,
    whyItMatters:
      'Screen reader users often browse a list of links. Labels like "click here" or empty links do not explain where they go.',
    suggestedFix:
      "Use descriptive link text, add visually hidden context, or provide an aria-label that names the destination.",
    beforeCode: firstNode,
    afterCode:
      '<a href="/pricing">View pricing</a>\n<a href="/post">Read more<span class="sr-only"> about cloud scanning</span></a>',
  }),
  "html-has-lang": (_issue, { firstNode }) => ({
    title: "Page language is missing",
    description: "The root html element must declare the page language.",
    whatHappened: "The document does not expose a valid lang attribute.",
    whyItMatters:
      "Screen readers use the language to choose pronunciation rules. Missing language can make content sound wrong or hard to understand.",
    suggestedFix:
      "Add a valid BCP 47 language code to the html element, such as en, uk, de, or pt-BR.",
    beforeCode: firstNode,
    afterCode: '<html lang="en">',
  }),
  "document-title": (_issue, { firstNode }) => ({
    title: "Document needs a title",
    description: "Every page needs a descriptive title element.",
    whatHappened: "The document title is empty or missing.",
    whyItMatters:
      "The title is the first page identifier for screen readers, browser tabs, bookmarks, and search results.",
    suggestedFix:
      "Add a concise title that identifies the page and product or site.",
    beforeCode: firstNode,
    afterCode: "<title>Dashboard | Axiony</title>",
  }),
  "heading-order": (_issue, { count, firstNode }) => ({
    title: "Heading levels should not be skipped",
    description:
      "Headings should follow the document outline in a logical order.",
    whatHappened: `${affected(count)} break the heading hierarchy.`,
    whyItMatters:
      "Screen reader users navigate by heading level to understand structure and jump between sections.",
    suggestedFix:
      "Choose heading levels for structure, not visual size. Style headings with CSS instead of skipping levels.",
    beforeCode: firstNode,
    afterCode: "<h2>Features</h2>\n<h3>Cloud scanning</h3>",
  }),
  "landmark-one-main": (_issue, { firstNode }) => ({
    title: "Page needs one main landmark",
    description:
      "A page should expose exactly one main landmark for its primary content.",
    whatHappened: "The page is missing a main landmark or has more than one.",
    whyItMatters:
      "Landmarks let assistive technology users jump directly to primary content without tabbing through repeated navigation.",
    suggestedFix:
      "Wrap the primary page content in one <main> element. Avoid nesting multiple main landmarks.",
    beforeCode: firstNode,
    afterCode: "<main>\n  <!-- primary page content -->\n</main>",
  }),
  "page-has-heading-one": (_issue, { firstNode }) => ({
    title: "Page needs a top-level heading",
    description: "Each page should have one h1 that names the main content.",
    whatHappened: "The page does not expose a clear h1.",
    whyItMatters:
      "A top-level heading gives screen reader users a fast summary of the page and anchors the document outline.",
    suggestedFix: "Add one visible h1 near the start of the main content.",
    beforeCode: firstNode,
    afterCode: "<main>\n  <h1>Accessibility dashboard</h1>\n</main>",
  }),
  region: (_issue, { count, firstNode }) => ({
    title: "Content should be inside landmarks",
    description:
      "Page content should be contained by landmarks such as header, nav, main, aside, or footer.",
    whatHappened: `${affected(count)} are not contained by a landmark.`,
    whyItMatters:
      "Landmarks create a navigable page map for assistive technology users.",
    suggestedFix:
      "Move stray content into an appropriate semantic landmark, usually <main> for primary content.",
    beforeCode: firstNode,
    afterCode: "<main>\n  <!-- page content -->\n</main>",
  }),
  "frame-title": (_issue, { count, firstNode }) => ({
    title: "Frames need titles",
    description:
      "Each iframe needs a title that describes its embedded content.",
    whatHappened: `${affected(count)} do not expose a useful frame title.`,
    whyItMatters:
      "Screen reader users need frame titles to decide whether to enter, skip, or interact with embedded content.",
    suggestedFix:
      "Add a short title attribute that names what the iframe contains.",
    beforeCode: firstNode,
    afterCode: '<iframe title="Product demo video" src="..."></iframe>',
  }),
  list: (_issue, { count, firstNode }) => ({
    title: "Lists need valid structure",
    description:
      "List containers should only contain valid list item children.",
    whatHappened: `${affected(count)} have invalid list markup.`,
    whyItMatters:
      "Assistive technology relies on list semantics to announce item counts and relationships.",
    suggestedFix:
      "Use <ul> or <ol> with direct <li> children. Move wrappers inside the list item.",
    beforeCode: firstNode,
    afterCode: "<ul>\n  <li>First item</li>\n  <li>Second item</li>\n</ul>",
  }),
  listitem: (_issue, { count, firstNode }) => ({
    title: "List items need a list parent",
    description: "A list item must be inside a ul, ol, or menu element.",
    whatHappened: `${affected(count)} are not inside a valid list container.`,
    whyItMatters:
      "Without a list parent, assistive technology cannot announce the item as part of a list.",
    suggestedFix: "Wrap related list items in a semantic list container.",
    beforeCode: firstNode,
    afterCode: "<ul>\n  <li>Item</li>\n</ul>",
  }),
  "meta-viewport": (_issue, { firstNode }) => ({
    title: "Viewport should allow zooming",
    description: "The viewport meta tag should not prevent users from zooming.",
    whatHappened: "The page restricts zoom or scaling.",
    whyItMatters:
      "Users with low vision often zoom pages. Disabling zoom makes the site harder or impossible to use.",
    suggestedFix:
      "Remove maximum-scale, minimum-scale, and user-scalable=no from the viewport meta tag.",
    beforeCode: firstNode,
    afterCode:
      '<meta name="viewport" content="width=device-width, initial-scale=1" />',
  }),
};

const ariaRepair: RepairFactory = (issue, { count, firstNode }) => ({
  title: "ARIA usage needs correction",
  description:
    issue.description ||
    "ARIA attributes must match the element role and expected values.",
  whatHappened: `${affected(count)} failed the ${issue.id} ARIA rule.`,
  whyItMatters:
    "Incorrect ARIA can make controls sound valid while exposing the wrong role, state, or relationship to assistive technology.",
  suggestedFix:
    "Prefer native HTML semantics. If ARIA is required, use only attributes supported by the element role and provide valid values.",
  beforeCode: firstNode,
  afterCode: `<!-- Prefer native semantics or valid ARIA for ${issue.id} -->\n${firstNode}`,
});

const defaultRepair: RepairFactory = (issue, { count, firstNode }) => ({
  title: issue.help || issue.id,
  description:
    issue.description ||
    issue.help ||
    `The ${issue.id} accessibility rule failed.`,
  whatHappened: `${affected(count)} failed ${issue.id}.`,
  whyItMatters:
    issue.description ||
    "This can make the page harder to understand, navigate, or operate with assistive technology.",
  suggestedFix: `Review the affected markup and apply the recommended fix for ${issue.id}.${docs(issue)}`,
  beforeCode: firstNode,
  afterCode: `<!-- Apply the recommended fix for ${issue.id} -->\n${firstNode}`,
});

export const resolveRepair = (
  issue: CliScanIssue,
  manual: boolean,
  firstNode: string,
): RepairCopy => {
  const nodes = issue.snippets?.length ? issue.snippets : issue.selectors;
  const context = { count: Math.max(nodes.length, 1), firstNode };

  if (manual) {
    return {
      ...defaultRepair(issue, context),
      title: `Manual check: ${issue.help || issue.id}`,
    };
  }

  const factory =
    catalog[issue.id] ??
    (issue.id.startsWith("aria-") ? ariaRepair : defaultRepair);
  return factory(issue, context);
};
