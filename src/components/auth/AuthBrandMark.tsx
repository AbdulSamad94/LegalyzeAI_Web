"use client";

import { motion } from "framer-motion";
import { FileCheck2, Sparkles } from "lucide-react";

export function AuthBrandMark() {
  return (
    <div
      role="img"
      aria-label="Legalyze AI"
      className="relative inline-flex h-20 w-20 items-center justify-center"
    >
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-500 blur-xl"
        aria-hidden="true"
      />

      <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-indigo-500/30">
        <FileCheck2 className="h-9 w-9 text-white" strokeWidth={2} aria-hidden="true" />
      </div>

      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.4, duration: 0.5, type: "spring", stiffness: 220 }}
        className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border border-blue-100 bg-white shadow-md"
        aria-hidden="true"
      >
        <Sparkles className="h-4 w-4 text-indigo-600" />
      </motion.div>
    </div>
  );
}
