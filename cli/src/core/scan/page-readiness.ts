import type { Page } from 'playwright';
import {
  PAGE_CHALLENGE_RETRY_DELAY,
  PAGE_CHALLENGE_RETRY_ATTEMPTS,
  PAGE_CHALLENGE_RETRY_TIMEOUT,
  PAGE_READINESS_MIN_INTERACTIVE_ELEMENTS,
  PAGE_READINESS_MIN_TEXT_LENGTH,
  PAGE_READINESS_STABLE_WINDOW,
  PAGE_READINESS_TIMEOUT,
} from './constants';

export const POSSIBLE_CHALLENGE_PAGE_WARNING =
  'The page appears to be a bot challenge or refresh page. Results may not represent the intended target page.';

const CHALLENGE_URL_PATTERNS = [
  '__cf_chl_rt_tk',
  '/cdn-cgi/challenge-platform/',
  'challenge',
];

const CHALLENGE_TEXT_PATTERNS = [
  'checking your browser',
  'just a moment',
  'attention required',
  'verify you are human',
];

const looksLikeChallengeUrl = (url: string): boolean => {
  const normalizedUrl = url.toLowerCase();

  return CHALLENGE_URL_PATTERNS.some((pattern) =>
    normalizedUrl.includes(pattern),
  );
};

const delay = async (timeout: number): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, timeout);
  });
};

export const waitForPageReadiness = async (page: Page): Promise<void> => {
  await page
    .waitForSelector('body', { timeout: PAGE_READINESS_TIMEOUT })
    .catch(() => undefined);

  await page
    .evaluate(
      ({ minInteractiveElements, minTextLength, stableWindow, timeout }) =>
        new Promise<void>((resolve) => {
          const body = document.body;

          if (!body) {
            resolve();
            return;
          }

          let lastMutationAt = Date.now();

          function cleanup() {
            observer.disconnect();
            window.clearInterval(intervalId);
            window.clearTimeout(timeoutId);
          }

          function finish() {
            cleanup();
            resolve();
          }

          const hasMeaningfulContent = () => {
            const textLength = body.innerText.trim().length;
            const interactiveCount = body.querySelectorAll(
              'a,button,input,select,textarea,main,nav,header,footer,[role]',
            ).length;

            return (
              textLength >= minTextLength ||
              interactiveCount >= minInteractiveElements
            );
          };

          const observer = new MutationObserver(() => {
            lastMutationAt = Date.now();
          });

          observer.observe(body, {
            attributes: true,
            characterData: true,
            childList: true,
            subtree: true,
          });

          const intervalId = window.setInterval(() => {
            const hasStableDom = Date.now() - lastMutationAt >= stableWindow;

            if (hasMeaningfulContent() && hasStableDom) {
              finish();
            }
          }, 100);

          const timeoutId = window.setTimeout(finish, timeout);
        }),
      {
        minInteractiveElements: PAGE_READINESS_MIN_INTERACTIVE_ELEMENTS,
        minTextLength: PAGE_READINESS_MIN_TEXT_LENGTH,
        stableWindow: PAGE_READINESS_STABLE_WINDOW,
        timeout: PAGE_READINESS_TIMEOUT,
      },
    )
    .catch(() => undefined);
};

export const detectPageWarnings = async (page: Page): Promise<string[]> => {
  const warningSignals = await page
    .evaluate((challengeTextPatterns) => {
      const hasMetaRefresh = Boolean(
        document.querySelector('meta[http-equiv="refresh" i]'),
      );
      const pageText = `${document.title} ${document.body?.innerText ?? ''}`
        .toLowerCase()
        .slice(0, 5_000);
      const hasChallengeText = challengeTextPatterns.some((pattern) =>
        pageText.includes(pattern),
      );

      return {
        hasChallengeText,
        hasMetaRefresh,
      };
    }, CHALLENGE_TEXT_PATTERNS)
    .catch(() => ({ hasChallengeText: false, hasMetaRefresh: false }));

  if (
    warningSignals.hasMetaRefresh ||
    warningSignals.hasChallengeText ||
    looksLikeChallengeUrl(page.url())
  ) {
    return [POSSIBLE_CHALLENGE_PAGE_WARNING];
  }

  return [];
};

export const waitForChallengeResolution = async (page: Page): Promise<void> => {
  const startedAt = Date.now();
  let attempts = 0;

  while (
    attempts < PAGE_CHALLENGE_RETRY_ATTEMPTS &&
    Date.now() - startedAt < PAGE_CHALLENGE_RETRY_TIMEOUT
  ) {
    const warnings = await detectPageWarnings(page);

    if (warnings.length === 0) {
      return;
    }

    attempts += 1;

    const currentUrl = page.url();

    await Promise.race([
      page
        .waitForURL((nextUrl) => nextUrl.href !== currentUrl, {
          timeout: PAGE_CHALLENGE_RETRY_DELAY,
        })
        .catch(() => undefined),
      delay(PAGE_CHALLENGE_RETRY_DELAY),
    ]);

    if (page.url() === currentUrl) {
      await page
        .reload({
          timeout: PAGE_READINESS_TIMEOUT,
          waitUntil: 'domcontentloaded',
        })
        .catch(() => undefined);
    }

    await waitForPageReadiness(page);
  }
};
