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
import { RevealController } from "./RevealController";

const HomePage = () => (
  <>
    <RevealController />
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

export default HomePage;
