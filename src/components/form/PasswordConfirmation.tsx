import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Check, Eye, EyeOff } from "lucide-react";
import type { ValidationError, FormValidationState } from "@/lib/hooks/useFormValidation";

interface PasswordConfirmationProps {
  id: string;
  name: keyof FormValidationState;
  label: string;
  value: string;
  password: string;
  error: ValidationError | null;
  onChange: (fieldName: keyof FormValidationState, value: string) => void;
  onBlur?: () => void;
  required?: boolean;
  disabled?: boolean;
}

export const PasswordConfirmation = React.forwardRef<HTMLInputElement, PasswordConfirmationProps>(
  (
    {
      id,
      name,
      label,
      value,
      password,
      error,
      onChange,
      onBlur,
      required = true,
      disabled = false,
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isError = error?.type === "error";
    const hasValue = value.length > 0;
    const passwordsMatch = password && value && password === value;

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
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          {/* Input */}
          <input
            ref={ref}
            id={id}
            name={name}
            type={showPassword ? "text" : "password"}
            placeholder="Re-enter your password"
            value={value}
            onChange={(e) => onChange(name, e.target.value)}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            autoComplete="new-password"
            className={`block w-full pl-10 pr-10 py-4 border rounded-2xl
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              text-gray-900 transition-colors
              ${
                isError
                  ? "border-red-300 bg-red-50"
                  : hasValue && passwordsMatch
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300"
              }
              ${disabled ? "bg-gray-100 cursor-not-allowed opacity-50" : ""}
            `}
          />

          {/* Password Toggle */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        {/* Match Status */}
        <AnimatePresence>
          {hasValue && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 text-sm font-medium"
            >
              {passwordsMatch ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">Passwords match</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-600">Passwords don&apos;t match</span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Validation Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm font-medium text-red-600 flex items-center gap-2"
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

PasswordConfirmation.displayName = "PasswordConfirmation";
