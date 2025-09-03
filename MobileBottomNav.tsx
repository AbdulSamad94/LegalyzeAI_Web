"use client";

import { Upload, Brain, BarChart3 } from "lucide-react";

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
  return (
    <div className="lg:hidden bg-white/90 backdrop-blur-md border-t border-gray-200 p-4">
      <div className="flex justify-around">
        {navigationItems.map((item) => (
          <div key={item.id} className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1 transition-all ${
                item.id === currentView
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <item.icon className="h-5 w-5" />
            </div>
            <span
              className={`text-xs font-medium ${
                item.id === currentView ? "text-blue-600" : "text-gray-400"
              }`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileBottomNav;
