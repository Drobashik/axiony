import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Short_Stack, Space_Grotesk } from "next/font/google";
import { Suspense } from "react";
import type { ReactNode } from "react";
import { BootGate, RouteLoadingIndicator } from "@/components/layout";
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

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

const shortStack = Short_Stack({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-short-stack",
  display: "swap",
});

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html
    lang="en"
    className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} ${shortStack.variable}`}
  >
    <body>
      <BootGate>{children}</BootGate>
      <Suspense fallback={null}>
        <RouteLoadingIndicator />
      </Suspense>
    </body>
  </html>
);

export default RootLayout;
