"use client";

import { useEffect, useState } from "react";

interface SessionResponse {
  user?: unknown;
}

interface SessionStatus {
  authenticated: boolean;
  pending: boolean;
}

let cachedAuthentication: boolean | undefined;
let sessionRequest: Promise<boolean> | undefined;

const requestSession = (): Promise<boolean> => {
  if (cachedAuthentication !== undefined) return Promise.resolve(cachedAuthentication);

  sessionRequest ??= fetch("/api/auth/get-session", {
    cache: "no-store",
    credentials: "same-origin",
    headers: { accept: "application/json" },
  })
    .then(async (response) => {
      if (!response.ok) return false;
      const session = (await response.json()) as SessionResponse | null;
      return Boolean(session?.user);
    })
    .catch(() => false)
    .then((authenticated) => {
      cachedAuthentication = authenticated;
      return authenticated;
    });

  return sessionRequest;
};

/**
 * The marketing shell only needs a yes/no session answer. Using the native
 * endpoint here keeps Better Auth's full client runtime out of the homepage's
 * critical JavaScript while preserving the same authenticated CTA behaviour.
 */
export const useSessionStatus = (): SessionStatus => {
  const [authenticated, setAuthenticated] = useState(cachedAuthentication ?? false);
  const [pending, setPending] = useState(cachedAuthentication === undefined);

  useEffect(() => {
    if (cachedAuthentication !== undefined) return;

    let active = true;
    void requestSession().then((nextAuthenticated) => {
      if (!active) return;
      setAuthenticated(nextAuthenticated);
      setPending(false);
    });

    return () => {
      active = false;
    };
  }, []);

  return { authenticated, pending };
};
