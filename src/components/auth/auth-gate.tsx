"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  LogIn,
  UserPlus,
  Lock,
  Scale,
  Shield,
  Zap,
  Brain,
  FileText,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Play,
  Award,
  Globe,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

const AuthRequired = () => {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description:
        "Advanced algorithms analyze your legal documents with 98% accuracy",
      color: "from-blue-500 to-indigo-600",
      stats: "10K+ documents analyzed",
    },
    {
      icon: Shield,
      title: "Risk Detection",
      description: "Automatically identify potential legal risks and red flags",
      color: "from-red-500 to-pink-600",
      stats: "95% risk detection rate",
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Get comprehensive legal summaries in under 3 seconds",
      color: "from-yellow-500 to-orange-600",
      stats: "2.3s average analysis time",
    },
    {
      icon: FileText,
      title: "Smart Summaries",
      description: "Complex legal jargon translated into plain English",
      color: "from-green-500 to-emerald-600",
      stats: "100% plain language",
    },
  ];

  const floatingElements = [
    { icon: Scale, delay: 0, x: 20, y: -20, color: "text-blue-400" },
    { icon: Shield, delay: 0.5, x: -30, y: 10, color: "text-green-400" },
    { icon: Sparkles, delay: 1, x: 40, y: 30, color: "text-purple-400" },
    { icon: Zap, delay: 1.5, x: -20, y: -30, color: "text-yellow-400" },
    { icon: Brain, delay: 2, x: 30, y: 40, color: "text-indigo-400" },
  ];

  // Auto-cycle through features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  const FeatureIcon = ({ icon }: { icon: React.ElementType }) => {
    const IconComponent = icon;
    return <IconComponent className="h-10 w-10 text-white" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-32 w-28 h-28 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-20 w-20 h-20 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      {/* Floating Legal Icons */}
      {floatingElements.map((element, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: 0.6,
            scale: 1,
            y: [0, element.y, 0],
            x: [0, element.x, 0],
          }}
          transition={{
            opacity: { duration: 0.5, delay: element.delay },
            scale: { duration: 0.5, delay: element.delay },
            y: {
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: element.delay,
            },
            x: {
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: element.delay,
            },
          }}
          className={`absolute ${
            index === 0
              ? "top-32 right-20"
              : index === 1
              ? "top-1/2 left-16"
              : index === 2
              ? "bottom-40 right-32"
              : index === 3
              ? "top-40 left-1/3"
              : "bottom-1/3 right-1/4"
          } hidden lg:block`}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/40">
            <element.icon className={`h-8 w-8 ${element.color}`} />
          </div>
        </motion.div>
      ))}

      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 p-6 lg:p-8"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="Veridict AI"
                width={110}
                height={110}
                className="h-full w-full"
              />
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="relative z-10 px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-200px)]">
            {/* Left Side - Auth Prompt */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Main Auth Card */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/40 p-8 lg:p-12">
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative inline-block mb-6"
                  >
                    <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl">
                      <Lock className="h-10 w-10 text-white" />
                    </div>
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{
                        duration: 20,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
                    >
                      <Sparkles className="h-4 w-4 text-white" />
                    </motion.div>
                  </motion.div>

                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    Authentication Required
                  </h2>
                  <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    Sign in to unlock the power of AI-driven legal document
                    analysis. Join thousands of professionals who trust Legalyze
                    AI.
                  </p>
                </div>

                {/* Auth Buttons */}
                <div className="space-y-4">
                  <Link href="/login" className="block">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
                    >
                      <LogIn className="h-5 w-5" />
                      Sign In to Continue
                      <ArrowRight className="h-5 w-5" />
                    </motion.button>
                  </Link>

                  <Link href="/signup" className="block">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-2xl font-semibold text-lg hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-3"
                    >
                      <UserPlus className="h-5 w-5" />
                      Create Free Account
                      <Sparkles className="h-5 w-5" />
                    </motion.button>
                  </Link>
                </div>

                {/* Trust Indicators */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Free to start</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span>100% secure</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-green-500" />
                      <span>GDPR compliant</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Demo Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-center"
              >
                <button className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
                  <Play className="h-4 w-4" />
                  Watch 2-minute demo
                </button>
              </motion.div>
            </motion.div>

            {/* Right Side - Features & Benefits */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-8"
            >
              {/* Animated Feature Showcase */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/40 p-8 lg:p-10">
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8 text-center">
                  What You&apos;ll Get Access To
                </h3>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentFeature}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="text-center space-y-6"
                  >
                    <div
                      className={`w-20 h-20 bg-gradient-to-r ${features[currentFeature].color} rounded-3xl flex items-center justify-center mx-auto shadow-2xl`}
                    >
                      <FeatureIcon icon={features[currentFeature].icon} />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-gray-900 mb-3">
                        {features[currentFeature].title}
                      </h4>
                      <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                        {features[currentFeature].description}
                      </p>
                      <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                        <Award className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">
                          {features[currentFeature].stats}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Feature Indicators */}
                <div className="flex justify-center space-x-2 mt-8">
                  {features.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentFeature(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentFeature
                          ? "bg-blue-600 w-8"
                          : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="relative z-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12"
      >
        <div className="max-w-4xl mx-auto text-center px-6">
          <h3 className="text-2xl lg:text-3xl font-bold mb-4">
            Ready to Transform Your Legal Workflow?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals who save time and money with
            AI-powered legal analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Link href="/signup" className="flex-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Sparkles className="h-5 w-5" />
                Start Free
              </motion.button>
            </Link>
            <Link href="/login" className="flex-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all duration-300"
              >
                Sign In
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthRequired;
