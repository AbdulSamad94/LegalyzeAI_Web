import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create a free Legalyze AI account to start analyzing contracts, agreements, and NDAs with AI-powered summaries and risk detection.",
  alternates: {
    canonical: "/signup",
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
