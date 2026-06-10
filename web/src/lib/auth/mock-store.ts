"use client";

// Local mock auth database. To go real, keep these function signatures and
// replace localStorage reads/writes with API calls to the auth service.
const MOCK_ACCOUNTS_KEY = "axiony.auth.accounts.mock";

export interface MockAuthIdentity {
  name: string;
  email: string;
}

interface MockAccount extends MockAuthIdentity {
  password: string;
  createdAt: string;
  provider?: string;
}

type AuthResult =
  | { ok: true; identity: MockAuthIdentity }
  | { ok: false; field?: "email" | "password"; message: string };

const isBrowser = (): boolean => typeof window !== "undefined";
const now = (): string => new Date().toISOString();
const normalizeEmail = (email: string): string => email.trim().toLowerCase();
const defaultName = (email: string): string => email.split("@")[0] || email;

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function normalizeAccount(account: Partial<MockAccount>): MockAccount | null {
  const email = normalizeEmail(account.email ?? "");
  if (!email) return null;

  return {
    name: (account.name ?? defaultName(email)).trim() || defaultName(email),
    email,
    // Mock only. Real auth must hash server-side and never expose passwords.
    password: String(account.password ?? ""),
    createdAt: account.createdAt ?? now(),
    provider: account.provider,
  };
}

function readAccounts(): MockAccount[] {
  if (!isBrowser()) return [];
  const parsed = safeParse<Partial<MockAccount>[]>(localStorage.getItem(MOCK_ACCOUNTS_KEY)) ?? [];
  const seen = new Set<string>();
  const accounts: MockAccount[] = [];

  for (const raw of parsed) {
    const account = normalizeAccount(raw);
    if (!account || seen.has(account.email)) continue;
    seen.add(account.email);
    accounts.push(account);
  }

  return accounts;
}

function writeAccounts(accounts: MockAccount[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(MOCK_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    /* local mock auth is non-critical */
  }
}

export function registerMockAccount(input: {
  name: string;
  email: string;
  password: string;
}): AuthResult {
  const email = normalizeEmail(input.email);
  const accounts = readAccounts();

  if (accounts.some((account) => account.email === email)) {
    return { ok: false, field: "email", message: "An account with this email already exists." };
  }

  const account = normalizeAccount({
    name: input.name,
    email,
    password: input.password,
    createdAt: now(),
  });

  if (!account) {
    return { ok: false, field: "email", message: "Enter a valid email address." };
  }

  writeAccounts([...accounts, account]);
  return { ok: true, identity: { name: account.name, email: account.email } };
}

export function authenticateMockAccount(input: { email: string; password: string }): AuthResult {
  const email = normalizeEmail(input.email);
  const account = readAccounts().find((candidate) => candidate.email === email);

  if (!account || account.password !== input.password) {
    return { ok: false, message: "We couldn't find an account with those credentials." };
  }

  return { ok: true, identity: { name: account.name, email: account.email } };
}

export function upsertMockOAuthAccount(
  identity: MockAuthIdentity,
  provider: string,
): MockAuthIdentity {
  const email = normalizeEmail(identity.email);
  const accounts = readAccounts();
  const existing = accounts.find((account) => account.email === email);

  if (existing) {
    existing.name = identity.name.trim() || existing.name;
    existing.provider = provider;
    writeAccounts(accounts);
    return { name: existing.name, email: existing.email };
  }

  const account = normalizeAccount({
    ...identity,
    email,
    provider,
    password: `oauth:${provider}`,
    createdAt: now(),
  });

  if (!account) return { name: identity.name, email };

  writeAccounts([...accounts, account]);
  return { name: account.name, email: account.email };
}
