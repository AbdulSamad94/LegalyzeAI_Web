"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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

interface AnalysisRecord {
  id: string;
  filename: string;
  type: string;
  date: string;
  status: "completed" | "failed" | "processing";
  risks_count: number;
  risk_level: "low" | "medium" | "high" | "critical";
  word_count: number;
}

interface DashboardStats {
  total_analyses: number;
  this_month: number;
  avg_risk_level: number;
  documents_processed: number;
  high_risk_documents: number;
  processing_time_avg: number;
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

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockAnalyses: AnalysisRecord[] = [
      {
        id: "1",
        filename: "Service_Agreement_2024.pdf",
        type: "Service Agreement",
        date: "2024-01-15",
        status: "completed",
        risks_count: 3,
        risk_level: "medium",
        word_count: 2847,
      },
      {
        id: "2",
        filename: "NDA_Template.docx",
        type: "Non-Disclosure Agreement",
        date: "2024-01-14",
        status: "completed",
        risks_count: 1,
        risk_level: "low",
        word_count: 1205,
      },
      {
        id: "3",
        filename: "Employment_Contract.pdf",
        type: "Employment Agreement",
        date: "2024-01-13",
        status: "completed",
        risks_count: 5,
        risk_level: "high",
        word_count: 4231,
      },
    ];

    setTimeout(() => {
      setAnalyses(mockAnalyses);
      setStats({
        total_analyses: 156,
        this_month: 23,
        avg_risk_level: 2.3,
        documents_processed: 156,
        high_risk_documents: 12,
        processing_time_avg: 32,
      });
      setIsLoading(false);
    }, 1000);
  }, []);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "processing":
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredAnalyses = analyses.filter((analysis) => {
    const matchesSearch =
      analysis.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.type.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    switch (filter) {
      case "high-risk":
        return (
          analysis.risk_level === "high" || analysis.risk_level === "critical"
        );
      case "recent":
        return (
          new Date(analysis.date) >
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
    <div className="min-h-screen bg-gray-50">
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
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <FileText className="h-4 w-4" />
                New Analysis
              </button>
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
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+12% from last month</span>
            </div>
          </motion.div>

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
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+8% from last month</span>
            </div>
          </motion.div>

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
            <div className="mt-4 flex items-center text-sm text-orange-600">
              <AlertTriangle className="h-4 w-4 mr-1" />
              <span>Requires attention</span>
            </div>
          </motion.div>

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
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>15% faster than before</span>
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
                {/* Search */}
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

                {/* Filter */}
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
                filteredAnalyses.map((analysis, index) => (
                  <motion.div
                    key={analysis.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {getStatusIcon(analysis.status)}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {analysis.filename}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{analysis.type}</span>
                          <span>•</span>
                          <span>
                            {analysis.word_count.toLocaleString()} words
                          </span>
                          <span>•</span>
                          <span>{analysis.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(
                              analysis.risk_level
                            )}`}
                          >
                            {analysis.risk_level.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-600">
                            {analysis.risks_count} risks
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                          <Download className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                          <Share2 className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Scale className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Legal Resources</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Access legal templates and guides
            </p>
            <button className="text-blue-600 font-medium hover:text-blue-700">
              Browse Resources →
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">
                Expert Consultation
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Connect with legal professionals
            </p>
            <button className="text-green-600 font-medium hover:text-green-700">
              Find Experts →
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Upgrade Plan</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Unlock advanced features and higher limits
            </p>
            <button className="text-purple-600 font-medium hover:text-purple-700">
              View Plans →
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductionDashboard;
