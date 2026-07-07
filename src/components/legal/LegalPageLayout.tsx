"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, type LucideIcon } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { PageWrapper } from "@/components/ui/PageWrapper";

export interface LegalSection {
  id: string;
  title: string;
  icon: LucideIcon;
  content: React.ReactNode;
}

interface LegalPageLayoutProps {
  eyebrow: string;
  title: string;
  description: string;
  heroIcon: LucideIcon;
  lastUpdated: string;
  sections: LegalSection[];
}

export function LegalPageLayout({
  eyebrow,
  title,
  description,
  heroIcon: HeroIcon,
  lastUpdated,
  sections,
}: LegalPageLayoutProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 }
    );

    sections.forEach((section) => {
      const el = sectionRefs.current[section.id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (id: string) => {
    const el = sectionRefs.current[id];
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <PageWrapper>
      <Header />

      <main className="pt-24 pb-16">
        {/* Hero */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                <HeroIcon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <span className="uppercase tracking-wide text-xs sm:text-sm font-semibold text-blue-100">
                {eyebrow}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
              {title}
            </h1>
            <p className="text-blue-100 text-base sm:text-lg max-w-2xl leading-relaxed">
              {description}
            </p>
            <p className="text-blue-200 text-sm mt-6">
              Last updated: {lastUpdated}
            </p>
          </motion.div>
        </div>

        {/* Mobile TOC */}
        <div className="lg:hidden max-w-5xl mx-auto px-4 sm:px-6 mt-6">
          <nav
            aria-label="Table of contents"
            className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1"
          >
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => scrollToSection(section.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
                  activeId === section.id
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {section.title}
              </button>
            ))}
          </nav>
        </div>

        {/* Content + Desktop TOC */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 lg:mt-10 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
          {/* Sticky sidebar */}
          <aside className="hidden lg:block">
            <nav
              aria-label="Table of contents"
              className="sticky top-24 space-y-1"
            >
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  aria-current={activeId === section.id ? "true" : undefined}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeId === section.id
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </aside>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.section
                  key={section.id}
                  id={section.id}
                  ref={(el) => {
                    sectionRefs.current[section.id] = el;
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.15) }}
                  className="scroll-mt-24 bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 sm:p-8"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      {section.title}
                    </h2>
                  </div>
                  <div className="prose-legal text-slate-700 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_p]:leading-relaxed [&_p+ul]:mt-3">
                    {section.content}
                  </div>
                </motion.section>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </PageWrapper>
  );
}
