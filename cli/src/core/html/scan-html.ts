import { BROWSER_TIMEOUT } from '../scan/constants';
import { launchScanBrowser, runAxeOnPage } from '../scan/axe';
import type { ScanResult } from '../scan/types';
import type { ScanHtmlOptions } from './types';

export async function scanHtml(
  html: string,
  options: ScanHtmlOptions = {},
): Promise<ScanResult> {
  const {
    label = 'HTML input',
    onProgressPrint = () => undefined,
    selector,
  } = options;

  const browser = await launchScanBrowser(onProgressPrint);

  try {
    onProgressPrint('Rendering HTML');

    const page = await browser.newPage();

    try {
      await page.setContent(html, {
        waitUntil: 'domcontentloaded',
        timeout: BROWSER_TIMEOUT,
      });
    } catch {
      throw new Error('Could not render the HTML input.');
    }

    const result = await runAxeOnPage(page, {
      onProgressPrint,
      selector,
    });

    return {
      ...result,
      url: label,
      metadata: selector ? { selector } : undefined,
    };
  } finally {
    await browser.close().catch(() => undefined);
  }
}
