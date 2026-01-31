"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  BuildingStorefrontIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { reportService } from '@/app/lib/services/reports';
import type { AdminReportType } from '@/types/api';
import { generateReportPDF } from '@/lib/reportGenerator';

const reportTypes = [
  {
    id: 'summary' as AdminReportType,
    name: 'Summary Report',
    description: 'Complete system overview and metrics',
    icon: ChartBarIcon,
    color: 'bg-blue-500'
  },
  {
    id: 'revenue' as AdminReportType,
    name: 'Revenue Report',
    description: 'Detailed revenue analysis by period',
    icon: CurrencyDollarIcon,
    color: 'bg-green-500'
  },
  {
    id: 'products' as AdminReportType,
    name: 'Products Report',
    description: 'Product performance and inventory metrics',
    icon: ChartBarIcon,
    color: 'bg-purple-500'
  },
  {
    id: 'vendors' as AdminReportType,
    name: 'Vendor Report',
    description: 'Vendor performance and analytics',
    icon: BuildingStorefrontIcon,
    color: 'bg-orange-500'
  },
  {
    id: 'orders' as AdminReportType,
    name: 'Order Report',
    description: 'Order trends and fulfillment metrics',
    icon: ChartBarIcon,
    color: 'bg-indigo-500'
  }
];

interface GeneratedReport {
  id: string;
  name: string;
  type: string;
  generatedDate: string;
  size: string;
  status: string;
  data?: any;
}

const quickStats = [
  {
    name: 'Monthly Revenue',
    value: '₹234,567',
    change: '+12.5%',
    changeType: 'increase',
    period: 'vs last month'
  },
  {
    name: 'New Customers',
    value: '1,234',
    change: '+8.2%',
    changeType: 'increase',
    period: 'vs last month'
  },
  {
    name: 'Active Vendors',
    value: '156',
    change: '+5.1%',
    changeType: 'increase',
    period: 'vs last month'
  },
  {
    name: 'Order Volume',
    value: '8,945',
    change: '-2.3%',
    changeType: 'decrease',
    period: 'vs last month'
  }
];

const recentReports = [
  {
    id: '1',
    name: 'Monthly Revenue Summary - January 2024',
    type: 'Revenue Report',
    generatedDate: '2024-01-31',
    size: '2.4 MB',
    status: 'Ready'
  },
  {
    id: '2',
    name: 'Customer Acquisition Report - Q4 2023',
    type: 'Customer Report',
    generatedDate: '2024-01-15',
    size: '1.8 MB',
    status: 'Ready'
  },
  {
    id: '3',
    name: 'Vendor Performance Analysis - December 2023',
    type: 'Vendor Report',
    generatedDate: '2024-01-10',
    size: '3.2 MB',
    status: 'Ready'
  },
  {
    id: '4',
    name: 'Order Trends Report - 2023 Annual',
    type: 'Order Report',
    generatedDate: '2024-01-05',
    size: '4.1 MB',
    status: 'Ready'
  }
];

export default function AdminReportsPage() {
  const [selectedReportType, setSelectedReportType] = useState<AdminReportType | ''>('');
  const [dateRange, setDateRange] = useState('last-month');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>(recentReports);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    if (!selectedReportType) return;
    
    setIsGenerating(true);
    setError(null);

    try {
      // Calculate date range
      const endDate = new Date();
      let startDate = new Date();
      
      switch (dateRange) {
        case 'last-week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'last-month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'last-quarter':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case 'last-year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(endDate.getMonth() - 1);
      }

      // Fetch report data from API
      const reportData = await reportService.getAdminReport(
        selectedReportType,
        {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      );

      // Create report metadata
      const reportTypeName = reportTypes.find(t => t.id === selectedReportType)?.name || 'Report';
      const dateRangeName = dateRange.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      const newReport: GeneratedReport = {
        id: Date.now().toString(),
        name: `${reportTypeName} - ${dateRangeName} - ${new Date().toLocaleDateString('en-IN')}`,
        type: reportTypeName,
        generatedDate: new Date().toISOString().split('T')[0],
        size: `${(JSON.stringify(reportData).length / 1024).toFixed(1)} KB`,
        status: 'Ready',
        data: reportData
      };

      // Add to generated reports list
      setGeneratedReports(prev => [newReport, ...prev]);

      // Generate PDF report (async) - this will download the PDF
      try {
        await generateReportPDF(selectedReportType, reportData);
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successMessage.textContent = 'PDF report generated and downloaded successfully!';
        document.body.appendChild(successMessage);
        setTimeout(() => document.body.removeChild(successMessage), 3000);
      } catch (pdfError) {
        console.error('PDF generation failed:', pdfError);
        
        // Show error for PDF but continue
        const warningMessage = document.createElement('div');
        warningMessage.className = 'fixed top-4 right-4 bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        warningMessage.textContent = 'PDF generation failed. Downloading JSON instead.';
        document.body.appendChild(warningMessage);
        setTimeout(() => document.body.removeChild(warningMessage), 3000);
        
        // Fallback to JSON download
        downloadReport(newReport);
      }

    } catch (err: any) {
      console.error('Failed to generate report:', err);
      setError(err.message || 'Failed to generate report. Please try again.');
      
      // Show error message
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      errorMessage.textContent = 'Failed to generate report. Please try again.';
      document.body.appendChild(errorMessage);
      setTimeout(() => document.body.removeChild(errorMessage), 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = (report: GeneratedReport) => {
    // Convert report data to JSON
    const jsonData = JSON.stringify(report.data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#37353E] mb-2">Reports & Analytics</h1>
        <p className="text-[#715A5A]">Generate detailed reports and view analytics</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]"
          >
            <div>
              <p className="text-sm font-medium text-[#715A5A]">{stat.name}</p>
              <p className="text-2xl font-bold text-[#37353E] mt-1">{stat.value}</p>
              <div className="flex items-center mt-2">
                {stat.changeType === 'increase' ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-[#715A5A] ml-1">{stat.period}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Report Generator */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm border border-[#D3DAD9]"
        >
          <div className="p-6 border-b border-[#D3DAD9]">
            <h3 className="text-lg font-semibold text-[#37353E]">Generate New Report</h3>
            <p className="text-sm text-[#715A5A] mt-1">Create custom reports for analysis</p>
          </div>
          <div className="p-6 space-y-6">
            {/* Report Type Selection */}
            <div>
              <label className="block text-sm font-medium text-[#715A5A] mb-3">Report Type</label>
              <div className="grid grid-cols-1 gap-3">
                {reportTypes.map((type) => (
                  <label key={type.id} className="flex items-center p-3 border border-[#D3DAD9] rounded-lg hover:bg-[#D3DAD9]/20 cursor-pointer">
                    <input
                      type="radio"
                      name="reportType"
                      value={type.id}
                      checked={selectedReportType === type.id}
                      onChange={(e) => setSelectedReportType(e.target.value as AdminReportType)}
                      className="mr-3 accent-[#37353E]"
                    />
                    <div className={`p-2 rounded-lg ${type.color} mr-3`}>
                      <type.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#37353E]">{type.name}</p>
                      <p className="text-xs text-[#715A5A]">{type.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-[#715A5A] mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent text-[#37353E] bg-white"
              >
                <option value="last-week">Last Week</option>
                <option value="last-month">Last Month</option>
                <option value="last-quarter">Last Quarter</option>
                <option value="last-year">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerateReport}
              disabled={!selectedReportType || isGenerating}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                selectedReportType && !isGenerating
                  ? 'bg-[#37353E] text-white hover:bg-[#44444E]'
                  : 'bg-[#D3DAD9] text-[#715A5A] cursor-not-allowed'
              }`}
            >
              {isGenerating ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Report...
                </div>
              ) : (
                'Generate Report'
              )}
            </button>
          </div>
        </motion.div>

        {/* Recent Reports */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm border border-[#D3DAD9]"
        >
          <div className="p-6 border-b border-[#D3DAD9]">
            <h3 className="text-lg font-semibold text-[#37353E]">Recent Reports</h3>
            <p className="text-sm text-[#715A5A] mt-1">Download previously generated reports</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {generatedReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 bg-[#D3DAD9]/20 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#37353E] mb-1">{report.name}</p>
                    <div className="flex items-center text-xs text-[#715A5A] space-x-4">
                      <span>{report.type}</span>
                      <span>•</span>
                      <span>{report.generatedDate}</span>
                      <span>•</span>
                      <span>{report.size}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      {report.status}
                    </span>
                    <button 
                      onClick={() => downloadReport(report)}
                      className="p-2 text-[#44444E] hover:text-[#37353E] hover:bg-[#D3DAD9] rounded-lg transition-colors"
                      title="Download Report"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Analytics Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]"
      >
        <h3 className="text-lg font-semibold text-[#37353E] mb-6">Analytics Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-[#D3DAD9]/20 rounded-lg">
            <ChartBarIcon className="h-12 w-12 text-[#37353E] mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-[#37353E] mb-2">Revenue Trends</h4>
            <p className="text-sm text-[#715A5A]">Track revenue growth and identify patterns over time</p>
          </div>
          <div className="text-center p-6 bg-[#D3DAD9]/20 rounded-lg">
            <UsersIcon className="h-12 w-12 text-[#37353E] mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-[#37353E] mb-2">Customer Insights</h4>
            <p className="text-sm text-[#715A5A]">Understand customer behavior and preferences</p>
          </div>
          <div className="text-center p-6 bg-[#D3DAD9]/20 rounded-lg">
            <BuildingStorefrontIcon className="h-12 w-12 text-[#37353E] mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-[#37353E] mb-2">Vendor Performance</h4>
            <p className="text-sm text-[#715A5A]">Monitor vendor metrics and performance indicators</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}