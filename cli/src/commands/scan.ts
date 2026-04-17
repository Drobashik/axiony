import { program } from 'commander';
import { validateUrl } from '../helpers';
import { logger } from '../logger/Logger';
import { scanUrl } from '../core/scan/scan-url';
import { CliSpinner } from '../ui/terminal/spinner';
import { formatScanReport } from '../ui/scan/formatter';

const scanLogger = logger.child('scan');

const runScanCommand = async (url: string) => {
  const spinner = new CliSpinner(scanLogger);

  try {
    validateUrl(url);

    spinner.start(`Scanning ${url}`);

    const result = await scanUrl(url, {
      onProgress: (message) => spinner.update(`${message} ${url}`),
    });

    spinner.succeed(
      result.issues.length === 0
        ? `Scan completed for ${url}`
        : `Scan completed with issues for ${url}`,
    );

    scanLogger.print(formatScanReport(result));

    process.exitCode = result.issues.length === 0 ? 0 : 1;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';

    spinner.fail(`Scan failed for ${url}`);

    scanLogger.print(message, { stream: 'stderr' });

    process.exitCode = 2;
  }
};

export const registerScanCommand = () => {
  program
    .command('scan')
    .description('Scan a page for accessibility issues')
    .argument('<url>', 'Target URL to scan')
    .action(runScanCommand);
};
