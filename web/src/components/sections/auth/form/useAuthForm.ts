"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  authenticateMockAccount,
  registerMockAccount,
  upsertMockOAuthAccount,
} from "@/lib/auth/mock-store";
import { completeAuth } from "@/lib/workspace";
import { getPasswordStrength, isEmail } from "../lib/validation";
import type { AuthFieldName, AuthMode, AuthStatus, AuthView, OAuthProvider } from "../lib/types";

// ── Mock timing + destination ────────────────────────────────────────
const SUBMIT_MS = 1300;
const REDIRECT_MS = 1000;
const OAUTH_MS = 1200;
const REDIRECT_TO = "/dashboard";

// Stand-in profiles returned by the mock OAuth providers, so a social
// sign-in still produces a believable account. Swap for the real profile
// from the provider callback later.
const OAUTH_IDENTITY: Record<OAuthProvider["id"], { name: string; email: string }> = {
  google: { name: "Alex Rivera", email: "alex.rivera@gmail.com" },
  github: { name: "Sam Carter", email: "sam@users.noreply.github.com" },
  gitlab: { name: "Priya Nair", email: "priya@gitlab-mail.com" },
};

interface Fields {
  name: string;
  email: string;
  password: string;
}

type Errors = Partial<Record<AuthFieldName | "terms", string>>;

/**
 * Owns all state for the auth form: field values, touched/error tracking,
 * and the mock submit lifecycle (idle → submitting → success/error) with a
 * logical redirect to the dashboard. No real backend — swap the timeouts in
 * `handleSubmit` / `handleOAuth` for API calls later.
 */
export function useAuthForm(mode: AuthMode) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [view, setView] = useState<AuthView>("form");
  const [fields, setFields] = useState<Fields>({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<AuthFieldName, boolean>>>({});
  const [remember, setRemember] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [oauthPending, setOauthPending] = useState<OAuthProvider["id"] | null>(null);
  const [resetSent, setResetSent] = useState(false);

  // Warm the redirect target so the post-success navigation feels instant.
  useEffect(() => {
    try {
      router.prefetch(REDIRECT_TO);
    } catch {
      /* prefetch is best-effort */
    }
  }, [router]);

  // Clear any pending mock timers on unmount.
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const schedule = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const validateField = (name: AuthFieldName, value: string): string | undefined => {
    if (name === "name" && mode === "signup" && !value.trim()) {
      return "Enter your name.";
    }
    if (name === "email") {
      if (!value.trim()) return "Enter your email.";
      if (!isEmail(value)) return "Enter a valid email address.";
    }
    if (name === "password") {
      if (!value) return "Enter your password.";
      if (mode === "signup") {
        if (value.length < 8) return "Use at least 8 characters.";
        if (getPasswordStrength(value).score < 2) return "Choose a stronger password.";
      }
    }
    return undefined;
  };

  const focusFirstInvalid = () => {
    requestAnimationFrame(() => {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    });
  };

  const setField = (name: AuthFieldName, value: string) => {
    setFields((prev) => ({ ...prev, [name]: value }));
    // Editing after a failed submit clears the blocking banner.
    if (status === "error") {
      setStatus("idle");
      setFormError(null);
    }
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (name: AuthFieldName) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, fields[name]) }));
  };

  const toggleTerms = (value: boolean) => {
    setAcceptTerms(value);
    if (value) setErrors((prev) => ({ ...prev, terms: undefined }));
  };

  const collectErrors = (): Errors => {
    const next: Errors = {
      email: validateField("email", fields.email),
      password: validateField("password", fields.password),
    };
    if (mode === "signup") {
      next.name = validateField("name", fields.name);
      if (!acceptTerms) next.terms = "Please accept the terms to continue.";
    }
    return Object.fromEntries(Object.entries(next).filter(([, v]) => v)) as Errors;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") return;

    setTouched({ name: true, email: true, password: true });
    const found = collectErrors();
    if (Object.keys(found).length > 0) {
      setErrors(found);
      focusFirstInvalid();
      return;
    }

    setErrors({});
    setFormError(null);
    setStatus("submitting");

    schedule(() => {
      const email = fields.email.trim().toLowerCase();
      const authResult =
        mode === "signup"
          ? registerMockAccount({
              name: fields.name,
              email,
              password: fields.password,
            })
          : authenticateMockAccount({
              email,
              password: fields.password,
            });

      if (!authResult.ok) {
        setStatus("error");
        if (authResult.field) {
          setErrors({ [authResult.field]: authResult.message });
          focusFirstInvalid();
        } else {
          setFormError(authResult.message);
        }
        return;
      }

      // Create/refresh the workspace — turns a pending scan into a baseline.
      completeAuth(authResult.identity);
      persistMockSession({ email, mode });
      setStatus("success");
      schedule(() => router.push(REDIRECT_TO), REDIRECT_MS);
    }, SUBMIT_MS);
  };

  const handleOAuth = (id: OAuthProvider["id"]) => {
    if (oauthPending || status === "submitting") return;
    setOauthPending(id);
    schedule(() => {
      const identity = upsertMockOAuthAccount(OAUTH_IDENTITY[id], id);
      completeAuth(identity);
      persistMockSession({ provider: id, mode });
      router.push(REDIRECT_TO);
    }, OAUTH_MS);
  };

  // ── Inline "forgot password" reset (login only) ────────────────────
  const enterReset = () => {
    setView("reset");
    setFormError(null);
    setErrors({});
    setResetSent(false);
  };

  const exitReset = () => {
    setView("form");
    setStatus("idle");
    setResetSent(false);
  };

  const handleResetSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") return;

    const emailError = validateField("email", fields.email);
    if (emailError) {
      setTouched((prev) => ({ ...prev, email: true }));
      setErrors({ email: emailError });
      focusFirstInvalid();
      return;
    }

    setErrors({});
    setStatus("submitting");
    schedule(() => {
      setStatus("idle");
      setResetSent(true);
    }, SUBMIT_MS);
  };

  return {
    formRef,
    view,
    fields,
    errors,
    remember,
    acceptTerms,
    status,
    formError,
    oauthPending,
    resetSent,
    setField,
    handleBlur,
    setRemember,
    toggleTerms,
    handleSubmit,
    handleOAuth,
    enterReset,
    exitReset,
    handleResetSubmit,
  };
}

function persistMockSession(payload: Record<string, unknown>) {
  try {
    sessionStorage.setItem("axiony.auth.mock", JSON.stringify({ ...payload, at: Date.now() }));
  } catch {
    /* storage may be unavailable (private mode) — non-fatal for the mock */
  }
}
