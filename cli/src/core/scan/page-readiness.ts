import type { Page } from 'playwright';
import type { ScanDiagnostic } from './types';
import {
  PAGE_READINESS_MIN_INTERACTIVE_ELEMENTS,
  PAGE_READINESS_MIN_OBSERVATION,
  PAGE_READINESS_MIN_TEXT_LENGTH,
  PAGE_READINESS_NETWORK_IDLE_TIMEOUT,
  PAGE_READINESS_RESOURCE_TIMEOUT,
  PAGE_READINESS_SAMPLE_INTERVAL,
  PAGE_READINESS_STABLE_WINDOW,
  PAGE_READINESS_TIMEOUT,
  PAGE_SHORT_REFRESH_MAX_DELAY_SECONDS,
} from './constants';

export const POSSIBLE_CHALLENGE_PAGE_WARNING =
  'The page appears to be a bot challenge or refresh page. Results may not represent the intended target page.';

export const BLOCKED_SCAN_PAGE_ERROR =
  'The target site blocked the scanner with an access-denied or bot-protection page. Try the CLI from a network the site trusts, or scan a staging URL that allows automated accessibility checks.';

export const REFRESH_OR_CHALLENGE_PAGE_ERROR =
  'The target page returned a refresh or bot-protection page. Try again, run the CLI locally, or allow the scanner network through the site protection layer.';

export const CLOUDFLARE_CHALLENGE_PAGE_ERROR =
  'Cloudflare blocked the cloud scanner with a Turnstile security challenge. Run the Axiony CLI locally or allow the scanner network in Cloudflare.';

const CHALLENGE_URL_PATTERNS = ['__cf_chl_rt_tk', '/cdn-cgi/challenge-platform/', 'challenge'];

const CHALLENGE_TEXT_PATTERNS = [
  'checking your browser',
  'just a moment',
  'attention required',
  'verify you are human',
];

const BLOCKED_URL_PATTERNS = ['errors.edgesuite.net', '/cdn-cgi/access-denied'];

const BLOCKED_TEXT_PATTERNS = [
  'access denied',
  "you don't have permission to access",
  'you do not have permission to access',
  'request blocked',
  'the request could not be satisfied',
  'forbidden',
];

interface PageWarningSignals {
  hasCloudflareChallenge: boolean;
  hasChallengeText: boolean;
  hasMetaRefresh: boolean;
  metaRefreshDelaySeconds?: number;
  elementCount: number;
  formControlCount: number;
  textLength: number;
}

export interface ChallengeResolution {
  cloudflareBlocked: boolean;
  responseStatus?: number;
  warnings: string[];
}

const looksLikeChallengeUrl = (url: string): boolean => {
  const normalizedUrl = url.toLowerCase();

  return CHALLENGE_URL_PATTERNS.some((pattern) => normalizedUrl.includes(pattern));
};

const looksLikeBlockedUrl = (url: string): boolean => {
  const normalizedUrl = url.toLowerCase();

  return BLOCKED_URL_PATTERNS.some((pattern) => normalizedUrl.includes(pattern));
};

const delay = async (timeout: number): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, timeout);
  });
};

const waitForDocumentResources = async (page: Page): Promise<void> => {
  await Promise.all([
    page
      .waitForLoadState('load', { timeout: PAGE_READINESS_RESOURCE_TIMEOUT })
      .catch(() => undefined),
    page
      .waitForLoadState('networkidle', { timeout: PAGE_READINESS_NETWORK_IDLE_TIMEOUT })
      .catch(() => undefined),
    page
      .evaluate(
        (timeout) =>
          Promise.race([
            Promise.allSettled([
              document.fonts?.ready,
              ...Array.from(document.images)
                .filter((image) => !image.complete)
                .map(
                  (image) =>
                    new Promise<void>((resolve) => {
                      image.addEventListener('load', () => resolve(), { once: true });
                      image.addEventListener('error', () => resolve(), { once: true });
                    }),
                ),
            ]),
            new Promise<void>((resolve) => window.setTimeout(resolve, timeout)),
          ]).then(() => undefined),
        PAGE_READINESS_RESOURCE_TIMEOUT,
      )
      .catch(() => undefined),
  ]);
};

export const waitForPageReadiness = async (page: Page): Promise<void> => {
  await page.waitForSelector('body', { timeout: PAGE_READINESS_TIMEOUT }).catch(() => undefined);
  await waitForDocumentResources(page);

  await page
    .evaluate(
      ({
        minInteractiveElements,
        minObservation,
        minTextLength,
        sampleInterval,
        stableWindow,
        timeout,
      }) =>
        new Promise<void>((resolve) => {
          const body = document.body;

          if (!body) {
            resolve();
            return;
          }

          const startedAt = Date.now();
          let stableSince = startedAt;
          let previousSignature = '';

          const bodyText = () =>
            typeof body.innerText === 'string' ? body.innerText : (body.textContent ?? '');

          const snapshot = () => {
            const textLength = bodyText().trim().length;
            const interactiveElements = Array.from(
              body.querySelectorAll<HTMLElement>(
                'a,button,input,select,textarea,main,nav,header,footer,[role]',
              ),
            );
            const images = Array.from(body.querySelectorAll<HTMLImageElement>('img'));
            const namedInteractiveCount = interactiveElements.filter((element) => {
              const text = element.textContent?.trim();
              const ariaLabel = element.getAttribute('aria-label')?.trim();
              const title = element.getAttribute('title')?.trim();
              const imageAlt = Array.from(element.querySelectorAll<HTMLImageElement>('img')).some(
                (image) => Boolean(image.alt.trim()),
              );

              return Boolean(text || ariaLabel || title || imageAlt);
            }).length;
            const interactiveCount = interactiveElements.length;
            const elementCount = body.querySelectorAll('*').length;
            const completeImageCount = images.filter(
              (image) => image.complete && image.naturalWidth > 0,
            ).length;

            return {
              meaningful: textLength >= minTextLength || interactiveCount >= minInteractiveElements,
              signature: [
                elementCount,
                textLength,
                interactiveCount,
                namedInteractiveCount,
                images.length,
                completeImageCount,
              ].join(':'),
            };
          };

          function cleanup() {
            window.clearInterval(intervalId);
            window.clearTimeout(timeoutId);
          }

          function finish() {
            cleanup();
            resolve();
          }

          const intervalId = window.setInterval(() => {
            const current = snapshot();
            const currentTime = Date.now();

            if (current.signature !== previousSignature) {
              previousSignature = current.signature;
              stableSince = currentTime;
            }

            const observedLongEnough = currentTime - startedAt >= minObservation;
            const stableLongEnough = currentTime - stableSince >= stableWindow;

            if (current.meaningful && observedLongEnough && stableLongEnough) {
              finish();
            }
          }, sampleInterval);

          const timeoutId = window.setTimeout(finish, timeout);
        }),
      {
        minInteractiveElements: PAGE_READINESS_MIN_INTERACTIVE_ELEMENTS,
        minObservation: PAGE_READINESS_MIN_OBSERVATION,
        minTextLength: PAGE_READINESS_MIN_TEXT_LENGTH,
        sampleInterval: PAGE_READINESS_SAMPLE_INTERVAL,
        stableWindow: PAGE_READINESS_STABLE_WINDOW,
        timeout: PAGE_READINESS_TIMEOUT,
      },
    )
    .catch(() => undefined);
};

const readPageWarningSignals = async (page: Page): Promise<PageWarningSignals> =>
  page
    .evaluate((challengeTextPatterns) => {
      const metaRefresh = document.querySelector<HTMLMetaElement>('meta[http-equiv="refresh" i]');
      const metaRefreshContent = metaRefresh?.content?.trim() ?? '';
      const rawDelay = metaRefreshContent.split(';', 1)[0]?.trim();
      const parsedDelay = rawDelay ? Number.parseFloat(rawDelay) : Number.NaN;
      const rawPageText = `${document.title} ${document.body?.innerText ?? ''}`.trim();
      const pageText = rawPageText.toLowerCase().slice(0, 5_000);
      const hasChallengeText = challengeTextPatterns.some((pattern) => pageText.includes(pattern));
      const hasCloudflareChallenge = Boolean(
        document.querySelector(
          'input[name="cf-turnstile-response"], script[src*="challenges.cloudflare.com"], iframe[src*="challenges.cloudflare.com"]',
        ),
      );

      return {
        elementCount: document.body?.querySelectorAll('*').length ?? 0,
        formControlCount:
          document.body?.querySelectorAll('button,input,select,textarea').length ?? 0,
        hasCloudflareChallenge,
        hasChallengeText,
        hasMetaRefresh: Boolean(metaRefresh),
        metaRefreshDelaySeconds: Number.isFinite(parsedDelay) ? parsedDelay : undefined,
        textLength: rawPageText.length,
      };
    }, CHALLENGE_TEXT_PATTERNS)
    .catch(
      (): PageWarningSignals => ({
        elementCount: 0,
        formControlCount: 0,
        hasCloudflareChallenge: false,
        hasChallengeText: false,
        hasMetaRefresh: false,
        textLength: 0,
      }),
    );

const warningsFromSignals = (page: Page, signals: PageWarningSignals): string[] => {
  if (signals.hasMetaRefresh || signals.hasChallengeText || looksLikeChallengeUrl(page.url())) {
    return [POSSIBLE_CHALLENGE_PAGE_WARNING];
  }

  return [];
};

export const detectPageWarnings = async (page: Page): Promise<string[]> =>
  warningsFromSignals(page, await readPageWarningSignals(page));

export const captureScanDiagnostic = async (
  page: Page,
  requestedUrl: string,
  httpStatus?: number,
): Promise<ScanDiagnostic> => {
  const details = await page
    .evaluate(() => {
      const body = document.body;
      const rawHtml = document.documentElement?.outerHTML ?? '';
      const sanitizedHtml = rawHtml
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '<script>…</script>')
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '<style>…</style>')
        .replace(
          /\s(value|nonce|integrity|authorization|token|secret|api-key)=("[^"]*"|'[^']*')/gi,
          ' $1="[redacted]"',
        )
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 1_500);

      return {
        elementCount: body?.querySelectorAll('*').length ?? 0,
        formControlCount: body?.querySelectorAll('button,input,select,textarea').length ?? 0,
        htmlPreview: sanitizedHtml,
        metaRefresh:
          document
            .querySelector<HTMLMetaElement>('meta[http-equiv="refresh" i]')
            ?.content?.trim() || undefined,
        textLength: (body?.innerText ?? body?.textContent ?? '').trim().length,
        title: document.title.trim(),
      };
    })
    .catch(() => ({
      elementCount: 0,
      formControlCount: 0,
      htmlPreview: '',
      metaRefresh: undefined,
      textLength: 0,
      title: '',
    }));

  return {
    capturedAt: new Date().toISOString(),
    requestedUrl,
    finalUrl: page.url(),
    httpStatus,
    ...details,
  };
};

export const detectBlockedScanPage = async (
  page: Page,
  status?: number,
): Promise<string | undefined> => {
  const blockedSignals = await page
    .evaluate((blockedTextPatterns) => {
      const pageText = `${document.title} ${document.body?.innerText ?? ''}`
        .toLowerCase()
        .slice(0, 5_000);
      const hasBlockedText = blockedTextPatterns.some((pattern) => pageText.includes(pattern));

      return {
        hasBlockedText,
      };
    }, BLOCKED_TEXT_PATTERNS)
    .catch(() => ({ hasBlockedText: false }));

  const blockedStatus = status === 401 || status === 403 || status === 429;

  if (
    blockedSignals.hasBlockedText ||
    looksLikeBlockedUrl(page.url()) ||
    (blockedStatus && looksLikeChallengeUrl(page.url()))
  ) {
    return BLOCKED_SCAN_PAGE_ERROR;
  }

  return undefined;
};

export const waitForChallengeResolution = async (page: Page): Promise<ChallengeResolution> => {
  const signals = await readPageWarningSignals(page);
  const warnings = warningsFromSignals(page, signals);

  if (signals.hasCloudflareChallenge) {
    return { cloudflareBlocked: true, warnings };
  }

  const shortRefresh =
    signals.metaRefreshDelaySeconds !== undefined &&
    signals.metaRefreshDelaySeconds <= PAGE_SHORT_REFRESH_MAX_DELAY_SECONDS;

  if (shortRefresh) {
    const currentUrl = page.url();
    const navigationWait = signals.metaRefreshDelaySeconds! * 1_000 + 750;

    await Promise.race([
      page
        .waitForURL((nextUrl) => nextUrl.href !== currentUrl, {
          timeout: navigationWait,
        })
        .catch(() => undefined),
      delay(navigationWait),
    ]);

    if (page.url() !== currentUrl) {
      await waitForPageReadiness(page);
    }
  }

  return {
    cloudflareBlocked: false,
    warnings: await detectPageWarnings(page),
  };
};
