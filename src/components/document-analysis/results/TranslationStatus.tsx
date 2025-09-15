"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { ProgressState } from "@/lib/types";

const ThreeDotWave: React.FC<{ size?: "sm" | "md" }> = ({ size = "sm" }) => {
  const dotSize = size === "sm" ? "w-2 h-2" : "w-3 h-3";
  const gapClass = size === "sm" ? "mx-0.5" : "mx-1";
  const duration = 0.6;

  return (
    <span className="inline-flex items-end" aria-hidden="true">
      {[0, 0.12, 0.24].map((d, i) => (
        <motion.span
          key={i}
          className={`${dotSize} ${gapClass} rounded-full bg-blue-500 inline-block`}
          style={{ display: "inline-block" }}
          initial={{ y: 0, opacity: 0.75 }}
          animate={{ y: [-2, -8, -2], opacity: [0.6, 1, 0.6] }}
          transition={{
            duration,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
            delay: d,
          }}
        />
      ))}
    </span>
  );
};

export const TranslationStatusIndicator: React.FC<{
  status: ProgressState;
  size?: "sm" | "md";
}> = ({ status, size = "sm" }) => {
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  switch (status) {
    case "pending":
      return <Clock className={`${iconSize} text-gray-400`} />;
    case "translating":
      // show wave animation instead of static icon
      return (
        <span className="flex items-center gap-2">
          <ThreeDotWave size={size} />
          {/* hidden text for screen readers */}
          <span className="sr-only">Translating</span>
        </span>
      );
    case "completed":
      return <CheckCircle2 className={`${iconSize} text-green-500`} />;
    case "error":
      return <AlertTriangle className={`${iconSize} text-red-500`} />;
    default:
      return null;
  }
};
