import {
  Faq,
  FinalCta,
  Hero,
  PricingPreview,
  Problem,
  QuickStart,
  ScanWorkflow,
  Solution,
} from "@/components/sections/home";
import { RevealController } from "./RevealController";

const HomePage = () => (
  <>
    <RevealController />
    <Hero />
    <Problem />
    <Solution />
    <ScanWorkflow />
    <QuickStart />
    <PricingPreview />
    <Faq />
    <FinalCta />
  </>
);

export default HomePage;
