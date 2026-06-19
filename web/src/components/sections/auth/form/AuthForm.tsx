"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";
import { readPendingScan } from "@/lib/workspace";
import { AuthField } from "../components/AuthField";
import { Checkbox } from "../components/Checkbox";
import { OAuthRow } from "../components/OAuthRow";
import { PasswordMeter } from "../components/PasswordMeter";
import {
  AlertIcon,
  ArrowRightIcon,
  BackIcon,
  CheckIcon,
  LockIcon,
  MailIcon,
  Spinner,
  UserIcon,
} from "../components/icons";
import type { AuthMode } from "../lib/types";
import styles from "../screen/AuthScreen.module.scss";
import { useAuthForm } from "./useAuthForm";

const COPY = {
  login: {
    title: "Sign in to Axiony",
    sub: "Welcome back — let's get you to your dashboard.",
    cta: "Sign in",
    busy: "Signing in…",
    switchText: "New to Axiony?",
    switchCta: "Create an account",
    switchHref: "/signup",
  },
  signup: {
    title: "Create your account",
    sub: "Start free — no credit card required.",
    cta: "Create account",
    busy: "Creating account…",
    switchText: "Already have an account?",
    switchCta: "Sign in",
    switchHref: "/login",
  },
} as const;

export const AuthForm = ({ mode }: { mode: AuthMode }) => {
  const {
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
  } = useAuthForm(mode);

  const copy = COPY[mode];
  const resultRef = useRef<HTMLDivElement>(null);

  // Captured once (lazy init) because the pending scan is consumed the
  // moment auth completes — we still want to celebrate it on success.
  const [hadScan] = useState(() => readPendingScan() !== null);
  const savedBaseline = mode === "signup" && hadScan;

  const submitting = status === "submitting";
  const locked = submitting || oauthPending !== null;

  // Move focus to the confirmation panel when a flow resolves, so keyboard
  // and screen-reader users are carried to the new content.
  useEffect(() => {
    if (status === "success" || resetSent) resultRef.current?.focus();
  }, [status, resetSent]);

  // ── Inline password-reset sub-flow (login only) ────────────────────
  if (view === "reset") {
    return (
      <div className={styles.form}>
        <button type="button" className={styles.backLink} onClick={exitReset}>
          <BackIcon size={15} />
          Back to sign in
        </button>

        {resetSent ? (
          <div className={styles.result} ref={resultRef} tabIndex={-1} role="status">
            <span className={styles.resultIcon} data-tone="info">
              <MailIcon size={26} />
            </span>
            <h1 className={styles.resultTitle}>Check your inbox</h1>
            <p className={styles.resultText}>
              If an account exists for <strong>{fields.email.trim()}</strong>, a password reset link
              is on its way.
            </p>
            <Button variant="secondary" size="md" onClick={exitReset}>
              Back to sign in
            </Button>
          </div>
        ) : (
          <form ref={formRef} className={styles.formBody} onSubmit={handleResetSubmit} noValidate>
            <header className={styles.formHead}>
              <h1 className={styles.formTitle}>Reset your password</h1>
              <p className={styles.formSub}>
                Enter your account email and we&apos;ll send a link to set a new password.
              </p>
            </header>

            <AuthField
              label="Work email"
              type="email"
              inputMode="email"
              autoComplete="email"
              icon={<MailIcon size={17} />}
              placeholder="you@company.com"
              value={fields.email}
              error={errors.email}
              disabled={submitting}
              onChange={(e) => setField("email", e.target.value)}
              onBlur={() => handleBlur("email")}
            />

            <Button type="submit" size="lg" block disabled={submitting} className={styles.submit}>
              {submitting ? (
                <>
                  <Spinner className={styles.spin} size={18} />
                  Sending link…
                </>
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>
        )}
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────────────────
  if (status === "success") {
    return (
      <div className={styles.form}>
        <div className={styles.result} ref={resultRef} tabIndex={-1} role="status">
          <span className={styles.resultIcon} data-tone="success">
            <CheckIcon size={28} />
          </span>
          <h1 className={styles.resultTitle}>
            {savedBaseline
              ? "Baseline saved"
              : mode === "signup"
                ? "Workspace created"
                : "You're signed in"}
          </h1>
          <p className={styles.resultText}>
            {savedBaseline
              ? "We saved your scan as a baseline. Taking you to your dashboard to see your tracked debt and regression protection."
              : mode === "signup"
                ? "Taking you to your dashboard to run your first scan and lock a baseline."
                : "Taking you to your dashboard — your baselines and history are loading."}
          </p>
          <div className={styles.resultBar} aria-hidden="true">
            <span />
          </div>
          <Button href="/dashboard" variant="ghost" size="sm" className={styles.resultLink}>
            Go to dashboard now
            <ArrowRightIcon size={14} />
          </Button>
        </div>
      </div>
    );
  }

  // ── Default form ───────────────────────────────────────────────────
  return (
    <div className={styles.form}>
      <form
        ref={formRef}
        className={styles.formBody}
        onSubmit={handleSubmit}
        noValidate
        aria-busy={submitting}
      >
        <header className={styles.formHead}>
          <h1 className={styles.formTitle}>{copy.title}</h1>
          <p className={styles.formSub}>{copy.sub}</p>
        </header>

        <OAuthRow mode={mode} pending={oauthPending} disabled={submitting} onSelect={handleOAuth} />

        <div className={styles.divider}>
          <span>or with email</span>
        </div>

        {formError && (
          <div className={styles.banner} role="alert">
            <AlertIcon size={16} />
            <span>{formError}</span>
          </div>
        )}

        <div className={styles.fields}>
          {mode === "signup" && (
            <AuthField
              label="Full name"
              autoComplete="name"
              icon={<UserIcon size={17} />}
              placeholder="Ada Lovelace"
              value={fields.name}
              error={errors.name}
              disabled={locked}
              onChange={(e) => setField("name", e.target.value)}
              onBlur={() => handleBlur("name")}
            />
          )}

          <AuthField
            label="Work email"
            type="email"
            inputMode="email"
            autoComplete="email"
            icon={<MailIcon size={17} />}
            placeholder="you@company.com"
            value={fields.email}
            error={errors.email}
            disabled={locked}
            onChange={(e) => setField("email", e.target.value)}
            onBlur={() => handleBlur("email")}
          />

          <AuthField
            label="Password"
            revealable
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            icon={<LockIcon size={17} />}
            placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
            value={fields.password}
            error={errors.password}
            hint={
              mode === "signup" && !errors.password
                ? "Mix letters, numbers & symbols for a stronger password."
                : undefined
            }
            disabled={locked}
            onChange={(e) => setField("password", e.target.value)}
            onBlur={() => handleBlur("password")}
          >
            {mode === "signup" && <PasswordMeter password={fields.password} />}
          </AuthField>
        </div>

        {mode === "login" ? (
          <div className={styles.optionsRow}>
            <Checkbox checked={remember} onChange={setRemember} disabled={locked}>
              Keep me signed in
            </Checkbox>
            <button type="button" className={styles.linkBtn} onClick={enterReset} disabled={locked}>
              Forgot password?
            </button>
          </div>
        ) : (
          <Checkbox
            checked={acceptTerms}
            onChange={toggleTerms}
            error={errors.terms}
            disabled={locked}
          >
            I agree to the{" "}
            <Link href="#" className={styles.inlineLink}>
              Terms
            </Link>{" "}
            and{" "}
            <Link href="#" className={styles.inlineLink}>
              Privacy Policy
            </Link>
            .
          </Checkbox>
        )}

        <Button type="submit" size="lg" block disabled={locked} className={styles.submit}>
          {submitting ? (
            <>
              <Spinner className={styles.spin} size={18} />
              {copy.busy}
            </>
          ) : (
            <>
              {copy.cta}
              <ArrowRightIcon size={16} />
            </>
          )}
        </Button>
      </form>

      <p className={styles.switch}>
        {copy.switchText}{" "}
        <Link href={copy.switchHref} className={styles.switchLink}>
          {copy.switchCta}
        </Link>
      </p>
    </div>
  );
};
