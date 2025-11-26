"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  BarChart3,
  FileText,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Download,
  Filter,
  Search,
  Calendar,
  Users,
  DollarSign,
  Scale,
  Activity,
  Eye,
  Trash2,
  Share2,
} from "lucide-react";

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
        const response = await fetch('/api/analyses');
        const result = await response.json();

        if (result.success) {
          setAnalyses(result.data);
          
          // Calculate stats from the fetched data
          const totalAnalyses = result.data.length;
          const thisMonthAnalyses = result.data.filter((analysis: AnalysisRecord) => 
            new Date(analysis.createdAt).getMonth() === new Date().getMonth() &&
            new Date(analysis.createdAt).getFullYear() === new Date().getFullYear()
          ).length;
          const highRiskCount = result.data.filter((a: AnalysisRecord) => getRiskLevel(a.risks.length, a.verdict) === 'high' || getRiskLevel(a.risks.length, a.verdict) === 'critical').length;

          setStats(prev => ({
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

  const getRiskLevel = (risksCount: number, verdict: string): "low" | "medium" | "high" | "critical" => {
    if (verdict.toLowerCase().includes('high risk') || verdict.toLowerCase().includes('critical')) return 'critical';
    if (risksCount > 4) return "high";
    if (risksCount > 2) return "medium";
    return "low";
  };
  
  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical":
        return "text-red-600 bg-red-100";
      case "high":
        return "text-orange-600 bg-orange-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = () => {
    // All saved analyses are considered 'completed'
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const filteredAnalyses = analyses.filter((analysis) => {
    const matchesSearch =
      analysis.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.documentType.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    
    const riskLevel = getRiskLevel(analysis.risks.length, analysis.verdict);

    switch (filter) {
      case "high-risk":
        return (
          riskLevel === "high" || riskLevel === "critical"
        );
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-12">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                LegalyzeAI Dashboard
              </h1>
              <p className="text-gray-600">
                Monitor your document analyses and insights
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/document-analysis" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <FileText className="h-4 w-4" />
                New Analysis
              </Link>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Analyses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Analyses
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.total_analyses}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          {/* This Month */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.this_month}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          {/* High Risk Docs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  High Risk Docs
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.high_risk_documents}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </motion.div>
          
          {/* Avg Processing */}
           <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg Processing
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.processing_time_avg}s
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Analyses
              </h2>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as typeof filter)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="all">All Documents</option>
                    <option value="high-risk">High Risk</option>
                    <option value="recent">Recent (7 days)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Analysis List */}
            <div className="mt-6 space-y-3">
              {filteredAnalyses.length > 0 ? (
                filteredAnalyses.map((analysis, index) => {
                  const riskLevel = getRiskLevel(analysis.risks.length, analysis.verdict);
                  return (
                  <motion.div
                    key={analysis._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {getStatusIcon()}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {analysis.documentName}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{analysis.documentType}</span>
                          <span>•</span>
                           <span>{new Date(analysis.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(
                              riskLevel
                            )}`}
                          >
                            {riskLevel.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-600">
                            {analysis.risks.length} risks
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link href={`/analyses/${analysis._id}`} passHref className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No analyses found
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm || filter !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Upload your first document to get started with AI analysis"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionDashboard;
