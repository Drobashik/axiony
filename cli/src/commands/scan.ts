import { program } from 'commander';
import { validateUrl } from '../helpers';
import { logger } from '../logger/Logger';

const SCAN = 'scan';

const scanLogger = logger.child(SCAN);

const runScanCommand = async (url: string) => {
  try {
    scanLogger.debug('Validating scan target URL', { url });

    validateUrl(url);

    scanLogger.info(`Scanning ${url}...`);

    scanLogger.info(
      'CLI is wired correctly. Scanner implementation comes next.',
    );

    scanLogger.success('Scan command finished successfully.');

    process.exit(0);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';

    scanLogger.error(message, error);

    process.exit(2);
  }
};

export const registerScanCommand = () => {
  program
    .command(SCAN)
    .description('Scan a page for accessibility issues')
    .argument('<url>', 'Target URL to scan')
    .action(runScanCommand);
};
