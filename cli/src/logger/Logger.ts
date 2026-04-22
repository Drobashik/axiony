import { LoggerOptions, LogLevel, LogValue, LoggerWriteOptions } from './types';

export class Logger {
  private readonly context?: string;
  private readonly debugEnabled: boolean;

  constructor(options: LoggerOptions = {}) {
    this.context = options.context;
    this.debugEnabled = options.debugEnabled ?? false;
  }

  debug(message: string, ...meta: LogValue[]): void {
    if (!this.debugEnabled) {
      return;
    }

    this.write('debug', message, meta);
  }

  info(message: string, ...meta: LogValue[]): void {
    this.write('info', message, meta);
  }

  warn(message: string, ...meta: LogValue[]): void {
    this.write('warn', message, meta);
  }

  error(message: string, ...meta: LogValue[]): void {
    this.write('error', message, meta);
  }

  success(message: string, ...meta: LogValue[]): void {
    this.write('success', message, meta);
  }

  print(message: string, options: LoggerWriteOptions = {}, ...meta: LogValue[]): void {
    this.write('info', message, meta, {
      formatted: false,
      ...options,
    });
  }

  newline(options: LoggerWriteOptions = {}): void {
    this.print('', options);
  }

  child(context: string): Logger {
    return new Logger({
      context: this.context ? `${this.context}:${context}` : context,
      debugEnabled: this.debugEnabled,
    });
  }

  private write(
    level: LogLevel,
    message: string,
    meta: LogValue[],
    options: LoggerWriteOptions = {},
  ): void {
    const stream = options.stream === 'stderr' || level === 'error' ? console.error : console.log;
    if (!message) {
      stream(message);
      return;
    }

    const output = options.formatted === false ? message : this.formatMessage(level, message);

    if (meta.length === 0) {
      stream(output);
      return;
    }

    stream(output, ...meta);
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    const levelLabel = level.toUpperCase().padEnd(5, ' ');
    const contextLabel = this.context ? ` [${this.context}]` : '';

    return `${timestamp} ${levelLabel}${contextLabel} ${message}`;
  }
}

export const logger = new Logger({
  debugEnabled: process.env.LOG_LEVEL === 'debug',
});
