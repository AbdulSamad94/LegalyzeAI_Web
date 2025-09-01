import type React from "react";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SessionProviderWrapper } from "@/components/session/SessionProviderWrapper";
import { Analytics } from "@vercel/analytics/next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Legalyze AI - Understand Any Legal Document in Seconds",
  description:
    "Upload contracts, agreements, or NDAs and get instant summaries, risk analysis, and safe/unsafe verdicts powered by advanced AI technology.",
  keywords:
    "legal AI, document analysis, contract review, legal tech, AI lawyer",
  authors: [{ name: "Legalyze AI Team" }],
  openGraph: {
    title: "Legalyze AI - AI-Powered Legal Document Analyzer",
    description:
      "Get instant legal document analysis with AI-powered summaries and risk assessments.",
    type: "website",
  },
  icons: {
    icon: "/fav-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProviderWrapper>
      <html lang="en" className="scroll-smooth">
        <body className={plusJakartaSans.className}>
          <Header />
          {children}
          <Footer />
          <Analytics />
        </body>
      </html>
    </SessionProviderWrapper>
  );
}
