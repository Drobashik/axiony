const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
} as const;

const supportsColor = (): boolean =>
  Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;

const apply = (value: string, ...codes: string[]): string => {
  if (!supportsColor()) {
    return value;
  }

  return `${codes.join('')}${value}${ANSI.reset}`;
};

export const text = {
  bold: (value: string): string => apply(value, ANSI.bold),
  dim: (value: string): string => apply(value, ANSI.dim),
  muted: (value: string): string => apply(value, ANSI.gray),
  info: (value: string): string => apply(value, ANSI.cyan),
  success: (value: string): string => apply(value, ANSI.green),
  warning: (value: string): string => apply(value, ANSI.yellow),
  danger: (value: string): string => apply(value, ANSI.red),
  accent: (value: string): string => apply(value, ANSI.magenta),
};

export const terminal = {
  supportsColor,
  isInteractive: (): boolean => Boolean(process.stdout.isTTY),
};
