import type { Metadata } from "next";
import { AuthScreen } from "@/components/sections/auth";

export const metadata: Metadata = {
  title: "Create your account",
  description:
    "Create an Axiony workspace to save scans, lock an accessibility baseline, track your score, and connect your team's GitHub & GitLab workflow.",
};

const SignupPage = () => <AuthScreen mode="signup" />;

export default SignupPage;
