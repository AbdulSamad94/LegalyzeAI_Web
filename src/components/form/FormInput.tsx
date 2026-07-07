import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Check, Eye, EyeOff } from "lucide-react";
import type { ValidationError, FormValidationState } from "@/lib/hooks/useFormValidation";

interface FormInputProps {
  id: string;
  name: keyof FormValidationState;
  label: string;
  type?: "text" | "email" | "password";
  placeholder?: string;
  value: string;
  error: ValidationError | null;
  icon?: React.ReactNode;
  onChange: (fieldName: keyof FormValidationState, value: string) => void;
  onBlur?: () => void;
  required?: boolean;
  autoComplete?: string;
  disabled?: boolean;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      id,
      name,
      label,
      type = "text",
      placeholder,
      value,
      error,
      icon,
      onChange,
      onBlur,
      required = true,
      autoComplete,
      disabled = false,
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const isError = error?.type === "error";
    const hasValue = value.length > 0;

    return (
      <div className="space-y-2">
        {/* Label */}
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 flex items-center gap-1"
        >
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>

        {/* Input Container */}
        <div className="relative">
          {/* Icon */}
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {icon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={id}
            name={name}
            type={isPassword ? (showPassword ? "text" : "password") : type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(name, e.target.value)}
            onBlur={onBlur}
            disabled={disabled}
            autoComplete={autoComplete}
            required={required}
            className={`block w-full ${icon ? "pl-10" : "pl-3"} pr-10 py-4 border rounded-2xl
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              text-gray-900 transition-colors
              ${
                isError
                  ? "border-red-300 bg-red-50"
                  : hasValue && !error
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300"
              }
              ${disabled ? "bg-gray-100 cursor-not-allowed opacity-50" : ""}
            `}
          />

          {/* Password Toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          )}

          {/* Success Indicator */}
          {!isError && hasValue && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
            >
              <Check className="h-5 w-5 text-green-500" />
            </motion.div>
          )}

          {/* Error Indicator */}
          {isError && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
            >
              <AlertCircle className="h-5 w-5 text-red-500" />
            </motion.div>
          )}
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`text-sm font-medium flex items-center gap-2 ${
                error.type === "error" ? "text-red-600" : "text-amber-600"
              }`}
            >
              <AlertCircle className="h-4 w-4" />
              {error.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
