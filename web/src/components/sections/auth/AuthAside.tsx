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

/**
 * The value panel beside the form. Spells out what the account is *for* —
 * saving scans, locking a baseline, tracking the score, and connecting the
 * team's workflow — so the form never reads as a generic gate.
 */
export const AuthAside = ({ mode }: { mode: AuthMode }) => {
  const copy = AUTH_COPY[mode];

  return (
    <aside className={styles.aside}>
      <div className={styles.asideGrid} aria-hidden="true" />
      <div className={styles.asideGlow} aria-hidden="true" />

      <div className={styles.asideInner}>
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

        <ul className={styles.trust}>
          {copy.trust.map((item) => (
            <li key={item} className={styles.trustItem}>
              <CheckIcon size={13} />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};
