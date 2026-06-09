// Local icons for the auth screens. Shared product icons come from
// `@/components/ui` (<Icon />); these are the extras the auth flow needs
// (form affordances, OAuth marks, value-panel glyphs).

interface IconProps {
  className?: string;
  size?: number;
}

const stroke = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "aria-hidden": true as const,
});

export const MailIcon = ({ className, size = 18 }: IconProps) => (
  <svg
    {...stroke(size)}
    className={className}
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

export const LockIcon = ({ className, size = 18 }: IconProps) => (
  <svg
    {...stroke(size)}
    className={className}
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
  </svg>
);

export const UserIcon = ({ className, size = 18 }: IconProps) => (
  <svg
    {...stroke(size)}
    className={className}
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

export const EyeIcon = ({ className, size = 18 }: IconProps) => (
  <svg
    {...stroke(size)}
    className={className}
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const EyeOffIcon = ({ className, size = 18 }: IconProps) => (
  <svg
    {...stroke(size)}
    className={className}
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9.9 5.2A10.4 10.4 0 0 1 12 5c6.4 0 10 7 10 7a17.7 17.7 0 0 1-3.3 4.1M6.6 6.6A17.6 17.6 0 0 0 2 12s3.6 7 10 7a10.3 10.3 0 0 0 4.4-.9" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18" />
  </svg>
);

export const AlertIcon = ({ className, size = 16 }: IconProps) => (
  <svg
    {...stroke(size)}
    className={className}
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5M12 16.5h.01" />
  </svg>
);

export const CheckIcon = ({ className, size = 18 }: IconProps) => (
  <svg
    {...stroke(size)}
    className={className}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const ArrowRightIcon = ({ className, size = 16 }: IconProps) => (
  <svg
    {...stroke(size)}
    className={className}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const BackIcon = ({ className, size = 16 }: IconProps) => (
  <svg
    {...stroke(size)}
    className={className}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export const Spinner = ({ className, size = 18 }: IconProps) => (
  <svg {...stroke(size)} className={className} strokeWidth="2.2" strokeLinecap="round">
    <circle cx="12" cy="12" r="9" opacity="0.25" />
    <path d="M21 12a9 9 0 0 0-9-9" />
  </svg>
);

// ── Value-panel glyphs ───────────────────────────────────────────────
export const BaselineIcon = ({ className, size = 18 }: IconProps) => (
  <svg
    {...stroke(size)}
    className={className}
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3 4 6.5v5c0 4.4 3.2 7.8 8 9 4.8-1.2 8-4.6 8-9v-5L12 3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const TrendIcon = ({ className, size = 18 }: IconProps) => (
  <svg
    {...stroke(size)}
    className={className}
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 17l5-5 4 3 6-7" />
    <path d="M18 8h3v3" />
  </svg>
);

export const GitIcon = ({ className, size = 18 }: IconProps) => (
  <svg
    {...stroke(size)}
    className={className}
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="6" cy="6" r="2.5" />
    <circle cx="6" cy="18" r="2.5" />
    <circle cx="18" cy="9" r="2.5" />
    <path d="M6 8.5v7M8.4 7.4 15.6 9M18 11.5c0 3-3 3.5-6 3.5" />
  </svg>
);

export const SparkIcon = ({ className, size = 18 }: IconProps) => (
  <svg {...stroke(size)} className={className} strokeWidth="1.5" strokeLinejoin="round">
    <path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z" />
    <path d="M19 14l.8 2.4L22 17l-2.2.6L19 20l-.8-2.4L16 17l2.2-.6L19 14Z" />
  </svg>
);

export const TeamIcon = ({ className, size = 18 }: IconProps) => (
  <svg
    {...stroke(size)}
    className={className}
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
    <path d="M16 5.5a3 3 0 0 1 0 5.6M16.5 14.2A5.5 5.5 0 0 1 20.5 19.5" />
  </svg>
);

// ── OAuth marks (brand glyphs, filled) ───────────────────────────────
export const GoogleIcon = ({ className, size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.87Z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.96-1.08 7.95-2.91l-3.88-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.27v3.09A12 12 0 0 0 12 24Z"
    />
    <path
      fill="#FBBC05"
      d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.27a12 12 0 0 0 0 10.76l4-3.09Z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.62l4 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
    />
  </svg>
);

export const GitHubIcon = ({ className, size = 18 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

export const GitLabIcon = ({ className, size = 18 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="m23.6 9.6-.03-.08-3.26-8.5a.85.85 0 0 0-.84-.53.83.83 0 0 0-.49.2.85.85 0 0 0-.28.43l-2.2 6.73H7.5L5.3 1.12a.84.84 0 0 0-.28-.43.83.83 0 0 0-.49-.2.85.85 0 0 0-.84.53L.43 9.51l-.03.08a6.05 6.05 0 0 0 2 7l.02.01.03.02 4.95 3.71 2.45 1.86 1.5 1.13a.99.99 0 0 0 1.2 0l1.5-1.13 2.45-1.86 4.98-3.73.01-.01a6.05 6.05 0 0 0 2-6.99z" />
  </svg>
);
