"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Download, Share2, Check, Brain } from "lucide-react";
import { type LegalAnalysisResult } from "@/lib/types";

interface ResultsHeaderProps {
  analysisResult: LegalAnalysisResult;
  displayContent: { verdict: string };
  isVerdictTranslating: boolean;
  language: string;
}

function buildReportText(analysisResult: LegalAnalysisResult, verdict: string): string {
  const { document_info, analysis } = analysisResult;

  const lines = [
    "LEGALYZE AI - DOCUMENT ANALYSIS REPORT",
    "=".repeat(50),
    "",
    `Document: ${document_info.filename}`,
    `Processed: ${new Date(document_info.processed_at).toLocaleString()}`,
    `Word count: ${document_info.word_count} | Estimated pages: ${document_info.estimated_pages} | Read time: ${document_info.estimated_read_time} min`,
    "",
    "AI VERDICT",
    "-".repeat(50),
    verdict,
    "",
    "SUMMARY",
    "-".repeat(50),
    analysis.summary,
    "",
    "RISKS IDENTIFIED",
    "-".repeat(50),
  ];

  if (analysis.risks.length === 0) {
    lines.push("No risks identified.");
  } else {
    analysis.risks.forEach((risk, i) => {
      lines.push(
        `${i + 1}. [${risk.level.toUpperCase()}] ${risk.category}`,
        `   Clause: ${risk.clause_reference || "N/A"}`,
        `   Issue: ${risk.description}`,
        `   Recommendation: ${risk.recommendation}`,
        ""
      );
    });
  }

  lines.push("", "DISCLAIMER", "-".repeat(50), analysis.disclaimer);

  return lines.join("\n");
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const ResultsHeader: React.FC<ResultsHeaderProps> = ({
  analysisResult,
  displayContent,
  isVerdictTranslating,
  language,
}) => {
  const [downloaded, setDownloaded] = useState(false);
  const [shared, setShared] = useState(false);

  const handleDownload = () => {
    const reportText = buildReportText(analysisResult, displayContent.verdict);
    const baseName = analysisResult.document_info.filename.replace(/\.[^/.]+$/, "");
    downloadTextFile(`${baseName}-analysis-report.txt`, reportText);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const handleShare = async () => {
    const reportText = buildReportText(analysisResult, displayContent.verdict);
    const shareData = {
      title: "Legalyze AI - Document Analysis",
      text: `Legalyze AI analysis for "${analysisResult.document_info.filename}":\n\n${displayContent.verdict}`,
    };

    try {
      if (typeof navigator.share === "function") {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(reportText);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch (error) {
      // AbortError fires when the user cancels the native share sheet - not a failure.
      if (error instanceof Error && error.name !== "AbortError") {
        try {
          await navigator.clipboard.writeText(reportText);
          setShared(true);
          setTimeout(() => setShared(false), 2000);
        } catch {
          // Clipboard access unavailable - nothing more we can do silently.
        }
      }
    }
  };

  return (
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
            type="button"
            onClick={handleDownload}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Download analysis report"
            title="Download report as a text file"
            className="p-3 sm:p-4 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
          >
            {downloaded ? (
              <Check className="h-5 w-5 sm:h-6 sm:w-6" />
            ) : (
              <Download className="h-5 w-5 sm:h-6 sm:w-6" />
            )}
          </motion.button>
          <motion.button
            type="button"
            onClick={handleShare}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Share analysis results"
            title="Share results (copies to clipboard if native sharing isn't available)"
            className="p-3 sm:p-4 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
          >
            {shared ? (
              <Check className="h-5 w-5 sm:h-6 sm:w-6" />
            ) : (
              <Share2 className="h-5 w-5 sm:h-6 sm:w-6" />
            )}
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
};
