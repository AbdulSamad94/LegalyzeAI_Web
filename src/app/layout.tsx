import type React from "react";
import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import BugReportModal from "@/components/layout/BugReportModal";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants/seo";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

const TITLE = "Legalyze AI - Understand Any Legal Document in Seconds";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "legal document analyzer",
    "AI contract review",
    "NDA analysis",
    "contract risk assessment",
    "legal tech AI",
    "AI lawyer",
    "document summarizer",
  ],
  authors: [{ name: "Legalyze AI Team" }],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Legalyze AI - AI-Powered Legal Document Analyzer",
    description:
      "Get instant legal document analysis with AI-powered summaries and risk assessments.",
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/footer-logo.png",
        width: 1536,
        height: 1024,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Legalyze AI - AI-Powered Legal Document Analyzer",
    description:
      "Get instant legal document analysis with AI-powered summaries and risk assessments.",
    images: ["/footer-logo.png"],
  },
  icons: {
    icon: "/fav-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4f46e5",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Google Site Verification */}
        <meta
          name="google-site-verification"
          content="i5rgLv46YHMPKalrYwZOpajp-gsbKKVx5PpeH46S1QM"
        />

        {/* Structured data for search engines (Google rich results, etc.) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
  );
}
