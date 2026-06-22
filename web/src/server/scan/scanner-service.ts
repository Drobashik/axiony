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
  "Scanner service is temporarily unavailable. It may be waking up, deploying, or restarting. Try again in a minute.";

const MAX_ERROR_MESSAGE_LENGTH = 280;

const isHtmlDocument = (value: string): boolean => {
  const trimmed = value.trim().toLowerCase();
  return (
    trimmed.startsWith("<!doctype html") || trimmed.startsWith("<html") || trimmed.includes("<body")
  );
};

const fallbackErrorMessage = (status: number, value: string): string => {
  if (status === 502) {
    return "Scanner service is temporarily unavailable (502 Bad Gateway). It may be waking up, deploying, or restarting. Try again in a minute.";
  }

  if (status === 503 || status === 504 || isHtmlDocument(value)) {
    return SCANNER_UNAVAILABLE_MESSAGE;
  }

  const message = value.replace(/\s+/g, " ").trim();
  return message ? message.slice(0, MAX_ERROR_MESSAGE_LENGTH) : SCANNER_UNAVAILABLE_MESSAGE;
};

const toJsonBody = (value: string, status: number): unknown => {
  if (!value) return {};

  try {
    return JSON.parse(value);
  } catch {
    return { error: fallbackErrorMessage(status, value) };
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
    body: toJsonBody(await response.text(), response.status),
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
