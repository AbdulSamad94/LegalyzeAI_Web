"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Home, Upload, Brain, BarChart3 } from "lucide-react";
import Image from "next/image";
import { type AnalysisResultShape } from "@/lib/types";

type ViewState = "upload" | "processing" | "results";

interface MobileHeaderProps {
  currentView: ViewState;
  analysisResult: AnalysisResultShape | null;
  resetState: () => void;
}

const navigationItems = [
  { id: "upload", label: "Upload", icon: Upload },
  { id: "processing", label: "Analysis", icon: Brain },
  { id: "results", label: "Results", icon: BarChart3 },
];

const MobileHeader: React.FC<MobileHeaderProps> = ({
  currentView,
  analysisResult,
  resetState,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="lg:hidden bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div>
            <Image
              src="/logo.png"
              alt="Legalyze AI"
              width={110}
              height={30}
              className="w-[110px] h-auto"
            />
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl hover:bg-gray-100"
        >
          <Menu className="h-6 w-6 text-gray-600" />
        </motion.button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200 bg-white"
          >
            <div className="p-4 space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    currentView === item.id
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
              {analysisResult && (
                <button
                  onClick={resetState}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
                >
                  <Home className="h-5 w-5" />
                  <span className="font-medium">New Analysis</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileHeader;
