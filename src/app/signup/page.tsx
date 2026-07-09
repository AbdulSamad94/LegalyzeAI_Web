"use client";

import type React from "react";
import { motion } from "framer-motion";
import {
  Mail,
  User,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { FaGithub } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { authClient } from "@/lib/auth-client";
import { useFormValidation } from "@/lib/hooks/useFormValidation";
import { FormInput } from "@/components/form/FormInput";
import { PasswordConfirmation } from "@/components/form/PasswordConfirmation";
import { PasswordStrengthMeter } from "@/components/form/PasswordStrengthMeter";
import { AuthBrandMark } from "@/components/auth/AuthBrandMark";

const SignupPage = () => {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successEmail, setSuccessEmail] = useState("");
  const [message, setMessage] = useState({ type: "", content: "" });
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const {
    formData,
    fieldErrors,
    passwordStrength,
    handleFieldChange,
    validateAllFields,
    resetForm,
  } = useFormValidation();

  // Auto-focus name field
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    // Validate all fields
    if (!validateAllFields()) {
      setMessage({ type: "error", content: "Please fix the errors above" });
      return;
    }

    // Check terms
    if (!acceptTerms) {
      setMessage({
        type: "error",
        content: "Please accept the terms and conditions",
      });
      return;
    }

    // Prevent duplicate submissions
    if (isLoading) return;
    setIsLoading(true);
    setMessage({ type: "", content: "" });

    try {
      const response = await authClient.signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      });

      // Better error detection
      if (response && !response.error) {
        // Success - show confirmation screen with email
        setSuccessEmail(formData.email);
        setShowSuccess(true);
        setMessage({
          type: "success",
          content: "Account created! Please verify your email.",
        });
        resetForm();
        setAcceptTerms(false);
        setSubmitAttempted(false);
      } else {
        // Error occurred
        const error = response?.error as
          | { message?: string }
          | string
          | undefined;
        const errorMessage =
          (typeof error === "object" && error?.message) ||
          (typeof error === "string" ? error : null) ||
          "Failed to create account. Please try again.";

        setMessage({
          type: "error",
          content: errorMessage,
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Signup error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      setMessage({
        type: "error",
        content: errorMessage,
      });
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider: "google" | "github") => {
    // Prevent duplicate submissions
    if (isLoading) return;

    setIsLoading(true);
    setMessage({ type: "", content: "" });

    try {
      await authClient.signIn.social(
        {
          provider,
          callbackURL: "/",
        },
        {
          onError: (err) => {
            const errorMessage =
              err?.error?.message ||
              (typeof err === "string" ? err : null) ||
              `Failed to sign up with ${provider === "google" ? "Google" : "GitHub"}. Please try again.`;

            setMessage({
              type: "error",
              content: errorMessage,
            });
            setIsLoading(false);
          },
        },
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : `Failed to sign up with ${provider === "google" ? "Google" : "GitHub"}. Please try again.`;

      setMessage({
        type: "error",
        content: errorMessage,
      });
      setIsLoading(false);
    }
  };

  // Success Screen
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex p-4 bg-green-100 rounded-full"
            >
              <CheckCircle className="h-8 w-8 text-green-600" />
            </motion.div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Check Your Email!
              </h1>
              <p className="text-sm text-gray-600">
                We&apos;ve sent a verification link to:
              </p>
              <p className="text-sm font-semibold text-gray-900 mt-2 break-all">
                {successEmail}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700 space-y-2">
              <p>
                <strong>📧 Check your email</strong> (including spam folder) for
                the verification link
              </p>
              <p>
                <strong>⏱️ Time limit:</strong> The link expires in 24 hours
              </p>
              <p>
                <strong>✅ What&apos;s next:</strong> Click the link to verify
                your account and start analyzing documents
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <button
                onClick={() => setShowSuccess(false)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-2xl font-semibold hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                Create Another Account
              </button>
              <Link href="/login" className="block">
                <button className="w-full text-blue-600 hover:text-blue-500 font-medium py-3 transition-colors">
                  Already verified? Sign In
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-linear-to-br from-slate-50 to-blue-50">
      {/* Left Side - Signup Form */}
      <div className="lg:w-1/2 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 order-1 min-h-screen">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </motion.div>

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center mb-6"
            >
              <AuthBrandMark />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Account
            </h1>
            <p className="text-gray-600">
              Start analyzing legal documents with AI
            </p>
          </div>

          {/* Alert Message */}
          {message.content && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-2xl flex items-center gap-3 ${
                message.type === "error"
                  ? "bg-red-50 border border-red-200 text-red-700"
                  : "bg-green-50 border border-green-200 text-green-700"
              }`}
            >
              {message.type === "error" ? (
                <AlertCircle className="h-5 w-5 shrink-0" />
              ) : (
                <CheckCircle className="h-5 w-5 shrink-0" />
              )}
              <span className="text-sm">{message.content}</span>
            </motion.div>
          )}

          {/* Signup Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8"
          >
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Name Field */}
              <FormInput
                ref={nameInputRef}
                id="name"
                name="name"
                label="Full Name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                error={submitAttempted ? fieldErrors.name : null}
                icon={<User className="h-5 w-5 text-gray-400" />}
                onChange={handleFieldChange}
                autoComplete="name"
              />

              {/* Email Field */}
              <FormInput
                id="email"
                name="email"
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                error={submitAttempted ? fieldErrors.email : null}
                icon={<Mail className="h-5 w-5 text-gray-400" />}
                onChange={handleFieldChange}
                autoComplete="email"
              />

              {/* Password Field */}
              <div>
                <FormInput
                  id="password"
                  name="password"
                  label="Password"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  error={submitAttempted ? fieldErrors.password : null}
                  icon={
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
                  }
                  onChange={handleFieldChange}
                  autoComplete="new-password"
                />

                {/* Password Strength Meter */}
                <div className="mt-3">
                  <PasswordStrengthMeter strength={passwordStrength} />
                </div>
              </div>

              {/* Confirm Password Field */}
              <PasswordConfirmation
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                value={formData.confirmPassword}
                password={formData.password}
                error={submitAttempted ? fieldErrors.confirmPassword : null}
                onChange={handleFieldChange}
              />

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  id="accept-terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded mt-0.5 cursor-pointer"
                  required
                />
                <label
                  htmlFor="accept-terms"
                  className="text-sm text-gray-700 leading-relaxed cursor-pointer"
                >
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="font-semibold text-blue-600 hover:text-blue-500"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="font-semibold text-blue-600 hover:text-blue-500"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="text-sm text-gray-500">OR</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            {/* Social Auth Buttons */}
            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => handleSocialAuth("google")}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-2xl hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FcGoogle className="w-5 h-5" />
                <span className="text-gray-700 font-medium">
                  Continue with Google
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialAuth("github")}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-2xl hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaGithub className="w-5 h-5 text-gray-900" />
                <span className="text-gray-700 font-medium">
                  Continue with GitHub
                </span>
              </button>
            </div>

            {/* Sign In Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-blue-600 hover:text-blue-500"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - Decorative (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden items-center justify-center order-2 min-h-screen">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />
          <div className="absolute top-40 right-32 w-24 h-24 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000" />
          <div className="absolute bottom-32 left-32 w-28 h-28 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000" />
          <div className="absolute bottom-20 right-20 w-20 h-20 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500" />
        </div>

        <div className="relative z-10 text-center px-8 lg:px-16 max-w-md">
          <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
            Understand Any Legal Document in Seconds
          </h2>
          <p className="text-xl text-blue-100">
            Join thousands of professionals who trust Legalyze AI for instant
            legal document analysis
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
