"use client";

import { motion } from "framer-motion";
import { Upload, Brain, BarChart3, FileText, Home } from "lucide-react";
import { type AnalysisResultShape, type ProcessingUpdate } from "@/lib/types";

type ViewState = "upload" | "processing" | "results";

interface DesktopSidebarProps {
  currentView: ViewState;
  file: File | null;
  formatFileSize: (bytes: number) => string;
  analysisResult: AnalysisResultShape | null;
  resetState: () => void;
  processingUpdates?: ProcessingUpdate[];
}

const navigationItems = [
  { id: "upload", label: "Upload", icon: Upload },
  { id: "processing", label: "Analysis", icon: Brain },
  { id: "results", label: "Results", icon: BarChart3 },
];

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  currentView,
  file,
  formatFileSize,
  analysisResult,
  resetState,
  processingUpdates = [],
}) => {
  const latestProgress = processingUpdates.length
    ? Math.max(...processingUpdates.map((u) => u.progress))
    : 0;

  return (
    <div className="hidden lg:flex lg:w-80 bg-white/80 backdrop-blur-md border-r border-gray-200 flex-col">
      <div className="p-8 border-b border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Progress</h3>
        <div className="space-y-4">
          {navigationItems.map((item, index) => {
            const isCompleted = index < navigationItems.findIndex((nav) => nav.id === currentView);
            const isActive = item.id === currentView;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <motion.div
                  animate={
                    isActive
                      ? { scale: 1.15, boxShadow: "0 0 0 8px rgba(37, 99, 235, 0.1)" }
                      : { scale: 1 }
                  }
                  transition={{ duration: 0.3 }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                    isCompleted
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                      : isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {isCompleted ? "✓" : index + 1}
                </motion.div>
                <span
                  className={`font-medium transition-colors ${
                    isCompleted
                      ? "text-green-600"
                      : isActive
                        ? "text-blue-600"
                        : "text-gray-500"
                  }`}
                >
                  {item.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {file && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6 border-b border-gray-200"
        >
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Current Document</h3>
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 transition-all"
          >
            <div className="flex items-start gap-3 mb-3">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate text-sm">
                  {file.name}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {formatFileSize(file.size)} • {file.type === "application/pdf" ? "PDF" : file.type.includes("word") ? "DOCX" : "TXT"}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            {currentView === "processing" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600">Processing...</span>
                  <span className="text-xs font-medium text-blue-600">{latestProgress}%</span>
                </div>
                <div className="h-1.5 bg-white rounded-full overflow-hidden shadow-sm">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${latestProgress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}

      <div className="p-6 mt-auto space-y-3">
        {analysisResult && (
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: "0 20px 40px rgba(37, 99, 235, 0.3)" }}
            whileTap={{ scale: 0.97 }}
            onClick={resetState}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Home className="h-5 w-5" />
            New Analysis
          </motion.button>
        )}

        {!analysisResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs text-gray-500 text-center py-2"
          >
            {currentView === "upload" && "Upload a document to get started"}
            {currentView === "processing" && "Analyzing your document..."}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DesktopSidebar;
