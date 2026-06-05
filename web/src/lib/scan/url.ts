// =====================================================================
// URL normalisation + validation for the scan inputs.
// Lenient on input (a bare domain becomes https://), strict on the
// result so we only ever "scan" something URL-shaped.
// =====================================================================

export interface UrlValidation {
  url?: string;
  error?: string;
}

export const normalizeUrl = (raw: string): string => {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

export const validateUrl = (raw: string): UrlValidation => {
  const trimmed = raw.trim();
  if (!trimmed) return { error: "Enter a website URL to preview a scan." };

  const candidate = normalizeUrl(trimmed);

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return { error: "That doesn’t look like a valid URL. Try https://your-site.com." };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { error: "Use an http:// or https:// URL." };
  }
  if (!parsed.hostname.includes(".")) {
    return { error: "Enter a full domain, like https://your-site.com." };
  }

  return { url: candidate };
};

export const isValidEmail = (raw: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.trim());
