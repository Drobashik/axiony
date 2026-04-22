import { registerComponentCommand } from '../commands/component';
import { registerHtmlCommand } from '../commands/html';
import { registerInstallCommand } from '../commands/install';
import { registerScanCommand } from '../commands/scan';

export const commandsRegister = [
  registerInstallCommand,
  registerScanCommand,
  registerHtmlCommand,
  registerComponentCommand,
];
