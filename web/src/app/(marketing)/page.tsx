"use client";

import {
  DeveloperExperience,
  DocsPreview,
  Faq,
  Features,
  FinalCta,
  Hero,
  HowItWorks,
  PricingPreview,
  Problem,
  Solution,
  Testimonials,
  TrustBar,
  UseCases,
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
      <Features />
      <HowItWorks />
      <DeveloperExperience />
      <DocsPreview />
      <UseCases />
      <PricingPreview />
      <Testimonials />
      <Faq />
      <FinalCta />
    </>
  );
}
