import { validatePublicUrl } from "@/server/scan/security";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 500;
const RESOLUTION_TIMEOUT_MS = 6_000;
const FETCH_TIMEOUT_MS = 4_000;
const MAX_REDIRECTS = 3;
const MAX_HTML_BYTES = 512 * 1024;
const MIN_PREFERRED_ICON_SIZE = 64;

interface IconCandidate {
  src: string;
  size: number;
  appleTouchIcon: boolean;
  svg: boolean;
  order: number;
}

interface CacheEntry {
  expiresAt: number;
  value: Promise<string | undefined>;
}

declare global {
  var __axionySiteIconCache: Map<string, CacheEntry> | undefined;
}

const cache = globalThis.__axionySiteIconCache ?? new Map<string, CacheEntry>();
globalThis.__axionySiteIconCache = cache;

const attributeValue = (tag: string, name: string): string | undefined => {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));

  return match?.[1] ?? match?.[2] ?? match?.[3];
};

const declaredSize = (value: string): number => {
  const sizes = [...value.matchAll(/(\d+)x(\d+)/gi)].map((match) =>
    Math.min(Number(match[1]), Number(match[2])),
  );

  return sizes.length > 0 ? Math.max(...sizes) : 0;
};

const absoluteIconUrl = (value: string, documentUrl: string): string | undefined => {
  try {
    const url = new URL(value, documentUrl);

    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    if (url.username || url.password) return undefined;

    return url.toString();
  } catch {
    return undefined;
  }
};

const iconCandidates = (html: string, documentUrl: string): IconCandidate[] =>
  [...html.matchAll(/<link\b[^>]*>/gi)].flatMap((match, order) => {
    const tag = match[0];
    const rel = (attributeValue(tag, "rel") ?? "").toLowerCase().split(/\s+/);
    const appleTouchIcon = rel.some((value) => value.startsWith("apple-touch-icon"));

    if (!rel.includes("icon") && !appleTouchIcon) return [];

    const href = attributeValue(tag, "href");
    const src = href ? absoluteIconUrl(href, documentUrl) : undefined;

    if (!src) return [];

    const type = attributeValue(tag, "type")?.toLowerCase() ?? "";

    return [
      {
        src,
        size: declaredSize(attributeValue(tag, "sizes") ?? ""),
        appleTouchIcon,
        svg: type.includes("svg") || new URL(src).pathname.toLowerCase().endsWith(".svg"),
        order,
      },
    ];
  });

const selectIcon = (candidates: IconCandidate[]): string | undefined => {
  const byLargestSize = (left: IconCandidate, right: IconCandidate) =>
    right.size - left.size || left.order - right.order;
  const standardIcons = candidates.filter(({ appleTouchIcon }) => !appleTouchIcon);
  const preferredStandardIcon = standardIcons
    .filter(({ size }) => size >= MIN_PREFERRED_ICON_SIZE)
    .sort(byLargestSize)[0];

  if (preferredStandardIcon) return preferredStandardIcon.src;

  const appleTouchIcon = candidates
    .filter(({ appleTouchIcon }) => appleTouchIcon)
    .sort(byLargestSize)[0];

  if (appleTouchIcon) return appleTouchIcon.src;

  const svgIcon = standardIcons.find(({ svg }) => svg);

  return svgIcon?.src ?? standardIcons.sort(byLargestSize)[0]?.src;
};

const readDocumentHead = async (response: Response): Promise<string | undefined> => {
  if (!response.body) return undefined;

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let html = "";
  let receivedBytes = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    receivedBytes += value.byteLength;

    html += decoder.decode(value, { stream: true });

    if (/<\/head\s*>/i.test(html)) {
      await reader.cancel();

      return html;
    }

    if (receivedBytes > MAX_HTML_BYTES) {
      await reader.cancel();

      return html;
    }
  }

  return html + decoder.decode();
};

const fetchDocument = async (
  initialUrl: string,
): Promise<{ html: string; documentUrl: string } | undefined> => {
  let currentUrl = await validatePublicUrl(initialUrl);

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    const response = await fetch(currentUrl, {
      cache: "no-store",
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "Axiony project metadata resolver",
      },
      redirect: "manual",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");

      if (!location || redirectCount === MAX_REDIRECTS) return undefined;

      currentUrl = await validatePublicUrl(new URL(location, currentUrl).toString());

      continue;
    }

    if (!response.ok) return undefined;

    const contentType = response.headers.get("content-type")?.toLowerCase();

    if (contentType && !contentType.includes("text/html")) return undefined;

    const html = await readDocumentHead(response);

    return html ? { html, documentUrl: currentUrl } : undefined;
  }

  return undefined;
};

const resolveUncached = async (url: string): Promise<string | undefined> => {
  const document = await fetchDocument(url);

  if (!document) return undefined;

  const iconUrl = selectIcon(iconCandidates(document.html, document.documentUrl));

  if (!iconUrl) return undefined;

  return validatePublicUrl(iconUrl).catch(() => undefined);
};

const resolveWithTimeout = (url: string): Promise<string | undefined> => {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const deadline = new Promise<undefined>((resolve) => {
    timeout = setTimeout(() => resolve(undefined), RESOLUTION_TIMEOUT_MS);
  });

  return Promise.race([resolveUncached(url), deadline]).finally(() => {
    if (timeout) clearTimeout(timeout);
  });
};

const pruneCache = () => {
  const now = Date.now();

  for (const [key, entry] of cache) {
    if (entry.expiresAt <= now) cache.delete(key);
  }

  while (cache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value;

    if (!oldestKey) break;

    cache.delete(oldestKey);
  }
};

export const resolveSiteIcon = async (url: string): Promise<string | undefined> => {
  let origin: string;

  try {
    origin = new URL(url).origin;
  } catch {
    return undefined;
  }

  const cached = cache.get(origin);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  pruneCache();

  const value = resolveWithTimeout(origin).catch(() => undefined);
  const entry: CacheEntry = {
    expiresAt: Date.now() + CACHE_TTL_MS,
    value,
  };

  cache.set(origin, entry);

  void value.then((iconUrl) => {
    if (!iconUrl && cache.get(origin) === entry) {
      cache.delete(origin);
    }
  });

  return value;
};
