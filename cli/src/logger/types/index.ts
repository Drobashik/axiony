export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';

export type LogValue = unknown;

export type LogStream = 'stdout' | 'stderr';

export type LoggerWriteOptions = {
  formatted?: boolean;
  stream?: LogStream;
};

export type LoggerOptions = {
  context?: string;
  debugEnabled?: boolean;
};
