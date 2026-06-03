import cn from "classnames";
import styles from "./LogoMark.module.scss";

export interface LogoMarkProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

export interface LogoLockupProps {
  className?: string;
  markSize?: number;
  tagline?: boolean;
}

export const LogoMark = ({ size = 28, className, glow }: LogoMarkProps) => (
  <span
    className={cn(styles.mark, glow && styles.glow, className)}
    style={{ width: size, height: size }}
    aria-hidden="true"
  >
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="axiHex" x1="14" y1="4" x2="50" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#55a7ff" />
          <stop offset="0.38" stopColor="#245cff" />
          <stop offset="0.72" stopColor="#3b34d7" />
          <stop offset="1" stopColor="#6a22e8" />
        </linearGradient>
        <radialGradient id="axiGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(22 13) rotate(54) scale(55 48)">
          <stop stopColor="white" stopOpacity="0.34" />
          <stop offset="0.45" stopColor="white" stopOpacity="0.08" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      <path
        d="M32 2.5c2.7 0 5.3.72 7.6 2.1l14 8.25a15.2 15.2 0 0 1 7.43 13.1v12.1a15.2 15.2 0 0 1-7.43 13.1l-14 8.25a15 15 0 0 1-15.2 0l-14-8.25a15.2 15.2 0 0 1-7.43-13.1v-12.1a15.2 15.2 0 0 1 7.43-13.1l14-8.25A15 15 0 0 1 32 2.5Z"
        fill="url(#axiHex)"
        stroke="rgba(255,255,255,0.2)"
      />
      <path
        d="M32 2.5c2.7 0 5.3.72 7.6 2.1l14 8.25a15.2 15.2 0 0 1 7.43 13.1v12.1a15.2 15.2 0 0 1-7.43 13.1l-14 8.25a15 15 0 0 1-15.2 0l-14-8.25a15.2 15.2 0 0 1-7.43-13.1v-12.1a15.2 15.2 0 0 1 7.43-13.1l14-8.25A15 15 0 0 1 32 2.5Z"
        fill="url(#axiGlow)"
      />

      <g stroke="white" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18.5 44.5 32 18.5 45.5 44.5" />
      </g>

      <circle cx="18.5" cy="44.5" r="5.2" fill="white" />
      <circle cx="45.5" cy="44.5" r="5.2" fill="white" />
      <circle cx="32" cy="18.5" r="5.5" fill="#27e2a4" />
    </svg>
  </span>
);

export const LogoLockup = ({ className, markSize = 72, tagline = true }: LogoLockupProps) => (
  <span className={cn(styles.lockup, className)} aria-label="Axiony">
    <LogoMark size={markSize} glow />
    <span className={styles.lockupText}>
      <span className={styles.wordmark}>Axiony</span>
      {tagline ? (
        <span className={styles.tagline}>
          Accessibility. <strong>Integrated.</strong>
        </span>
      ) : null}
    </span>
  </span>
);
