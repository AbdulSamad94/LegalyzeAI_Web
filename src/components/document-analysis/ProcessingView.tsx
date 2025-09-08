"use client";

import { motion } from "framer-motion";
import { Loader2, CheckCircle, Brain } from "lucide-react";
import { type ProcessingUpdate } from "../../lib/types";

interface ProcessingViewProps {
  processingUpdates: ProcessingUpdate[];
}

const ProcessingView: React.FC<ProcessingViewProps> = ({
  processingUpdates,
}) => {
  return (
    <motion.div
      key="processing"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 sm:space-y-8"
    >
      <div className="text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl">
          <Brain className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 sm:mb-4">
          AI Processing
        </h2>
        <p className="text-base sm:text-lg text-gray-600">
          Analyzing your document with Legal AI. This might take a moment.
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {processingUpdates.map((update, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="flex items-center space-x-4 bg-white/70 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-md border border-gray-100"
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
    </motion.div>
  );
};

export default ProcessingView;
