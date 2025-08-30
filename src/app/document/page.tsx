"use client";
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle,
  X,
  Shield,
  BarChart3,
  FileCheck,
  Loader2,
  AlertCircle,
  Scale,
} from "lucide-react";
import {
  ProcessingUpdate,
  RiskLevel,
  AnalysisResultShape,
  parseStreamData, // Our new smart parser!
} from "@/lib/types"; // Make sure path is correct

const LegalAnalysisComponent: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processingUpdates, setProcessingUpdates] = useState<
    ProcessingUpdate[]
  >([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<AnalysisResultShape | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "risks">("summary");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFile(null);
    setProcessingUpdates([]);
    setAnalysisResult(null);
    setError(null);
    setActiveTab("summary");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = (selectedFile: File | null) => {
    resetState();
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
  };

  const startAnalysis = async () => {
    if (!file) return;

    // Reset parts of state for new analysis
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
        buffer = parts.pop() || ""; // Keep the last, possibly incomplete, part

        for (const part of parts) {
          if (!part.startsWith("data:")) continue;

          const jsonStr = part.substring(5).trim(); // More robust than replace
          if (jsonStr === "[DONE]") {
            setIsAnalyzing(false);
            return;
          }

          try {
            const rawData: unknown = JSON.parse(jsonStr);

            // Our new parser will check if this is the final result (even if wrapped in an error)
            const finalResult = parseStreamData(rawData);
            if (finalResult) {
              setAnalysisResult(finalResult);
              // Clear processing updates once we have the final result
              setProcessingUpdates([]);
              continue; // Move to next part
            }

            // If it's not a final result, it must be a processing update
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
            console.warn(
              "Failed to parse SSE JSON chunk:",
              e,
              "Raw chunk:",
              `"${jsonStr}"`
            );
          }
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (level: RiskLevel): string => {
    const colors: Record<RiskLevel, string> = {
      critical: "bg-red-100 border-red-300 text-red-800",
      high: "bg-orange-100 border-orange-300 text-orange-800",
      medium: "bg-yellow-100 border-yellow-300 text-yellow-800",
      low: "bg-green-100 border-green-300 text-green-800",
      unknown: "bg-gray-100 border-gray-300 text-gray-800",
    };
    return colors[level] || colors.unknown;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
            Legal AI Analyzer
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Upload your document to get instant AI-powered insights and risk
            analysis.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Left Column: Upload & Status */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-700">
                <Upload className="h-5 w-5 text-blue-600" />
                Upload Your Document
              </h2>
              {!file ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                    isDragOver
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-blue-400"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    handleFileSelect(e.dataTransfer.files[0]);
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) =>
                      handleFileSelect(e.target.files?.[0] || null)
                    }
                    accept=".pdf,.docx,.txt"
                  />
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileCheck className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="font-semibold text-gray-800">
                      Drag & drop or click to upload
                    </p>
                    <p className="text-sm text-gray-500">
                      PDF, DOCX, or TXT (Max 10MB)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <div className="truncate">
                        <p className="font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={resetState}
                      className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                  <button
                    onClick={startAnalysis}
                    disabled={isAnalyzing}
                    className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />{" "}
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="h-5 w-5" /> Analyze Document
                      </>
                    )}
                  </button>
                </div>
              )}
              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                  <AlertCircle className="h-5 w-5" /> {error}
                </div>
              )}
            </div>

            {/* Processing Status */}
            <AnimatePresence>
              {isAnalyzing && processingUpdates.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-xl shadow-md border border-gray-200 p-6"
                >
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">
                    Analysis Progress
                  </h3>
                  <ul className="space-y-3">
                    {processingUpdates.map((update) => (
                      <li
                        key={update.step}
                        className="flex items-center gap-3 text-sm"
                      >
                        {update.status === "completed" ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                        )}
                        <span className="font-medium text-gray-800">
                          {update.step}
                        </span>
                        <span className="text-gray-500 ml-auto">
                          {update.progress}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {analysisResult ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-xl shadow-xl border border-gray-200"
                >
                  {analysisResult.type === "legal_analysis" ? (
                    <>
                      <header className="p-6 border-b border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800">
                          Analysis Report
                        </h2>
                        <p className="text-gray-600">
                          for {analysisResult.document_info.filename}
                        </p>
                      </header>
                      <div className="p-6">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
                          <h3 className="font-semibold text-blue-800">
                            Key Verdict
                          </h3>
                          <p className="text-blue-700">
                            {analysisResult.analysis.verdict}
                          </p>
                        </div>
                        <div className="flex border-b border-gray-200 mb-6">
                          <button
                            onClick={() => setActiveTab("summary")}
                            className={`px-4 py-2 font-medium transition-colors ${
                              activeTab === "summary"
                                ? "border-b-2 border-blue-600 text-blue-600"
                                : "text-gray-500 hover:text-gray-800"
                            }`}
                          >
                            Summary
                          </button>
                          <button
                            onClick={() => setActiveTab("risks")}
                            className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
                              activeTab === "risks"
                                ? "border-b-2 border-blue-600 text-blue-600"
                                : "text-gray-500 hover:text-gray-800"
                            }`}
                          >
                            <Shield className="h-4 w-4" /> Risks{" "}
                            <span className="bg-blue-100 text-blue-700 text-xs font-bold rounded-full px-2 py-0.5">
                              {analysisResult.analysis.risks.length}
                            </span>
                          </button>
                        </div>
                        {activeTab === "summary" ? (
                          <div className="prose prose-sm max-w-none text-gray-700">
                            <p>{analysisResult.analysis.summary}</p>
                          </div>
                        ) : (
                          <ul className="space-y-4">
                            {analysisResult.analysis.risks.map(
                              (risk, index) => (
                                <li
                                  key={index}
                                  className={`border p-4 rounded-lg ${getRiskColor(
                                    risk.level
                                  )}`}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold">
                                      {risk.category} Risk
                                    </h4>
                                    <span className="text-xs font-semibold uppercase px-2 py-1 rounded-full">
                                      {risk.level}
                                    </span>
                                  </div>
                                  <p className="mb-3">{risk.description}</p>
                                  <div className="bg-white/60 p-3 rounded">
                                    <p className="font-semibold text-sm">
                                      Recommendation:
                                    </p>
                                    <p className="text-sm">
                                      {risk.recommendation}
                                    </p>
                                  </div>
                                </li>
                              )
                            )}
                          </ul>
                        )}
                      </div>
                      <footer className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl text-xs text-gray-600">
                        <strong>Disclaimer:</strong>{" "}
                        {analysisResult.analysis.disclaimer}
                      </footer>
                    </>
                  ) : (
                    <div className="p-8 flex flex-col items-center justify-center text-center">
                      <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                      <h2 className="text-xl font-bold text-red-700">
                        Analysis Error
                      </h2>
                      <p className="text-red-600 mt-2 max-w-md">
                        {analysisResult.friendly_message}
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center flex flex-col items-center justify-center h-full"
                >
                  <Scale className="h-12 w-12 text-gray-300 mb-4" />
                  <h2 className="text-xl font-semibold text-gray-700">
                    Your analysis results will appear here
                  </h2>
                  <p className="text-gray-500 mt-2">
                    Upload a document and click &quot;Analyze&quot; to begin.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalAnalysisComponent;
