import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { BootGate } from "@/components/layout";
import "@/styles/globals.scss";

export const metadata: Metadata = {
  title: {
    default: "Axiony — Accessibility Testing for Developers",
    template: "%s — Axiony",
  },
  description:
    "Developer-first accessibility testing for modern teams. Scan URLs, components, and raw HTML. Monitor issues over time. Fix faster — in the browser or in CI.",
  applicationName: "Axiony",
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang="en">
    <body>
      <BootGate>{children}</BootGate>
    </body>
  </html>
);

export default RootLayout;
