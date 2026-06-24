import type { Cookie } from 'playwright';

const SESSION_TTL_MS = 30 * 60 * 1000;
const MAX_ORIGINS = 100;
const MAX_COOKIES_PER_ORIGIN = 50;

interface StoredSession {
  cookies: Cookie[];
  updatedAt: number;
}

const sessions = new Map<string, StoredSession>();

const originFromUrl = (url: string): string | null => {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
};

const pruneSessions = (): void => {
  const cutoff = Date.now() - SESSION_TTL_MS;

  for (const [origin, session] of sessions) {
    if (session.updatedAt < cutoff) sessions.delete(origin);
  }

  while (sessions.size > MAX_ORIGINS) {
    const oldestOrigin = sessions.keys().next().value;
    if (typeof oldestOrigin !== 'string') break;
    sessions.delete(oldestOrigin);
  }
};

export const readScanSessionCookies = (url: string): Cookie[] => {
  pruneSessions();

  const origin = originFromUrl(url);
  if (!origin) return [];

  const session = sessions.get(origin);
  if (!session) return [];

  // Refresh insertion order so frequently scanned origins remain cached.
  sessions.delete(origin);
  sessions.set(origin, session);

  return session.cookies.map((cookie) => ({ ...cookie }));
};

export const writeScanSessionCookies = (url: string, cookies: Cookie[]): void => {
  const origin = originFromUrl(url);
  if (!origin || cookies.length === 0) return;

  sessions.delete(origin);
  sessions.set(origin, {
    cookies: cookies.slice(0, MAX_COOKIES_PER_ORIGIN).map((cookie) => ({ ...cookie })),
    updatedAt: Date.now(),
  });
  pruneSessions();
};
