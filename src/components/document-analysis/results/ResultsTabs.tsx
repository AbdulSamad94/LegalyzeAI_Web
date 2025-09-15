"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Eye, Shield, ChevronDown } from "lucide-react";
import { SummaryTab } from "./SummaryTab";
import { RisksTab } from "./RisksTab";
import { TranslatedContent, ProgressState } from "@/lib/types";

interface ResultsTabsProps {
  activeTab: "summary" | "risks";
  setActiveTab: (tab: "summary" | "risks") => void;
  displayContent: TranslatedContent;
  translationProgress: { summary: ProgressState; risks: ProgressState[] };
  language: string;
  riskCount: number;
}

export const ResultsTabs: React.FC<ResultsTabsProps> = ({
  activeTab,
  setActiveTab,
  displayContent,
  translationProgress,
  language,
  riskCount,
}) => (
  <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
    {/* Mobile Tabs */}
    <div className="sm:hidden">
      <div className="relative">
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value as "summary" | "risks")}
          className="w-full appearance-none bg-white border-b border-gray-200 p-4 pr-10 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="summary">Summary</option>
          <option value="risks">Risk Analysis ({riskCount})</option>
        </select>
        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
      </div>
    </div>

    {/* Desktop Tabs */}
    <div className="hidden sm:flex border-b border-gray-200">
      <motion.button
        whileHover={{ scale: 1.01 }}
        onClick={() => setActiveTab("summary")}
        className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 sm:py-6 font-bold text-lg sm:text-xl transition-all ${
          activeTab === "summary"
            ? "bg-blue-50 text-blue-600 border-b-2 sm:border-b-3 border-blue-600"
            : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
        }`}
      >
        <Eye className="h-5 w-5 sm:h-6 sm:w-6" /> Summary
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.01 }}
        onClick={() => setActiveTab("risks")}
        className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 sm:py-6 font-bold text-lg sm:text-xl transition-all ${
          activeTab === "risks"
            ? "bg-blue-50 text-blue-600 border-b-2 sm:border-b-3 border-blue-600"
            : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
        }`}
      >
        <Shield className="h-5 w-5 sm:h-6 sm:w-6" /> Risk Analysis
        <span className="bg-red-100 text-red-700 text-sm font-bold rounded-full px-2 sm:px-3 py-1">
          {riskCount}
        </span>
      </motion.button>
    </div>

    <div className="p-4 sm:p-6 lg:p-12">
      <AnimatePresence mode="wait">
        {activeTab === "summary" ? (
          <SummaryTab
            summary={displayContent.summary}
            isTranslating={translationProgress.summary !== "completed"}
            language={language}
          />
        ) : (
          <RisksTab
            displayContent={displayContent}
            translationProgress={translationProgress}
            language={language}
          />
        )}
      </AnimatePresence>
    </div>
  </div>
);
