"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Languages } from "lucide-react";
import {
  type RiskLevel,
  type AnalysisResultShape,
  type ProgressState,
} from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  buildCombinedText,
  parseCombinedTranslated,
} from "@/lib/translationUtils";
import { TranslationStatusIndicator } from "./results/TranslationStatus";
import { ResultsHeader } from "./results/ResultsHeader";
import { StatsGrid } from "./results/StatsGrid";
import { ResultsTabs } from "./results/ResultsTabs";

interface ResultsViewProps {
  analysisResult: AnalysisResultShape;
}

interface TranslatedRisk {
  description: string;
  recommendation: string;
  level: RiskLevel;
  category: string;
}

interface TranslatedContent {
  verdict: string;
  summary: string;
  risks: TranslatedRisk[];
}

interface TranslationProgress {
  verdict: ProgressState;
  summary: ProgressState;
  risks: ProgressState[];
}

const ResultsView: React.FC<ResultsViewProps> = ({ analysisResult }) => {
  const [activeTab, setActiveTab] = useState<"summary" | "risks">("summary");
  const [translatedContent, setTranslatedContent] =
    useState<TranslatedContent | null>(null);
  const [translationProgress, setTranslationProgress] =
    useState<TranslationProgress>({
      verdict: "pending",
      summary: "pending",
      risks: [],
    });

  const { language, translateText } = useLanguage();

  useEffect(() => {
    let cancelled = false;

    const translateContent = async () => {
      if (language === "en" || analysisResult.type !== "legal_analysis") {
        setTranslatedContent(null);
        setTranslationProgress({
          verdict: "pending",
          summary: "pending",
          risks: [],
        });
        return;
      }

      const risksCount = analysisResult.analysis.risks.length;
      setTranslationProgress({
        verdict: "translating",
        summary: "translating",
        risks: Array.from({ length: risksCount }, () => "translating"),
      });

      try {
        // Build combined payload (single request)
        const combined = buildCombinedText(
          analysisResult.analysis.verdict,
          analysisResult.analysis.summary,
          analysisResult.analysis.risks.map((r) => ({
            description: r.description,
            recommendation: r.recommendation,
            level: r.level,
            category: r.category,
          }))
        );

        const translatedCombined = await translateText(combined);
        if (cancelled) return;

        // Try to parse translatedCombined back into parts
        const parsed = parseCombinedTranslated(translatedCombined);

        if (parsed) {
          // Map parsed -> TranslatedContent
          const translatedRisks: TranslatedRisk[] = parsed.risks.map((r) => ({
            description: r.description || "",
            recommendation: r.recommendation || "",
            level:
              (r.level.toLowerCase() as RiskLevel) ?? ("unknown" as RiskLevel),
            category: r.category || "",
          }));

          setTranslatedContent({
            verdict: parsed.verdict || analysisResult.analysis.verdict,
            summary: parsed.summary || analysisResult.analysis.summary,
            risks: translatedRisks.length
              ? translatedRisks
              : analysisResult.analysis.risks.map((r) => ({
                  description: r.description,
                  recommendation: r.recommendation,
                  level: r.level,
                  category: r.category,
                })),
          });

          setTranslationProgress({
            verdict: "completed",
            summary: "completed",
            risks: Array.from({ length: risksCount }, () => "completed"),
          });
          return;
        }

        // fallback: parsing failed -> degrade to per-part translate (old behavior) to keep UI working
        console.warn(
          "Parsing combined translation failed; falling back to per-part translation"
        );

        // per-part fallback (less ideal — kept as last resort)
        const translatedVerdict = await translateText(
          analysisResult.analysis.verdict
        );
        if (cancelled) return;
        const translatedSummary = await translateText(
          analysisResult.analysis.summary
        );
        if (cancelled) return;

        const translatedRisks: TranslatedRisk[] =
          analysisResult.analysis.risks.map((r) => ({
            description: r.description,
            recommendation: r.recommendation,
            level: r.level,
            category: r.category,
          }));

        for (let i = 0; i < analysisResult.analysis.risks.length; i++) {
          if (cancelled) return;
          const risk = analysisResult.analysis.risks[i];
          const [td, tr] = await Promise.all([
            translateText(risk.description),
            translateText(risk.recommendation),
          ]);
          translatedRisks[i] = {
            ...translatedRisks[i],
            description: td,
            recommendation: tr,
          };
        }

        setTranslatedContent({
          verdict: translatedVerdict,
          summary: translatedSummary,
          risks: translatedRisks,
        });
        setTranslationProgress({
          verdict: "completed",
          summary: "completed",
          risks: Array.from({ length: risksCount }, () => "completed"),
        });
      } catch (err) {
        console.error("Translation failed:", err);
        if (cancelled) return;
        setTranslationProgress((prev) => ({
          verdict: prev.verdict === "translating" ? "error" : prev.verdict,
          summary: prev.summary === "translating" ? "error" : prev.summary,
          risks: prev.risks.length
            ? prev.risks.map((s) => (s === "translating" ? "error" : s))
            : [],
        }));
      }
    };

    translateContent();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, analysisResult]); // translateText intentionally excluded to avoid re-creating combined payload on each render

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

  const risksProgressCount = translationProgress.risks.filter(
    (s) => s === "completed"
  ).length;
  const isTranslating =
    language === "ur" &&
    (translationProgress.verdict === "translating" ||
      translationProgress.summary === "translating" ||
      translationProgress.risks.some((s) => s === "translating"));

  const isVerdictTranslating = translationProgress.verdict !== "completed";

  return (
    <motion.div
      key="results"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 sm:space-y-8"
    >
      {language === "ur" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Languages className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800">
                Translation Progress
              </span>
            </div>
            <div className="text-sm text-blue-600">
              {isTranslating ? "Translating..." : "Translation Complete"}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <TranslationStatusIndicator
                status={translationProgress.verdict}
              />
              <span>AI Verdict</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TranslationStatusIndicator
                status={translationProgress.summary}
              />
              <span>Summary</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TranslationStatusIndicator
                status={
                  translationProgress.risks.length === 0
                    ? "pending"
                    : translationProgress.risks.every((s) => s === "completed")
                    ? "completed"
                    : translationProgress.risks.some((s) => s === "translating")
                    ? "translating"
                    : translationProgress.risks.some((s) => s === "error")
                    ? "error"
                    : "pending"
                }
              />
              <span>
                Risk Analysis ({risksProgressCount}/
                {translationProgress.risks.length ||
                  analysisResult.analysis.risks.length}
                )
              </span>
            </div>
          </div>
        </motion.div>
      )}

      <ResultsHeader
        analysisResult={analysisResult}
        displayContent={displayContent}
        isVerdictTranslating={isVerdictTranslating}
        language={language}
      />

      <StatsGrid analysisResult={analysisResult} />

      <ResultsTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        displayContent={displayContent}
        translationProgress={translationProgress}
        language={language}
        riskCount={analysisResult.analysis.risks.length}
      />
    </motion.div>
  );
};

export default ResultsView;
