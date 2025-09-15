"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Target } from "lucide-react";
import { type RiskLevel } from "@/lib/types";

interface RiskItemCardProps {
  risk: {
    description: string;
    level: RiskLevel;
    category: string;
    recommendation: string;
  };
  index: number;
  isTranslating: boolean;
  language: string;
}

const getRiskColor = (level: RiskLevel): string => {
  const colors: Record<RiskLevel, string> = {
    critical: "from-red-500 to-red-600",
    high: "from-orange-500 to-orange-600",
    medium: "from-yellow-500 to-yellow-600",
    low: "from-green-500 to-green-600",
    unknown: "from-gray-500 to-gray-600",
  };
  return colors[level] ?? colors.unknown;
};

export const RiskItemCard: React.FC<RiskItemCardProps> = ({
  risk,
  index,
  isTranslating,
  language,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06 }}
    className="bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 hover:shadow-lg transition-all"
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
    <div
      className={`${
        language === "ur" && isTranslating ? "opacity-50" : ""
      } transition-opacity duration-300`}
    >
      <div className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6 leading-relaxed whitespace-pre-line">
        {risk.description}
      </div>
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 sm:p-6 rounded-r-xl">
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <Target className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
          <h5 className="font-bold text-blue-800 text-base sm:text-lg">
            Recommendation
          </h5>
        </div>
        <div className="text-blue-700 text-base sm:text-lg leading-relaxed whitespace-pre-line">
          {risk.recommendation}
        </div>
      </div>
    </div>
  </motion.div>
);
