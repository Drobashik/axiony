import type { CSSProperties } from "react";
import cn from "classnames";
import { SCAN_HOST, SCAN_ISSUES } from "../data";
import { CloudScannerController } from "./CloudScannerController";
import { EyeOffIcon, ImageIcon, LockIcon, ReplayIcon, SpeakerIcon } from "./icons";
import styles from "../Hero.module.scss";

const ViaIcon = ({ via }: { via: "sr" | "eye" }) =>
  via === "sr" ? <SpeakerIcon /> : <EyeOffIcon />;

const ISSUE_LOW_CONTRAST = 0;
const ISSUE_NO_ALT_TEXT = 1;
const ISSUE_BUTTON_NAME = 2;
const ISSUE_MISSING_LABEL = 3;
const BROWSER_ID = "hero-cloud-scanner";

export const CloudScanner = () => {
  const renderIssue = (idx: number, options?: { tagPlacement?: "below" }) => {
    const issue = SCAN_ISSUES[idx];

    return (
      <span
        className={cn(styles.issue, options?.tagPlacement === "below" && styles.issueTagBelow)}
        data-sev={issue.sev}
        data-scan-marker={idx}
        aria-hidden="true"
      >
        <span className={styles.issueTag}>
          <span className={styles.issueDot} />
          {issue.label}
        </span>

        <span className={styles.heard} data-via={issue.via}>
          <ViaIcon via={issue.via} />
          {issue.via === "sr" ? `“${issue.heard}”` : issue.heard}
        </span>
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

      <div id={BROWSER_ID} className={styles.browser} style={{ "--p": 0 } as CSSProperties}>
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
          <span className={styles.statusLive} aria-hidden="true">
            <i />
            scanning <b data-scan-progress>0%</b>
          </span>
          <button
            type="button"
            className={styles.statusReplay}
            data-scan-replay
            aria-label="Replay the scan"
          >
            <ReplayIcon />
            scan again
          </button>
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
                <strong data-scan-found>0 of 4 found</strong>
              </span>
              <span className={styles.auditScore} data-scan-score>
                100
              </span>
            </div>

            <div className={styles.auditList}>
              {SCAN_ISSUES.map((issue, idx) => {
                return (
                  <button
                    key={issue.label}
                    type="button"
                    className={styles.auditItem}
                    data-sev={issue.sev}
                    data-scan-issue={idx}
                    disabled
                    aria-pressed="false"
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

            <div className={styles.impact} data-via={SCAN_ISSUES[0].via} data-scan-impact>
              <span className={styles.impactEyebrow}>why this matters</span>
              <p className={styles.impactText} data-scan-impact-text>
                {SCAN_ISSUES[0].impact}
              </p>
              <span className={styles.impactHint} data-scan-impact-hint>
                Scanning the visible page
              </span>
            </div>
          </aside>
        </div>
      </div>
      <CloudScannerController browserId={BROWSER_ID} />
    </div>
  );
};
