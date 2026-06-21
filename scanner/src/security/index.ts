import { lookup } from "node:dns/promises";
import type { LookupAddress } from "node:dns";
import { isIP } from "node:net";
import type { WcagLevel } from "../types";

const MAX_URL_LENGTH = 2048;
const BLOCKED_HOSTS = new Set(["localhost", "localhost.localdomain"]);

export class ScanRequestError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ScanRequestError";
    this.status = status;
  }
}

const isWcagLevel = (value: unknown): value is WcagLevel =>
  value === "A" || value === "AA" || value === "AAA";

const normalizeHostname = (hostname: string): string =>
  hostname
    .toLowerCase()
    .replace(/^\[(.*)\]$/, "$1")
    .replace(/\.$/, "");

const isPrivateIpv4 = (address: string): boolean => {
  const parts = address.split(".").map((part) => Number(part));
  if (
    parts.length !== 4 ||
    parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  ) {
    return true;
  }

  const [a, b] = parts;

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
};

const isPrivateIpv6 = (address: string): boolean => {
  const value = address.toLowerCase();

  if (value === "::" || value === "::1") return true;
  if (value.startsWith("fc") || value.startsWith("fd")) return true;
  if (value.startsWith("fe80:")) return true;

  if (value.startsWith("::ffff:")) {
    return isPrivateIpv4(value.slice("::ffff:".length));
  }

  return false;
};

export const isPrivateAddress = (address: string): boolean => {
  const version = isIP(address);
  if (version === 4) return isPrivateIpv4(address);
  if (version === 6) return isPrivateIpv6(address);
  return true;
};

export const ensurePublicHost = async (hostname: string): Promise<void> => {
  const normalized = normalizeHostname(hostname);

  if (BLOCKED_HOSTS.has(normalized) || normalized.endsWith(".local")) {
    throw new ScanRequestError("Internal or local URLs cannot be scanned.");
  }

  if (isIP(normalized)) {
    if (isPrivateAddress(normalized)) {
      throw new ScanRequestError(
        "Internal or private IP addresses cannot be scanned.",
      );
    }
    return;
  }

  let addresses: LookupAddress[];
  try {
    addresses = await lookup(normalized, { all: true, verbatim: true });
  } catch {
    throw new ScanRequestError(
      "Could not resolve that domain. Check the URL and try again.",
    );
  }

  if (
    addresses.length === 0 ||
    addresses.some(({ address }) => isPrivateAddress(address))
  ) {
    throw new ScanRequestError(
      "That domain resolves to an internal address and cannot be scanned.",
    );
  }
};

export const validateScanRequest = async (
  body: unknown,
): Promise<{ url: string; level: WcagLevel }> => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ScanRequestError("Request body must be a JSON object.");
  }

  const { url, level } = body as { url?: unknown; level?: unknown };

  if (typeof url !== "string" || url.trim().length === 0) {
    throw new ScanRequestError("Enter a website URL to scan.");
  }

  if (url.length > MAX_URL_LENGTH) {
    throw new ScanRequestError("URL is too long.");
  }

  if (!isWcagLevel(level)) {
    throw new ScanRequestError("Choose a valid WCAG level.");
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new ScanRequestError("That does not look like a valid URL.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new ScanRequestError(
      "Only http:// and https:// URLs can be scanned.",
    );
  }

  if (parsed.username || parsed.password) {
    throw new ScanRequestError(
      "URLs with embedded credentials cannot be scanned.",
    );
  }

  await ensurePublicHost(parsed.hostname);
  parsed.hash = "";

  return {
    url: parsed.toString(),
    level,
  };
};
