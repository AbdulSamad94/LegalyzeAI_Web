import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "Document Analysis",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DocumentAnalysisLayout({ children }: { children: React.ReactNode }) {
  return children;
}
