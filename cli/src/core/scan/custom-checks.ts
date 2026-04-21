import type { Page } from 'playwright';
import type { ScanIssue } from './types';

const DUPLICATE_ID_HELP_URL =
  'https://www.w3.org/WAI/WCAG21/Techniques/failures/F77';

type DuplicateIdResult = {
  idValue: string;
  selectors: string[];
  snippets: string[];
};

export const findDuplicateIdIssues = async (
  page: Page,
  selector?: string,
): Promise<ScanIssue[]> => {
  const duplicates = await page.evaluate((contextSelector) => {
    const root = contextSelector
      ? document.querySelector(contextSelector)
      : document;

    if (!root) {
      return [];
    }

    const byId = new Map<string, Element[]>();

    for (const element of Array.from(root.querySelectorAll('[id]'))) {
      const id = element.id;
      const entries = byId.get(id) ?? [];
      entries.push(element);
      byId.set(id, entries);
    }

    const escapeId = (id: string): string => {
      if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
        return CSS.escape(id);
      }

      return id.replace(/["\\]/g, '\\$&');
    };

    return Array.from(byId.entries())
      .filter(([, elements]) => elements.length > 1)
      .map(([idValue, elements]) => ({
        idValue,
        selectors: elements.map((element) => `#${escapeId(element.id)}`),
        snippets: elements.map((element) => element.outerHTML),
      }));
  }, selector);

  return (duplicates as DuplicateIdResult[]).map(
    ({ idValue, selectors, snippets }) => ({
      id: 'duplicate-id',
      impact: 'serious',
      description: `Ensures id attribute values are unique. Duplicate value: "${idValue}".`,
      help: 'ID attributes must be unique',
      helpUrl: DUPLICATE_ID_HELP_URL,
      selectors,
      snippets,
      tags: ['wcag2a', 'wcag411'],
    }),
  );
};
