import type { MouseEvent as ReactMouseEvent } from "react";

export interface NavItem {
  href: string;
  label: string;
  id: string;
}

export type NavSectionClick = (event: ReactMouseEvent<HTMLAnchorElement>, id: string) => void;
