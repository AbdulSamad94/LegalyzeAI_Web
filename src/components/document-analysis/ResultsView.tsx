"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle,
  Download,
  Share2,
  Eye,
  Shield,
  ChevronDown,
  Brain,
  TrendingUp,
  Zap,
  Target,
  Languages,
} from "lucide-react";
import { type RiskLevel, type AnalysisResultShape } from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";

interface ResultsViewProps {
  analysisResult: AnalysisResultShape;
}

interface TranslatedContent {
  verdict: string;
  summary: string;
  risks: Array<{
    description: string;
    recommendation: string;
    level: RiskLevel;
    category: string;
  }>;
}

const getRiskColor = (level: RiskLevel): string => {
  const colors: Record<RiskLevel, string> = {
    critical: "from-red-500 to-red-600",
    high: "from-orange-500 to-orange-600",
    medium: "from-yellow-500 to-yellow-600",
    low: "from-green-500 to-green-600",
    unknown: "from-gray-500 to-gray-600",
  };
  return colors[level] || colors.unknown;
};

const ResultsView: React.FC<ResultsViewProps> = ({ analysisResult }) => {
  const [activeTab, setActiveTab] = useState<"summary" | "risks">("summary");
  const [translatedContent, setTranslatedContent] =
    useState<TranslatedContent | null>(null);
  const [localIsTranslating, setLocalIsTranslating] = useState(false);
  const { language, translateText } = useLanguage();

  useEffect(() => {
    const translateContent = async () => {
      if (language === "en" || analysisResult.type !== "legal_analysis") {
        setTranslatedContent(null);
        return;
      }

      setLocalIsTranslating(true);

      try {
        const [translatedVerdict, translatedSummary] = await Promise.all([
          translateText(analysisResult.analysis.verdict),
          translateText(analysisResult.analysis.summary),
        ]);

        const translatedRisks = await Promise.all(
          analysisResult.analysis.risks.map(async (risk) => ({
            ...risk,
            description: await translateText(risk.description),
            recommendation: await translateText(risk.recommendation),
          }))
        );

        setTranslatedContent({
          verdict: translatedVerdict,
          summary: translatedSummary,
          risks: translatedRisks,
        });
      } catch (error) {
        console.error("Translation failed:", error);
        setTranslatedContent(null);
      } finally {
        setLocalIsTranslating(false);
      }
    };

    translateContent();
  }, [language, analysisResult, translateText]);

  if (analysisResult.type !== "legal_analysis") {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-12 text-center">
        <AlertTriangle className="h-16 w-16 sm:h-20 sm:w-20 text-red-500 mx-auto mb-6 sm:mb-8" />
        <h2 className="text-2xl sm:text-3xl font-bold text-red-700 mb-4">
          Analysis Error
        </h2>
        <p className="text-red-600 text-lg sm:text-xl">
          {analysisResult.friendly_message}
        </p>
      </div>
    );
  }

  const displayContent =
    translatedContent && language === "ur"
      ? translatedContent
      : analysisResult.analysis;
  const isTranslating = localIsTranslating;

  return (
    <motion.div
      key="results"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 sm:space-y-8"
    >
      {/* Translation Status Indicator */}
      {isTranslating && language === "ur" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3"
        >
          <Languages className="h-5 w-5 text-blue-600 animate-spin" />
          <span className="text-blue-700 font-medium">
            Translating content to Urdu...
          </span>
        </motion.div>
      )}

      {/* Results Header - UI stays in English */}
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 sm:p-4 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
            >
              <Download className="h-5 w-5 sm:h-6 sm:w-6" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 sm:p-4 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
            >
              <Share2 className="h-5 w-5 sm:h-6 sm:w-6" />
            </motion.button>
          </div>
        </div>

        {/* AI Verdict - ONLY the content text gets translated */}
        <div className="bg-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 backdrop-blur-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-white flex-shrink-0" />
            <h3 className="text-xl sm:text-2xl font-bold">AI Verdict</h3>
          </div>
          <div
            className={`${
              isTranslating && language === "ur" ? "opacity-50" : ""
            } transition-opacity duration-300`}
          >
            <p className="text-base sm:text-lg lg:text-xl leading-relaxed text-blue-50">
              {displayContent.verdict}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats - UI stays in English */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {[
          {
            icon: AlertTriangle,
            value: analysisResult.analysis.risks.length,
            label: "Risks Found",
            color: "from-red-500 to-red-600",
          },
          {
            icon: TrendingUp,
            value: "94%",
            label: "Confidence",
            color: "from-green-500 to-green-600",
          },
          {
            icon: Zap,
            value: "2.3s",
            label: "Analysis Time",
            color: "from-blue-500 to-blue-600",
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20 text-center"
          >
            <div
              className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${stat.color} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg`}
            >
              <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
              {stat.value}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 font-medium">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Detailed Results */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        {/* Mobile Tabs - UI stays in English */}
        <div className="sm:hidden">
          <div className="relative">
            <select
              value={activeTab}
              onChange={(e) =>
                setActiveTab(e.target.value as "summary" | "risks")
              }
              className="w-full appearance-none bg-white border-b border-gray-200 p-4 pr-10 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="summary">Summary</option>
              <option value="risks">
                Risk Analysis ({analysisResult.analysis.risks.length})
              </option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Desktop Tabs - UI stays in English */}
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
            <Eye className="h-5 w-5 sm:h-6 sm:w-6" />
            Summary
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
            <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
            Risk Analysis
            <span className="bg-red-100 text-red-700 text-sm font-bold rounded-full px-2 sm:px-3 py-1">
              {analysisResult.analysis.risks.length}
            </span>
          </motion.button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 lg:p-12">
          <AnimatePresence mode="wait">
            {activeTab === "summary" ? (
              <motion.div
                key="summary"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8"
              >
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
                  Document Summary
                </h3>
                <div
                  className={`${
                    isTranslating && language === "ur" ? "opacity-50" : ""
                  } transition-opacity duration-300`}
                >
                  <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                    {displayContent.summary}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="risks"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 sm:space-y-6 lg:space-y-8"
              >
                {displayContent.risks.map((risk, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 hover:shadow-lg transition-all ${
                      isTranslating && language === "ur" ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div
                          className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${getRiskColor(
                            risk.level
                          )} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}
                        >
                          <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">
                            {risk.category} Risk
                          </h4>
                          <span
                            className={`inline-block px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-r ${getRiskColor(
                              risk.level
                            )}`}
                          >
                            {risk.level.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* ONLY the content text gets translated */}
                    <p className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6 leading-relaxed">
                      {risk.description}
                    </p>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 sm:p-6 rounded-r-xl">
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <Target className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
                        <h5 className="font-bold text-blue-800 text-base sm:text-lg">
                          Recommendation
                        </h5>
                      </div>
                      {/* ONLY the content text gets translated */}
                      <p className="text-blue-700 text-base sm:text-lg leading-relaxed">
                        {risk.recommendation}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ResultsView;
