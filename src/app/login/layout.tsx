import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "Log In",
  description:
    "Log in to Legalyze AI to access your saved document analyses and continue reviewing contracts, agreements, and NDAs.",
  alternates: {
    canonical: "/login",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
