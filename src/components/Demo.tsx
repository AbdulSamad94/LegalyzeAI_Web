"use client";

import type React from "react";
import { useState } from "react";
import {
  Upload,
  ArrowRight,
  Loader,
  AlertTriangle,
  CheckCircle,
  FileText,
  X,
  Download,
  RefreshCw,
  Sparkles,
  Shield,
  AlertCircle,
  Info,
  TrendingUp,
} from "lucide-react";

interface StatusUpdate {
  step: string;
  status: "processing" | "completed" | "failed";
  message: string;
}

interface RiskItem {
  description: string;
  level: string;
  category: string;
  recommendation: string;
}

interface StructuredData {
  summary: string;
  risks: RiskItem[];
  verdict: string;
  disclaimer: string;
  risk_count: number;
  confidence_score: number;
}

const DemoSection = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analysisSteps, setAnalysisSteps] = useState<StatusUpdate[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [finalMessage, setFinalMessage] = useState<string>("");
  const [structuredData, setStructuredData] = useState<StructuredData | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    if (
      ![
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ].includes(selectedFile.type)
    ) {
      setError("Invalid file type. Please upload a PDF, DOCX, or TXT file.");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File is too large. Please upload a file smaller than 10MB.");
      return;
    }
    setFile(selectedFile);
    setError(null);
    setAnalysisSteps([]);
    setFinalMessage("");
    setStructuredData(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const handleChooseFileClick = () => {
    document.getElementById("file-upload")?.click();
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    setAnalysisSteps([]);
    setFinalMessage("");
    setStructuredData(null);
  };

  const startAnalysis = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisSteps([]);
    setFinalMessage("");
    setStructuredData(null);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/demo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value, { stream: true });

        const lines = chunk
          .split("\n")
          .filter((line) => line.trim().startsWith("data:"));

        for (const line of lines) {
          const data = line.replace(/^data: /, "");
          if (data.startsWith("[DONE]")) {
            done = true;
            break;
          }
          try {
            const parsedData = JSON.parse(data);

            // Handle structured data (new format for better display)
            if (parsedData.structured_data) {
              setStructuredData(parsedData.structured_data);
            }
            // Handle simple final message (fallback)
            else if (parsedData.final_message) {
              setFinalMessage(parsedData.final_message);
            }
            // Handle step updates
            else if (parsedData.step) {
              setAnalysisSteps((prevSteps) => {
                const existingStepIndex = prevSteps.findIndex(
                  (s) => s.step === parsedData.step
                );

                if (existingStepIndex !== -1) {
                  const updatedSteps = [...prevSteps];
                  updatedSteps[existingStepIndex] = parsedData;
                  return updatedSteps;
                } else {
                  return [...prevSteps, parsedData];
                }
              });
            }
          } catch (e) {
            console.error("Failed to parse stream data chunk:", data, e);
          }
        }
      }
    } catch (err: unknown) {
      setError((err as Error).message || "An unexpected error occurred.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case "critical":
      case "high":
        return <AlertTriangle className="h-4 w-4" />;
      case "medium":
        return <AlertCircle className="h-4 w-4" />;
      case "low":
        return <Info className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const renderStatusIcon = (status: "processing" | "completed" | "failed") => {
    switch (status) {
      case "processing":
        return (
          <div className="relative">
            <div className="w-5 h-5 border-2 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        );
      case "completed":
        return (
          <div className="animate-scale-in">
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
        );
      case "failed":
        return (
          <div className="animate-scale-in">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
        );
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const resetDemo = () => {
    setFile(null);
    setAnalysisSteps([]);
    setFinalMessage("");
    setStructuredData(null);
    setError(null);
  };

  return (
    <>
      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-in {
          animation: slide-in 0.5s ease-out;
        }
        .animate-float {
          animation: float 2s ease-in-out infinite;
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-yellow-300" />
              <h2 className="text-4xl lg:text-5xl font-bold text-white">
                Try Legalyze AI
              </h2>
              <Sparkles className="h-8 w-8 text-yellow-300" />
            </div>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Experience the power of AI-driven legal document analysis. Upload
              any contract, NDA, or agreement and get instant insights.
            </p>
          </div>

          {/* Main Demo Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-fade-in">
            {!isAnalyzing &&
              analysisSteps.length === 0 &&
              !finalMessage &&
              !structuredData && (
                <div className="p-8">
                  {/* File Upload Area */}
                  <div
                    className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
                      isDragOver
                        ? "border-blue-500 bg-blue-50 scale-105"
                        : file
                        ? "border-green-400 bg-green-50"
                        : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                    }`}
                    onClick={!file ? handleChooseFileClick : undefined}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.docx,.txt"
                    />

                    {!file ? (
                      <div>
                        <div className="inline-flex p-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl mb-6 shadow-lg animate-float">
                          <Upload className="h-12 w-12 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                          {isDragOver
                            ? "Drop your document here"
                            : "Upload Your Legal Document"}
                        </h3>
                        <p className="text-gray-600 mb-8 text-lg">
                          Drag and drop or click to select • PDF, DOCX, TXT •
                          Max 10MB
                        </p>
                        <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 mx-auto hover:scale-105">
                          <Upload className="h-5 w-5" />
                          Choose File
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6 animate-fade-in">
                        {/* File Info Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 max-w-md mx-auto">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                              <FileText className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="flex-1 text-left">
                              <h4 className="font-semibold text-gray-900 truncate">
                                {file.name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile();
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <X className="h-5 w-5 text-gray-400" />
                            </button>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startAnalysis();
                            }}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 justify-center hover:scale-105"
                          >
                            <Sparkles className="h-5 w-5" />
                            Analyze Document
                            <ArrowRight className="h-5 w-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleChooseFileClick();
                            }}
                            className="border-2 border-gray-300 text-gray-700 px-6 py-4 rounded-2xl font-semibold hover:border-blue-500 hover:text-blue-600 transition-all duration-300 flex items-center gap-2 justify-center hover:scale-105"
                          >
                            <RefreshCw className="h-5 w-5" />
                            Choose Different File
                          </button>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
                        <div className="flex items-center gap-2 text-red-700">
                          <AlertTriangle className="h-5 w-5" />
                          <p className="font-medium">{error}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            {(isAnalyzing ||
              analysisSteps.length > 0 ||
              finalMessage ||
              structuredData) && (
              <div className="p-8 animate-fade-in">
                {/* Analysis Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        Document Analysis
                      </h3>
                      <p className="text-gray-600">{file?.name}</p>
                    </div>
                  </div>
                  {isAnalyzing && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <Loader className="h-5 w-5 animate-spin" />
                      <span className="font-medium">Processing...</span>
                    </div>
                  )}
                </div>

                {/* Progress Steps */}
                <div className="space-y-4 mb-8">
                  {analysisSteps.map((step, index) => (
                    <div
                      key={`${step.step}-${index}`}
                      className={`flex items-start gap-4 p-6 rounded-2xl border transition-all duration-300 animate-slide-in ${
                        step.status === "completed"
                          ? "bg-green-50 border-green-200"
                          : step.status === "failed"
                          ? "bg-red-50 border-red-200"
                          : "bg-blue-50 border-blue-200"
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="mt-1">
                        {renderStatusIcon(step.status)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {step.step}
                        </h4>
                        <p className="text-gray-600">{step.message}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Structured Results Display */}
                {structuredData && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 mb-8 animate-fade-in">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-green-100 rounded-xl">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <h4 className="text-2xl font-bold text-green-800">
                        Analysis Complete!
                      </h4>
                      <div className="ml-auto flex items-center gap-2 text-sm text-green-700">
                        <TrendingUp className="h-4 w-4" />
                        {Math.round(structuredData.confidence_score * 100)}%
                        Confidence
                      </div>
                    </div>

                    <div className="grid gap-6">
                      {/* Document Summary */}
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h5 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          Document Summary
                        </h5>
                        <p className="text-gray-700 leading-relaxed">
                          {structuredData.summary}
                        </p>
                      </div>

                      {/* Risk Assessment */}
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Shield className="h-5 w-5 text-orange-600" />
                          Risk Assessment
                          <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                            {structuredData.risk_count} risks found
                          </span>
                        </h5>

                        {structuredData.risks &&
                        structuredData.risks.length > 0 ? (
                          <div className="space-y-4">
                            {structuredData.risks.map((risk, index) => (
                              <div
                                key={index}
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                              >
                                <div className="flex items-start gap-3 mb-3">
                                  <div
                                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getRiskLevelColor(
                                      risk.level
                                    )}`}
                                  >
                                    {getRiskIcon(risk.level)}
                                    {risk.level.toUpperCase()}
                                  </div>
                                  {risk.category && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                      {risk.category}
                                    </span>
                                  )}
                                </div>
                                <h6 className="font-semibold text-gray-900 mb-2">
                                  {risk.description}
                                </h6>
                                {risk.recommendation && (
                                  <p className="text-gray-600 text-sm">
                                    <strong>Recommendation:</strong>{" "}
                                    {risk.recommendation}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Shield className="h-12 w-12 mx-auto mb-3 text-green-500" />
                            <p>
                              No significant risks detected in this document.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Overall Verdict */}
                      {structuredData.verdict && (
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                          <h5 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-purple-600" />
                            Overall Assessment
                          </h5>
                          <p className="text-gray-700 leading-relaxed">
                            {structuredData.verdict}
                          </p>
                        </div>
                      )}

                      {/* Disclaimer */}
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-blue-800 text-sm text-center">
                          <strong>Disclaimer:</strong>{" "}
                          {structuredData.disclaimer}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4 mt-6">
                      <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 flex items-center gap-2 hover:scale-105">
                        <Download className="h-4 w-4" />
                        Download Report
                      </button>
                      <button
                        onClick={resetDemo}
                        className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:border-blue-500 hover:text-blue-600 transition-all duration-300 flex items-center gap-2 hover:scale-105"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Analyze Another Document
                      </button>
                    </div>
                  </div>
                )}

                {/* Fallback Final Message Display */}
                {finalMessage && !structuredData && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 mb-8 animate-fade-in">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-100 rounded-xl">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <h4 className="text-2xl font-bold text-green-800">
                        Analysis Complete!
                      </h4>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {finalMessage}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4 mt-6">
                      <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 flex items-center gap-2 hover:scale-105">
                        <Download className="h-4 w-4" />
                        Download Report
                      </button>
                      <button
                        onClick={resetDemo}
                        className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:border-blue-500 hover:text-blue-600 transition-all duration-300 flex items-center gap-2 hover:scale-105"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Analyze Another Document
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 text-center animate-fade-in">
            <div className="flex flex-wrap items-center justify-center gap-8 text-blue-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>256-bit SSL encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>GDPR compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>No data stored permanently</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default DemoSection;
