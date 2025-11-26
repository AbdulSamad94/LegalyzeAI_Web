import dynamic from "next/dynamic";
import HeroSection from "@/components/Hero";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const HowItWorks = dynamic(() => import("@/components/HowItWorks"));
const Features = dynamic(() => import("@/components/Features"));
const UseCases = dynamic(() => import("@/components/UseCases"));
const DemoSection = dynamic(() => import("@/components/Demo"));

// import PricingSection from "@/components/Pricing";

export default async function Home() {
  const session = await getServerSession(authOptions);
  console.log(session?.user?.id);
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
