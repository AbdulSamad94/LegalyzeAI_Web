import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the terms and conditions for using Legalyze AI's document analysis service, including usage limits, disclaimers, and your rights as a user.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
