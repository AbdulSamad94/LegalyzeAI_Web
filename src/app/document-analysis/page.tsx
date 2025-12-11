"use client";

import type React from "react";
import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { AnimatePresence } from "framer-motion";
import {
  type ProcessingUpdate,
  type AnalysisResultShape,
  parseStreamData,
} from "@/lib/types";
import DesktopSidebar from "@/components/document-analysis/DesktopSidebar";
import UploadView from "@/components/document-analysis/UploadView";
import ProcessingView from "@/components/document-analysis/ProcessingView";
import MobileBottomNav from "@/components/document-analysis/MobileBottomNav";
import AuthRequired from "@/components/auth-gate";
import DesktopHeader from "@/components/document-analysis/DesktopHeader";
import { LanguageProvider } from "@/contexts/LanguageContext";
import dynamic from "next/dynamic";
import { PageWrapper } from "@/components/ui/PageWrapper";

const ResultsView = dynamic(
  () => import("@/components/document-analysis/ResultsView"),
  {
    loading: () => (
      <ProcessingView
        processingUpdates={[
          {
            step: "Loading Results",
            status: "processing",
            message: "wait/sabar",
            progress: 20,
            timestamp: "20",
          },
        ]}
      />
    ),
  }
);

type ViewState = "upload" | "processing" | "results";

const LegalAnalysisComponent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [processingUpdates, setProcessingUpdates] = useState<
    ProcessingUpdate[]
  >([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<AnalysisResultShape | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();

  const resetState = () => {
    setFile(null);
    setProcessingUpdates([]);
    setAnalysisResult(null);
    setError(null);
    console.log(isAnalyzing);
    setCurrentView("upload");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please upload a PDF, DOCX, or TXT file.");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB.");
      return;
    }
    setFile(selectedFile);
    setError(null);
  };

  const startAnalysis = async () => {
    if (!file) return;

    setCurrentView("processing");
    setIsAnalyzing(true);
    setProcessingUpdates([]);
    setAnalysisResult(null);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok || !response.body) {
        throw new Error(
          `Server error: ${response.statusText || response.status}`
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          if (!part.startsWith("data:")) continue;

          const jsonStr = part.substring(5).trim();
          if (jsonStr === "[DONE]") {
            setIsAnalyzing(false);
            setCurrentView("results");
            return;
          }

          try {
            const rawData: unknown = JSON.parse(jsonStr);

            const finalResult = parseStreamData(rawData);
            if (finalResult) {
              setAnalysisResult(finalResult);
              setProcessingUpdates([]);
              setCurrentView("results");
              continue;
            }

            if (typeof (rawData as ProcessingUpdate)?.step === "string") {
              const update = rawData as ProcessingUpdate;
              setProcessingUpdates((prev) => {
                const existingIndex = prev.findIndex(
                  (p) => p.step === update.step
                );
                if (existingIndex > -1) {
                  const newUpdates = [...prev];
                  newUpdates[existingIndex] = update;
                  return newUpdates;
                }
                return [...prev, update];
              });
            }
          } catch (e) {
            console.warn("Failed to parse SSE JSON chunk:", e);
          }
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
      setCurrentView("upload");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${
      sizes[i]
    }`;
  };
  if (!session) {
    return <AuthRequired />;
  }

  return (
    <LanguageProvider>
      <PageWrapper className="flex flex-col">
        <DesktopHeader />

        <div className="flex flex-1 mt-16">
          <DesktopSidebar
            currentView={currentView}
            file={file}
            formatFileSize={formatFileSize}
            analysisResult={analysisResult}
            resetState={resetState}
          />

          <div className="flex-1 overflow-auto">
            <div className="p-4 sm:p-6 lg:p-12 max-w-6xl mx-auto">
              <AnimatePresence mode="wait">
                {currentView === "upload" && (
                  <UploadView
                    file={file}
                    error={error}
                    fileInputRef={
                      fileInputRef as React.RefObject<HTMLInputElement>
                    }
                    handleFileSelect={handleFileSelect}
                    startAnalysis={startAnalysis}
                    setFile={setFile}
                    setError={setError}
                  />
                )}

                {currentView === "processing" && (
                  <ProcessingView processingUpdates={processingUpdates} />
                )}

                {currentView === "results" && analysisResult && (
                  <ResultsView analysisResult={analysisResult} />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <MobileBottomNav currentView={currentView} />
      </PageWrapper>
    </LanguageProvider>
  );
};

export default LegalAnalysisComponent;
