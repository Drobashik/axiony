import { resolve } from 'node:path';
import { program } from 'commander';
import { logger } from '../logger/Logger';
import { scanComponent } from '../core/component/scan-component';
import { CliSpinner } from '../ui/terminal/spinner';
import { formatScanOutput } from '../ui/scan/formatter';
import {
  getScanOutputFormat,
  validateJsonOutputOptions,
  writeOutputFile,
  type JsonOutputOptions,
} from './shared';

const componentLogger = logger.child('component');

type ComponentCommandOptions = JsonOutputOptions & {
  selector?: string;
  verbose?: boolean;
};

const validateComponentOptions = (options: ComponentCommandOptions) => {
  validateJsonOutputOptions(options);

  if (options.selector !== undefined && options.selector.trim().length === 0) {
    throw new Error('Use --selector with a non-empty CSS selector.');
  }
};

const runComponentCommand = async (filePath: string, options: ComponentCommandOptions) => {
  const format = getScanOutputFormat(options);

  const shouldPrintToStdout = !options.output;

  const shouldPrintProgress = shouldPrintToStdout && format === 'text';

  const spinner = new CliSpinner(componentLogger);

  let spinnerStarted = false;

  const targetLabel = resolve(filePath);

  try {
    validateComponentOptions(options);

    if (shouldPrintProgress) {
      spinner.start(`Scanning ${targetLabel}`);
      spinnerStarted = true;
    }

    const result = await scanComponent(filePath, {
      onProgressPrint: (message) => {
        if (shouldPrintProgress) {
          spinner.update(`${message} ${targetLabel}`);
        }
      },
      selector: options.selector?.trim(),
    });

    if (shouldPrintProgress) {
      spinner.succeed(
        result.issues.length === 0
          ? `Scan completed for ${targetLabel}`
          : `Scan completed with issues for ${targetLabel}`,
      );
    }

    const output = formatScanOutput(result, format, {
      command: 'axiony component',
      verbose: options.verbose,
    });

    if (options.output) {
      await writeOutputFile(options.output, output);
    } else {
      componentLogger.print(output);
    }

    process.exitCode = result.issues.length === 0 ? 0 : 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';

    if (spinnerStarted) {
      spinner.fail(`Scan failed for ${targetLabel}`);
    }

    componentLogger.print(message, { stream: 'stderr' });

    process.exitCode = 2;
  }
};

export const registerComponentCommand = () => {
  program
    .command('component')
    .summary('Scan a local React component for accessibility issues')
    .description(
      'Render one local React component with zero-config best-effort mode, run axe-core, and print an accessibility report.',
    )
    .argument('<path>', 'Local .tsx, .jsx, .ts, or .js React component file')
    .option('--json', 'Print the scan result as pretty JSON')
    .option('--selector <selector>', 'Scan only within a matched DOM region')
    .option('--verbose', 'Print all matched elements and HTML snippets')
    .option('-o, --output <name>', 'Write JSON output to a file in axy-reports (requires --json)')
    .addHelpText(
      'after',
      `

Examples:
  $ axiony component ./src/Button.tsx
  $ axiony component ./src/Button.tsx --json
  $ axiony component ./src/Button.tsx --verbose
  $ axiony component ./src/Button.tsx --selector "#root"
`,
    )
    .action(runComponentCommand);
};
