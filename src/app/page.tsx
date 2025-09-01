"use client";

import HeroSection from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import UseCases from "@/components/UseCases";
import DemoSection from "@/components/Demo";
import PricingSection from "@/components/Pricing";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      <main>
        <HeroSection />
        <HowItWorks />
        <Features />
        <UseCases />
        <DemoSection />
        <PricingSection />
      </main>
    </div>
  );
}
