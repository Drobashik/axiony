import type { FooterBadge, FooterColumn } from "./types";

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: "Product",
    links: [
      { href: "/#features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/#changelog", label: "Changelog" },
      { href: "#", label: "Roadmap" },
    ],
  },
  {
    heading: "Docs",
    links: [
      { href: "/docs", label: "Introduction" },
      { href: "/docs#install", label: "Installation" },
      { href: "/docs#cli", label: "CLI Reference" },
      { href: "/docs#ci", label: "CI Integration" },
      { href: "/docs#config", label: "Configuration" },
    ],
  },
  {
    heading: "Community",
    links: [
      { href: "#", label: "GitHub" },
      { href: "#", label: "Discord" },
      { href: "#", label: "Blog" },
      { href: "#", label: "Twitter / X" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "#", label: "About" },
      { href: "#", label: "Contact" },
      { href: "#", label: "Privacy" },
      { href: "#", label: "Terms" },
    ],
  },
];

export const FOOTER_BADGES: FooterBadge[] = [
  { tone: "green", label: "SOC 2 Ready" },
  { tone: "blue", label: "WCAG 2.2" },
];
