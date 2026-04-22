import { Logger } from '../../logger/Logger';
import { terminal, text } from './styles';

const FRAMES = ['-', '\\', '|', '/'];
const INTERVAL_MS = 80;

type SpinnerState = 'idle' | 'running' | 'stopped';

export class CliSpinner {
  private frameIndex = 0;
  private timer?: NodeJS.Timeout;
  private text = '';
  private state: SpinnerState = 'idle';
  private hasPrintedStaticLine = false;

  constructor(private readonly logger: Logger) {}

  start(message: string): void {
    this.text = message;

    if (!terminal.isInteractive()) {
      if (!this.hasPrintedStaticLine) {
        this.logger.print(`${text.info('>')} ${message}`);
        this.hasPrintedStaticLine = true;
      }

      this.state = 'running';
      return;
    }

    this.state = 'running';
    this.render();
    this.timer = setInterval(() => this.render(), INTERVAL_MS);
  }

  update(message: string): void {
    this.text = message;

    if (this.state === 'running' && terminal.isInteractive()) {
      this.render();
    }
  }

  succeed(message: string): void {
    this.stop(`${text.success('[done]')} ${message}`);
  }

  fail(message: string): void {
    this.stop(`${text.danger('[x]')} ${message}`);
  }

  stop(message?: string): void {
    this.clearTimer();

    if (!message) {
      this.clearLine();
      this.state = 'stopped';
      return;
    }

    if (terminal.isInteractive()) {
      process.stdout.write(`\r\x1b[2K${message}\n`);
    } else {
      this.logger.print(message);
    }

    this.state = 'stopped';
  }

  private render(): void {
    if (!terminal.isInteractive()) {
      return;
    }

    const frame = text.accent(FRAMES[this.frameIndex % FRAMES.length] ?? FRAMES[0]);
    this.frameIndex += 1;
    process.stdout.write(`\r\x1b[2K${frame} ${this.text}`);
  }

  private clearTimer(): void {
    if (!this.timer) {
      return;
    }

    clearInterval(this.timer);
    this.timer = undefined;
  }

  private clearLine(): void {
    if (terminal.isInteractive()) {
      process.stdout.write('\r\x1b[2K');
    }
  }
}
