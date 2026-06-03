import type { NavItem } from "./types";

export const LINKS: NavItem[] = [
  { href: "#workflow", label: "How it works", id: "workflow" },
  { href: "#pricing", label: "Pricing", id: "pricing" },
  { href: "#faq", label: "FAQ", id: "faq" },
];

export const SPY_IDS = LINKS.map((link) => link.id);
