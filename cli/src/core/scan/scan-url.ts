import { BROWSER_TIMEOUT } from './constants';
import { addAxeInitScript, launchScanBrowser, runAxeOnPage } from './axe';
import type { ScanResult, ScanUrlOptions } from './types';

const formatNavigationError = (error: unknown): string =>
  error instanceof Error && error.message.includes('Timeout')
    ? 'Page load timed out. Check the URL and try again.'
    : 'Could not open the page. Check the URL and try again.';

export async function scanUrl(
  url: string,
  options: ScanUrlOptions = {},
): Promise<ScanResult> {
  const { onProgressPrint = () => undefined, selector } = options;

  const browser = await launchScanBrowser(onProgressPrint);

  try {
    onProgressPrint('Opening page');

    const page = await browser.newPage();
    await addAxeInitScript(page);

    try {
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: BROWSER_TIMEOUT,
      });
    } catch (error) {
      const navigationError = new Error(
        formatNavigationError(error),
      ) as Error & {
        cause?: unknown;
      };
      navigationError.cause = error;
      throw navigationError;
    }

    const result = await runAxeOnPage(page, {
      onProgressPrint,
      selector,
    });

    return {
      url: result.url,
      timestamp: result.timestamp,
      metadata: selector ? { selector } : undefined,
      issues: result.issues,
      manualChecks: result.manualChecks,
    };
  } finally {
    await browser.close().catch(() => undefined);
  }
}
