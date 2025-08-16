"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  ArrowRight,
  Loader,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface StatusUpdate {
  step: string;
  status: "processing" | "completed" | "failed";
  message: string;
}

const DemoSection = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analysisSteps, setAnalysisSteps] = useState<StatusUpdate[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [finalMessage, setFinalMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Handles file selection from the input
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (
        ![
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain",
        ].includes(selectedFile.type)
      ) {
        setError("Invalid file type. Please upload a PDF, DOCX, or TXT file.");
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File is too large. Please upload a file smaller than 10MB.");
        return;
      }
      setFile(selectedFile);
      setError(null);
      setAnalysisSteps([]);
      setFinalMessage("");
    }
  };

  const handleChooseFileClick = () => {
    document.getElementById("file-upload")?.click();
  };

  const startAnalysis = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisSteps([]);
    setFinalMessage("");
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value, { stream: true });

        const lines = chunk
          .split("\n")
          .filter((line) => line.trim().startsWith("data:"));

        for (const line of lines) {
          const data = line.replace(/^data: /, "");
          if (data.startsWith("[DONE]")) {
            done = true;
            break;
          }
          try {
            const parsedData = JSON.parse(data);
            if (parsedData.final_message) {
              setFinalMessage(parsedData.final_message);
            } else {
              // *** FIX 1: UPDATE STATUS LOGIC ***
              // Instead of just adding, we check if the step already exists and update it.
              setAnalysisSteps((prevSteps) => {
                const existingStepIndex = prevSteps.findIndex(
                  (s) => s.step === parsedData.step
                );

                if (existingStepIndex !== -1) {
                  // If step exists, create a new array with the updated step
                  const updatedSteps = [...prevSteps];
                  updatedSteps[existingStepIndex] = parsedData;
                  return updatedSteps;
                } else {
                  // If it's a new step, add it to the array
                  return [...prevSteps, parsedData];
                }
              });
            }
          } catch (e) {
            console.error("Failed to parse stream data chunk:", data, e);
          }
        }
      }
    } catch (err: unknown) {
      setError((err as Error).message || "An unexpected error occurred.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderStatusIcon = (status: "processing" | "completed" | "failed") => {
    switch (status) {
      case "processing":
        return <Loader className="h-5 w-5 text-blue-500 animate-spin" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-indigo-700">
      <div className="max-w-4xl mx-auto text-center">
        {/* ... (The h2 and p tags for the title are unchanged) ... */}
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
          {!isAnalyzing && analysisSteps.length === 0 && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-400 transition-all duration-300 cursor-pointer"
              onClick={handleChooseFileClick}
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.docx,.txt"
              />
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="inline-flex p-4 bg-blue-50 rounded-2xl mb-6"
              >
                <Upload className="h-8 w-8 text-blue-600" />
              </motion.div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {file ? file.name : "Drop your document here"}
              </h3>
              <p className="text-gray-600 mb-6">
                Supports PDF, DOC, DOCX files up to 10MB
              </p>

              <motion.button
                type="button" // Good practice to prevent form submission
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto disabled:opacity-50"
                disabled={isAnalyzing}
                onClick={(e) => {
                  // *** FIX 2: STOP EVENT PROPAGATION ***
                  // If a file is selected, we stop the click from reaching the parent div
                  if (file) {
                    e.stopPropagation();
                    startAnalysis();
                  }
                  // Otherwise, the parent div's onClick will handle opening the file dialog
                }}
              >
                {file
                  ? isAnalyzing
                    ? "Analyzing..."
                    : "Analyze Document"
                  : "Choose File"}
                {!isAnalyzing && <ArrowRight className="h-4 w-4" />}
                {isAnalyzing && <Loader className="h-4 w-4 animate-spin" />}
              </motion.button>
              {error && <p className="text-red-500 mt-4">{error}</p>}
            </motion.div>
          )}

          {(isAnalyzing || analysisSteps.length > 0) && (
            // ... (The rest of the progress display JSX is unchanged and correct) ...
            <div className="text-left">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Analysis Progress
              </h3>
              <div className="space-y-4">
                {analysisSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="mr-4">{renderStatusIcon(step.status)}</div>
                    <div>
                      <p className="font-semibold text-gray-700">{step.step}</p>
                      <p className="text-sm text-gray-500">{step.message}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              {finalMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <h4 className="text-xl font-semibold text-blue-800 mb-2">
                    Final Result
                  </h4>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {finalMessage}
                  </p>
                </motion.div>
              )}
              {!isAnalyzing && (analysisSteps.length > 0 || finalMessage) && (
                <motion.button
                  onClick={() => {
                    setFile(null);
                    setAnalysisSteps([]);
                    setFinalMessage("");
                  }}
                  className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Analyze Another Document
                </motion.button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default DemoSection;
