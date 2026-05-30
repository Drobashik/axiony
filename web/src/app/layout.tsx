import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import { BootGate } from "@/components/layout";
import "@/styles/globals.scss";

export const metadata: Metadata = {
  title: {
    default: "Axiony — Accessibility Testing for Developers",
    template: "%s — Axiony",
  },
  description:
    "Developer-first accessibility testing for modern teams. Scan URLs, components, and raw HTML. Monitor issues over time. Fix faster — in the browser or in CI.",
  // Next.js auto-detects `app/icon.svg` and `app/apple-icon.svg`, so we
  // don't have to declare them here. We just add the brand color hint.
  applicationName: "Axiony",
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
};

/**
 * The root shell. We mount {@link BootGate} here so the LoadingScreen
 * gates the *entire* page — Nav, Footer, sidebar and all — instead of
 * just one section. That way the user sees the loader, then the whole
 * site reveals at once instead of catching a flash of Nav/Footer with
 * an empty middle while individual pages mount.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <BootGate>{children}</BootGate>
      </body>
    </html>
  );
}
