import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Legalyze AI collects, uses, and protects your data, including the documents you upload for analysis.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
