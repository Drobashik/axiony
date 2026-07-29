import type { Page } from 'playwright';

export const resolvePageIcon = async (page: Page): Promise<string | undefined> =>
  page.evaluate(() => {
    interface Candidate {
      src: string;
      score: number;
    }

    const absoluteUrl = (value: unknown): string | null => {
      if (typeof value !== 'string' || !value.trim()) return null;

      try {
        const url = new URL(value, document.baseURI);

        if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

        if (url.username || url.password) return null;

        return url.toString();
      } catch {
        return null;
      }
    };

    const declaredSize = (value: string): number => {
      const sizes = [...value.matchAll(/(\d+)x(\d+)/gi)].map((match) =>
        Math.min(Number(match[1]), Number(match[2])),
      );

      return sizes.length > 0 ? Math.max(...sizes) : 0;
    };

    const icons: Candidate[] = [...document.querySelectorAll<HTMLLinkElement>('link[rel]')]
      .flatMap((link) => {
        const rel = link.rel.toLowerCase().split(/\s+/);

        if (!rel.includes('icon') && !rel.includes('apple-touch-icon')) return [];

        const src = absoluteUrl(link.href);

        if (!src) return [];

        const isSvg =
          link.type.toLowerCase().includes('svg') ||
          new URL(src).pathname.toLowerCase().endsWith('.svg');

        const isApple = rel.includes('apple-touch-icon');

        const size = declaredSize(link.getAttribute('sizes') ?? '');

        return [
          {
            src,
            score: (isSvg ? 10_000 : 0) + (isApple ? 1_000 : 0) + size,
          },
        ];
      })
      .sort((left, right) => right.score - left.score);

    const schemaLogos = new Set<string>();

    const collectLogo = (logo: unknown) => {
      if (Array.isArray(logo)) {
        logo.forEach(collectLogo);
        return;
      }

      if (typeof logo === 'string') {
        const src = absoluteUrl(logo);
        if (src) schemaLogos.add(src);
        return;
      }

      if (!logo || typeof logo !== 'object') return;

      const logoRecord = logo as Record<string, unknown>;

      const src = absoluteUrl(logoRecord.url ?? logoRecord.contentUrl);

      if (src) schemaLogos.add(src);
    };

    const visit = (value: unknown, depth = 0) => {
      if (!value || depth > 8) return;

      if (Array.isArray(value)) {
        value.forEach((entry) => visit(entry, depth + 1));
        return;
      }

      if (typeof value !== 'object') return;

      const record = value as Record<string, unknown>;

      collectLogo(record.logo);

      Object.values(record).forEach((entry) => visit(entry, depth + 1));
    };

    document
      .querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]')
      .forEach((script) => {
        try {
          visit(JSON.parse(script.textContent ?? ''));
        } catch {
          // A malformed JSON-LD block should not affect the scan
        }
      });

    const bestIcon = icons[0];

    if (bestIcon?.score >= 64) return bestIcon.src;

    const schemaLogo = schemaLogos.values().next().value;

    if (schemaLogo) return schemaLogo;

    if (bestIcon) return bestIcon.src;

    return undefined;
  });
