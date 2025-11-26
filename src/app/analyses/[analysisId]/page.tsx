"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeftCircle, AlertTriangle, Loader2 } from "lucide-react";
import ResultsView from "@/components/document-analysis/ResultsView"; // Re-use the existing ResultsView
import {
  AnalysisResultShape,
  RiskItem,
  DocumentInfo,
  Analysis as LegalAnalysis,
} from "@/lib/types";
import { LanguageProvider } from "@/contexts/LanguageContext";

const DetailedAnalysisPage = () => {
  const router = useRouter();
  const params = useParams();
  const analysisId = params.analysisId as string;

  const [analysisResult, setAnalysisResult] =
    useState<AnalysisResultShape | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!analysisId) return;

    const fetchAnalysis = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/analyses/${analysisId}`);
        const result = await response.json();

        if (result.success) {
          // The backend API returns the Analysis model, not the full AnalysisResultShape
          // We need to transform it to fit ResultsView's expected prop type
          const dbData = result.data;

          const transformedRisks: RiskItem[] = dbData.risks.map(
            (risk: RiskItem) => ({ ...risk })
          );

          const transformedAnalysis: LegalAnalysis = {
            summary: dbData.summary,
            risks: transformedRisks,
            verdict: dbData.verdict,
            disclaimer:
              "This analysis is based on a saved record and for informational purposes only and does not constitute legal advice.",
          };

          const documentInfo: DocumentInfo = {
            filename: dbData.documentName || "Untitled Document",
            word_count: 0, // Not stored in DB
            estimated_pages: 0, // Not stored in DB
            estimated_read_time: 0, // Not stored in DB
            processed_at: dbData.createdAt, // Use createdAt from DB
          };

          setAnalysisResult({
            type: "legal_analysis",
            document_info: documentInfo,
            analysis: transformedAnalysis,
            friendly_message: "Your document analysis is complete.",
            session_id: analysisId,
          });
        } else {
          setError(result.error || "Failed to fetch analysis details.");
        }
      } catch (err) {
        console.error("Error fetching detailed analysis:", err);
        setError("An unexpected error occurred while fetching analysis.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [analysisId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-lg text-gray-700 dark:text-gray-300 ml-4">
          Loading analysis...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-red-600 p-4">
        <AlertTriangle className="h-16 w-16 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error Loading Analysis</h2>
        <p className="text-center">{error}</p>
        <motion.button
          onClick={() => router.back()}
          className="mt-8 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Go back to dashboard"
        >
          <ArrowLeftCircle className="h-5 w-5" />
          Go Back
        </motion.button>
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-700 p-4">
        <AlertTriangle className="h-16 w-16 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Analysis Not Found</h2>
        <p className="text-center">
          The requested analysis could not be found or you do not have
          permission to view it.
        </p>
        <motion.button
          onClick={() => router.back()}
          className="mt-8 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Go back to dashboard"
        >
          <ArrowLeftCircle className="h-5 w-5" />
          Go Back
        </motion.button>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8"
      >
        <div className="max-w-7xl mx-auto py-6">
          <motion.button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-6 transition-colors"
            whileHover={{ x: -5 }}
            aria-label="Go back to previous page"
          >
            <ArrowLeftCircle className="h-5 w-5" />
            <span className="text-lg">Go Back to Dashboard</span>
          </motion.button>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 lg:p-10 border border-gray-200 dark:border-gray-700">
            <ResultsView analysisResult={analysisResult} />
          </div>
        </div>
      </motion.div>
    </LanguageProvider>
  );
};

export default DetailedAnalysisPage;
