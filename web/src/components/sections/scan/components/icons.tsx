// Local icons for the scan studio. Shared product icons come from
// `@/components/ui` (<Icon />); these are the extras this page needs.

interface IconProps {
  className?: string;
  size?: number;
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "aria-hidden": true as const,
});

export const GlobeIcon = ({ className, size = 15 }: IconProps) => (
  <svg {...base(size)} className={className} strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
  </svg>
);

export const SearchIcon = ({ className, size = 15 }: IconProps) => (
  <svg {...base(size)} className={className} strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

export const SparkleIcon = ({ className, size = 14 }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path
      d="M12 3l1.6 5.1L19 9.7l-5.4 1.6L12 16l-1.6-4.7L5 9.7l5.4-1.6L12 3z"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M19 15l.7 2.2L22 18l-2.3.8L19 21l-.7-2.2L16 18l2.3-.8L19 15z"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
  </svg>
);

export const LockIcon = ({ className, size = 14 }: IconProps) => (
  <svg {...base(size)} className={className} strokeLinecap="round">
    <rect x="5" y="11" width="14" height="9" rx="2" strokeWidth="1.5" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" strokeWidth="1.5" />
  </svg>
);

export const RefreshIcon = ({ className, size = 15 }: IconProps) => (
  <svg
    {...base(size)}
    className={className}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 4v6h6M23 20v-6h-6" />
    <path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15" />
  </svg>
);

export const DownloadIcon = ({ className, size = 15 }: IconProps) => (
  <svg
    {...base(size)}
    className={className}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
  </svg>
);

export const CopyIcon = ({ className, size = 14 }: IconProps) => (
  <svg
    {...base(size)}
    className={className}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);

export const ChevronIcon = ({ className, size = 16 }: IconProps) => (
  <svg
    {...base(size)}
    className={className}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);
