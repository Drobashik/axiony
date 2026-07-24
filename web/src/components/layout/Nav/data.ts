import type { NavItem } from "./types";

export const LINKS: NavItem[] = [
  { href: "/#workflow", label: "Workflow", id: "workflow" },
  { href: "/#quickstart", label: "Quick start", id: "quickstart" },
  { href: "/#pricing", label: "Pricing", id: "pricing" },
];

export const SPY_IDS = [...LINKS.map((link) => link.id), "faq"];
