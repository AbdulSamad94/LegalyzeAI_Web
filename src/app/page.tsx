import dynamic from "next/dynamic";
import HeroSection from "@/components/Hero";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const HowItWorks = dynamic(() => import("@/components/HowItWorks"));
const Features = dynamic(() => import("@/components/Features"));
const UseCases = dynamic(() => import("@/components/UseCases"));
const DemoSection = dynamic(() => import("@/components/Demo"));

// import PricingSection from "@/components/Pricing";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      <Header />
      <main>
        <HeroSection />
        <HowItWorks />
        <Features />
        <UseCases />
        <DemoSection />
        {/* <PricingSection /> */}
      </main>
      <Footer />
    </div>
  );
}
