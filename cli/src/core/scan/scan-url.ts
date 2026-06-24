import { BROWSER_TIMEOUT } from './constants';
import { addAxeInitScript, createScanPage, launchScanBrowser, runAxeOnPage } from './axe';
import {
  captureScanDiagnostic,
  CLOUDFLARE_CHALLENGE_PAGE_ERROR,
  detectBlockedScanPage,
  detectPageWarnings,
  REFRESH_OR_CHALLENGE_PAGE_ERROR,
  waitForChallengeResolution,
  waitForPageReadiness,
} from './page-readiness';
import { createWcagAxeOptions } from './profile';
import { readScanSessionCookies, writeScanSessionCookies } from './session-cookies';
import { ScanDiagnosticError } from './types';
import type { ScanResult, ScanUrlOptions } from './types';

type ScanUrlMetadata = NonNullable<ScanResult['metadata']>;

const formatNavigationError = (error: unknown): string =>
  error instanceof Error && error.message.includes('Timeout')
    ? 'Page load timed out. Check the URL and try again.'
    : 'Could not open the page. Check the URL and try again.';

const buildScanUrlMetadata = (
  selector: string | undefined,
  warnings: string[],
): ScanUrlMetadata | undefined => {
  const metadata: ScanUrlMetadata = {};

  if (selector) {
    metadata.selector = selector;
  }

  if (warnings.length > 0) {
    metadata.warnings = warnings;
  }

  if (Object.keys(metadata).length === 0) {
    return undefined;
  }

  return metadata;
};

const REFRESH_ONLY_RULE_IDS = new Set(['meta-refresh', 'meta-refresh-no-exceptions']);

const isLikelyRefreshPlaceholderResult = (
  result: Pick<ScanResult, 'issues' | 'manualChecks'>,
): boolean => {
  const hasNoFindings = result.issues.length === 0 && result.manualChecks.length === 0;
  const hasOnlyRefreshIssues =
    result.issues.length > 0 &&
    result.manualChecks.length === 0 &&
    result.issues.every((issue) => REFRESH_ONLY_RULE_IDS.has(issue.id));

  return hasNoFindings || hasOnlyRefreshIssues;
};

export async function scanUrl(url: string, options: ScanUrlOptions = {}): Promise<ScanResult> {
  const { level, onProgressPrint = () => undefined, selector } = options;

  const browser = await launchScanBrowser(onProgressPrint);

  try {
    const storedCookies = readScanSessionCookies(url);
    onProgressPrint('Opening page');

    const page = await createScanPage(browser, { cookies: storedCookies });

    try {
      await addAxeInitScript(page);

      let responseStatus: number | undefined;

      try {
        const response = await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: BROWSER_TIMEOUT,
        });
        responseStatus = response?.status();
      } catch (error) {
        const navigationError = new Error(formatNavigationError(error)) as Error & {
          cause?: unknown;
        };
        navigationError.cause = error;
        throw navigationError;
      }

      const initialChallengeResolution = await waitForChallengeResolution(page);
      if (initialChallengeResolution.cloudflareBlocked) {
        throw new ScanDiagnosticError(
          CLOUDFLARE_CHALLENGE_PAGE_ERROR,
          await captureScanDiagnostic(page, url, responseStatus),
        );
      }

      onProgressPrint('Waiting for page readiness');
      await waitForPageReadiness(page);
      const challengeResolution = await waitForChallengeResolution(page);

      if (challengeResolution.cloudflareBlocked) {
        throw new ScanDiagnosticError(
          CLOUDFLARE_CHALLENGE_PAGE_ERROR,
          await captureScanDiagnostic(page, url, responseStatus),
        );
      }

      const blockedScanError = await detectBlockedScanPage(page, responseStatus);
      if (blockedScanError) {
        throw new Error(blockedScanError);
      }

      const warnings =
        challengeResolution.warnings.length > 0
          ? challengeResolution.warnings
          : await detectPageWarnings(page);

      const result = await runAxeOnPage(page, {
        axeOptions: level ? createWcagAxeOptions(level) : undefined,
        onProgressPrint,
        selector,
      });

      const refreshPlaceholder = warnings.length > 0 && isLikelyRefreshPlaceholderResult(result);

      if (refreshPlaceholder) {
        throw new ScanDiagnosticError(
          REFRESH_OR_CHALLENGE_PAGE_ERROR,
          await captureScanDiagnostic(page, url, responseStatus),
        );
      }

      const sessionCookies = await page
        .context()
        .cookies(url)
        .catch(() => []);
      writeScanSessionCookies(url, sessionCookies);

      return {
        url: result.url,
        timestamp: result.timestamp,
        metadata: buildScanUrlMetadata(selector, warnings),
        issues: result.issues,
        manualChecks: result.manualChecks,
      };
    } finally {
      await page
        .context()
        .close()
        .catch(() => undefined);
    }
  } finally {
    await browser.close().catch(() => undefined);
  }
}
