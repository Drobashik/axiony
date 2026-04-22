import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { program } from 'commander';
import { logger } from '../logger/Logger';

const installLogger = logger.child('install');

const requireFromHere = createRequire(__filename);

type InstallCommandOptions = {
  withDeps?: boolean;
};

export const buildPlaywrightInstallArgs = (options: InstallCommandOptions) => [
  'install',
  ...(options.withDeps ? ['--with-deps'] : []),
  'chromium',
];

const resolvePlaywrightCliPath = () =>
  join(dirname(requireFromHere.resolve('playwright/package.json')), 'cli.js');

const runPlaywrightInstall = async (options: InstallCommandOptions): Promise<void> => {
  const playwrightCliPath = resolvePlaywrightCliPath();
  const args = [playwrightCliPath, ...buildPlaywrightInstallArgs(options)];

  await new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      stdio: 'inherit',
      windowsHide: true,
    });

    child.on('error', reject);

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error('Playwright Chromium installation failed.'));
    });
  });
};

const runInstallCommand = async (options: InstallCommandOptions) => {
  try {
    installLogger.print(
      options.withDeps
        ? 'Installing Playwright Chromium with system dependencies...'
        : 'Installing Playwright Chromium...',
    );

    await runPlaywrightInstall(options);

    installLogger.print('Playwright Chromium is ready for Axiony scans.');

    process.exitCode = 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';

    installLogger.print(message, { stream: 'stderr' });

    process.exitCode = 2;
  }
};

export const registerInstallCommand = () => {
  program
    .command('install')
    .summary('Install Playwright Chromium for Axiony scans')
    .description('Install the Playwright Chromium browser required by Axiony scan commands.')
    .option('--with-deps', 'Also install Linux system dependencies required by Chromium')
    .addHelpText(
      'after',
      `

Examples:
  $ axiony install
  $ axiony install --with-deps
`,
    )
    .action(runInstallCommand);
};
