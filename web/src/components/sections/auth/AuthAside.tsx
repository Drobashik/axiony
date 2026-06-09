"use client";

import { SEVERITY_COLOR, SEVERITY_LABEL, SEVERITY_ORDER } from "@/lib/scan/issues";
import { usePendingScan } from "@/lib/workspace";
import type { PendingScan } from "@/lib/workspace";
import { AUTH_COPY } from "./data";
import type { AuthMode, AuthValuePoint } from "./types";
import { BaselineIcon, CheckIcon, GitIcon, SparkIcon, TeamIcon, TrendIcon } from "./icons";
import styles from "./AuthScreen.module.scss";

const POINT_ICON: Record<AuthValuePoint["icon"], typeof BaselineIcon> = {
  baseline: BaselineIcon,
  trend: TrendIcon,
  git: GitIcon,
  spark: SparkIcon,
  team: TeamIcon,
};

const scoreColor = (score: number): string => {
  if (score >= 80) return "var(--green)";
  if (score >= 60) return "var(--severity-moderate)";
  return "var(--severity-critical)";
};

const TrustList = ({ items }: { items: string[] }) => (
  <ul className={styles.trust}>
    {items.map((item) => (
      <li key={item} className={styles.trustItem}>
        <CheckIcon size={13} />
        {item}
      </li>
    ))}
  </ul>
);

/** Signup arriving from a scan: show the actual result being saved. */
const ScanContext = ({ pending }: { pending: PendingScan }) => (
  <>
    <span className={styles.eyebrow}>Save your scan</span>
    <h2 className={styles.asideTitle}>One step from your baseline</h2>

    <div className={styles.scanCard}>
      <div className={styles.scanCardTop}>
        <span className={styles.scanCardLabel}>Scan to save</span>
        <span className={styles.scanCardHost}>{pending.host}</span>
      </div>
      <div className={styles.scanCardScore}>
        <span className={styles.scanScore} style={{ color: scoreColor(pending.score) }}>
          {pending.score}
        </span>
        <span className={styles.scanScoreUnit}>/ 100</span>
        <span className={styles.scanScoreMeta}>
          WCAG {pending.level} · {pending.total} issues
        </span>
      </div>
      <div className={styles.scanSeverities}>
        {SEVERITY_ORDER.filter((s) => pending.counts[s] > 0).map((s) => (
          <span key={s} className={styles.sevChip}>
            <span className={styles.sevDot} style={{ background: SEVERITY_COLOR[s] }} />
            {pending.counts[s]} {SEVERITY_LABEL[s]}
          </span>
        ))}
      </div>
    </div>

    <p className={styles.asideSub}>
      Create your account to save this as a <strong>baseline</strong>. These {pending.total} issues
      become tracked debt — new regressions get caught in CI and pull requests.
    </p>

    <TrustList items={AUTH_COPY.signup.trust} />
  </>
);

const DefaultContext = ({ mode }: { mode: AuthMode }) => {
  const copy = AUTH_COPY[mode];
  return (
    <>
      <span className={styles.eyebrow}>{copy.eyebrow}</span>
      <h2 className={styles.asideTitle}>{copy.title}</h2>
      <p className={styles.asideSub}>{copy.subtitle}</p>

      <ul className={styles.points}>
        {copy.points.map((point) => {
          const Glyph = POINT_ICON[point.icon];
          return (
            <li key={point.title} className={styles.point}>
              <span className={styles.pointIcon} aria-hidden="true">
                <Glyph size={18} />
              </span>
              <span className={styles.pointBody}>
                <span className={styles.pointTitle}>{point.title}</span>
                <span className={styles.pointDesc}>{point.desc}</span>
              </span>
            </li>
          );
        })}
      </ul>

      <TrustList items={copy.trust} />
    </>
  );
};

/**
 * The value panel beside the form. Normally spells out what the account is
 * *for*; when the user arrived from a scan, it shows that exact scan so the
 * form reads as "save my result", not a generic gate.
 */
export const AuthAside = ({ mode }: { mode: AuthMode }) => {
  // SSR-safe: the server snapshot is null, so the default panel renders
  // first, then swaps to the scan context after hydration when present.
  const pending = usePendingScan();
  const showScan = mode === "signup" && pending !== null;

  return (
    <aside className={styles.aside}>
      <div className={styles.asideGrid} aria-hidden="true" />
      <div className={styles.asideGlow} aria-hidden="true" />

      <div className={styles.asideInner}>
        {showScan ? <ScanContext pending={pending} /> : <DefaultContext mode={mode} />}
      </div>
    </aside>
  );
};
