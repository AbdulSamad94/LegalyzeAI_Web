import dynamic from "next/dynamic";
import HeroSection from "@/components/home/Hero";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const HowItWorks = dynamic(() => import("@/components/home/HowItWorks"));
const Features = dynamic(() => import("@/components/home/Features"));
const UseCases = dynamic(() => import("@/components/home/UseCases"));
const DemoSection = dynamic(() => import("@/components/home/Demo"));

// import PricingSection from "@/components/Pricing";

export default async function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
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
