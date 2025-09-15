"use client";

import { motion } from "framer-motion";
import { RiskItemCard } from "./RiskItemCard";
import { TranslatedContent, ProgressState } from "@/lib/types";

interface RisksTabProps {
  displayContent: TranslatedContent;
  translationProgress: { risks: ProgressState[] };
  language: string;
}

export const RisksTab: React.FC<RisksTabProps> = ({
  displayContent,
  translationProgress,
  language,
}) => (
  <motion.div
    key="risks"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-4 sm:space-y-6 lg:space-y-8"
  >
    {displayContent.risks.map((risk, index) => (
      <RiskItemCard
        key={index}
        risk={risk}
        index={index}
        isTranslating={translationProgress.risks[index] !== "completed"}
        language={language}
      />
    ))}
  </motion.div>
);
