import type { IconName } from "@/types";
import type { ReactNode } from "react";

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  className?: string;
  "aria-label"?: string;
}

const PATHS: Record<IconName, ReactNode> = {
  scan: (
    <>
      <path
        d="M3 3h5v5H3zM16 3h5v5h-5zM3 16h5v5H3zM14 14h7v7h-7z"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 5.5h8M5.5 8v8M18.5 8v3M14 18.5h3" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  check: (
    <path
      d="M20 6L9 17l-5-5"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  arrow: (
    <path
      d="M5 12h14M13 6l6 6-6 6"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  terminal: (
    <>
      <rect x="4" y="6" width="16" height="12" strokeWidth="1.5" fill="none" rx="2" />
      <path
        d="M8 10l3 3-3 3M12 16h4"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  ci: (
    <>
      <circle cx="12" cy="12" r="9" strokeWidth="1.5" fill="none" />
      <path
        d="M9 12l2 2 4-4"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  ),
  report: (
    <>
      <path
        d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
        strokeWidth="1.5"
        fill="none"
      />
      <polyline points="14,2 14,8 20,8" strokeWidth="1.5" fill="none" />
      <line x1="8" y1="13" x2="16" y2="13" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="17" x2="16" y2="17" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  team: (
    <>
      <path
        d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="9" cy="7" r="4" strokeWidth="1.5" fill="none" />
      <path
        d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </>
  ),
  bolt: (
    <path
      d="M13 2L4.5 13.5H12L11 22l8.5-11.5H12.5L13 2z"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  code: (
    <>
      <polyline
        points="16,18 22,12 16,6"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <polyline
        points="8,6 2,12 8,18"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  ),
  selector: (
    <>
      <circle cx="12" cy="12" r="3" strokeWidth="1.5" fill="none" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="10" strokeWidth="1.5" fill="none" />
      <path
        d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </>
  ),
  json: (
    <>
      <path
        d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
        strokeWidth="1.5"
        fill="none"
      />
      <polyline points="14,2 14,8 20,8" strokeWidth="1.5" fill="none" />
      <path
        d="M9 13c0 1.1-.45 2-1 2s-1-.9-1-2 .45-2 1-2 1 .9 1 2zM16 11v4M14 13h2M18 13h.5c.28 0 .5.22.5.5s-.22.5-.5.5H18c-.28 0-.5.22-.5.5s.22.5.5.5h.5"
        strokeWidth="1.3"
        strokeLinecap="round"
        fill="none"
      />
    </>
  ),
};

export const Icon = ({
  name,
  size = 18,
  color = "currentColor",
  className,
  "aria-label": ariaLabel,
}: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    stroke={color}
    className={className}
    role={ariaLabel ? "img" : undefined}
    aria-label={ariaLabel}
    aria-hidden={ariaLabel ? undefined : true}
  >
    {PATHS[name]}
  </svg>
);
