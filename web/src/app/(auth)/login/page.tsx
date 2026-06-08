import type { Metadata } from "next";
import { AuthScreen } from "@/components/sections/auth";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to Axiony to access your accessibility baselines, scan history, and team workflow.",
};

const LoginPage = () => <AuthScreen mode="login" />;

export default LoginPage;
