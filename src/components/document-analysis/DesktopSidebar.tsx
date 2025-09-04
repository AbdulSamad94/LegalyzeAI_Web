"use client";

import { motion } from "framer-motion";
import { Upload, Brain, BarChart3, FileText, Home } from "lucide-react";
import { type AnalysisResultShape } from "@/lib/types";

type ViewState = "upload" | "processing" | "results";

interface DesktopSidebarProps {
  currentView: ViewState;
  file: File | null;
  formatFileSize: (bytes: number) => string;
  analysisResult: AnalysisResultShape | null;
  resetState: () => void;
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
}) => {
  return (
    <div className="hidden lg:flex lg:w-80 bg-white/80 backdrop-blur-md border-r border-gray-200 flex-col">
      <div className="p-8 border-b border-gray-200">
        <div className="space-y-3">
          {navigationItems.map((item, index) => (
            <div key={item.id} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  item.id === currentView
                    ? "bg-blue-600 text-white"
                    : index <
                      navigationItems.findIndex((nav) => nav.id === currentView)
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                <item.icon className="h-4 w-4" />
              </div>
              <span
                className={`font-medium ${
                  item.id === currentView
                    ? "text-blue-600"
                    : index <
                      navigationItems.findIndex((nav) => nav.id === currentView)
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

      {file && (
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3">Current Document</h3>
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-gray-800 truncate">
                {file.name}
              </span>
            </div>
            <p className="text-sm text-blue-600">{formatFileSize(file.size)}</p>
          </div>
        </div>
      )}

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
  );
};

export default DesktopSidebar;
