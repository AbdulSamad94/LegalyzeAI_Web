"use client";

import { motion } from "framer-motion";
import { Briefcase, Rocket, Home, GraduationCap } from "lucide-react";

const UseCases = () => {
  const useCases = [
    {
      icon: Briefcase,
      title: "Freelancers",
      description:
        "Review client contracts and protect yourself from unfavorable terms.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Rocket,
      title: "Startups",
      description:
        "Analyze investment agreements, partnerships, and vendor contracts.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Home,
      title: "Real Estate",
      description:
        "Understand property agreements, leases, and purchase contracts.",
      color: "from-green-500 to-green-600",
    },
    {
      icon: GraduationCap,
      title: "Students",
      description:
        "Learn legal concepts and analyze case studies for academic purposes.",
      color: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <section id="use-cases" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Perfect for Everyone
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Whether you&#39;re a professional or student, Legalyze AI helps you
            understand legal documents.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {useCases.map((useCase, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300"
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: 10 }}
                className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${useCase.color} mb-6`}
              >
                <useCase.icon className="h-8 w-8 text-white" />
              </motion.div>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {useCase.title}
              </h3>

              <p className="text-gray-600 leading-relaxed">
                {useCase.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
