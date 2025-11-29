"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeftCircle, AlertTriangle, Loader2 } from "lucide-react";
import ResultsView from "@/components/document-analysis/ResultsView";
import {
  AnalysisResultShape,
  RiskItem,
  DocumentInfo,
  Analysis as LegalAnalysis,
} from "@/lib/types";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PageWrapper } from "@/components/ui/PageWrapper";

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
            word_count: 0,
            estimated_pages: 0,
            estimated_read_time: 0,
            processed_at: dbData.createdAt,
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
      <PageWrapper className="flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-lg text-slate-700 ml-4 font-medium">
          Loading analysis...
        </p>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper className="flex flex-col items-center justify-center text-red-600 p-4">
        <AlertTriangle className="h-16 w-16 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error Loading Analysis</h2>
        <p className="text-center text-slate-600 mb-6">{error}</p>
        <motion.button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeftCircle className="h-5 w-5" />
          Go Back
        </motion.button>
      </PageWrapper>
    );
  }

  if (!analysisResult) {
    return (
      <PageWrapper className="flex flex-col items-center justify-center text-slate-700 p-4">
        <AlertTriangle className="h-16 w-16 mb-4 text-orange-500" />
        <h2 className="text-2xl font-bold mb-2 text-slate-900">
          Analysis Not Found
        </h2>
        <p className="text-center text-slate-600 mb-6">
          The requested analysis could not be found or you do not have permission
          to view it.
        </p>
        <motion.button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeftCircle className="h-5 w-5" />
          Go Back
        </motion.button>
      </PageWrapper>
    );
  }

  return (
    <LanguageProvider>
      <PageWrapper className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto py-6">
          <motion.button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors font-medium group"
            whileHover={{ x: -5 }}
          >
            <ArrowLeftCircle className="h-5 w-5 group-hover:text-blue-600 transition-colors" />
            <span className="text-lg">Back to Dashboard</span>
          </motion.button>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 p-6 sm:p-8 lg:p-10">
            <ResultsView analysisResult={analysisResult} />
          </div>
        </div>
      </PageWrapper>
    </LanguageProvider>
  );
};

export default DetailedAnalysisPage;
