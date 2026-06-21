import type { WcagLevel } from "./types";

const SCANNER_API_URL = process.env.AXIONY_SCANNER_API_URL?.replace(/\/+$/, "");
const SCANNER_API_KEY = process.env.AXIONY_SCANNER_API_KEY;

interface ScannerProxyResult {
  body: unknown;
  status: number;
}

interface ScannerFetchOptions {
  auth?: boolean;
}

const SCANNER_UNAVAILABLE_MESSAGE =
  "Scanner service is unavailable. Start the scanner and try again.";

const toJsonBody = (value: string): unknown => {
  if (!value) return {};

  try {
    return JSON.parse(value);
  } catch {
    return { error: value };
  }
};

const scannerFetch = async (
  path: string,
  init?: RequestInit,
  options: ScannerFetchOptions = {},
): Promise<ScannerProxyResult> => {
  const { auth = true } = options;

  if (!SCANNER_API_URL) {
    return {
      body: { error: "Scanner service is not configured. Set AXIONY_SCANNER_API_URL." },
      status: 503,
    };
  }

  if (auth && !SCANNER_API_KEY) {
    return {
      body: { error: "Scanner service key is not configured. Set AXIONY_SCANNER_API_KEY." },
      status: 503,
    };
  }

  let response: Response;

  try {
    response = await fetch(`${SCANNER_API_URL}${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(auth && SCANNER_API_KEY ? { Authorization: `Bearer ${SCANNER_API_KEY}` } : {}),
        ...init?.headers,
      },
    });
  } catch (error) {
    console.error("Scanner service request failed", error instanceof Error ? error.message : error);

    return {
      body: { error: SCANNER_UNAVAILABLE_MESSAGE },
      status: 502,
    };
  }

  return {
    body: toJsonBody(await response.text()),
    status: response.status,
  };
};

export const hasScannerService = (): boolean => Boolean(SCANNER_API_URL);

export const requiresScannerService = (): boolean => process.env.VERCEL === "1";

export const scannerServiceUnavailable = (): ScannerProxyResult => ({
  body: {
    error:
      "Scanner service is not configured. Set AXIONY_SCANNER_API_URL and AXIONY_SCANNER_API_KEY.",
  },
  status: 503,
});

export const createRemoteScanJob = (url: string, level: WcagLevel): Promise<ScannerProxyResult> =>
  scannerFetch("/scans", {
    method: "POST",
    body: JSON.stringify({ url, level }),
  });

export const getRemoteScanJob = (jobId: string): Promise<ScannerProxyResult> =>
  scannerFetch(`/scans/${encodeURIComponent(jobId)}`);

export const getRemoteScannerHealth = (): Promise<ScannerProxyResult> =>
  scannerFetch("/health", { method: "GET" });
