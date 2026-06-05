import type { Metadata } from "next";
import { ScanStudio } from "@/components/sections/scan-v3";

export const metadata: Metadata = {
  title: "Cloud Scanner Studio",
  description:
    "Preview the Axiony Cloud scanner — paste a URL for a computed accessibility score, a severity breakdown, and a searchable issue explorer with plain-English fixes and code.",
};

const ScanPage = () => <ScanStudio />;

export default ScanPage;
