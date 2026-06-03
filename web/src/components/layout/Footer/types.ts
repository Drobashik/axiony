import type { AccentColor } from "@/types";

export interface FooterLink {
  href: string;
  label: string;
}

export interface FooterColumn {
  heading: string;
  links: FooterLink[];
}

export interface FooterBadge {
  tone: AccentColor;
  label: string;
}
