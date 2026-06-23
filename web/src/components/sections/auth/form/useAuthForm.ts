"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth-client";
import { startRouteLoading } from "@/lib/navigation/route-loading";
import { importPendingScanToServer, readPendingScan } from "@/lib/workspace";
import { getPasswordStrength, isEmail } from "../lib/validation";
import type { AuthFieldName, AuthMode, AuthStatus, AuthView, OAuthProvider } from "../lib/types";

// ── Timing + destination ─────────────────────────────────────────────
const SUBMIT_MS = 1300;
const REDIRECT_MS = 1000;
const REDIRECT_TO = "/dashboard";

interface Fields {
  name: string;
  email: string;
  password: string;
}

type Errors = Partial<Record<AuthFieldName | "terms", string>>;

/**
 * Owns all state for the auth form: field values, touched/error tracking,
 * and the submit lifecycle (idle → submitting → success/error) with a redirect
 * to the dashboard. Email/password and social sign-in both go through
 * BetterAuth (`@/lib/auth-client`). OAuth failures redirect back here as
 * `?error=<code>` and surface on the form.
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

  // Clear any pending timers on unmount.
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  // Surface OAuth failures: BetterAuth redirects back here as ?error=<code>
  // (instead of its own error page). Show it on the form, then strip the param
  // so a refresh doesn't replay it.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("error");
    if (!code) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from a client-only URL param
    setFormError(oauthRedirectMessage(code));

    params.delete("error");
    params.delete("error_description");
    const query = params.toString();
    window.history.replaceState(null, "", window.location.pathname + (query ? `?${query}` : ""));
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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

    const email = fields.email.trim().toLowerCase();
    const { error } =
      mode === "signup"
        ? await signUp.email({ name: fields.name.trim(), email, password: fields.password })
        : await signIn.email({ email, password: fields.password, rememberMe: remember });

    if (error) {
      setStatus("error");
      const message = authErrorMessage(error, mode);
      if (mode === "signup" && isDuplicateEmail(error)) {
        setErrors({ email: message });
        focusFirstInvalid();
      } else {
        setFormError(message);
      }
      return;
    }

    const pendingScan = readPendingScan();

    // The real session is now set via an httpOnly cookie. If the user scanned
    // as a guest, import that pending result into Neon before entering dashboard.
    await importPendingScanToServer(pendingScan);
    setStatus("success");
    schedule(() => {
      startRouteLoading();
      router.push(REDIRECT_TO);
    }, REDIRECT_MS);
  };

  const handleOAuth = async (id: OAuthProvider["id"]) => {
    if (oauthPending || status === "submitting") return;
    setOauthPending(id);

    // Kicks off the provider redirect. On success the browser leaves this page,
    // so the code below only runs if *initiating* the flow failed (e.g. the
    // provider isn't configured). The workspace is bootstrapped on return to
    // /dashboard from the BetterAuth session (see DashboardShell).
    const { error } = await signIn.social({
      provider: id,
      callbackURL: REDIRECT_TO,
      // If the OAuth round-trip fails, come back to this auth page with
      // ?error=<code> instead of BetterAuth's built-in error page.
      errorCallbackURL: mode === "signup" ? "/signup" : "/login",
    });
    if (error) {
      setOauthPending(null);
      setFormError(authErrorMessage(error, mode));
    }
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

type AuthClientError = { code?: string; message?: string };

function isDuplicateEmail(error: AuthClientError): boolean {
  const code = error.code?.toUpperCase() ?? "";
  const message = error.message?.toLowerCase() ?? "";
  return code.includes("EXIST") || message.includes("already");
}

function authErrorMessage(error: AuthClientError, mode: AuthMode): string {
  if (error.message) return error.message;
  return mode === "signup"
    ? "We couldn't create your account. Please try again."
    : "We couldn't sign you in. Check your details and try again.";
}

// Maps a BetterAuth OAuth `?error=<code>` (from a failed provider round-trip)
// to a human message shown on the form.
function oauthRedirectMessage(code: string): string {
  switch (code) {
    case "account_not_linked":
      return "That email already has an account with a different sign-in method. Sign in that way first, then link the provider.";
    case "email_doesn't_match":
    case "email_not_found":
      return "That provider didn't share a usable email, so we couldn't sign you in.";
    case "oauth_provider_not_found":
      return "That sign-in option isn't available right now.";
    default:
      return "We couldn't finish signing in with that provider. Please try again.";
  }
}
