"use client";

import { motion } from "framer-motion";
import {
  FileText,
  AlertTriangle,
  Scale,
  Globe,
  Shield,
  Database,
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: FileText,
      title: "AI Legal Summary",
      description:
        "Get comprehensive summaries of complex legal documents in plain English.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: AlertTriangle,
      title: "Risk Detection",
      description:
        "Automatically identify potential risks and red flags in your contracts.",
      color: "from-red-500 to-red-600",
    },
    {
      icon: Scale,
      title: "Clause Verdict",
      description:
        "Understand if specific clauses are favorable, neutral, or concerning.",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      icon: Globe,
      title: "Urdu/English Support",
      description:
        "Analyze documents in both Urdu and English with equal accuracy.",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Shield,
      title: "100% Privacy",
      description:
        "Your documents are processed securely and never stored permanently.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Database,
      title: "Secure Storage",
      description:
        "Optional encrypted storage for your analyzed documents and reports.",
      color: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <section
      id="features"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to understand and analyze legal documents with
            confidence.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-6`}
              >
                <feature.icon className="h-6 w-6 text-white" />
              </motion.div>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>

              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
