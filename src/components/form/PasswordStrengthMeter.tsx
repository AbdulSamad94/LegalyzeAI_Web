import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import type { PasswordStrength } from "@/lib/hooks/useFormValidation";

interface PasswordStrengthMeterProps {
  strength: PasswordStrength | null;
}

export const PasswordStrengthMeter = ({ strength }: PasswordStrengthMeterProps) => {
  if (!strength) return null;

  const bars = [
    strength.score >= 1,
    strength.score >= 2,
    strength.score >= 3,
    strength.score >= 4,
  ];

  const barColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-3 mt-3"
    >
      {/* Strength bars */}
      <div className="flex gap-1">
        {bars.map((isFilled, i) => (
          <motion.div
            key={i}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: isFilled ? 1 : 0.3 }}
            className={`h-1 flex-1 rounded-full transition-colors ${
              isFilled ? barColors[i] : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Strength label */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Password Strength:</span>
        <span className={`font-semibold capitalize ${strength.color}`}>
          {strength.label.replace("-", " ")}
        </span>
      </div>

      {/* Requirements checklist */}
      <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
        <RequirementItem
          met={strength.requirements.hasMinLength}
          label="At least 8 characters"
        />
        <RequirementItem
          met={strength.requirements.hasUppercase}
          label="Uppercase letter (A-Z)"
        />
        <RequirementItem
          met={strength.requirements.hasLowercase}
          label="Lowercase letter (a-z)"
        />
        <RequirementItem
          met={strength.requirements.hasNumber}
          label="Number (0-9)"
        />
        <RequirementItem
          met={strength.requirements.hasSpecialChar}
          label="Special character (!@#$%^&*...)"
        />
      </div>
    </motion.div>
  );
};

interface RequirementItemProps {
  met: boolean;
  label: string;
}

const RequirementItem = ({ met, label }: RequirementItemProps) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center gap-2 text-xs"
  >
    {met ? (
      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
    ) : (
      <X className="h-4 w-4 text-gray-300 flex-shrink-0" />
    )}
    <span className={met ? "text-gray-700" : "text-gray-400"}>{label}</span>
  </motion.div>
);
