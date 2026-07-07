"use client";

import { motion } from "framer-motion";
import { Upload, Brain, BarChart3, Check } from "lucide-react";

type ViewState = "upload" | "processing" | "results";

interface MobileBottomNavProps {
  currentView: ViewState;
}

const navigationItems = [
  { id: "upload", label: "Upload", icon: Upload },
  { id: "processing", label: "Analysis", icon: Brain },
  { id: "results", label: "Results", icon: BarChart3 },
];

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentView }) => {
  const activeIndex = navigationItems.findIndex((nav) => nav.id === currentView);

  return (
    <nav
      aria-label="Analysis progress"
      className="lg:hidden bg-white/90 backdrop-blur-md border-t border-gray-200 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
    >
      <div className="flex justify-around">
        {navigationItems.map((item, index) => {
          const isCompleted = index < activeIndex;
          const isActive = item.id === currentView;

          return (
            <div
              key={item.id}
              aria-current={isActive ? "step" : undefined}
              className="flex flex-col items-center gap-1 min-w-[44px]"
            >
              <motion.div
                animate={
                  isActive
                    ? { scale: 1.1, boxShadow: "0 0 0 6px rgba(37, 99, 235, 0.12)" }
                    : { scale: 1 }
                }
                transition={{ duration: 0.3 }}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                  isCompleted
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                    : isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-500"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <item.icon className="h-5 w-5" />
                )}
              </motion.div>
              <span
                className={`text-xs font-medium ${
                  isCompleted
                    ? "text-green-600"
                    : isActive
                      ? "text-blue-600"
                      : "text-gray-500"
                }`}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
