import type { Metadata } from "next";
import { ScanStudio } from "@/components/sections/scan";

export const metadata: Metadata = {
  title: "Scanner Studio",
  description:
    "Paste a URL into Axiony for an accessibility score, prioritized issues, and clear fixes.",
};

const ScanPage = () => <ScanStudio />;

export default ScanPage;
