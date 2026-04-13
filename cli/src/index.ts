import { program } from 'commander';
import pkg from '../package.json';
import { commandsRegister } from './register';

const { description, name, version } = pkg;

async function main(): Promise<void> {
  program.name(name).description(description).version(version);

  commandsRegister.forEach((command) => {
    command();
  });

  await program.parseAsync(process.argv);
}

main();
