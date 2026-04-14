export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';

export type LogValue = unknown;

export type LoggerOptions = {
  context?: string;
  debugEnabled?: boolean;
};
