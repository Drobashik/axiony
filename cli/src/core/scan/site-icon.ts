import type { Page } from 'playwright';
import type { SiteIconAppearance } from './types';

const ICON_ANALYSIS_SIZE = 64;
const MAX_ICON_BYTES = 2 * 1024 * 1024;
const ICON_REQUEST_TIMEOUT_MS = 3_000;
const ICON_DECODE_TIMEOUT_MS = 1_500;
const MIN_VISIBLE_ALPHA = 0.08;
const MIN_VISIBLE_COVERAGE = 0.01;
const DARK_PIXEL_LUMINANCE = 0.24;
const DARK_ICON_LUMINANCE = 0.28;
const LIGHT_PIXEL_LUMINANCE = 0.72;
const LIGHT_ICON_LUMINANCE = 0.72;
const DOMINANT_TONE_SHARE = 0.68;

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

export const resolvePageIconAppearance = async (
  page: Page,
  iconUrl: string,
): Promise<SiteIconAppearance | undefined> => {
  const response = await page.context().request.get(iconUrl, {
    failOnStatusCode: false,
    timeout: ICON_REQUEST_TIMEOUT_MS,
  });

  if (!response.ok()) {
    return undefined;
  }

  const contentType = response.headers()['content-type']?.split(';')[0]?.trim().toLowerCase();

  if (!contentType?.startsWith('image/')) {
    return undefined;
  }

  const declaredLength = Number(response.headers()['content-length']);

  if (Number.isFinite(declaredLength) && declaredLength > MAX_ICON_BYTES) {
    return undefined;
  }

  const body = await response.body();

  if (body.length === 0 || body.length > MAX_ICON_BYTES) {
    return undefined;
  }

  const source = `data:${contentType};base64,${body.toString('base64')}`;
  const analysisPage = await page.context().newPage();

  try {
    return await analysisPage.evaluate(
      async ({ imageSource, analysisSize, decodeTimeout, thresholds }) => {
        const image = new Image();

        image.decoding = 'async';
        image.src = imageSource;

        const decoded = await Promise.race([
          image
            .decode()
            .then(() => true)
            .catch(() => false),
          new Promise<false>((resolve) => window.setTimeout(() => resolve(false), decodeTimeout)),
        ]);

        if (!decoded) {
          return undefined;
        }

        if (!image.naturalWidth || !image.naturalHeight) {
          return undefined;
        }

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { willReadFrequently: true });

        if (!context) {
          return undefined;
        }

        canvas.width = analysisSize;
        canvas.height = analysisSize;

        const scale = Math.min(
          analysisSize / image.naturalWidth,
          analysisSize / image.naturalHeight,
        );
        const renderedWidth = image.naturalWidth * scale;
        const renderedHeight = image.naturalHeight * scale;

        context.drawImage(
          image,
          (analysisSize - renderedWidth) / 2,
          (analysisSize - renderedHeight) / 2,
          renderedWidth,
          renderedHeight,
        );

        const pixels = context.getImageData(0, 0, analysisSize, analysisSize).data;
        let visibleWeight = 0;
        let luminanceTotal = 0;
        let darkWeight = 0;
        let lightWeight = 0;

        const linearChannel = (channel: number): number => {
          const normalized = channel / 255;

          return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
        };

        for (let index = 0; index < pixels.length; index += 4) {
          const alpha = pixels[index + 3] / 255;

          if (alpha < thresholds.minVisibleAlpha) {
            continue;
          }

          const luminance =
            0.2126 * linearChannel(pixels[index]) +
            0.7152 * linearChannel(pixels[index + 1]) +
            0.0722 * linearChannel(pixels[index + 2]);

          visibleWeight += alpha;
          luminanceTotal += luminance * alpha;

          if (luminance <= thresholds.darkPixelLuminance) {
            darkWeight += alpha;
          }

          if (luminance >= thresholds.lightPixelLuminance) {
            lightWeight += alpha;
          }
        }

        if (visibleWeight < analysisSize * analysisSize * thresholds.minVisibleCoverage) {
          return undefined;
        }

        const averageLuminance = luminanceTotal / visibleWeight;
        const darkShare = darkWeight / visibleWeight;
        const lightShare = lightWeight / visibleWeight;

        if (
          averageLuminance <= thresholds.darkIconLuminance &&
          darkShare >= thresholds.dominantToneShare
        ) {
          return 'dark';
        }

        if (
          averageLuminance >= thresholds.lightIconLuminance &&
          lightShare >= thresholds.dominantToneShare
        ) {
          return 'light';
        }

        return 'balanced';
      },
      {
        imageSource: source,
        analysisSize: ICON_ANALYSIS_SIZE,
        decodeTimeout: ICON_DECODE_TIMEOUT_MS,
        thresholds: {
          minVisibleAlpha: MIN_VISIBLE_ALPHA,
          minVisibleCoverage: MIN_VISIBLE_COVERAGE,
          darkPixelLuminance: DARK_PIXEL_LUMINANCE,
          darkIconLuminance: DARK_ICON_LUMINANCE,
          lightPixelLuminance: LIGHT_PIXEL_LUMINANCE,
          lightIconLuminance: LIGHT_ICON_LUMINANCE,
          dominantToneShare: DOMINANT_TONE_SHARE,
        },
      },
    );
  } finally {
    await analysisPage.close().catch(() => undefined);
  }
};
