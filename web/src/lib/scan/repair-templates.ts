export interface AxeIssueLike {
  id: string;
  description: string;
  help: string;
  helpUrl: string;
  snippets?: string[];
  tags: string[];
  selectors: string[];
}

export interface AxeRepairDetails {
  title: string;
  description: string;
  fix: string;
  whatHappened: string;
  whyItMatters: string;
  suggestedFix: string;
  beforeCode: string;
  afterCode: string;
}

interface TemplateContext {
  issue: AxeIssueLike;
  before: string;
  selector: string;
  manual: boolean;
}

type TemplateValue = string | ((context: TemplateContext) => string);

interface RepairTemplate {
  title: string;
  whatHappened: TemplateValue;
  whyItMatters: string;
  suggestedFix: TemplateValue;
  afterCode: TemplateValue;
  beforeCode?: TemplateValue;
}

const fallbackNode = "Affected element not reported.";

const voidHtmlTags = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

const sentence = (value: string): string =>
  value.endsWith(".") || value.endsWith("!") || value.endsWith("?") ? value : `${value}.`;

const addAttribute = (snippet: string, attribute: string): string => {
  const trimmed = snippet.trim();

  if (!trimmed.startsWith("<")) return `<element ${attribute}>...</element>`;
  if (new RegExp(`\\s${attribute.split("=")[0]}(?:=|\\s|>|/)`, "i").test(trimmed)) return trimmed;

  return trimmed.replace(/^<([a-zA-Z][\w:-]*)([^>]*)>/, `<$1$2 ${attribute}>`);
};

const removeAttribute = (snippet: string, attributeName: string): string => {
  const trimmed = snippet.trim();
  const pattern = new RegExp(`\\s${attributeName}(?:=(?:"[^"]*"|'[^']*'|[^\\s>]+))?`, "i");

  return trimmed.replace(pattern, "");
};

const replaceTag = (snippet: string, tagName: string, replacement: string): string => {
  const trimmed = snippet.trim();
  const content = trimmed.match(/^<[^>]+>([\s\S]*)<\/[^>]+>$/)?.[1]?.trim();

  return content ? `<${tagName}>${content}</${tagName}>` : replacement;
};

const getTagName = (snippet: string): string | null =>
  snippet
    .trim()
    .match(/^<([a-zA-Z][\w:-]*)\b/)?.[1]
    ?.toLowerCase() ?? null;

const readAttribute = (snippet: string, attributeName: string): string | null => {
  const match = snippet
    .trim()
    .match(new RegExp(`\\s${attributeName}(?:=(?:"([^"]*)"|'([^']*)'|([^\\s>]+)))?`, "i"));

  return match ? (match[1] ?? match[2] ?? match[3] ?? "") : null;
};

const setAttribute = (snippet: string, attributeName: string, value: string): string => {
  const trimmed = snippet.trim();
  if (!trimmed.startsWith("<")) return `<element ${attributeName}="${value}">...</element>`;

  const existingPattern = new RegExp(
    `(\\s${attributeName})(?:=(?:"[^"]*"|'[^']*'|[^\\s>]+))?`,
    "i",
  );
  if (existingPattern.test(trimmed)) {
    return trimmed.replace(existingPattern, `$1="${value}"`);
  }

  return trimmed.replace(
    /^<([a-zA-Z][\w:-]*)([^>]*?)(\s*\/?)>/,
    `<$1$2 ${attributeName}="${value}"$3>`,
  );
};

const stripTags = (value: string): string =>
  value
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeText = (value: string): string =>
  value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/[^a-zA-Z0-9 ]+/g, " ")
    .replace(/\b(js|mfe|container|input|field|bar|btn|button|link|icon|placeholder)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const titleCase = (value: string): string => {
  const knownUpper = new Set(["api", "faq", "id", "ui", "url", "wcag", "json", "svg"]);

  return normalizeText(value)
    .split(" ")
    .filter(Boolean)
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (knownUpper.has(lower)) return lower.toUpperCase();
      if (index > 0 && ["to", "for", "of", "and", "my"].includes(lower)) return lower;
      return `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
    })
    .join(" ")
    .replace(/\bGit Hub\b/g, "GitHub");
};

const sentenceCase = (value: string): string => {
  const text = titleCase(value);
  return text ? `${text.charAt(0).toUpperCase()}${text.slice(1)}` : text;
};

const slug = (value: string, fallback = "field"): string => {
  const cleaned = normalizeText(value)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");

  return cleaned || fallback;
};

const firstClassSelector = (snippet: string): string | null => {
  const className = readAttribute(snippet, "class")?.split(/\s+/).find(Boolean);
  return className ? `.${className}` : null;
};

const cssSelectorFor = (snippet: string): string => {
  const tag = getTagName(snippet) ?? "element";
  const id = readAttribute(snippet, "id");
  const classSelector = firstClassSelector(snippet);
  const href = readAttribute(snippet, "href");

  if (id) return `#${id}`;
  if (classSelector) return classSelector;
  if (href && tag === "a") return `a[href="${href}"]`;

  return tag;
};

const completeHtmlElement = (snippet: string): string => {
  const trimmed = snippet.trim();
  const tag = getTagName(trimmed);

  if (
    !tag ||
    voidHtmlTags.has(tag) ||
    /\/>$/.test(trimmed) ||
    new RegExp(`</${tag}>`, "i").test(trimmed)
  ) {
    return trimmed;
  }

  if (/^<[^>]+>$/.test(trimmed)) {
    return `${trimmed}\n  ...\n</${tag}>`;
  }

  return trimmed;
};

const indent = (value: string, spaces = 2): string => {
  const prefix = " ".repeat(spaces);
  return value
    .trim()
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
};

const deriveName = (snippet: string, fallback: string): string => {
  const tag = getTagName(snippet);
  const type = readAttribute(snippet, "type")?.toLowerCase();
  const candidates = [
    readAttribute(snippet, "aria-label"),
    readAttribute(snippet, "placeholder"),
    readAttribute(snippet, "title"),
    readAttribute(snippet, "value"),
    stripTags(snippet),
    readAttribute(snippet, "id"),
    readAttribute(snippet, "name"),
    readAttribute(snippet, "class"),
  ].filter((value): value is string => Boolean(value && normalizeText(value).length > 0));

  const raw = candidates[0];

  if (tag === "input" && type === "email") return "Email address";
  if (tag === "input" && type === "password") return "Password";
  if (tag === "input" && type === "search") return "Search";

  if (raw) {
    const text = titleCase(raw);
    if (/faq/i.test(raw) && /search/i.test(raw)) return "FAQ search";
    if (text) return text;
  }

  return fallback;
};

const ensureControlId = (snippet: string, label: string): { id: string; code: string } => {
  const id = readAttribute(snippet, "id") ?? `${slug(label)}-field`;
  return { id, code: setAttribute(snippet, "id", id) };
};

const buildLabeledControlFix = (context: TemplateContext): string => {
  const label = deriveName(context.before, "Field label");
  const { id, code } = ensureControlId(context.before, label);

  return `<label for="${id}">${label}</label>\n${code}`;
};

const buildLinkNameFix = (context: TemplateContext): string => {
  const href = readAttribute(context.before, "href") ?? "/destination";
  const text = deriveName(context.before, "Describe this destination");

  return `<a href="${href}">${text}</a>`;
};

const buildColorContrastFix = (context: TemplateContext): string => {
  const selector = cssSelectorFor(context.before);
  const isLink = getTagName(context.before) === "a";

  return `${context.before}

/* Raise contrast on the actual affected selector, then verify 4.5:1 for normal text. */
${selector} {
  color: #1f2937;
  ${isLink ? "text-decoration: underline;\n  text-underline-offset: 0.14em;" : "background-color: #ffffff;"}
}`;
};

const normalizeLanguageTag = (value: string | null): string => {
  const raw = (value ?? "en").replace(/_/g, "-").split("-").filter(Boolean);
  const language = raw[0]?.toLowerCase().match(/^[a-z]{2,3}$/)?.[0] ?? "en";
  const region = raw[1]?.match(/^[a-zA-Z]{2}$/)?.[0]?.toUpperCase();

  return region ? `${language}-${region}` : language;
};

const buildHtmlLangFix = (context: TemplateContext): string =>
  setAttribute(context.before, "lang", normalizeLanguageTag(readAttribute(context.before, "lang")));

const buildDuplicateIdFix = (context: TemplateContext): string => {
  const tag = getTagName(context.before);
  const id = readAttribute(context.before, "id");

  if (tag && ["path", "circle", "rect", "polygon", "polyline", "line", "g"].includes(tag)) {
    return `${removeAttribute(context.before, "id")}
<!-- If another SVG node references this id with url(#${id ?? "id"}), rename that reference too. -->`;
  }

  if (tag === "script" && readAttribute(context.before, "type")?.includes("json")) {
    const baseId = id ?? "embedded-json";
    const joiner = /[_-]$/.test(baseId) ? "" : "-";
    return setAttribute(context.before, "id", `${baseId}${joiner}page-data`);
  }

  if (id) {
    const suffix = slug(
      deriveName(context.before, tag ? `${tag} element` : "element"),
      tag ?? "element",
    );
    return setAttribute(context.before, "id", `${id}-${suffix}`);
  }

  return setAttribute(context.before, "id", `${tag ?? "element"}-unique-id`);
};

const buildLandmarkUniqueFix = (context: TemplateContext): string => {
  const tag = getTagName(context.before);
  const currentLabel =
    readAttribute(context.before, "aria-label") ?? readAttribute(context.before, "title");
  const action = readAttribute(context.before, "action");
  const className = readAttribute(context.before, "class");
  let label = currentLabel ? titleCase(currentLabel) : deriveName(context.before, "Page region");

  const signupMatch = currentLabel?.match(/sign\s*up\s*for\s+(.+)/i);
  if (tag === "form" && signupMatch) label = `${titleCase(signupMatch[1])} sign-up form`;
  else if (tag === "form" && action?.includes("signup")) label = `${label} form`;
  else if (tag === "nav" && /footer/i.test(className ?? "")) label = "Footer navigation";
  else if (tag === "nav") label = `${label} navigation`;
  else if (tag === "aside") label = `${label} complementary content`;

  return setAttribute(context.before, "aria-label", label);
};

const buildListItemFix = (context: TemplateContext): string => {
  const tag = getTagName(context.before);
  if (tag !== "li") return `<ul>\n  <li>${deriveName(context.before, "List item")}</li>\n</ul>`;

  return `<ul>\n${indent(context.before)}\n</ul>`;
};

const buildRoleButtonListItemFix = (context: TemplateContext): string => {
  const tag = getTagName(context.before);
  const role = readAttribute(context.before, "role")?.toLowerCase();

  if (tag !== "li" || role !== "button") {
    return `<button type="button">${deriveName(context.before, "Open item")}</button>`;
  }

  const id = readAttribute(context.before, "id");
  const className = readAttribute(context.before, "class");
  const label = sentenceCase(id ?? className ?? "Open item");

  return `<li${className ? ` class="${className}"` : ""}>
  <button${id ? ` id="${id}"` : ""} type="button">${label}</button>
</li>`;
};

const buildMainLandmarkFix = (context: TemplateContext): string => {
  const tag = getTagName(context.before);

  if (tag === "html") {
    return `${context.before}
  <body>
    <header>...</header>
    <main id="main">
      <h1>Page title</h1>
      <!-- Move the primary page content here. -->
    </main>
    <footer>...</footer>
  </body>
</html>`;
  }

  if (tag === "body") {
    return `<body>
  <header>...</header>
  <main id="main">
    <h1>Page title</h1>
    <!-- Move the primary page content here. -->
  </main>
  <footer>...</footer>
</body>`;
  }

  return `<main id="main">
${indent(completeHtmlElement(context.before))}
</main>`;
};

const buildPageHeadingFix = (context: TemplateContext): string => {
  const tag = getTagName(context.before);
  const title = deriveName(context.before, "Page title");

  if (tag === "html") {
    return `${context.before}
  <body>
    <main id="main">
      <h1>${title}</h1>
      <!-- Existing primary page content. -->
    </main>
  </body>
</html>`;
  }

  if (tag === "body") {
    return `<body>
  <main id="main">
    <h1>${title}</h1>
    <!-- Existing primary page content. -->
  </main>
</body>`;
  }

  return `<main id="main">
  <h1>${title}</h1>
${indent(completeHtmlElement(context.before))}
</main>`;
};

const buildRegionFix = (context: TemplateContext): string => {
  const tag = getTagName(context.before);

  if (tag === "html" || tag === "body") return buildMainLandmarkFix(context);

  if (tag === "nav") {
    return setAttribute(
      context.before,
      "aria-label",
      deriveName(context.before, "Section navigation"),
    );
  }

  if (tag === "aside") {
    return setAttribute(
      context.before,
      "aria-label",
      deriveName(context.before, "Related content"),
    );
  }

  return `<main id="main">
${indent(completeHtmlElement(context.before))}
</main>`;
};

const exact = (value: string): RepairTemplate => ({
  title: value,
  whatHappened:
    "The affected element failed this axe rule and needs a targeted accessibility repair.",
  whyItMatters:
    "When this pattern is left as-is, assistive technology can expose incomplete, confusing, or unusable information.",
  suggestedFix:
    "Review the affected element, preserve the visual design, and update the underlying semantic HTML or ARIA so the rule passes.",
  afterCode: ({ before }) => `<!-- Apply the accessibility repair for this rule -->\n${before}`,
});

const nameTemplate = (
  title: string,
  elementLabel: string,
  afterCode: RepairTemplate["afterCode"],
): RepairTemplate => ({
  title,
  whatHappened: `${elementLabel} does not have an accessible name that assistive technology can announce.`,
  whyItMatters:
    "Screen reader and voice-control users often navigate by control names. If the name is empty or vague, they cannot tell what the control does.",
  suggestedFix:
    "Give the element a short, action-oriented accessible name. Prefer visible text; for icon-only UI, use aria-label or aria-labelledby and hide decorative SVGs with aria-hidden.",
  afterCode,
});

const ariaTemplate = (
  title: string,
  whatHappened: string,
  suggestedFix: TemplateValue,
  afterCode: RepairTemplate["afterCode"],
): RepairTemplate => ({
  title,
  whatHappened,
  whyItMatters:
    "ARIA changes the accessibility tree. Invalid roles, unsupported attributes, or missing required relationships can make controls announce incorrectly or stop working for assistive technology.",
  suggestedFix,
  afterCode,
});

const landmarkTemplate = (
  title: string,
  whatHappened: string,
  suggestedFix: TemplateValue,
  afterCode: RepairTemplate["afterCode"],
): RepairTemplate => ({
  title,
  whatHappened,
  whyItMatters:
    "Landmarks let keyboard and screen reader users jump directly to major page areas instead of tabbing through the whole interface.",
  suggestedFix,
  afterCode,
});

const tableTemplate = (
  title: string,
  whatHappened: string,
  suggestedFix: TemplateValue,
  afterCode: RepairTemplate["afterCode"],
): RepairTemplate => ({
  title,
  whatHappened,
  whyItMatters:
    "Accessible tables expose header and data relationships so users can understand each cell without visually scanning rows and columns.",
  suggestedFix,
  afterCode,
});

const mediaTemplate = (
  title: string,
  whatHappened: string,
  suggestedFix: TemplateValue,
  afterCode: RepairTemplate["afterCode"],
): RepairTemplate => ({
  title,
  whatHappened,
  whyItMatters:
    "Audio, video, and timed content must remain understandable and controllable for users who cannot hear audio, need more time, or are sensitive to motion.",
  suggestedFix,
  afterCode,
});

const repairTemplates: Record<string, RepairTemplate> = {
  accesskeys: {
    title: "Access key value is reused",
    whatHappened:
      "More than one element uses the same accesskey value, so the keyboard shortcut becomes ambiguous.",
    whyItMatters:
      "Access keys are meant to provide fast keyboard access. Duplicate shortcuts can trigger the wrong control or make a shortcut impossible to predict.",
    suggestedFix:
      "Remove accesskey unless the product has a deliberate shortcut system. If you keep it, make every accesskey unique and document the shortcut.",
    afterCode: `<button type="button">Save</button>
<a href="/settings">Settings</a>`,
  },
  "area-alt": {
    title: "Image map area is missing alt text",
    whatHappened: "An active area inside an image map does not describe its destination or action.",
    whyItMatters:
      "Image map links are otherwise announced only as unlabeled regions, which makes navigation impossible without sight.",
    suggestedFix:
      "Add concise alt text to each clickable area. The text should describe the target, not the shape.",
    afterCode: ({ before }) => addAttribute(before, 'alt="View pricing details"'),
  },
  "aria-allowed-attr": ariaTemplate(
    "ARIA attribute is not supported by this role",
    "The element uses an ARIA attribute that its current role does not support.",
    "Remove the unsupported ARIA attribute, or change the element to a native control/valid role that actually supports that state or property.",
    `<button type="button" aria-expanded="false" aria-controls="account-menu">
  Account
</button>`,
  ),
  "aria-allowed-role": ariaTemplate(
    "ARIA role does not fit the element",
    "The element has a role that conflicts with its native semantics.",
    "Prefer the native HTML element that already has the right role. Only add role when the native element cannot express the needed semantics.",
    `<button type="button">Open menu</button>`,
  ),
  "aria-braille-equivalent": ariaTemplate(
    "Braille label is missing a text equivalent",
    "The element exposes a braille-only label or role description without an equivalent accessible name.",
    "Keep aria-braillelabel/aria-brailleroledescription only when there is also a normal accessible name such as visible text, aria-label, or aria-labelledby.",
    `<button type="button" aria-label="Download invoice" aria-braillelabel="Download invoice">
  Download
</button>`,
  ),
  "aria-command-name": nameTemplate(
    "ARIA command has no accessible name",
    "An ARIA button, link, menuitem, or command",
    ({ before }) => addAttribute(before, 'aria-label="Open settings"'),
  ),
  "aria-conditional-attr": ariaTemplate(
    "ARIA attribute is missing required context",
    "The element uses an ARIA attribute only allowed in specific role states or relationships.",
    "Check the role requirements, then either remove the attribute or add the required role/relationship so the state is meaningful.",
    `<div role="combobox" aria-expanded="false" aria-controls="country-list" aria-haspopup="listbox">
  <input id="country" type="text" aria-autocomplete="list" />
</div>
<ul id="country-list" role="listbox"></ul>`,
  ),
  "aria-deprecated-role": ariaTemplate(
    "Deprecated ARIA role is used",
    "The element uses an ARIA role that is no longer recommended.",
    "Replace the deprecated role with a current semantic role or, ideally, with native HTML that carries the role automatically.",
    `<section aria-labelledby="updates-heading">
  <h2 id="updates-heading">Updates</h2>
</section>`,
  ),
  "aria-dialog-name": nameTemplate(
    "Dialog has no accessible name",
    "A dialog or alertdialog",
    `<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Delete project</h2>
  <p>This action cannot be undone.</p>
</div>`,
  ),
  "aria-hidden-body": ariaTemplate(
    "The document body is hidden from assistive technology",
    'The <body> element has aria-hidden="true", which hides the entire page from the accessibility tree.',
    "Remove aria-hidden from <body>. If you need to hide background content behind a modal, apply inert/aria-hidden only to the app shell outside the active dialog.",
    `<body>
  <div id="app" inert>
    <!-- Background content while modal is open -->
  </div>
  <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <h2 id="modal-title">Confirm action</h2>
  </div>
</body>`,
  ),
  "aria-hidden-focus": ariaTemplate(
    "Hidden content contains focusable controls",
    'An element with aria-hidden="true" is focusable or contains focusable descendants.',
    "Remove focusable controls from the hidden subtree, set tabindex=-1/disabled on those controls while hidden, or remove aria-hidden from content users can focus.",
    `<div aria-hidden="true">
  <button type="button" tabindex="-1" disabled>Hidden action</button>
</div>`,
  ),
  "aria-input-field-name": nameTemplate(
    "ARIA input field has no accessible name",
    "An ARIA input field",
    `<label id="search-label" for="search">Search</label>
<div role="searchbox" id="search" aria-labelledby="search-label" contenteditable="true"></div>`,
  ),
  "aria-meter-name": nameTemplate(
    "ARIA meter has no accessible name",
    "A meter",
    `<div role="meter" aria-label="Storage used" aria-valuemin="0" aria-valuemax="100" aria-valuenow="72">
  72%
</div>`,
  ),
  "aria-progressbar-name": nameTemplate(
    "Progress bar has no accessible name",
    "A progress indicator",
    `<div role="progressbar" aria-label="Upload progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="64">
  64%
</div>`,
  ),
  "aria-prohibited-attr": ariaTemplate(
    "ARIA attribute is prohibited for this role",
    "The element has an ARIA property that must not be used with its current role.",
    "Remove the prohibited attribute. If you need that state, use a role or native element that supports it.",
    `<button type="button" aria-pressed="false">
  Bold
</button>`,
  ),
  "aria-required-attr": ariaTemplate(
    "Required ARIA attribute is missing",
    "The element has an ARIA role that requires additional aria-* state or relationship attributes.",
    "Add every required attribute for the role, or replace the custom ARIA widget with a native HTML control.",
    `<div role="slider" aria-label="Volume" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" tabindex="0"></div>`,
  ),
  "aria-required-children": ariaTemplate(
    "ARIA role is missing required children",
    "A composite ARIA widget does not contain the child roles required by its parent role.",
    "Build the full role structure, for example listbox > option or tablist > tab, and keep keyboard behavior aligned with the pattern.",
    `<div role="listbox" aria-label="Plan">
  <div role="option" aria-selected="true">Starter</div>
  <div role="option" aria-selected="false">Pro</div>
</div>`,
  ),
  "aria-required-parent": ariaTemplate(
    "ARIA child role is outside the required parent",
    "An element with a child role is not nested inside the parent role that gives it meaning.",
    "Move the element into the required parent structure, or use native HTML that already has valid parent/child semantics.",
    `<ul role="listbox" aria-label="Plan">
  <li role="option">Starter</li>
  <li role="option">Pro</li>
</ul>`,
  ),
  "aria-roledescription": ariaTemplate(
    "Role description is attached to an element without a role",
    "aria-roledescription is present where assistive technology cannot safely apply it.",
    "Use aria-roledescription sparingly. Add it only to an element with a clear implicit or explicit role, and keep the normal role understandable.",
    `<section role="region" aria-label="Timeline" aria-roledescription="carousel">
  ...
</section>`,
  ),
  "aria-roles": ariaTemplate(
    "ARIA role value is invalid",
    "The role attribute contains a typo, unsupported value, or multiple roles in an invalid order.",
    "Replace it with a valid role, or remove role and use the correct native HTML element.",
    `<nav aria-label="Primary">
  <a href="/pricing">Pricing</a>
</nav>`,
  ),
  "aria-text": ariaTemplate(
    'role="text" contains focusable content',
    'An element with role="text" contains links, buttons, inputs, or another focusable descendant.',
    'Remove role="text" or move interactive descendants outside of it. Do not flatten content that users need to focus.',
    `<p>
  Product updates
  <a href="/updates">Read updates</a>
</p>`,
  ),
  "aria-toggle-field-name": nameTemplate(
    "Toggle control has no accessible name",
    "A checkbox, switch, radio, or menuitemcheckbox/menuitemradio",
    `<button type="button" role="switch" aria-checked="false" aria-label="Email notifications">
  Off
</button>`,
  ),
  "aria-tooltip-name": nameTemplate(
    "Tooltip has no accessible name",
    "A tooltip",
    `<button type="button" aria-describedby="password-help">Password rules</button>
<span role="tooltip" id="password-help">Use at least 12 characters.</span>`,
  ),
  "aria-treeitem-name": nameTemplate(
    "Tree item has no accessible name",
    "A tree item",
    `<div role="tree" aria-label="Files">
  <div role="treeitem" aria-expanded="false">src</div>
</div>`,
  ),
  "aria-valid-attr": ariaTemplate(
    "ARIA attribute name is invalid",
    "An aria-* attribute is misspelled or not part of the ARIA specification.",
    "Fix the typo or remove the attribute. Common mistakes are aria-labeledby instead of aria-labelledby and aria-describedBy instead of aria-describedby.",
    `<button type="button" aria-labelledby="save-label">
  <span id="save-label">Save changes</span>
</button>`,
  ),
  "aria-valid-attr-value": ariaTemplate(
    "ARIA attribute value is invalid",
    "An ARIA attribute has a value that does not match the allowed format for that attribute.",
    "Use the allowed token, boolean, ID reference, or number expected by the attribute. Make sure referenced IDs exist on the page.",
    `<button type="button" aria-expanded="false" aria-controls="filters-panel">
  Filters
</button>
<section id="filters-panel" hidden></section>`,
  ),
  "audio-caption": mediaTemplate(
    "Audio is missing captions or transcript",
    "An audio element does not provide an equivalent text alternative.",
    "Add a transcript near the player. If the audio is synchronized with video, provide captions using a track element.",
    `<audio controls src="/podcast.mp3"></audio>
<a href="/podcast-transcript">Read transcript</a>`,
  ),
  "autocomplete-valid": {
    title: "Autocomplete attribute is invalid",
    whatHappened:
      "A form field uses an autocomplete value that browsers and assistive technology cannot understand.",
    whyItMatters:
      "Correct autocomplete tokens help users fill personal information quickly and reduce typing, memory, and motor effort.",
    suggestedFix:
      "Use valid autocomplete tokens that match the field purpose, such as email, given-name, family-name, street-address, postal-code, cc-number, or current-password.",
    afterCode: `<label for="email">Email</label>
<input id="email" name="email" type="email" autocomplete="email" />`,
  },
  "avoid-inline-spacing": {
    title: "Inline text spacing blocks user overrides",
    whatHappened:
      "Text spacing is set inline, making it hard for users to apply custom stylesheets or browser overrides.",
    whyItMatters:
      "Some users need increased line height, letter spacing, word spacing, or paragraph spacing to read comfortably.",
    suggestedFix:
      "Move spacing styles into CSS classes and make sure layout still works when text spacing is increased.",
    afterCode: `<p class="article-summary">Quarterly accessibility report</p>

.article-summary {
  line-height: 1.5;
}`,
  },
  blink: mediaTemplate(
    "Deprecated blink element is used",
    "The page uses a <blink> element or blinking pattern.",
    "Remove blinking content. If the content is important, render it as normal text and use a non-motion visual treatment.",
    `<strong class="status-alert">Payment failed</strong>`,
  ),
  "button-name": nameTemplate("Button has no accessible name", "A button", ({ before }) =>
    addAttribute(before, `aria-label="${deriveName(before, "Describe this action")}"`),
  ),
  bypass: landmarkTemplate(
    "Page has no way to bypass repeated navigation",
    "Keyboard users must move through repeated header/navigation content before reaching the main page content.",
    "Add a visible-on-focus skip link before navigation, and point it at a focusable main content container.",
    `<a class="skip-link" href="#main">Skip to content</a>
<header>...</header>
<main id="main" tabindex="-1">
  <h1>Dashboard</h1>
</main>`,
  ),
  "color-contrast": {
    title: "Text contrast is below WCAG AA",
    whatHappened:
      "Text color and background color do not provide enough contrast for normal or large text.",
    whyItMatters:
      "Low contrast makes text hard to read for users with low vision, color vision differences, glare, or tired eyes.",
    suggestedFix: ({ before }) =>
      `Update the CSS behind ${cssSelectorFor(before)} instead of changing the content. Normal text needs at least 4.5:1 contrast; large text needs at least 3:1.`,
    afterCode: buildColorContrastFix,
  },
  "color-contrast-enhanced": {
    title: "Text contrast is below WCAG AAA",
    whatHappened:
      "Text passes neither the enhanced contrast threshold nor the configured AAA target.",
    whyItMatters:
      "Enhanced contrast gives more comfortable reading for users with low vision and in difficult lighting conditions.",
    suggestedFix:
      "Increase contrast to 7:1 for normal text or 4.5:1 for large text when targeting AAA.",
    afterCode: `.body-copy {
  color: #111827;
  background: #ffffff;
}`,
  },
  "css-orientation-lock": {
    title: "Page is locked to one orientation",
    whatHappened:
      "CSS forces portrait or landscape orientation instead of allowing the content to adapt.",
    whyItMatters:
      "Some users mount their device in a fixed orientation or use assistive hardware that cannot easily rotate.",
    suggestedFix:
      "Remove orientation-locking media queries and make the layout responsive in both portrait and landscape.",
    afterCode: `@media (max-width: 720px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }
}`,
  },
  "definition-list": {
    title: "Definition list structure is invalid",
    whatHappened:
      "A <dl> contains elements that are not valid definition terms/descriptions or valid grouping containers.",
    whyItMatters:
      "Screen readers rely on the <dt>/<dd> relationship to announce term and description pairs correctly.",
    suggestedFix:
      "Keep direct children as <dt>, <dd>, script/template, or wrapper <div> groups containing valid <dt>/<dd> pairs.",
    afterCode: `<dl>
  <div>
    <dt>Plan</dt>
    <dd>Pro</dd>
  </div>
  <div>
    <dt>Status</dt>
    <dd>Active</dd>
  </div>
</dl>`,
  },
  dlitem: {
    title: "Definition item is outside a definition list",
    whatHappened: "A <dt> or <dd> element appears without a parent <dl>.",
    whyItMatters:
      "Definition terms and descriptions only have meaning when grouped inside a definition list.",
    suggestedFix:
      "Wrap the related <dt> and <dd> elements in a <dl>, or use normal headings/paragraphs if it is not a definition list.",
    afterCode: `<dl>
  <dt>Billing email</dt>
  <dd>finance@example.com</dd>
</dl>`,
  },
  "document-title": {
    title: "Document title is missing or empty",
    whatHappened: "The page does not expose a meaningful <title> element.",
    whyItMatters:
      "The document title is the first page identity announced by screen readers and is used in browser tabs, history, bookmarks, and search results.",
    suggestedFix: "Add a concise, unique title that identifies the current page and product.",
    beforeCode: `<head>
  <title></title>
</head>`,
    afterCode: `<head>
  <title>Pricing | Axiony</title>
</head>`,
  },
  "duplicate-id": {
    title: "Duplicate id value is present",
    whatHappened: "Multiple elements share the same id value.",
    whyItMatters:
      "IDs are used by labels, ARIA relationships, fragment links, and scripts. Duplicates can point assistive technology to the wrong element.",
    suggestedFix: ({ before }) =>
      `Fix the duplicated id on this ${getTagName(before) ?? "element"}. If another attribute references the old id, update that reference at the same time.`,
    afterCode: buildDuplicateIdFix,
  },
  "duplicate-id-active": {
    title: "Interactive element has a duplicate id",
    whatHappened: "An active/focusable element shares its id with another element.",
    whyItMatters:
      "Duplicate IDs on controls can break labels, focus handling, validation messages, and automated tests.",
    suggestedFix: ({ before }) =>
      `Give this active ${getTagName(before) ?? "element"} a stable unique id and update the label or ARIA reference that points to it.`,
    afterCode: buildDuplicateIdFix,
  },
  "duplicate-id-aria": {
    title: "ARIA or label reference points to duplicate IDs",
    whatHappened: "An id used by a label or ARIA relationship is duplicated on the page.",
    whyItMatters:
      "When aria-labelledby, aria-describedby, or for points to a duplicate id, assistive technology may read the wrong label or description.",
    suggestedFix:
      "Make this referenced id unique. Then update matching for, aria-labelledby, aria-describedby, aria-controls, or SVG url(#id) references.",
    afterCode: buildDuplicateIdFix,
  },
  "empty-heading": {
    title: "Heading is empty",
    whatHappened: "A heading element exists in the page outline but has no readable text.",
    whyItMatters:
      "Screen reader users often jump by headings. Empty headings create confusing stops with no context.",
    suggestedFix:
      "Remove the empty heading if it is decorative, or add meaningful text that describes the section that follows.",
    afterCode: `<h2>Billing history</h2>`,
  },
  "empty-table-header": tableTemplate(
    "Table header is empty",
    "A <th> cell is present but has no readable header text.",
    "Add concise header text, or remove the header cell if it is not describing any data.",
    `<th scope="col">Invoice date</th>`,
  ),
  "focus-order-semantics": {
    title: "Focusable element has non-interactive semantics",
    whatHappened:
      "An element is in the keyboard focus order but does not expose an interactive role.",
    whyItMatters:
      "Keyboard users can land on the element, but screen readers may not announce what action is available or how to operate it.",
    suggestedFix:
      "Use a real button/link/input for interactive content, or remove tabindex if the element should not be focusable.",
    afterCode: buildRoleButtonListItemFix,
  },
  "form-field-multiple-labels": {
    title: "Form field has multiple labels",
    whatHappened: "One form field is associated with more than one <label> element.",
    whyItMatters:
      "Multiple labels can produce repeated or conflicting accessible names, especially in complex forms.",
    suggestedFix:
      "Keep one primary label. Move helper copy, requirements, or examples into aria-describedby.",
    afterCode: `<label for="phone">Phone number</label>
<input id="phone" name="phone" aria-describedby="phone-help" />
<p id="phone-help">Include country code.</p>`,
  },
  "frame-focusable-content": {
    title: "Frame with focusable content is removed from tab order",
    whatHappened: "An iframe/frame contains focusable content but uses tabindex=-1.",
    whyItMatters:
      "Keyboard users may be unable to enter the embedded content even when it contains usable controls.",
    suggestedFix:
      "Remove tabindex=-1 from frames that contain interactive content, or make the embedded content non-interactive if it should not be reached.",
    afterCode: ({ before }) => removeAttribute(before, "tabindex"),
  },
  "frame-tested": {
    title: "Frame content needs manual accessibility review",
    whatHappened:
      "Axe could not fully test the contents of a frame, often because the frame is cross-origin or cannot load the axe script.",
    whyItMatters:
      "Issues inside embedded checkout, auth, chat, or marketing frames can still block users even if the parent page passes.",
    suggestedFix:
      "Scan the frame URL directly if you control it. For third-party frames, require accessibility documentation or a VPAT from the vendor.",
    afterCode: `<iframe
  src="https://trusted-vendor.example/widget"
  title="Customer support chat"
></iframe>`,
  },
  "frame-title": nameTemplate("Frame has no accessible name", "An iframe or frame", ({ before }) =>
    addAttribute(before, 'title="Payment details"'),
  ),
  "frame-title-unique": {
    title: "Frame title is not unique",
    whatHappened:
      "Multiple frames expose the same title, so users cannot distinguish their purpose.",
    whyItMatters:
      "Screen reader users navigate frames by title. Repeated titles make it hard to pick the right embedded area.",
    suggestedFix: "Give each frame a unique title that describes its specific content or task.",
    afterCode: `<iframe src="/billing-card" title="Saved payment card"></iframe>
<iframe src="/billing-address" title="Billing address form"></iframe>`,
  },
  "heading-order": {
    title: "Heading levels skip in the page outline",
    whatHappened: "A heading jumps more than one level from the previous heading.",
    whyItMatters:
      "Headings are the page outline for screen reader users. Skipped levels make sections feel disconnected or incorrectly nested.",
    suggestedFix:
      "Change heading levels so the outline increases one level at a time. Do not choose heading levels based only on visual size; style them with CSS instead.",
    afterCode: `<h2>Account settings</h2>
<h3>Billing email</h3>
<h3>Invoices</h3>`,
  },
  "hidden-content": {
    title: "Hidden content needs review",
    whatHappened:
      "Axe found content that is hidden or conditionally revealed and cannot confirm whether it should be exposed.",
    whyItMatters:
      "Hidden content can either clutter assistive technology output or hide content that users need to complete a task.",
    suggestedFix:
      "Confirm the content state. Use hidden/display:none for content unavailable to everyone, inert for inactive UI, and aria-expanded/aria-controls for revealable panels.",
    afterCode: `<button type="button" aria-expanded="false" aria-controls="filters">
  Filters
</button>
<section id="filters" hidden>
  ...
</section>`,
  },
  "html-has-lang": {
    title: "Page language is not declared",
    whatHappened: "The root <html> element does not have a lang attribute.",
    whyItMatters:
      "Screen readers use the page language to choose pronunciation rules, voice, punctuation behavior, and translation hints.",
    suggestedFix:
      "Add the correct BCP 47 language tag to <html>, such as en, uk, fr, de, es, or en-US.",
    beforeCode: `<html>`,
    afterCode: `<html lang="en">`,
  },
  "html-lang-valid": {
    title: "Page language value is invalid",
    whatHappened: "The <html lang> value is missing, misspelled, or not a valid language tag.",
    whyItMatters:
      "Invalid language tags prevent assistive technology from selecting the right pronunciation and localization behavior.",
    suggestedFix: ({ before }) =>
      `Replace the invalid language value with ${normalizeLanguageTag(readAttribute(before, "lang"))}, a valid BCP 47-style tag for this page.`,
    afterCode: buildHtmlLangFix,
  },
  "html-xml-lang-mismatch": {
    title: "html lang and xml:lang do not match",
    whatHappened: "The page declares different base languages in lang and xml:lang.",
    whyItMatters:
      "Conflicting language metadata can cause inconsistent pronunciation and parsing across assistive technologies.",
    suggestedFix:
      "Use the same base language in both attributes, or remove xml:lang for normal HTML pages.",
    afterCode: `<html lang="en" xml:lang="en">`,
  },
  "identical-links-same-purpose": {
    title: "Same link text points to different purposes",
    whatHappened:
      "Multiple links have the same accessible name but go to different destinations or perform different actions.",
    whyItMatters:
      "When links are listed out of context, users expect identical names to have identical purpose.",
    suggestedFix: "Make the visible text or aria-label unique enough to describe each destination.",
    afterCode: `<a href="/blog/accessibility-testing">Read accessibility testing guide</a>
<a href="/blog/wcag-checklist">Read WCAG checklist</a>`,
  },
  "image-alt": {
    title: "Image is missing alternative text",
    whatHappened: "An image does not expose text that describes its content or purpose.",
    whyItMatters:
      "Screen reader users cannot perceive the image unless the alternative text communicates the same meaning or the image is marked decorative.",
    suggestedFix:
      'Add meaningful alt text for informative images. For decorative images, use alt="" and keep the image out of the accessibility tree.',
    afterCode: ({ before }) => addAttribute(before, 'alt="Describe the image purpose"'),
  },
  "image-redundant-alt": {
    title: "Image alt repeats nearby text",
    whatHappened: "The image alternative text duplicates visible text next to the image.",
    whyItMatters: "Repeated content creates noisy, inefficient screen reader output.",
    suggestedFix:
      'If the nearby text already communicates the image meaning, mark the image decorative with alt="". Otherwise rewrite the alt so it adds missing information.',
    afterCode: ({ before }) => addAttribute(before, 'alt=""'),
  },
  "input-button-name": nameTemplate(
    "Input button has no accessible name",
    "An input button",
    `<input type="submit" value="Create account" />`,
  ),
  "input-image-alt": {
    title: "Image submit button is missing alt text",
    whatHappened: 'An <input type="image"> control does not describe the action it performs.',
    whyItMatters:
      "The image input behaves like a button. Without alt text, users cannot tell what action they are submitting.",
    suggestedFix:
      "Add alt text that describes the action, such as Search, Submit order, or Sign in.",
    afterCode: ({ before }) => addAttribute(before, 'alt="Search"'),
  },
  label: {
    title: "Form field is missing a label",
    whatHappened: "A form control does not have a programmatically associated label.",
    whyItMatters:
      "Labels tell screen reader users what information to enter, and they increase the clickable target for mouse and touch users.",
    suggestedFix: ({ before }) =>
      `Add a persistent visible label for "${deriveName(before, "this field")}" and connect it with for/id. Keep helper text in aria-describedby if the field needs instructions.`,
    afterCode: buildLabeledControlFix,
  },
  "label-content-name-mismatch": {
    title: "Accessible name does not include visible text",
    whatHappened: "A control's visible text is not part of its accessible name.",
    whyItMatters:
      'Voice-control users speak the visible label to activate controls. If the accessible name differs, commands like "click Save" may fail.',
    suggestedFix:
      "Make aria-label/aria-labelledby include the exact visible text, preferably at the beginning.",
    afterCode: `<button type="button" aria-label="Save changes">
  Save
</button>`,
  },
  "label-title-only": {
    title: "Form field relies on a hidden/title-only label",
    whatHappened:
      "A form field has an accessible name, but no visible label users can see before interacting.",
    whyItMatters:
      "Visible labels help everyone understand the expected input, especially users with memory, attention, or language-processing needs.",
    suggestedFix:
      "Render a persistent visible label. Keep helper text in aria-describedby instead of using title as the only instruction.",
    afterCode: `<label for="company">Company name</label>
<input id="company" name="company" aria-describedby="company-help" />
<p id="company-help">Use your legal business name.</p>`,
  },
  "landmark-banner-is-top-level": landmarkTemplate(
    "Banner landmark is nested",
    "A header/banner landmark is inside another landmark.",
    "Move the primary site header to the top level of the page. If it is only a section header, remove role=banner and use a normal heading.",
    `<header>
  <nav aria-label="Primary">...</nav>
</header>
<main>...</main>`,
  ),
  "landmark-complementary-is-top-level": landmarkTemplate(
    "Complementary landmark is nested too deeply",
    "An aside/complementary landmark is inside another landmark where it may not be discoverable as a page region.",
    "Move page-level complementary content to the top level, or keep it inside the section only when it truly belongs to that section.",
    `<main>...</main>
<aside aria-label="Related resources">
  ...
</aside>`,
  ),
  "landmark-contentinfo-is-top-level": landmarkTemplate(
    "Footer/contentinfo landmark is nested",
    "A footer/contentinfo landmark is inside another landmark.",
    "Move the primary page footer to the top level. Use a plain footer without contentinfo semantics for section footers.",
    `<main>...</main>
<footer>
  ...
</footer>`,
  ),
  "landmark-main-is-top-level": landmarkTemplate(
    "Main landmark is nested",
    "The main landmark is contained inside another landmark.",
    "Move <main> to the top-level document structure so it represents the primary content of the whole page.",
    `<header>...</header>
<main id="main">
  ...
</main>
<footer>...</footer>`,
  ),
  "landmark-no-duplicate-banner": landmarkTemplate(
    "Page has multiple banner landmarks",
    "More than one top-level banner/header landmark exists.",
    "Keep only the site-level header as <header>. Convert nested or repeated headers to div/section with headings.",
    `<header>
  <nav aria-label="Primary">...</nav>
</header>
<section>
  <h2>Product updates</h2>
</section>`,
  ),
  "landmark-no-duplicate-contentinfo": landmarkTemplate(
    "Page has multiple contentinfo landmarks",
    "More than one top-level footer/contentinfo landmark exists.",
    "Keep one page footer. Use section-level footers only inside sectioning content and avoid role=contentinfo on them.",
    `<main>...</main>
<footer>
  <p>Copyright Axiony</p>
</footer>`,
  ),
  "landmark-no-duplicate-main": landmarkTemplate(
    "Page has multiple main landmarks",
    "More than one <main> or role=main landmark exists.",
    "Keep one main landmark for the page. Convert secondary content to section/article/aside as appropriate.",
    `<main id="main">
  <h1>Reports</h1>
  ...
</main>`,
  ),
  "landmark-one-main": landmarkTemplate(
    "Page is missing a main landmark",
    "The document does not have a <main> element or role=main landmark.",
    ({ before }) =>
      getTagName(before) === "html" || getTagName(before) === "body"
        ? 'Add one <main id="main"> inside this document\'s body and move the primary content into it.'
        : `Wrap this ${getTagName(before) ?? "content block"} in one <main id="main"> landmark, or move it into the existing main landmark if the page already has one.`,
    buildMainLandmarkFix,
  ),
  "landmark-unique": landmarkTemplate(
    "Landmark needs a unique label",
    "Multiple landmarks have the same role and accessible name.",
    ({ before }) =>
      `Keep this ${getTagName(before) ?? "landmark"}, but give it a unique accessible name that describes its exact purpose on the page.`,
    buildLandmarkUniqueFix,
  ),
  "link-in-text-block": {
    title: "Link is only distinguished by color",
    whatHappened:
      "A link inside a text block relies on color alone to stand out from surrounding text.",
    whyItMatters:
      "Users with color vision differences, low vision, or custom color settings may not be able to identify the link.",
    suggestedFix:
      "Add a non-color cue such as underline, thickness, icon, or persistent text-decoration. Keep hover-only underlines as a supplement, not the only cue.",
    afterCode: `.prose a {
  color: #075985;
  text-decoration: underline;
  text-underline-offset: 0.16em;
}`,
  },
  "link-name": nameTemplate("Link has no accessible name", "A link", buildLinkNameFix),
  list: {
    title: "List contains invalid direct children",
    whatHappened:
      "A <ul> or <ol> contains elements other than <li>, script, or template as direct children.",
    whyItMatters:
      "Assistive technology announces list length and item position based on valid list semantics.",
    suggestedFix:
      "Move wrappers inside <li> elements, or convert the structure to non-list markup if it is not actually a list.",
    afterCode: buildListItemFix,
  },
  listitem: {
    title: "List item is outside a list",
    whatHappened: "An <li> element is not contained in a <ul> or <ol>.",
    whyItMatters: "A list item only has useful semantics when it belongs to a list.",
    suggestedFix:
      "Wrap this exact <li> in the parent <ul>/<ol>, or replace <li> with a normal element if it is not actually a list item.",
    afterCode: buildListItemFix,
  },
  marquee: mediaTemplate(
    "Deprecated marquee element is used",
    "The page uses a <marquee> element or scrolling text behavior.",
    "Remove the marquee. If content is important, show it statically or provide user-controlled carousel controls with pause/next/previous buttons.",
    `<p class="announcement">New audit report is ready.</p>`,
  ),
  "meta-refresh": mediaTemplate(
    "Page refreshes or redirects automatically",
    "A meta refresh is used to reload or redirect the page after a delay.",
    "Replace delayed meta refresh with an explicit link or server-side redirect. For sessions, warn users and let them extend time.",
    `<p>Your session is about to expire.</p>
<button type="button">Stay signed in</button>`,
  ),
  "meta-refresh-no-exceptions": mediaTemplate(
    "Delayed refresh is not allowed",
    "The page uses a delayed meta refresh pattern.",
    "Remove the meta refresh and provide a user-controlled way to continue, reload, or navigate.",
    `<a href="/dashboard">Continue to dashboard</a>`,
  ),
  "meta-viewport": {
    title: "Viewport disables zooming",
    whatHappened: "The viewport meta tag prevents users from zooming or scaling text.",
    whyItMatters:
      "Many low-vision users rely on pinch-zoom or browser zoom to read and operate pages.",
    suggestedFix:
      "Remove user-scalable=no and restrictive maximum-scale values. Let users zoom normally.",
    afterCode: `<meta name="viewport" content="width=device-width, initial-scale=1" />`,
  },
  "meta-viewport-large": {
    title: "Viewport limits large scaling",
    whatHappened:
      "The viewport allows some zoom but not enough for users who need very large scaling.",
    whyItMatters:
      "Users may need text and controls much larger than default sizes, especially on mobile devices.",
    suggestedFix:
      "Avoid maximum-scale restrictions and test the layout at high browser zoom/text scaling.",
    afterCode: `<meta name="viewport" content="width=device-width, initial-scale=1" />`,
  },
  "nested-interactive": {
    title: "Interactive controls are nested",
    whatHappened: "A focusable control contains another focusable control.",
    whyItMatters:
      "Nested interactions create confusing focus behavior and can hide inner controls from assistive technology.",
    suggestedFix:
      "Separate nested controls into siblings. If a list item is acting as a button, keep the <li> as structure and put a real <button> inside it.",
    afterCode: buildRoleButtonListItemFix,
  },
  "no-autoplay-audio": mediaTemplate(
    "Audio starts automatically",
    "Audio or video with sound starts without user action or without a quick way to stop it.",
    "Disable autoplay with sound. If media must autoplay, mute it by default and provide visible controls.",
    `<video controls muted playsinline>
  <source src="/intro.mp4" type="video/mp4" />
</video>`,
  ),
  "object-alt": {
    title: "Object element is missing alternative text",
    whatHappened: "An <object> embeds content without a text alternative.",
    whyItMatters:
      "If the embedded object cannot be accessed or loaded, users still need an equivalent description or fallback.",
    suggestedFix:
      "Add fallback text/content inside the object, or replace it with accessible HTML.",
    afterCode: `<object data="/chart.svg" type="image/svg+xml">
  Revenue chart showing a 14% increase from Q1 to Q2.
</object>`,
  },
  "p-as-heading": {
    title: "Paragraph is styled like a heading",
    whatHappened: "Text visually looks like a heading but is marked up as a paragraph.",
    whyItMatters:
      "Screen reader users navigating by headings will miss the section because it is not in the document outline.",
    suggestedFix:
      "Use the correct heading element for the content hierarchy, then style it with CSS to match the design.",
    afterCode: ({ before }) => replaceTag(before, "h2", `<h2>Section title</h2>`),
  },
  "page-has-heading-one": {
    title: "Page has no h1",
    whatHappened: "The page does not contain a top-level heading.",
    whyItMatters: "The h1 gives users a fast confirmation of the page purpose after navigation.",
    suggestedFix: ({ before }) =>
      getTagName(before) === "html" || getTagName(before) === "body"
        ? "Add one clear h1 at the start of the primary <main> content. Use the real page name, not a generic heading."
        : `Add one clear h1 before this ${getTagName(before) ?? "content block"} inside the main landmark. The h1 should name the page or task.`,
    afterCode: buildPageHeadingFix,
  },
  "presentation-role-conflict": ariaTemplate(
    "Presentational role conflicts with interactive semantics",
    'An element marked role="presentation" or role="none" still has ARIA, focus, or interaction that should be exposed.',
    "Remove the presentational role from meaningful or focusable elements. Use role=presentation only for decorative wrapper/table/list markup.",
    `<button type="button">
  Save changes
</button>`,
  ),
  region: landmarkTemplate(
    "Content is outside landmarks",
    "Some visible page content is not contained within a landmark region.",
    ({ before }) =>
      `Move this ${getTagName(before) ?? "content block"} into an appropriate landmark. For primary page content, wrap it in <main id="main">; for navigation use <nav aria-label="...">; for supporting content use <aside aria-label="...">.`,
    buildRegionFix,
  ),
  "role-img-alt": {
    title: 'Element with role="img" is missing alternative text',
    whatHappened: 'A custom image-like element has role="img" but no accessible name.',
    whyItMatters:
      "Assistive technology treats the element as an image and needs text describing what the visual communicates.",
    suggestedFix:
      "Add aria-label or aria-labelledby. If the graphic is decorative, remove role=img and hide it with aria-hidden.",
    afterCode: ({ before }) => addAttribute(before, 'aria-label="Sales increased 18% in May"'),
  },
  "scope-attr-valid": tableTemplate(
    "Table scope attribute is invalid",
    "A table header uses scope incorrectly.",
    'Use scope="col" for column headers and scope="row" for row headers. Avoid scope on normal <td> cells.',
    `<table>
  <thead>
    <tr><th scope="col">Plan</th><th scope="col">Price</th></tr>
  </thead>
  <tbody>
    <tr><th scope="row">Pro</th><td>$29</td></tr>
  </tbody>
</table>`,
  ),
  "scrollable-region-focusable": {
    title: "Scrollable region is not keyboard accessible",
    whatHappened: "A scrollable container cannot receive keyboard focus.",
    whyItMatters:
      "Keyboard users, especially in Safari, may be unable to scroll inside the region and reach hidden content.",
    suggestedFix:
      'Give the scrollable region tabindex="0" and an accessible name, or redesign so the page itself scrolls.',
    afterCode: ({ before }) =>
      addAttribute(addAttribute(before, 'tabindex="0"'), 'aria-label="Activity log"'),
  },
  "select-name": nameTemplate(
    "Select field has no accessible name",
    "A select field",
    `<label for="country">Country</label>
<select id="country" name="country">
  <option>Ukraine</option>
</select>`,
  ),
  "server-side-image-map": {
    title: "Server-side image map is used",
    whatHappened:
      "The page uses a server-side image map where click targets are not available to keyboard users.",
    whyItMatters:
      "Server-side image maps require pointer coordinates and cannot expose individual links or controls accessibly.",
    suggestedFix:
      "Replace it with normal links/buttons or a client-side image map with accessible <area> alt text.",
    afterCode: `<nav aria-label="Map shortcuts">
  <a href="/north">North region</a>
  <a href="/south">South region</a>
</nav>`,
  },
  "skip-link": landmarkTemplate(
    "Skip link target is missing or not focusable",
    "A skip link points to a target that does not exist or cannot receive focus.",
    "Make sure the href matches a real id and the target can receive focus when activated.",
    `<a class="skip-link" href="#main">Skip to content</a>
<main id="main" tabindex="-1">
  <h1>Reports</h1>
</main>`,
  ),
  "summary-name": nameTemplate(
    "Summary element has no readable text",
    "A <summary> element",
    `<details>
  <summary>View billing details</summary>
  <p>Next invoice date: June 30.</p>
</details>`,
  ),
  "svg-img-alt": {
    title: "SVG image is missing accessible text",
    whatHappened: "An SVG with image semantics does not expose a text alternative.",
    whyItMatters:
      "Screen reader users need the same meaning conveyed by the SVG, especially for icons, charts, logos, and status graphics.",
    suggestedFix:
      'For informative SVGs, use role="img" with aria-labelledby and a <title>/<desc>. For decorative SVGs, set aria-hidden="true".',
    afterCode: `<svg role="img" aria-labelledby="chart-title chart-desc" viewBox="0 0 120 80">
  <title id="chart-title">Revenue trend</title>
  <desc id="chart-desc">Revenue increased from January through March.</desc>
  ...
</svg>`,
  },
  tabindex: {
    title: "Positive tabindex changes focus order",
    whatHappened: "An element uses tabindex greater than 0.",
    whyItMatters:
      "Positive tabindex creates a custom focus order that often differs from the visual and DOM order, which disorients keyboard users.",
    suggestedFix:
      'Remove positive tabindex values. Use the DOM order for focus order, and use tabindex="0" only for custom widgets that must be focusable.',
    afterCode: ({ before }) => removeAttribute(before, "tabindex"),
  },
  "table-duplicate-name": tableTemplate(
    "Table caption repeats summary text",
    "A table exposes the same name through caption and summary.",
    "Keep one concise table name. Use the caption for the table title and move longer explanation into nearby text.",
    `<table>
  <caption>Monthly invoices</caption>
  ...
</table>`,
  ),
  "table-fake-caption": tableTemplate(
    "Table caption is not marked up as caption",
    "A data/header cell is being used visually as a table caption.",
    "Move the table title into a real <caption> element as the first child of <table>.",
    `<table>
  <caption>Quarterly revenue</caption>
  <thead>...</thead>
  <tbody>...</tbody>
</table>`,
  ),
  "target-size": {
    title: "Touch target is too small or too close",
    whatHappened:
      "An interactive target is smaller than the expected touch size or lacks enough spacing from nearby targets.",
    whyItMatters:
      "Small targets are hard to activate for users with motor disabilities, tremors, large fingers, or mobile devices.",
    suggestedFix:
      "Increase the clickable area to at least 24x24 CSS pixels, or add enough spacing so adjacent targets are not accidentally activated.",
    afterCode: `.icon-button {
  inline-size: 2.75rem;
  block-size: 2.75rem;
  padding: 0.625rem;
}`,
  },
  "td-has-header": tableTemplate(
    "Data cell is not associated with a header",
    "A non-empty table cell in a larger table has no header relationship.",
    'Use clear <th scope="col"> and <th scope="row"> headers. For complex tables, connect cells with headers/id.',
    `<table>
  <thead>
    <tr><th scope="col">Month</th><th scope="col">Revenue</th></tr>
  </thead>
  <tbody>
    <tr><th scope="row">May</th><td>$42,000</td></tr>
  </tbody>
</table>`,
  ),
  "td-headers-attr": tableTemplate(
    "Table headers attribute references invalid cells",
    "A td headers attribute points to an element that is not a header in the same table.",
    'Make each headers value point to existing <th id="..."> cells in the same table, or simplify with scope where possible.',
    `<table>
  <tr>
    <th id="plan">Plan</th>
    <th id="price">Price</th>
  </tr>
  <tr>
    <td headers="plan">Pro</td>
    <td headers="price">$29</td>
  </tr>
</table>`,
  ),
  "th-has-data-cells": tableTemplate(
    "Table header has no data cells",
    "A table header does not describe any data cells.",
    "Remove orphan headers, correct the row/column structure, or add the missing data cells they describe.",
    `<table>
  <thead>
    <tr><th scope="col">Feature</th><th scope="col">Included</th></tr>
  </thead>
  <tbody>
    <tr><th scope="row">Exports</th><td>Yes</td></tr>
  </tbody>
</table>`,
  ),
  "valid-lang": {
    title: "Language attribute value is invalid",
    whatHappened: "A lang attribute on an element contains an invalid language code.",
    whyItMatters: "Screen readers switch pronunciation based on language changes inside the page.",
    suggestedFix:
      "Use a valid BCP 47 language tag on the element whose language differs from the page.",
    afterCode: `<p lang="fr">Bonjour</p>`,
  },
  "video-caption": mediaTemplate(
    "Video is missing captions",
    "A video element does not provide captions for spoken audio.",
    'Add a captions track with kind="captions" and srclang, and make sure captions include meaningful sound cues.',
    `<video controls>
  <source src="/demo.mp4" type="video/mp4" />
  <track kind="captions" src="/demo.en.vtt" srclang="en" label="English" default />
</video>`,
  ),
};

const categoryTemplates: Array<[(issue: AxeIssueLike) => boolean, RepairTemplate]> = [
  [
    (issue) => issue.id.startsWith("aria-"),
    ariaTemplate(
      "ARIA implementation needs repair",
      "The element uses ARIA in a way axe cannot validate as correct.",
      "Prefer native HTML. If a custom ARIA widget is necessary, validate the role, supported attributes, required parent/child roles, accessible name, and keyboard behavior together.",
      `<button type="button" aria-expanded="false" aria-controls="panel">
  Toggle panel
</button>`,
    ),
  ],
  [
    (issue) => issue.tags.includes("cat.tables"),
    tableTemplate(
      "Table semantics need repair",
      "A table relationship is missing or malformed.",
      "Use semantic table markup: caption for the title, th for headers, scope for simple row/column relationships, and headers/id for complex tables.",
      `<table>
  <caption>Report summary</caption>
  <thead>
    <tr><th scope="col">Metric</th><th scope="col">Value</th></tr>
  </thead>
  <tbody>
    <tr><th scope="row">Issues</th><td>12</td></tr>
  </tbody>
</table>`,
    ),
  ],
  [
    (issue) => issue.tags.includes("cat.forms"),
    {
      title: "Form control needs accessible labeling",
      whatHappened: "A form control is missing a clear label, instruction, or valid browser hint.",
      whyItMatters:
        "Accessible form markup helps users understand what to enter, recover from errors, and use autofill reliably.",
      suggestedFix:
        "Use a visible label connected with for/id, helper text connected with aria-describedby, and valid autocomplete values where appropriate.",
      afterCode: `<label for="field">Field label</label>
<input id="field" name="field" aria-describedby="field-help" />
<p id="field-help">Short instruction.</p>`,
    },
  ],
  [
    (issue) => issue.tags.includes("cat.text-alternatives"),
    {
      title: "Text alternative needs repair",
      whatHappened: "Non-text content does not expose an equivalent text alternative.",
      whyItMatters:
        "Users who cannot perceive the visual or audio content need a text equivalent to understand the same information.",
      suggestedFix:
        "Add a concise text alternative when the content is meaningful. Mark decorative visuals as hidden from assistive technology.",
      afterCode: ({ before }) => addAttribute(before, 'alt="Describe the content or action"'),
    },
  ],
  [
    (issue) => issue.tags.includes("cat.keyboard"),
    {
      title: "Keyboard accessibility needs repair",
      whatHappened: "The affected element creates a keyboard navigation or operation problem.",
      whyItMatters:
        "Keyboard access is essential for users who cannot use a mouse and for many assistive technologies.",
      suggestedFix:
        "Use native interactive controls, keep DOM focus order logical, provide visible focus styles, and make custom widgets respond to Enter, Space, Escape, and arrow keys where expected.",
      afterCode: `<button type="button" class="action-button">
  Continue
</button>

.action-button:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}`,
    },
  ],
  [
    (issue) => issue.tags.includes("cat.language"),
    {
      title: "Language metadata needs repair",
      whatHappened: "The page or element language is missing, invalid, or inconsistent.",
      whyItMatters:
        "Correct language metadata helps screen readers pronounce content with the right voice and rules.",
      suggestedFix:
        "Use valid BCP 47 language tags on <html> and on any passages that use a different language than the page.",
      afterCode: `<html lang="en">`,
    },
  ],
];

const getTemplate = (issue: AxeIssueLike): RepairTemplate => {
  const id = issue.id.toLowerCase();
  const direct = repairTemplates[id];
  if (direct) return direct;

  return (
    categoryTemplates.find(([matches]) => matches(issue))?.[1] ?? exact(issue.help || issue.id)
  );
};

const readTemplateValue = (value: TemplateValue, context: TemplateContext): string =>
  typeof value === "function" ? value(context) : value;

export const resolveAxeRepair = (issue: AxeIssueLike, manual = false): AxeRepairDetails => {
  const before = issue.snippets?.[0] ?? issue.selectors[0] ?? fallbackNode;
  const selector = issue.selectors[0] ?? fallbackNode;
  const template = getTemplate(issue);
  const context: TemplateContext = { issue, before, selector, manual };
  const whatHappened = readTemplateValue(template.whatHappened, context);
  const suggestedFix = readTemplateValue(template.suggestedFix, context);

  return {
    title: template.title || issue.help || issue.id,
    description: issue.description,
    fix: suggestedFix,
    whatHappened: manual
      ? `Axe marked this for manual review: ${sentence(whatHappened)}`
      : sentence(whatHappened),
    whyItMatters: sentence(template.whyItMatters),
    suggestedFix: sentence(suggestedFix),
    beforeCode: template.beforeCode ? readTemplateValue(template.beforeCode, context) : before,
    afterCode: readTemplateValue(template.afterCode, context),
  };
};
