"use client";

import {
  Faq,
  FinalCta,
  Hero,
  PricingPreview,
  Problem,
  QuickStart,
  ScanWorkflow,
  Solution,
  TrustBar,
} from "@/components/sections/home";
import { useReveal } from "@/lib/hooks/useReveal";

/**
 * Marketing home page — assembled from focused section components.
 * The BootGate that plays the loading screen lives at the root layout
 * level, so we don't have to wrap anything here.
 */
export default function HomePage() {
  useReveal();

  return (
    <>
      <Hero />
      <TrustBar />
      <Problem />
      <Solution />
      <ScanWorkflow />
      <QuickStart />
      <PricingPreview />
      <Faq />
      <FinalCta />
    </>
  );
}
