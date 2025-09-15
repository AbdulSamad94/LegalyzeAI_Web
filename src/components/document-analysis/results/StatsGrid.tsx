"use client";

import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, Zap } from "lucide-react";
import { type LegalAnalysisResult } from "@/lib/types";

interface StatsGridProps {
  analysisResult: LegalAnalysisResult;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ analysisResult }) => {
  const stats = [
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
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
      {stats.map((stat, index) => (
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
  );
};
