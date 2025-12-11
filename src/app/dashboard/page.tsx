"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  BarChart3,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  Download,
  Filter,
  Search,
  Calendar,
  Activity,
  Eye,
  Trash2,
  Plus,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { PageWrapper } from "@/components/ui/PageWrapper";

// Updated interface to match the backend model
interface AnalysisRecord {
  _id: string;
  documentName: string;
  documentType: string;
  createdAt: string; // Comes as ISO string
  risks: string[];
  verdict: string;
}

interface DashboardStats {
  total_analyses: number;
  this_month: number;
  avg_risk_level: number; // Will keep this as a static example for now
  documents_processed: number;
  high_risk_documents: number;
  processing_time_avg: number; // Will keep this as a static example for now
}

const ProductionDashboard = () => {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_analyses: 0,
    this_month: 0,
    avg_risk_level: 2.3,
    documents_processed: 0,
    high_risk_documents: 0,
    processing_time_avg: 32,
  });
  const [filter, setFilter] = useState<"all" | "high-risk" | "recent">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real data from the API
  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/analyses");
        const result = await response.json();

        if (result.success) {
          setAnalyses(result.data);

          // Calculate stats from the fetched data
          const totalAnalyses = result.data.length;
          const thisMonthAnalyses = result.data.filter(
            (analysis: AnalysisRecord) =>
              new Date(analysis.createdAt).getMonth() ===
                new Date().getMonth() &&
              new Date(analysis.createdAt).getFullYear() ===
                new Date().getFullYear()
          ).length;
          const highRiskCount = result.data.filter(
            (a: AnalysisRecord) =>
              getRiskLevel(a.risks.length, a.verdict) === "high" ||
              getRiskLevel(a.risks.length, a.verdict) === "critical"
          ).length;

          setStats((prev) => ({
            ...prev,
            total_analyses: totalAnalyses,
            documents_processed: totalAnalyses,
            this_month: thisMonthAnalyses,
            high_risk_documents: highRiskCount,
          }));
        } else {
          console.error("Failed to fetch analyses:", result.error);
          // Handle error display for the user here
        }
      } catch (error) {
        console.error("Error fetching analyses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyses();
  }, []);

  const getRiskLevel = (
    risksCount: number,
    verdict: string
  ): "low" | "medium" | "high" | "critical" => {
    if (
      verdict.toLowerCase().includes("high risk") ||
      verdict.toLowerCase().includes("critical")
    )
      return "critical";
    if (risksCount > 4) return "high";
    if (risksCount > 2) return "medium";
    return "low";
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical":
        return "text-red-700 bg-red-50 border border-red-200";
      case "high":
        return "text-orange-700 bg-orange-50 border border-orange-200";
      case "medium":
        return "text-yellow-700 bg-yellow-50 border border-yellow-200";
      case "low":
        return "text-green-700 bg-green-50 border border-green-200";
      default:
        return "text-slate-700 bg-slate-50 border border-slate-200";
    }
  };

  const getStatusIcon = () => {
    // All saved analyses are considered 'completed'
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  };

  const filteredAnalyses = analyses.filter((analysis) => {
    const matchesSearch =
      analysis.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.documentType.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    const riskLevel = getRiskLevel(analysis.risks.length, analysis.verdict);

    switch (filter) {
      case "high-risk":
        return riskLevel === "high" || riskLevel === "critical";
      case "recent":
        return (
          new Date(analysis.createdAt) >
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        );
      default:
        return true;
    }
  });

  if (isLoading) {
    return (
      <PageWrapper className="flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">
            Loading your dashboard...
          </p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Header />
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-slate-600 mt-2 text-lg">
              Monitor your document analyses and insights
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/document-analysis"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 font-medium"
            >
              <Plus className="h-5 w-5" />
              New Analysis
            </Link>
            <button className="bg-white text-slate-700 px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 flex items-center gap-2 font-medium shadow-sm">
              <Download className="h-4 w-4" />
              Export Data
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            title="Total Analyses"
            value={stats.total_analyses}
            icon={<BarChart3 className="h-6 w-6 text-blue-600" />}
            bg="bg-blue-100"
            delay={0}
          />
          <StatCard
            title="This Month"
            value={stats.this_month}
            icon={<Calendar className="h-6 w-6 text-green-600" />}
            bg="bg-green-100"
            delay={0.1}
          />
          <StatCard
            title="High Risk Docs"
            value={stats.high_risk_documents}
            icon={<AlertTriangle className="h-6 w-6 text-orange-600" />}
            bg="bg-orange-100"
            delay={0.2}
          />
          <StatCard
            title="Avg Processing"
            value={`${stats.processing_time_avg}s`}
            icon={<Activity className="h-6 w-6 text-purple-600" />}
            bg="bg-purple-100"
            delay={0.3}
          />
        </div>

        {/* Filters and Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 mb-8 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-bold text-slate-900">
                Recent Analyses
              </h2>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64 bg-slate-50 focus:bg-white transition-colors"
                  />
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as typeof filter)}
                    className="pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-slate-50 focus:bg-white transition-colors cursor-pointer text-slate-700 font-medium"
                  >
                    <option value="all">All Documents</option>
                    <option value="high-risk">High Risk</option>
                    <option value="recent">Recent (7 days)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis List */}
          <div className="p-6 bg-slate-50/50">
            <div className="space-y-3">
              {filteredAnalyses.length > 0 ? (
                filteredAnalyses.map((analysis, index) => {
                  const riskLevel = getRiskLevel(
                    analysis.risks.length,
                    analysis.verdict
                  );
                  return (
                    <motion.div
                      key={analysis._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200"
                    >
                      <div className="flex items-start gap-4 mb-4 sm:mb-0">
                        <div className="mt-1">{getStatusIcon()}</div>
                        <div>
                          <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {analysis.documentName}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <FileText className="h-3.5 w-3.5" />
                              {analysis.documentType}
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {new Date(analysis.createdAt).toLocaleDateString(
                                undefined,
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${getRiskColor(
                              riskLevel
                            )}`}
                          >
                            {riskLevel}
                          </span>
                          <span className="text-sm font-medium text-slate-600">
                            {analysis.risks.length} risks
                          </span>
                        </div>

                        <div className="flex items-center gap-2 border-l border-slate-200 pl-4 ml-2">
                          <Link
                            href={`/analyses/${analysis._id}`}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="View Analysis"
                          >
                            <Eye className="h-5 w-5" />
                          </Link>
                          <button
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
                  <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    No analyses found
                  </h3>
                  <p className="text-slate-500 max-w-sm mx-auto mb-6">
                    {searchTerm || filter !== "all"
                      ? "Try adjusting your search or filter criteria to find what you're looking for."
                      : "Upload your first document to get started with AI-powered legal analysis."}
                  </p>
                  {(searchTerm || filter !== "all") && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setFilter("all");
                      }}
                      className="text-blue-600 font-medium hover:underline"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </PageWrapper>
  );
};

const StatCard = ({
  title,
  value,
  icon,
  bg,
  delay,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bg: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 p-6 hover:shadow-md transition-all duration-200"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${bg}`}>{icon}</div>
    </div>
  </motion.div>
);

export default ProductionDashboard;
