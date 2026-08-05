import type { Page } from 'playwright';
import type { SiteIconAppearance } from './types';

const ICON_ANALYSIS_SIZE = 64;
const MAX_ICON_BYTES = 2 * 1024 * 1024;
const MAX_ICON_CANDIDATES = 8;
const ICON_REQUEST_TIMEOUT_MS = 3_000;
const ICON_DECODE_TIMEOUT_MS = 1_500;
const MIN_VISIBLE_ALPHA = 0.08;
const MIN_OPAQUE_ALPHA = 0.95;
const MIN_VISIBLE_COVERAGE = 0.01;
const MIN_BACKGROUND_COVERAGE = 0.68;
const MIN_BACKGROUND_ICON_SIZE = 24;
const MIN_SQUARE_ASPECT_RATIO = 0.8;
const DARK_PIXEL_LUMINANCE = 0.24;
const DARK_ICON_LUMINANCE = 0.28;
const LIGHT_PIXEL_LUMINANCE = 0.72;
const LIGHT_ICON_LUMINANCE = 0.72;
const DOMINANT_TONE_SHARE = 0.68;
const VECTOR_QUALITY_SIZE = 512;
const MAX_QUALITY_SIZE = 512;
const BACKGROUND_SCORE_BONUS = 100_000;
const SQUARE_SCORE_BONUS = 5_000;
const QUALITY_SCORE_MULTIPLIER = 100;

type IconCandidateSource = 'declared' | 'apple-touch-icon' | 'default' | 'schema';

interface IconCandidate {
  src: string;
  declaredSize: number;
  source: IconCandidateSource;
  vectorHint: boolean;
  order: number;
}

interface IconAnalysis {
  appearance: SiteIconAppearance;
  naturalWidth: number;
  naturalHeight: number;
  opaqueCoverage: number;
  vector: boolean;
}

interface AnalyzedIcon {
  candidate: IconCandidate;
  analysis: IconAnalysis;
}

export interface ResolvedPageIcon {
  src: string;
  appearance: SiteIconAppearance;
}

const contentTypeFromUrl = (iconUrl: string): string | undefined => {
  const pathname = new URL(iconUrl).pathname.toLowerCase();

  if (pathname.endsWith('.svg')) return 'image/svg+xml';
  if (pathname.endsWith('.png')) return 'image/png';
  if (pathname.endsWith('.ico')) return 'image/x-icon';
  if (pathname.endsWith('.webp')) return 'image/webp';
  if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) return 'image/jpeg';
  if (pathname.endsWith('.gif')) return 'image/gif';

  return undefined;
};

const resolveContentType = (iconUrl: string, headerValue?: string): string | undefined => {
  const headerType = headerValue?.split(';')[0]?.trim().toLowerCase();

  if (headerType?.startsWith('image/')) {
    return headerType;
  }

  return contentTypeFromUrl(iconUrl);
};

const collectPageIconCandidates = async (page: Page): Promise<IconCandidate[]> =>
  page.evaluate(() => {
    interface BrowserCandidate {
      src: string;
      declaredSize: number;
      source: IconCandidateSource;
      vectorHint: boolean;
      order: number;
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

    const isVectorSource = (src: string, type = ''): boolean =>
      type.toLowerCase().includes('svg') || new URL(src).pathname.toLowerCase().endsWith('.svg');

    const candidates: BrowserCandidate[] = [];

    document.querySelectorAll<HTMLLinkElement>('link[rel]').forEach((link, order) => {
      const rel = link.rel.toLowerCase().split(/\s+/);
      const appleTouchIcon = rel.some((value) => value.startsWith('apple-touch-icon'));
      const customIcon = rel.some((value) => value.endsWith('-icon') && value !== 'mask-icon');
      const standardIcon = rel.includes('icon') || customIcon;

      if (!standardIcon && !appleTouchIcon) return;

      const src = absoluteUrl(link.href);

      if (!src) return;

      candidates.push({
        src,
        declaredSize: declaredSize(link.getAttribute('sizes') ?? ''),
        source: appleTouchIcon ? 'apple-touch-icon' : 'declared',
        vectorHint: isVectorSource(src, link.type),
        order,
      });
    });

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

    const candidateUrls = new Set(candidates.map(({ src }) => src));
    const defaultIcon = absoluteUrl('/favicon.ico');

    if (defaultIcon && !candidateUrls.has(defaultIcon)) {
      candidates.push({
        src: defaultIcon,
        declaredSize: 0,
        source: 'default',
        vectorHint: false,
        order: candidates.length,
      });
      candidateUrls.add(defaultIcon);
    }

    schemaLogos.forEach((src) => {
      if (candidateUrls.has(src)) return;

      candidates.push({
        src,
        declaredSize: 0,
        source: 'schema',
        vectorHint: isVectorSource(src),
        order: candidates.length,
      });
      candidateUrls.add(src);
    });

    return candidates;
  });

const loadIconSource = async (
  page: Page,
  candidate: IconCandidate,
): Promise<{ candidate: IconCandidate; source: string; vector: boolean } | undefined> => {
  const response = await page.context().request.get(candidate.src, {
    failOnStatusCode: false,
    timeout: ICON_REQUEST_TIMEOUT_MS,
  });

  if (!response.ok()) {
    return undefined;
  }

  const headers = response.headers();
  const contentType = resolveContentType(candidate.src, headers['content-type']);

  if (!contentType) {
    return undefined;
  }

  const declaredLength = Number(headers['content-length']);

  if (Number.isFinite(declaredLength) && declaredLength > MAX_ICON_BYTES) {
    return undefined;
  }

  const body = await response.body();

  if (body.length === 0 || body.length > MAX_ICON_BYTES) {
    return undefined;
  }

  return {
    candidate,
    source: `data:${contentType};base64,${body.toString('base64')}`,
    vector: contentType === 'image/svg+xml' || candidate.vectorHint,
  };
};

const analyzeIconSource = async (
  analysisPage: Page,
  source: string,
  vector: boolean,
): Promise<IconAnalysis | undefined> =>
  analysisPage.evaluate(
    async ({ imageSource, isVector, analysisSize, decodeTimeout, thresholds }) => {
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

      if (!decoded || !image.naturalWidth || !image.naturalHeight) {
        return undefined;
      }

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', { willReadFrequently: true });

      if (!context) {
        return undefined;
      }

      canvas.width = analysisSize;
      canvas.height = analysisSize;

      const scale = Math.min(analysisSize / image.naturalWidth, analysisSize / image.naturalHeight);
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
      let opaquePixels = 0;
      let luminanceTotal = 0;
      let darkWeight = 0;
      let lightWeight = 0;

      const linearChannel = (channel: number): number => {
        const normalized = channel / 255;

        return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      };

      for (let index = 0; index < pixels.length; index += 4) {
        const alpha = pixels[index + 3] / 255;

        if (alpha >= thresholds.minOpaqueAlpha) {
          opaquePixels += 1;
        }

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

      const pixelCount = analysisSize * analysisSize;

      if (visibleWeight < pixelCount * thresholds.minVisibleCoverage) {
        return undefined;
      }

      const averageLuminance = luminanceTotal / visibleWeight;
      const darkShare = darkWeight / visibleWeight;
      const lightShare = lightWeight / visibleWeight;
      let appearance: SiteIconAppearance = 'balanced';

      if (
        averageLuminance <= thresholds.darkIconLuminance &&
        darkShare >= thresholds.dominantToneShare
      ) {
        appearance = 'dark';
      } else if (
        averageLuminance >= thresholds.lightIconLuminance &&
        lightShare >= thresholds.dominantToneShare
      ) {
        appearance = 'light';
      }

      return {
        appearance,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        opaqueCoverage: opaquePixels / pixelCount,
        vector: isVector,
      };
    },
    {
      imageSource: source,
      isVector: vector,
      analysisSize: ICON_ANALYSIS_SIZE,
      decodeTimeout: ICON_DECODE_TIMEOUT_MS,
      thresholds: {
        minVisibleAlpha: MIN_VISIBLE_ALPHA,
        minOpaqueAlpha: MIN_OPAQUE_ALPHA,
        minVisibleCoverage: MIN_VISIBLE_COVERAGE,
        darkPixelLuminance: DARK_PIXEL_LUMINANCE,
        darkIconLuminance: DARK_ICON_LUMINANCE,
        lightPixelLuminance: LIGHT_PIXEL_LUMINANCE,
        lightIconLuminance: LIGHT_ICON_LUMINANCE,
        dominantToneShare: DOMINANT_TONE_SHARE,
      },
    },
  );

const sourceScore = (source: IconCandidateSource): number => {
  switch (source) {
    case 'apple-touch-icon':
      return 400;
    case 'declared':
      return 300;
    case 'default':
      return 200;
    case 'schema':
      return 100;
  }
};

const iconScore = ({ candidate, analysis }: AnalyzedIcon): number => {
  const naturalSize = Math.min(analysis.naturalWidth, analysis.naturalHeight);
  const qualitySize = Math.min(
    MAX_QUALITY_SIZE,
    Math.max(candidate.declaredSize, analysis.vector ? VECTOR_QUALITY_SIZE : naturalSize),
  );
  const aspectRatio =
    Math.min(analysis.naturalWidth, analysis.naturalHeight) /
    Math.max(analysis.naturalWidth, analysis.naturalHeight);
  const backgroundReady =
    analysis.opaqueCoverage >= MIN_BACKGROUND_COVERAGE &&
    (analysis.vector || naturalSize >= MIN_BACKGROUND_ICON_SIZE);

  return (
    (backgroundReady ? BACKGROUND_SCORE_BONUS : 0) +
    (aspectRatio >= MIN_SQUARE_ASPECT_RATIO ? SQUARE_SCORE_BONUS : 0) +
    qualitySize * QUALITY_SCORE_MULTIPLIER +
    sourceScore(candidate.source) -
    candidate.order
  );
};

export const resolvePageIcon = async (page: Page): Promise<ResolvedPageIcon | undefined> => {
  const candidates = await collectPageIconCandidates(page);
  const limitedCandidates = candidates.slice(0, MAX_ICON_CANDIDATES);
  const loadedIcons = (
    await Promise.all(
      limitedCandidates.map((candidate) => loadIconSource(page, candidate).catch(() => undefined)),
    )
  ).filter((icon): icon is NonNullable<typeof icon> => Boolean(icon));

  if (loadedIcons.length === 0) {
    return undefined;
  }

  const analysisPage = await page.context().newPage();

  try {
    const analyzedIcons = (
      await Promise.all(
        loadedIcons.map(async ({ candidate, source, vector }) => {
          const analysis = await analyzeIconSource(analysisPage, source, vector).catch(
            () => undefined,
          );

          return analysis ? { candidate, analysis } : undefined;
        }),
      )
    ).filter((icon): icon is NonNullable<typeof icon> => Boolean(icon));

    const selectedIcon = analyzedIcons.sort((left, right) => iconScore(right) - iconScore(left))[0];

    if (!selectedIcon) {
      return undefined;
    }

    return {
      src: selectedIcon.candidate.src,
      appearance: selectedIcon.analysis.appearance,
    };
  } finally {
    await analysisPage.close().catch(() => undefined);
  }
};
