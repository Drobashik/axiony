#!/usr/bin/env node
import { program } from 'commander';
import pkg from '../package.json';
import { commandsRegister } from './register';

const { description, name, version } = pkg;

async function main(): Promise<void> {
  program
    .name(name)
    .description(description)
    .version(version)
    .showHelpAfterError()
    .exitOverride()
    .addHelpText(
      'after',
      `

Examples:
  $ axiony scan https://example.com
  $ axiony html --file ./page.html
  $ axiony scan https://example.com --json
  $ axiony scan https://example.com --json --output report
`,
    );

  commandsRegister.forEach((command) => {
    command();
  });

  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    if (isSuccessfulCommanderExit(error)) {
      return;
    }

    process.exitCode = 2;
  }
}

main();

function isSuccessfulCommanderExit(error: unknown): boolean {
  return error instanceof Error && 'exitCode' in error && error.exitCode === 0;
}
