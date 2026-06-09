"use client";

import { useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Button, Container, SectionEyebrow } from "@/components/ui";
import cn from "classnames";
import { isValidEmail } from "@/lib/scan/url";
import { CLI_COMMAND } from "../data";
import { CopyButton } from "./CopyButton";
import styles from "../ScanStudio.module.scss";

const EarlyAccessForm = () => {
  const inputId = useId();
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValidEmail(email)) {
      setError("Enter a valid email address so we can reach you.");
      inputRef.current?.focus();
      return;
    }
    setError(null);
    setDone(true);
    // TODO(cloud): POST { email } to the early-access / waitlist endpoint.
  };

  if (done) {
    return (
      <p className={styles.eaSuccess} role="status">
        Thanks — we&rsquo;ll email <strong>{email}</strong> when cloud scanning opens up.
      </p>
    );
  }

  return (
    <form className={styles.eaForm} onSubmit={handleSubmit} noValidate>
      <label className={styles.srOnly} htmlFor={inputId}>
        Email address for early access
      </label>
      <div className={styles.eaField}>
        <input
          ref={inputRef}
          id={inputId}
          type="email"
          inputMode="email"
          autoComplete="email"
          className={cn(styles.eaInput, error && styles.eaInputError)}
          placeholder="you@company.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          aria-describedby={error ? errorId : helpId}
          aria-invalid={error ? true : undefined}
        />
        <Button type="submit" size="lg">
          Join early access
        </Button>
      </div>
      {error ? (
        <p id={errorId} className={styles.eaError} role="alert">
          {error}
        </p>
      ) : (
        <p id={helpId} className={styles.eaHelp}>
          No spam — just a heads-up when the cloud scanner is ready.
        </p>
      )}
    </form>
  );
};

export const StudioCta = () => (
  <section className={styles.cta} id="early-access">
    <div className={styles.ctaGlow} aria-hidden="true" />
    <Container className={cn(styles.ctaInner, "reveal")}>
      <SectionEyebrow className={styles.ctaEyebrow}>Early access</SectionEyebrow>
      <h2>Want cloud scans when they launch?</h2>
      <p className={styles.ctaLead}>
        Join the early access list and start with the free CLI today.
      </p>

      <EarlyAccessForm />

      <div className={styles.ctaSecondary}>
        <Button href="/#quickstart" variant="secondary" size="lg">
          Run locally with the CLI
        </Button>
      </div>

      <div className={styles.cli}>
        <span className={styles.cliPrompt} aria-hidden="true">
          $
        </span>
        <code className={styles.cliText}>{CLI_COMMAND}</code>
        <CopyButton text={CLI_COMMAND} />
      </div>
    </Container>
  </section>
);
