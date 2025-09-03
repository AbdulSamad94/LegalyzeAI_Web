"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  FileCheck,
  Sparkles,
  ArrowRight,
  X,
  AlertCircle,
  Brain,
} from "lucide-react";

interface UploadViewProps {
  file: File | null;
  error: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileSelect: (file: File | null) => void;
  startAnalysis: () => void;
  setFile: (file: File | null) => void;
  setError: (error: string | null) => void;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${
    sizes[i]
  }`;
};

const UploadView: React.FC<UploadViewProps> = ({
  file,
  error,
  fileInputRef,
  handleFileSelect,
  startAnalysis,
  setFile,
  setError,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <motion.div
      key="upload"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 sm:space-y-8"
    >
      <div className="text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl">
          <Brain className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 sm:mb-4">
          AI Legal Analysis
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
          Upload your legal document to get instant AI-powered insights and risk
          analysis
        </p>
      </div>

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
              onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
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
                onClick={() => {
                  setFile(null);
                  setError(null);
                }}
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
  );
};

export default UploadView;
