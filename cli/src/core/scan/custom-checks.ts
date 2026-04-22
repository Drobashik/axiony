import type { Page } from 'playwright';
import type { ScanIssue } from './types';

const DUPLICATE_ID_HELP_URL = 'https://www.w3.org/WAI/WCAG21/Techniques/failures/F77';

type DuplicateIdResult = {
  idValue: string;
  impact: 'minor' | 'serious';
  isSvgResourceOnly: boolean;
  selectors: string[];
  snippets: string[];
};

export const findDuplicateIdIssues = async (
  page: Page,
  selector?: string,
): Promise<ScanIssue[]> => {
  const duplicates = await page.evaluate((contextSelector) => {
    const root = contextSelector ? document.querySelector(contextSelector) : document;

    if (!root) {
      return [];
    }

    const byId = new Map<string, Element[]>();

    for (const element of Array.from(root.querySelectorAll('[id]'))) {
      const id = element.id.trim();

      if (!id) {
        continue;
      }

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

    const SVG_RESOURCE_NAMES = new Set(
      [
        'clipPath',
        'defs',
        'filter',
        'linearGradient',
        'marker',
        'mask',
        'pattern',
        'radialGradient',
        'symbol',
      ].map((name) => name.toLowerCase()),
    );

    const A11Y_REFERENCE_ATTRIBUTES = ['aria-describedby', 'aria-labelledby', 'for'];

    const getReferenceTokens = (value: string | null): string[] =>
      value?.split(/\s+/).filter(Boolean) ?? [];

    const isSvgResourceElement = (element: Element): boolean => {
      const elementName = element.localName.toLowerCase();

      return SVG_RESOURCE_NAMES.has(elementName) || Boolean(element.closest('defs'));
    };

    const isReferencedByA11yAttribute = (id: string): boolean =>
      Array.from(
        root.querySelectorAll(
          A11Y_REFERENCE_ATTRIBUTES.map((attribute) => `[${attribute}]`).join(','),
        ),
      ).some((element) =>
        A11Y_REFERENCE_ATTRIBUTES.some((attribute) =>
          getReferenceTokens(element.getAttribute(attribute)).includes(id),
        ),
      );

    const isReferencedByFragmentLink = (id: string): boolean =>
      Array.from(root.querySelectorAll('a[href],area[href]')).some((element) => {
        const href = element.getAttribute('href');

        return href === `#${id}`;
      });

    return Array.from(byId.entries())
      .filter(([, elements]) => elements.length > 1)
      .map(([idValue, elements]) => {
        const isSvgResourceOnly = elements.every(isSvgResourceElement);
        const hasStrongA11yRisk =
          isReferencedByA11yAttribute(idValue) || isReferencedByFragmentLink(idValue);

        return {
          idValue,
          impact: isSvgResourceOnly && !hasStrongA11yRisk ? 'minor' : 'serious',
          isSvgResourceOnly,
          selectors: elements.map((element) => `#${escapeId(element.id)}`),
          snippets: elements.map((element) => element.outerHTML),
        };
      });
  }, selector);

  return (duplicates as DuplicateIdResult[]).map(
    ({ idValue, impact, isSvgResourceOnly, selectors, snippets }) => ({
      id: 'duplicate-id',
      impact,
      description: isSvgResourceOnly
        ? `Ensures SVG definition id values are unique. Duplicate value: "${idValue}".`
        : `Ensures id attribute values are unique. Duplicate value: "${idValue}".`,
      help: isSvgResourceOnly
        ? 'SVG definition IDs should be unique'
        : 'ID attributes must be unique',
      helpUrl: DUPLICATE_ID_HELP_URL,
      selectors,
      snippets,
      tags: ['wcag2a', 'wcag411'],
    }),
  );
};
