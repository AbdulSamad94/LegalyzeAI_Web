"use client";

import { motion } from "framer-motion";
import { Upload, ArrowRight } from "lucide-react";

const DemoSection = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-indigo-700">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Try It Now
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Upload a sample document and see the magic happen in real-time.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-3xl p-8 shadow-2xl"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-400 transition-all duration-300 cursor-pointer"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="inline-flex p-4 bg-blue-50 rounded-2xl mb-6"
            >
              <Upload className="h-8 w-8 text-blue-600" />
            </motion.div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Drop your document here
            </h3>
            <p className="text-gray-600 mb-6">
              Supports PDF, DOC, DOCX files up to 10MB
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
            >
              Choose File
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default DemoSection;
