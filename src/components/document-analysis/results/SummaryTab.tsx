"use client";

import { motion } from "framer-motion";

interface SummaryTabProps {
  summary: string;
  isTranslating: boolean;
  language: string;
}

export const SummaryTab: React.FC<SummaryTabProps> = ({
  summary,
  isTranslating,
  language,
}) => (
  <motion.div
    key="summary"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8"
  >
    <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
      <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
        Document Summary
      </h3>
    </div>
    <div
      className={`${
        language === "ur" && isTranslating ? "opacity-50" : ""
      } transition-opacity duration-300`}
    >
      <div className="text-base sm:text-lg text-gray-700 leading-relaxed whitespace-pre-line">
        {summary}
      </div>
    </div>
  </motion.div>
);
