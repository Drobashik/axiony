import {
  Faq,
  FinalCta,
  Hero,
  PricingPreview,
  Problem,
  QuickStart,
  ScanWorkflow,
} from "@/components/sections/home";
import { RevealController } from "./RevealController";

const HomePage = () => (
  <>
    <RevealController />
    <Hero />
    <Problem />
    <ScanWorkflow />
    <QuickStart />
    <PricingPreview />
    <Faq />
    <FinalCta />
  </>
);

export default HomePage;
