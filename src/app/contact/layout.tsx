import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the Legalyze AI team for questions, feedback, or partnership inquiries.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
