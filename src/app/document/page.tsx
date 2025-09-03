"use client";

import type React from "react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle,
  X,
  Shield,
  FileCheck,
  Loader2,
  AlertCircle,
  Sparkles,
  Download,
  Share2,
  Eye,
  TrendingUp,
  Brain,
  ArrowRight,
  Zap,
  Target,
  Home,
  ChevronDown,
  BarChart3,
} from "lucide-react";
import {
  type ProcessingUpdate,
  type RiskLevel,
  type AnalysisResultShape,
  parseStreamData,
} from "@/lib/types";

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
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "risks">("summary");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFile(null);
    setProcessingUpdates([]);
    setAnalysisResult(null);
    setError(null);
    setActiveTab("summary");
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
              console.log(isAnalyzing);
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

  const getRiskColor = (level: RiskLevel): string => {
    const colors: Record<RiskLevel, string> = {
      critical: "from-red-500 to-red-600",
      high: "from-orange-500 to-orange-600",
      medium: "from-yellow-500 to-yellow-600",
      low: "from-green-500 to-green-600",
      unknown: "from-gray-500 to-gray-600",
    };
    return colors[level] || colors.unknown;
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

  const navigationItems = [
    {
      id: "upload",
      label: "Upload",
      icon: Upload,
      active: currentView === "upload",
    },
    {
      id: "processing",
      label: "Analysis",
      icon: Brain,
      active: currentView === "processing",
    },
    {
      id: "results",
      label: "Results",
      icon: BarChart3,
      active: currentView === "results",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col mt-16">
      {/* Mobile Header */}

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-80 bg-white/80 backdrop-blur-md border-r border-gray-200 flex-col">
          {/* Sidebar Header */}
          <div className="p-8 border-b border-gray-200">
            {/* Progress Indicator */}
            <div className="space-y-3">
              {navigationItems.map((item, index) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      item.active
                        ? "bg-blue-600 text-white"
                        : index < navigationItems.findIndex((nav) => nav.active)
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span
                    className={`font-medium ${
                      item.active
                        ? "text-blue-600"
                        : index < navigationItems.findIndex((nav) => nav.active)
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* File Info */}
          {file && (
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-3">
                Current Document
              </h3>
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-800 truncate">
                    {file.name}
                  </span>
                </div>
                <p className="text-sm text-blue-600">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="p-6 mt-auto">
            {analysisResult && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={resetState}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Home className="h-5 w-5" />
                New Analysis
              </motion.button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-12 max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              {currentView === "upload" && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6 sm:space-y-8"
                >
                  {/* Header */}
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{
                        duration: 20,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                      className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl"
                    >
                      <Brain className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                    </motion.div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 sm:mb-4">
                      AI Legal Analysis
                    </h2>
                    <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
                      Upload your legal document to get instant AI-powered
                      insights and risk analysis
                    </p>
                  </div>

                  {/* Upload Area */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 p-6 sm:p-8 lg:p-12">
                    {!file ? (
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        className={`border-2 border-dashed rounded-xl sm:rounded-2xl p-8 sm:p-12 lg:p-16 text-center transition-all cursor-pointer ${
                          isDragOver
                            ? "border-blue-500 bg-blue-50 scale-105"
                            : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
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
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                          }}
                          className="mb-4 sm:mb-6"
                        >
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                            <Upload className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                          </div>
                        </motion.div>
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                          {isDragOver ? "Drop it here!" : "Upload Document"}
                        </h3>
                        <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-4 sm:mb-6">
                          Drag & drop or tap to browse
                        </p>
                        <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-xs mx-auto">
                          {[
                            { type: "PDF", color: "from-red-500 to-red-600" },
                            {
                              type: "DOCX",
                              color: "from-blue-500 to-blue-600",
                            },
                            {
                              type: "TXT",
                              color: "from-green-500 to-green-600",
                            },
                          ].map((format) => (
                            <div key={format.type} className="text-center">
                              <div
                                className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${format.color} rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-1 sm:mb-2`}
                              >
                                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                              </div>
                              <span className="text-xs sm:text-sm text-gray-600 font-medium">
                                {format.type}
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-4 sm:space-y-6"
                      >
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                          <FileCheck className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2">
                            Document Ready
                          </h3>
                          <div className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-6 max-w-md mx-auto">
                            <p className="font-bold text-gray-900 mb-1 truncate">
                              {file.name}
                            </p>
                            <p className="text-green-600 font-medium">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={startAnalysis}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                          >
                            <Sparkles className="h-5 w-5" />
                            Analyze Document
                            <ArrowRight className="h-5 w-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            onClick={() => setFile(null)}
                            className="border-2 border-gray-300 text-gray-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold hover:border-red-500 hover:text-red-600 transition-all flex items-center justify-center gap-2"
                          >
                            <X className="h-5 w-5" />
                            Remove
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 sm:mt-6 p-4 sm:p-6 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl flex items-start gap-3"
                      >
                        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <p className="font-medium">{error}</p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

              {currentView === "processing" && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6 sm:space-y-8"
                >
                  {/* Processing Header */}
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                      className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl"
                    >
                      <Brain className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                    </motion.div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 sm:mb-4">
                      AI Processing
                    </h2>
                    <p className="text-base sm:text-lg lg:text-xl text-gray-600 px-4">
                      Analyzing your document with advanced algorithms
                    </p>
                  </div>

                  {/* Processing Steps */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 p-6 sm:p-8 lg:p-12">
                    <div className="space-y-4 sm:space-y-6">
                      {processingUpdates.map((update, index) => (
                        <motion.div
                          key={update.step}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-gray-50 rounded-xl sm:rounded-2xl"
                        >
                          <div className="flex-shrink-0">
                            {update.status === "completed" ? (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 30,
                                }}
                                className="w-12 h-12 sm:w-14 sm:h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                              >
                                <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                              </motion.div>
                            ) : (
                              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 text-white animate-spin" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 truncate">
                              {update.step}
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600">
                              {update.message || "Processing..."}
                            </p>
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-blue-600">
                            {update.progress}%
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {currentView === "results" && analysisResult && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6 sm:space-y-8"
                >
                  {analysisResult.type === "legal_analysis" ? (
                    <>
                      {/* Results Header */}
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
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-3 sm:p-4 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                            >
                              <Download className="h-5 w-5 sm:h-6 sm:w-6" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-3 sm:p-4 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                            >
                              <Share2 className="h-5 w-5 sm:h-6 sm:w-6" />
                            </motion.button>
                          </div>
                        </div>

                        {/* AI Verdict */}
                        <div className="bg-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 backdrop-blur-sm">
                          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-white flex-shrink-0" />
                            <h3 className="text-xl sm:text-2xl font-bold">
                              AI Verdict
                            </h3>
                          </div>
                          <p className="text-base sm:text-lg lg:text-xl leading-relaxed text-blue-50">
                            {analysisResult.analysis.verdict}
                          </p>
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                        {[
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
                        ].map((stat, index) => (
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

                      {/* Detailed Results */}
                      <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                        {/* Mobile Tabs */}
                        <div className="sm:hidden">
                          <div className="relative">
                            <select
                              value={activeTab}
                              onChange={(e) =>
                                setActiveTab(
                                  e.target.value as "summary" | "risks"
                                )
                              }
                              className="w-full appearance-none bg-white border-b border-gray-200 p-4 pr-10 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="summary">Summary</option>
                              <option value="risks">
                                Risk Analysis (
                                {analysisResult.analysis.risks.length})
                              </option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                          </div>
                        </div>

                        {/* Desktop Tabs */}
                        <div className="hidden sm:flex border-b border-gray-200">
                          <motion.button
                            whileHover={{ scale: 1.01 }}
                            onClick={() => setActiveTab("summary")}
                            className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 sm:py-6 font-bold text-lg sm:text-xl transition-all ${
                              activeTab === "summary"
                                ? "bg-blue-50 text-blue-600 border-b-2 sm:border-b-3 border-blue-600"
                                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                            }`}
                          >
                            <Eye className="h-5 w-5 sm:h-6 sm:w-6" />
                            Summary
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.01 }}
                            onClick={() => setActiveTab("risks")}
                            className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 sm:py-6 font-bold text-lg sm:text-xl transition-all ${
                              activeTab === "risks"
                                ? "bg-blue-50 text-blue-600 border-b-2 sm:border-b-3 border-blue-600"
                                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                            }`}
                          >
                            <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
                            Risk Analysis
                            <span className="bg-red-100 text-red-700 text-sm font-bold rounded-full px-2 sm:px-3 py-1">
                              {analysisResult.analysis.risks.length}
                            </span>
                          </motion.button>
                        </div>

                        {/* Tab Content */}
                        <div className="p-4 sm:p-6 lg:p-12">
                          <AnimatePresence mode="wait">
                            {activeTab === "summary" ? (
                              <motion.div
                                key="summary"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8"
                              >
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
                                  Document Summary
                                </h3>
                                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                                  {analysisResult.analysis.summary}
                                </p>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="risks"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4 sm:space-y-6 lg:space-y-8"
                              >
                                {analysisResult.analysis.risks.map(
                                  (risk, index) => (
                                    <motion.div
                                      key={index}
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: index * 0.1 }}
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
                                      <p className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6 leading-relaxed">
                                        {risk.description}
                                      </p>
                                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 sm:p-6 rounded-r-xl">
                                        <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                          <Target className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
                                          <h5 className="font-bold text-blue-800 text-base sm:text-lg">
                                            Recommendation
                                          </h5>
                                        </div>
                                        <p className="text-blue-700 text-base sm:text-lg leading-relaxed">
                                          {risk.recommendation}
                                        </p>
                                      </div>
                                    </motion.div>
                                  )
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-12 text-center">
                      <AlertTriangle className="h-16 w-16 sm:h-20 sm:w-20 text-red-500 mx-auto mb-6 sm:mb-8" />
                      <h2 className="text-2xl sm:text-3xl font-bold text-red-700 mb-4">
                        Analysis Error
                      </h2>
                      <p className="text-red-600 text-lg sm:text-xl">
                        {analysisResult.friendly_message}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden bg-white/90 backdrop-blur-md border-t border-gray-200 p-4">
        <div className="flex justify-around">
          {navigationItems.map((item) => (
            <div key={item.id} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1 transition-all ${
                  item.active
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <span
                className={`text-xs font-medium ${
                  item.active ? "text-blue-600" : "text-gray-400"
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LegalAnalysisComponent;
