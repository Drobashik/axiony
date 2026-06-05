"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import cn from "classnames";
import { normalizeUrl, validateUrl } from "@/lib/scan/url";
import { EXAMPLE_URL, QUICK_URLS, WCAG_LEVELS } from "../data";
import type { WcagLevel } from "../types";
import { GlobeIcon, SearchIcon } from "./icons";
import styles from "../ScanStudio.module.scss";

interface UrlConsoleProps {
  url: string;
  level: WcagLevel;
  busy: boolean;
  onUrlChange: (value: string) => void;
  onLevelChange: (level: WcagLevel) => void;
  focusSignal?: number;
  /** Called with a normalised, validated URL. */
  onScan: (url: string) => void;
}

export const UrlConsole = ({
  url,
  level,
  busy,
  onUrlChange,
  onLevelChange,
  focusSignal = 0,
  onScan,
}: UrlConsoleProps) => {
  const inputId = useId();
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;
  const levelName = useId();

  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusSignal > 0 && !busy) {
      inputRef.current?.focus();
    }
  }, [busy, focusSignal]);

  const run = (raw: string) => {
    const { url: valid, error: validationError } = validateUrl(raw);
    if (validationError || !valid) {
      setError(validationError ?? "Enter a valid website URL.");
      inputRef.current?.focus();
      return;
    }
    setError(null);
    onScan(valid);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    run(url);
  };

  const scanShortcut = (raw: string) => {
    onUrlChange(raw);
    run(raw);
  };

  return (
    <form className={styles.console} onSubmit={handleSubmit} noValidate>
      <label className={styles.consoleLabel} htmlFor={inputId}>
        Website URL
      </label>

      <div className={cn(styles.inputRow, error && styles.inputRowError)}>
        <span className={styles.inputPrefix} aria-hidden="true">
          <GlobeIcon />
        </span>
        <input
          ref={inputRef}
          id={inputId}
          type="url"
          inputMode="url"
          autoComplete="url"
          spellCheck={false}
          className={styles.input}
          placeholder="https://your-site.com"
          value={url}
          onChange={(e) => {
            onUrlChange(e.target.value);
            if (error) setError(null);
          }}
          aria-describedby={error ? `${errorId} ${helpId}` : helpId}
          aria-invalid={error ? true : undefined}
          disabled={busy}
        />
        <button type="submit" className={styles.scanBtn} disabled={busy || !url.trim()}>
          <SearchIcon size={15} />
          {busy ? "Scanning…" : "Scan"}
        </button>
      </div>

      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
      <p id={helpId} className={styles.help}>
        No install needed. For production CI checks, use the free CLI.
      </p>

      <div className={styles.consoleRow}>
        <fieldset className={styles.levels} disabled={busy}>
          <legend className={styles.levelsLegend}>WCAG level</legend>
          <div className={styles.segmented}>
            {WCAG_LEVELS.map((l) => (
              <label key={l} className={cn(styles.segment, level === l && styles.segmentActive)}>
                <input
                  type="radio"
                  name={levelName}
                  value={l}
                  checked={level === l}
                  onChange={() => onLevelChange(l)}
                  className={styles.segmentInput}
                />
                {l}
              </label>
            ))}
          </div>
        </fieldset>

        <div className={styles.quick}>
          <span className={styles.quickLabel}>Try:</span>
          {QUICK_URLS.map((q) => (
            <button
              key={q}
              type="button"
              className={styles.quickChip}
              onClick={() => scanShortcut(q)}
              disabled={busy}
            >
              {q}
            </button>
          ))}
          <button
            type="button"
            className={styles.exampleLink}
            onClick={() => scanShortcut(normalizeUrl(EXAMPLE_URL))}
            disabled={busy}
          >
            example scan →
          </button>
        </div>
      </div>
    </form>
  );
};
