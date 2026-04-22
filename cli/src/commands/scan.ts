import { program } from 'commander';
import { validateUrl } from '../helpers';
import { logger } from '../logger/Logger';
import { scanUrl } from '../core/scan/scan-url';
import { CliSpinner } from '../ui/terminal/spinner';
import { formatCiScanReport, formatScanOutput } from '../ui/scan/formatter';
import {
  getScanOutputFormat,
  validateJsonOutputOptions,
  writeOutputFile,
  type JsonOutputOptions,
} from './shared';

const scanLogger = logger.child('scan');

type ScanCommandOptions = JsonOutputOptions & {
  ci?: boolean;
  selector?: string;
  verbose?: boolean;
};

const validateScanOptions = (options: ScanCommandOptions) => {
  validateJsonOutputOptions(options);

  if (options.selector !== undefined && options.selector.trim().length === 0) {
    throw new Error('Use --selector with a non-empty CSS selector.');
  }
};

const runScanCommand = async (url: string, options: ScanCommandOptions) => {
  const format = getScanOutputFormat(options);
  const shouldPrintToStdout = !options.output;
  const shouldPrintProgress = !options.ci && shouldPrintToStdout && format === 'text';
  const spinner = new CliSpinner(scanLogger);
  let spinnerStarted = false;

  try {
    validateUrl(url);
    validateScanOptions(options);

    if (shouldPrintProgress) {
      spinner.start(`Scanning ${url}`);
      spinnerStarted = true;
    }

    const result = await scanUrl(url, {
      onProgressPrint: (message) => {
        if (shouldPrintProgress) {
          spinner.update(`${message} ${url}`);
        }
      },
      selector: options.selector?.trim(),
    });

    if (shouldPrintProgress) {
      spinner.succeed(
        result.issues.length === 0
          ? `Scan completed for ${url}`
          : `Scan completed with issues for ${url}`,
      );
    }

    if (options.ci) {
      const outputPath = options.output
        ? await writeOutputFile(options.output, JSON.stringify(result, null, 2))
        : undefined;

      scanLogger.print(formatCiScanReport(result, { outputPath }));
    } else {
      const output = formatScanOutput(result, format, {
        command: 'axiony scan',
        verbose: options.verbose,
      });

      if (options.output) {
        await writeOutputFile(options.output, output);
      } else {
        scanLogger.print(output);
      }
    }

    process.exitCode = result.issues.length === 0 ? 0 : 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';

    if (spinnerStarted) {
      spinner.fail(`Scan failed for ${url}`);
    }

    scanLogger.print(message, { stream: 'stderr' });

    process.exitCode = 2;
  }
};

export const registerScanCommand = () => {
  program
    .command('scan')
    .summary('Scan one URL for accessibility issues')
    .description('Scan one page with axe-core and print an accessibility report.')
    .argument('<url>', 'Target URL to scan')
    .option('--json', 'Print the scan result as pretty JSON')
    .option('--ci', 'Print a compact CI-friendly scan summary')
    .option('--selector <selector>', 'Scan only within a matched DOM region')
    .option('--verbose', 'Print all matched elements and HTML snippets')
    .option(
      '-o, --output <name>',
      'Write JSON output to a file in axy-reports (requires --json or --ci)',
    )
    .addHelpText(
      'after',
      `

Examples:
  $ axiony scan https://example.com
  $ axiony scan https://example.com --selector main
  $ axiony scan https://example.com --verbose
  $ axiony scan https://example.com --json
  $ axiony scan https://example.com --json --output example
  $ axiony scan http://127.0.0.1:3000 --ci --output app
`,
    )
    .action(runScanCommand);
};
