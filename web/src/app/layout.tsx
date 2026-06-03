import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { BootGate } from "@/components/layout";
import "@/styles/globals.scss";

export const metadata: Metadata = {
  title: {
    default: "Axiony — Accessibility Workflow for Product & Engineering Teams",
    template: "%s — Axiony",
  },
  description:
    "An accessibility workflow platform for product and engineering teams. Find, track, and prevent accessibility regressions — from a free, open-source CLI to CI checks, a cloud dashboard, and pull-request protection.",
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
