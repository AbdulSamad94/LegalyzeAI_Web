"use client";

import type React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bug,
  X,
  Send,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  MessageSquare,
  FileText,
  Loader2,
} from "lucide-react";

export default function BugReportModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<null | "success" | "error" | "idle">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");

    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (res.ok) {
        setStatus("success");
        // Reset form after a delay to show success message
        setTimeout(() => {
          setName("");
          setEmail("");
          setSubject("");
          setMessage("");
          setOpen(false);
          setStatus("idle");
        }, 2000);
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  const closeModal = () => {
    setOpen(false);
    setStatus("idle");
  };

  return (
    <>
      {/* Floating Bug Report Button */}
      <motion.button
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 group"
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 3,
            }}
          >
            <Bug className="h-4 w-4 sm:h-5 sm:w-5" />
          </motion.div>
        </div>

        {/* Floating sparkles */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full"
        />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeModal}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md lg:max-w-lg border border-white/20 mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl sm:rounded-t-3xl p-3 sm:p-4 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700/20 to-indigo-700/20"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center">
                      <Bug className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold">
                        Report a Bug
                      </h3>
                      <p className="text-xs sm:text-sm text-blue-100">
                        Help us improve Legalyze AI
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={closeModal}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  </motion.button>
                </div>
              </div>

              {/* Form */}
              <div className="p-3 sm:p-4 lg:p-6">
                <AnimatePresence mode="wait">
                  {status === "success" ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="text-center py-4 sm:py-6"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: 0.2,
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                        className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4"
                      >
                        <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                      </motion.div>
                      <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                        Thank You!
                      </h4>
                      <p className="text-sm sm:text-base text-gray-600 px-2">
                        Your bug report has been sent successfully. We&lsquo;ll
                        look into it right away!
                      </p>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                      className="space-y-3 sm:space-y-4"
                    >
                      {/* Name Field */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                          Name (Optional)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                          </div>
                          <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 border border-gray-300 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base text-gray-900 bg-white/80 backdrop-blur-sm"
                            placeholder="Your name"
                          />
                        </div>
                      </motion.div>

                      {/* Email Field */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                          Email (Optional)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 border border-gray-300 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base text-gray-900 bg-white/80 backdrop-blur-sm"
                            placeholder="your.email@example.com"
                          />
                        </div>
                      </motion.div>

                      {/* Subject Field */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                          Subject <span className="text-blue-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                          </div>
                          <input
                            required
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 border border-gray-300 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base text-gray-900 bg-white/80 backdrop-blur-sm"
                            placeholder="Brief description of the bug"
                          />
                        </div>
                      </motion.div>

                      {/* Message Field */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                          Description <span className="text-blue-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute top-2.5 sm:top-3 left-3 pointer-events-none">
                            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                          </div>
                          <textarea
                            required
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={2}
                            className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 border border-gray-300 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base text-gray-900 bg-white/80 backdrop-blur-sm resize-none"
                            placeholder="Please describe the bug in detail. Include steps to reproduce, expected behavior, actual behavior, browser, OS, etc."
                          />
                        </div>
                      </motion.div>

                      {/* Error Message */}
                      <AnimatePresence>
                        {status === "error" && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-2 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-xl sm:rounded-2xl text-blue-700"
                          >
                            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                            <p className="text-xs sm:text-sm font-medium">
                              There was an error sending your report. Please try
                              again later.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Action Buttons */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4 pt-1 sm:pt-2"
                      >
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={closeModal}
                          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                        >
                          Cancel
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={loading}
                          className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                              <span>Sending...</span>
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                              <span>Send Report</span>
                            </>
                          )}
                        </motion.button>
                      </motion.div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
