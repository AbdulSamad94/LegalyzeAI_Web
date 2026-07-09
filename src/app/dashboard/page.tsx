"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  BarChart3,
  FileText,
  Clock,
  AlertTriangle,
  AlertCircle,
  Download,
  Search,
  Calendar,
  Activity,
  Eye,
  Trash2,
  Plus,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { PageWrapper } from "@/components/ui/PageWrapper";

// Updated interface to match the backend model
interface AnalysisRecord {
  id: string;
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

type RiskLevel = "low" | "medium" | "high" | "critical";

type FilterValue = "all" | "high-risk" | "recent";

const FILTER_OPTIONS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All Documents" },
  { value: "high-risk", label: "High Risk" },
  { value: "recent", label: "Recent (7 days)" },
];

const RISK_STYLES: Record<
  RiskLevel,
  { badge: string; accent: string; icon: React.ElementType }
> = {
  critical: {
    badge: "text-red-700 bg-red-50 border border-red-200",
    accent: "bg-red-500",
    icon: ShieldAlert,
  },
  high: {
    badge: "text-orange-700 bg-orange-50 border border-orange-200",
    accent: "bg-orange-500",
    icon: AlertTriangle,
  },
  medium: {
    badge: "text-amber-700 bg-amber-50 border border-amber-200",
    accent: "bg-amber-500",
    icon: AlertCircle,
  },
  low: {
    badge: "text-emerald-700 bg-emerald-50 border border-emerald-200",
    accent: "bg-emerald-500",
    icon: ShieldCheck,
  },
};

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
  const [filter, setFilter] = useState<FilterValue>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const getRiskLevel = (risksCount: number, verdict: string): RiskLevel => {
    if (
      verdict.toLowerCase().includes("high risk") ||
      verdict.toLowerCase().includes("critical")
    )
      return "critical";
    if (risksCount > 4) return "high";
    if (risksCount > 2) return "medium";
    return "low";
  };

  const handleDelete = async (analysisId: string, documentName: string) => {
    if (!window.confirm(`Delete "${documentName}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(analysisId);
    const previousAnalyses = analyses;
    setAnalyses((prev) => prev.filter((a) => a.id !== analysisId));

    try {
      const response = await fetch(`/api/analyses/${analysisId}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to delete analysis");
      }
    } catch (error) {
      console.error("Error deleting analysis:", error);
      setAnalyses(previousAnalyses);
      window.alert("Failed to delete the analysis. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = () => {
    if (filteredAnalyses.length === 0) return;

    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const header = ["Document Name", "Document Type", "Date", "Risk Level", "Risk Count", "Verdict"];
    const rows = filteredAnalyses.map((a) => [
      a.documentName,
      a.documentType,
      new Date(a.createdAt).toISOString(),
      getRiskLevel(a.risks.length, a.verdict),
      String(a.risks.length),
      a.verdict,
    ].map(escapeCsv).join(","));

    const csv = [header.map(escapeCsv).join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `legalyze-analyses-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
      <PageWrapper>
        <Header />
        <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <DashboardSkeleton />
        </main>
        <Footer />
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
              className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 font-medium cursor-pointer"
            >
              <Plus className="h-5 w-5" />
              New Analysis
            </Link>
            <button
              type="button"
              onClick={handleExport}
              disabled={filteredAnalyses.length === 0}
              className="bg-white text-slate-700 px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 flex items-center gap-2 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Export Data
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <StatCard
            title="Total Analyses"
            value={stats.total_analyses}
            icon={BarChart3}
            gradient="from-blue-500 to-indigo-600"
            delay={0}
          />
          <StatCard
            title="This Month"
            value={stats.this_month}
            icon={Calendar}
            gradient="from-emerald-500 to-green-600"
            delay={0.05}
          />
          <StatCard
            title="High Risk Docs"
            value={stats.high_risk_documents}
            icon={AlertTriangle}
            gradient="from-orange-500 to-red-500"
            delay={0.1}
          />
          <StatCard
            title="Avg Processing"
            value={`${stats.processing_time_avg}s`}
            icon={Activity}
            gradient="from-violet-500 to-purple-600"
            delay={0.15}
          />
        </div>

        {/* Filters and Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 mb-8 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <h2 className="text-xl font-bold text-slate-900">
                Recent Analyses
              </h2>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative">
                  <label htmlFor="dashboard-search" className="sr-only">
                    Search documents
                  </label>
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    id="dashboard-search"
                    type="text"
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64 bg-slate-50 focus:bg-white transition-colors text-sm"
                  />
                </div>

                <div
                  role="group"
                  aria-label="Filter analyses"
                  className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 overflow-x-auto"
                >
                  {FILTER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFilter(option.value)}
                      aria-pressed={filter === option.value}
                      className={`px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                        filter === option.value
                          ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
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
                  const riskStyle = RISK_STYLES[riskLevel];
                  const RiskIcon = riskStyle.icon;
                  const isDeleting = deletingId === analysis.id;

                  return (
                    <motion.div
                      key={analysis.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: isDeleting ? 0.5 : 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.04, 0.4) }}
                      className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 pl-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 overflow-hidden"
                    >
                      <span
                        className={`absolute left-0 top-0 bottom-0 w-1 ${riskStyle.accent}`}
                        aria-hidden="true"
                      />

                      <div className="flex items-start gap-4 min-w-0">
                        <div
                          className={`shrink-0 mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg ${riskStyle.badge}`}
                        >
                          <RiskIcon className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                            {analysis.documentName}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                              {analysis.documentType}
                            </span>
                            <span className="hidden sm:inline text-slate-300">•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
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

                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pl-[52px] sm:pl-0">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${riskStyle.badge}`}
                          >
                            {riskLevel}
                          </span>
                          <span className="text-sm font-medium text-slate-600 whitespace-nowrap">
                            {analysis.risks.length} risks
                          </span>
                        </div>

                        <div className="flex items-center gap-1 border-l border-slate-200 pl-3 ml-1">
                          <Link
                            href={`/analyses/${analysis.id}`}
                            aria-label={`View analysis for ${analysis.documentName}`}
                            title="View Analysis"
                            className="flex h-10 w-10 items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                          >
                            <Eye className="h-5 w-5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(analysis.id, analysis.documentName)}
                            disabled={isDeleting}
                            aria-label={`Delete analysis for ${analysis.documentName}`}
                            title="Delete"
                            className="flex h-10 w-10 items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <EmptyState
                  hasActiveFilters={Boolean(searchTerm) || filter !== "all"}
                  onClearFilters={() => {
                    setSearchTerm("");
                    setFilter("all");
                  }}
                />
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
  icon: Icon,
  gradient,
  delay,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  gradient: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-3xl font-bold text-slate-900 mt-2 tabular-nums">{value}</p>
      </div>
      <div className={`bg-gradient-to-br ${gradient} p-3 rounded-xl shadow-sm`}>
        <Icon className="h-6 w-6 text-white" aria-hidden="true" />
      </div>
    </div>
  </motion.div>
);

const EmptyState = ({
  hasActiveFilters,
  onClearFilters,
}: {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}) => (
  <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
      <FileText className="h-8 w-8 text-blue-500" aria-hidden="true" />
    </div>
    <h3 className="text-lg font-bold text-slate-900 mb-2">
      No analyses found
    </h3>
    <p className="text-slate-500 max-w-sm mx-auto mb-6">
      {hasActiveFilters
        ? "Try adjusting your search or filter criteria to find what you're looking for."
        : "Upload your first document to get started with AI-powered legal analysis."}
    </p>
    {hasActiveFilters ? (
      <button
        type="button"
        onClick={onClearFilters}
        className="text-blue-600 font-medium hover:underline cursor-pointer"
      >
        Clear filters
      </button>
    ) : (
      <Link
        href="/document-analysis"
        className="inline-flex items-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium cursor-pointer"
      >
        <Plus className="h-5 w-5" />
        New Analysis
      </Link>
    )}
  </div>
);

const SkeletonBlock = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded-md bg-slate-200/70 ${className}`} />
);

const DashboardSkeleton = () => (
  <div aria-busy="true" aria-label="Loading dashboard">
    {/* Page header skeleton */}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
      <div className="space-y-3">
        <SkeletonBlock className="h-8 w-40" />
        <SkeletonBlock className="h-5 w-64" />
      </div>
      <div className="flex gap-3">
        <SkeletonBlock className="h-11 w-36 rounded-xl" />
        <SkeletonBlock className="h-11 w-32 rounded-xl" />
      </div>
    </div>

    {/* Stats grid skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white/80 rounded-2xl shadow-sm border border-slate-200/60 p-6"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <SkeletonBlock className="h-4 w-24" />
              <SkeletonBlock className="h-8 w-16" />
            </div>
            <SkeletonBlock className="h-12 w-12 rounded-xl" />
          </div>
        </div>
      ))}
    </div>

    {/* Filters + list skeleton */}
    <div className="bg-white/80 rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <SkeletonBlock className="h-7 w-40" />
        <div className="flex gap-3">
          <SkeletonBlock className="h-10 w-full sm:w-64 rounded-xl" />
          <SkeletonBlock className="h-10 w-56 rounded-xl" />
        </div>
      </div>
      <div className="p-6 bg-slate-50/50 space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 p-5 bg-white rounded-xl border border-slate-200"
          >
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <SkeletonBlock className="h-9 w-9 rounded-lg shrink-0" />
              <div className="space-y-2 min-w-0 flex-1">
                <SkeletonBlock className="h-4 w-1/3" />
                <SkeletonBlock className="h-3 w-1/2" />
              </div>
            </div>
            <SkeletonBlock className="h-6 w-20 rounded-full hidden sm:block" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default ProductionDashboard;
