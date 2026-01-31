"use client";

import React, { useState } from 'react';
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

const reportTypes = [
  {
    id: 'revenue',
    name: 'Revenue Report',
    description: 'Detailed revenue analysis by period',
    icon: CurrencyDollarIcon,
    color: 'bg-green-500'
  },
  {
    id: 'customers',
    name: 'Customer Report',
    description: 'Customer acquisition and retention metrics',
    icon: UsersIcon,
    color: 'bg-blue-500'
  },
  {
    id: 'vendors',
    name: 'Vendor Report',
    description: 'Vendor performance and analytics',
    icon: BuildingStorefrontIcon,
    color: 'bg-purple-500'
  },
  {
    id: 'orders',
    name: 'Order Report',
    description: 'Order trends and fulfillment metrics',
    icon: ChartBarIcon,
    color: 'bg-orange-500'
  }
];

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
  const [selectedReportType, setSelectedReportType] = useState('');
  const [dateRange, setDateRange] = useState('last-month');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = () => {
    if (!selectedReportType) return;
    
    setIsGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      alert('Report generated successfully!');
    }, 2000);
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
                      onChange={(e) => setSelectedReportType(e.target.value)}
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
                className="w-full px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent"
              >
                <option value="last-week">Last Week</option>
                <option value="last-month">Last Month</option>
                <option value="last-quarter">Last Quarter</option>
                <option value="last-year">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

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
              {recentReports.map((report) => (
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
                    <button className="p-2 text-[#44444E] hover:text-[#37353E] hover:bg-[#D3DAD9] rounded-lg transition-colors">
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