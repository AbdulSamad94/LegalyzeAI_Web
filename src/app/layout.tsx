import type React from "react";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SessionProviderWrapper } from "@/components/session/SessionProviderWrapper";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import BugReportModal from "@/components/layout/BugReportModal";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Legalyze AI - Understand Any Legal Document in Seconds",
  description:
    "Upload contracts, agreements, or NDAs and get instant summaries, risk analysis, and safe/unsafe verdicts powered by advanced AI technology.",
  keywords:
    "legalyze AI, document analysis, contract review, legal tech, AI lawyer",
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
        <head>
          {/* Google Site Verification */}
          <meta
            name="google-site-verification"
            content="i5rgLv46YHMPKalrYwZOpajp-gsbKKVx5PpeH46S1QM"
          />

          {/* Google Analytics */}
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            strategy="beforeInteractive"
          />
          <Script id="google-analytics" strategy="beforeInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
            `}
          </Script>
        </head>
        <body className={plusJakartaSans.className}>
          {children}
          <BugReportModal />
          <Analytics />
        </body>
      </html>
    </SessionProviderWrapper>
  );
}
