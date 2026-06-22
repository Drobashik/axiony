const toInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const config = {
  host: process.env.HOST || "127.0.0.1",
  port: toInt(process.env.PORT, 4000),
  apiKey: process.env.SCANNER_API_KEY || "",
  allowUnauthenticated: process.env.SCANNER_ALLOW_UNAUTHENTICATED === "1",
  concurrency: Math.min(toInt(process.env.SCANNER_CONCURRENCY, 1), 4),
  jobTimeoutMs: toInt(process.env.SCAN_JOB_TIMEOUT_MS, 240_000),
};

export const validateConfig = (): void => {
  if (!config.apiKey && !config.allowUnauthenticated) {
    throw new Error(
      "SCANNER_API_KEY is required. For throwaway local testing only, set SCANNER_ALLOW_UNAUTHENTICATED=1.",
    );
  }
};
