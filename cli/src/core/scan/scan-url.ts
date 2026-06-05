import { BROWSER_TIMEOUT } from './constants';
import { addAxeInitScript, createScanPage, launchScanBrowser, runAxeOnPage } from './axe';
import {
  detectBlockedScanPage,
  detectPageWarnings,
  waitForChallengeResolution,
  waitForPageReadiness,
} from './page-readiness';
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

export async function scanUrl(url: string, options: ScanUrlOptions = {}): Promise<ScanResult> {
  const { onProgressPrint = () => undefined, selector } = options;

  const browser = await launchScanBrowser(onProgressPrint);

  try {
    onProgressPrint('Opening page');

    const page = await createScanPage(browser);
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

    onProgressPrint('Waiting for page readiness');
    await waitForPageReadiness(page);
    await waitForChallengeResolution(page);

    const blockedScanError = await detectBlockedScanPage(page, responseStatus);
    if (blockedScanError) {
      throw new Error(blockedScanError);
    }

    const warnings = await detectPageWarnings(page);

    const result = await runAxeOnPage(page, {
      onProgressPrint,
      selector,
    });

    return {
      url: result.url,
      timestamp: result.timestamp,
      metadata: buildScanUrlMetadata(selector, warnings),
      issues: result.issues,
      manualChecks: result.manualChecks,
    };
  } finally {
    await browser.close().catch(() => undefined);
  }
}
