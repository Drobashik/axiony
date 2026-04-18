import { registerHtmlCommand } from '../commands/html';
import { registerScanCommand } from '../commands/scan';

export const commandsRegister = [registerScanCommand, registerHtmlCommand];
