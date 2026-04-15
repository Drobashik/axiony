import { program } from 'commander';
import { validateUrl } from '../helpers';
import { logger } from '../logger/Logger';
import { scanUrl } from '../core/scan/scan-url';
import { EMPTY_STRING } from './constants';

const SCAN = 'scan';

export const scanLogger = logger.child(SCAN);

const runScanCommand = async (url: string) => {
  try {
    validateUrl(url);

    scanLogger.info(`Scanning ${url}...`);

    scanLogger.info(EMPTY_STRING);

    const result = await scanUrl(url);

    if (result.issues.length === 0) {
      scanLogger.info('No accessibility issues found.');

      process.exitCode = 0;

      return;
    }

    scanLogger.info(`${result.issues.length} accessibility issue(s) found:\n`);

    for (const issue of result.issues) {
      scanLogger.info(`[${issue.impact}] ${issue.id}`);

      scanLogger.info(`Element: ${issue.selector}`);

      scanLogger.info(issue.help);

      scanLogger.info(issue.description);

      scanLogger.info(EMPTY_STRING);
    }

    process.exitCode = 1;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';

    console.error(message);

    process.exitCode = 2;
  }
};

export const registerScanCommand = () => {
  program
    .command(SCAN)
    .description('Scan a page for accessibility issues')
    .argument('<url>', 'Target URL to scan')
    .action(runScanCommand);
};
