interface IconProps {
  className?: string;
}

const base = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const SunIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M12 2.8v2.1M12 19.1v2.1M2.8 12h2.1M19.1 12h2.1M5.45 5.45l1.48 1.48M17.07 17.07l1.48 1.48M18.55 5.45l-1.48 1.48M6.93 17.07l-1.48 1.48" />
    <circle cx="12" cy="12" r="4.1" />
    <path d="M9.5 11.1h5M10.7 13.8h2.6" />
  </svg>
);

export const MoonIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M18.9 15.75A8.2 8.2 0 0 1 8.25 5.1 8.4 8.4 0 1 0 18.9 15.75Z" />
    <path d="M9.4 10.2h.01M12.1 15.1h.01" />
    <path d="M18.7 3.5 19.35 5l1.55.65-1.55.65-.65 1.55-.65-1.55-1.55-.65L18.05 5Z" />
  </svg>
);

export const SystemIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <rect x="2" y="4" width="20" height="13" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
);
