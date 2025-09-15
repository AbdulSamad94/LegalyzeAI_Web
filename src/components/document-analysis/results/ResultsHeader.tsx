"use client";

import { motion } from "framer-motion";
import { CheckCircle, Download, Share2, Brain } from "lucide-react";
import { type LegalAnalysisResult } from "@/lib/types";

interface ResultsHeaderProps {
  analysisResult: LegalAnalysisResult;
  displayContent: { verdict: string };
  isVerdictTranslating: boolean;
  language: string;
}

export const ResultsHeader: React.FC<ResultsHeaderProps> = ({
  analysisResult,
  displayContent,
  isVerdictTranslating,
  language,
}) => (
  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-white shadow-2xl">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
          <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
        </div>
        <div className="min-w-0">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">
            Analysis Complete!
          </h2>
          <p className="text-blue-100 text-sm sm:text-base lg:text-xl truncate">
            {analysisResult.document_info.filename}
          </p>
        </div>
      </div>
      <div className="flex gap-2 sm:gap-3 flex-shrink-0">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-3 sm:p-4 bg-white/20 rounded-xl hover:bg-white/30 transition-colors">
          <Download className="h-5 w-5 sm:h-6 sm:w-6" />
        </motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-3 sm:p-4 bg-white/20 rounded-xl hover:bg-white/30 transition-colors">
          <Share2 className="h-5 w-5 sm:h-6 sm:w-6" />
        </motion.button>
      </div>
    </div>
    <div className="bg-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-white flex-shrink-0" />
          <h3 className="text-xl sm:text-2xl font-bold">AI Verdict</h3>
        </div>
      </div>
      <div className={`${language === "ur" && isVerdictTranslating ? "opacity-50" : ""} transition-opacity duration-300`}>
        <div className="text-base sm:text-lg lg:text-xl leading-relaxed text-blue-50 whitespace-pre-line">
          {displayContent.verdict}
        </div>
      </div>
    </div>
  </div>
);