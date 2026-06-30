"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import cn from "classnames";
import { useBootStatus } from "@/components/layout";
import { SCAN_HOST, SCAN_ISSUES } from "../data";
import { EyeOffIcon, ImageIcon, LockIcon, ReplayIcon, SpeakerIcon } from "./icons";
import styles from "../Hero.module.scss";

// The audit plays out over this window once the page is interactive.
const RUN_MS = 3600;
const START_PAUSE_MS = 420;
// Once it finishes, the spotlight steps through each issue's real-world impact.
const IMPACT_STEP_MS = 2600;

// Ease-in-out (smootherstep): a gentle start, steady sweep, soft finish —
// reads as a scanner working through the page, not a linear bar.
const ease = (t: number): number => t * t * t * (t * (t * 6 - 15) + 10);

const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const ViaIcon = ({ via }: { via: "sr" | "eye" }) =>
  via === "sr" ? <SpeakerIcon /> : <EyeOffIcon />;

const ISSUE_LOW_CONTRAST = 0;
const ISSUE_NO_ALT_TEXT = 1;
const ISSUE_BUTTON_NAME = 2;
const ISSUE_MISSING_LABEL = 3;

export const CloudScanner = () => {
  const { loaded } = useBootStatus();
  const [runId, setRunId] = useState(0);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [active, setActive] = useState(0);
  const [autoCycle, setAutoCycle] = useState(true);

  // Hold the run until the boot overlay clears so the visitor sees 0 → 100.
  // `runId` re-arms it on replay; the reset to 0 lives in the click handler, so
  // the effect itself only ever schedules async work (no synchronous setState).
  useEffect(() => {
    if (!loaded) return;

    if (prefersReducedMotion()) {
      const frame = requestAnimationFrame(() => {
        setProgress(100);
        setDone(true);
      });
      return () => cancelAnimationFrame(frame);
    }

    let raf = 0;
    let startedAt = 0;

    const tick = (now: number) => {
      if (!startedAt) startedAt = now;
      const t = Math.min(1, (now - startedAt) / RUN_MS);
      setProgress(Math.round(ease(t) * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDone(true);
      }
    };

    const startTimer = setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, START_PAUSE_MS);

    return () => {
      clearTimeout(startTimer);
      cancelAnimationFrame(raf);
    };
  }, [loaded, runId]);

  // After the scan, walk through each issue's impact one at a time.
  useEffect(() => {
    if (!done || !autoCycle || prefersReducedMotion()) return;
    const id = setInterval(() => {
      setActive((i) => (i + 1) % SCAN_ISSUES.length);
    }, IMPACT_STEP_MS);
    return () => clearInterval(id);
  }, [autoCycle, done]);

  const replay = () => {
    setProgress(0);
    setDone(false);
    setActive(0);
    setAutoCycle(true);
    setRunId((id) => id + 1);
  };

  const selectIssue = (index: number) => {
    setActive(index);
    setAutoCycle(false);
  };

  const shown = done ? 100 : progress;
  const spotlight = SCAN_ISSUES[active];
  const found = SCAN_ISSUES.filter((issue) => shown >= issue.at).length;

  const renderIssue = (idx: number, options?: { tagPlacement?: "below" }) => {
    const issue = SCAN_ISSUES[idx];

    return (
      <span
        className={cn(
          styles.issue,
          options?.tagPlacement === "below" && styles.issueTagBelow,
          shown >= issue.at && styles.issueOn,
          done && idx === active && styles.issueActive,
        )}
        data-sev={issue.sev}
        aria-hidden="true"
      >
        <span className={styles.issueTag}>
          <span className={styles.issueDot} />
          {issue.label}
        </span>

        {done && idx === active && (
          <span className={styles.heard} data-via={issue.via}>
            <ViaIcon via={issue.via} />
            {issue.via === "sr" ? `“${issue.heard}”` : issue.heard}
          </span>
        )}
      </span>
    );
  };

  return (
    <div className={styles.scanWrap}>
      {/* A dev note parked just left of the mini browser. */}
      <div className={styles.scanTodo}>
        <div
          className={styles.todo}
          aria-label="TODO: fix accessibility — later crossed out, today"
        >
          <span className={styles.todoComment}>
            <span className={styles.todoTyped}>{"// TODO: fix accessibility"}</span>
            <span className={styles.todoCursor} aria-hidden="true" />
          </span>
          <span className={styles.todoPatch}>
            <s className={styles.todoLater} aria-hidden="true">
              later
            </s>
            <span className={styles.todoToday}>today.</span>
          </span>
        </div>
      </div>

      {/* The one deliberately handwritten thing on the page. */}
      <div className={styles.annotation} aria-hidden="true">
        issues highlighted in context
      </div>
      <svg className={styles.annotationArrow} viewBox="0 0 116 46" fill="none" aria-hidden="true">
        <path className={styles.annotationCurve} pathLength={1} d="M106 6 C 80 16, 54 14, 32 40" />
        <path className={styles.annotationHead} d="M43 39 L31 43 L36 29" />
      </svg>

      <div
        className={cn(styles.browser, done && styles.browserDone)}
        style={{ "--p": shown } as CSSProperties}
      >
        {/* ── Browser chrome ── */}
        <div className={styles.browserBar}>
          <span className={styles.dots} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className={styles.urlPill} aria-hidden="true">
            <LockIcon />
            {SCAN_HOST}
          </span>
          {done ? (
            <button
              type="button"
              className={styles.statusReplay}
              onClick={replay}
              aria-label="Replay the scan"
            >
              <ReplayIcon />
              scan again
            </button>
          ) : (
            <span className={styles.statusLive} aria-hidden="true">
              <i />
              scanning <b>{shown}%</b>
            </span>
          )}
        </div>

        {/* slim audit progress bar */}
        <div className={styles.scanProgress} aria-hidden="true">
          <span className={styles.scanProgressFill} />
        </div>

        <div className={styles.scanWorkspace}>
          {/* ── The page being scanned ── */}
          <div
            className={styles.viewport}
            role="img"
            aria-label={`Axiony auditing ${SCAN_HOST} for accessibility issues`}
          >
            <div className={styles.page} aria-hidden="true">
              <div className={styles.siteNav}>
                <span className={styles.navBrand}>
                  <span className={styles.navLogo}>A</span>
                  <b>Arcwell</b>
                </span>
                <span className={styles.navLinks}>
                  <i>Product</i>
                  <i>Pricing</i>
                  <i>Stories</i>
                  {renderIssue(ISSUE_LOW_CONTRAST, { tagPlacement: "below" })}
                </span>
                <span className={styles.navBtn}>Sign in</span>
              </div>

              <span className={styles.demoEyebrow}>FINANCE, WITHOUT THE FRICTION</span>

              <span className={styles.demoHeadline}>
                Money moves.
                <br />
                Your team moves faster.
              </span>
              <span className={styles.demoCopy}>
                One calm place to plan spend, approve purchases, and keep every team on budget.
              </span>

              <span className={styles.demoActions}>
                <span className={styles.demoCta}>Start free</span>
                {/* Intentionally icon-only: visually understandable, unnamed
                    to a screen reader. */}
                <span className={styles.demoIconButton}>↗{renderIssue(ISSUE_BUTTON_NAME)}</span>
              </span>

              {/* A polished image can still be inaccessible when alt is absent. */}
              <span className={styles.mediaTarget}>
                <span className={styles.media}>
                  <span className={styles.mediaTop}>
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className={styles.mediaBalance}>$84,240</span>
                  <span className={styles.mediaLabel}>Available balance</span>
                  <span className={styles.mediaChart}>
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className={styles.mediaBadge}>
                    <ImageIcon />
                    product preview
                  </span>
                </span>
                {renderIssue(ISSUE_NO_ALT_TEXT)}
              </span>

              {/* Placeholder-only field: it looks labelled until somebody types. */}
              <span className={styles.demoForm}>
                <span className={styles.demoInput}>
                  Work email
                  {renderIssue(ISSUE_MISSING_LABEL)}
                </span>
                <span className={styles.demoSubmit}>Join waitlist</span>
              </span>

              <span className={styles.demoTrust}>
                <i />
                Trusted by 2,000+ finance teams
              </span>
            </div>

            {/* Scan overlays: a dimmed "already scanned" region + the line. */}
            <span className={styles.scanned} aria-hidden="true" />
            <span className={styles.beam} aria-hidden="true" />
          </div>

          {/* A compact audit rail makes the relationship between the highlighted
              element, the technical evidence, and the human cost explicit. */}
          <aside className={styles.auditPanel} aria-label="Accessibility issues found">
            <div className={styles.auditHeader}>
              <span>
                <small>accessibility audit</small>
                <strong>{done ? "4 issues found" : `${found} of 4 found`}</strong>
              </span>
              <span
                className={cn(
                  styles.auditScore,
                  found > 0 && styles.auditScoreWarn,
                  done && styles.auditScoreDone,
                )}
              >
                {Math.max(61, 100 - found * 13)}
              </span>
            </div>

            <div className={styles.auditList}>
              {SCAN_ISSUES.map((issue, idx) => {
                const isFound = shown >= issue.at;
                return (
                  <button
                    key={issue.label}
                    type="button"
                    className={cn(
                      styles.auditItem,
                      isFound && styles.auditItemFound,
                      done && idx === active && styles.auditItemActive,
                    )}
                    data-sev={issue.sev}
                    disabled={!done}
                    aria-pressed={done && idx === active}
                    onClick={() => selectIssue(idx)}
                  >
                    <span className={styles.auditItemIcon}>
                      <ViaIcon via={issue.via} />
                    </span>
                    <span className={styles.auditItemCopy}>
                      <strong>{issue.label}</strong>
                      <small>{issue.evidence}</small>
                    </span>
                    <span className={styles.auditItemArrow}>→</span>
                  </button>
                );
              })}
            </div>

            <div className={styles.impact} data-via={spotlight.via}>
              <span className={styles.impactEyebrow}>why this matters</span>
              <p className={styles.impactText}>{spotlight.impact}</p>
              <span className={styles.impactHint}>
                {done ? "Select an issue to inspect it" : "Scanning the visible page"}
              </span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
