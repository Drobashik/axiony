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

const HomePage = () => {
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
};

export default HomePage;
