"use client";

import React, { useState } from "react";
import {
  CurrencyDollarIcon,
  CalendarIcon,
  ChartBarIcon,
  BanknotesIcon,
  CreditCardIcon,
  ArrowDownTrayIcon
} from "@heroicons/react/24/outline";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/outline";

// Mock data
const mockEarnings = {
  overview: {
    totalEarnings: 15420.50,
    thisMonth: 3240.75,
    lastMonth: 2890.25,
    pendingPayouts: 1250.00,
    availableBalance: 2150.75
  },
  monthlyData: [
    { month: "Jan 2024", earnings: 2890.25, orders: 45, avgOrder: 64.23 },
    { month: "Feb 2024", earnings: 3240.75, orders: 52, avgOrder: 62.32 },
    { month: "Mar 2024", earnings: 2750.50, orders: 41, avgOrder: 67.08 },
    { month: "Apr 2024", earnings: 3180.00, orders: 48, avgOrder: 66.25 },
    { month: "May 2024", earnings: 3359.00, orders: 55, avgOrder: 61.07 }
  ],
  recentPayouts: [
    {
      id: "PAY-001",
      amount: 2890.25,
      date: "2024-01-31",
      status: "completed",
      method: "Bank Transfer",
      reference: "TXN-789123"
    },
    {
      id: "PAY-002", 
      amount: 2750.50,
      date: "2024-02-29",
      status: "completed",
      method: "PayPal",
      reference: "PP-456789"
    },
    {
      id: "PAY-003",
      amount: 3180.00,
      date: "2024-03-31",
      status: "pending",
      method: "Bank Transfer",
      reference: "TXN-123456"
    }
  ],
  topProducts: [
    {
      name: "Professional Camera Kit",
      earnings: 2250.00,
      orders: 18,
      avgRental: 125.00
    },
    {
      name: "Party Sound System",
      earnings: 1800.00,
      orders: 12,
      avgRental: 150.00
    },
    {
      name: "Projector & Screen",
      earnings: 1320.00,
      orders: 15,
      avgRental: 88.00
    },
    {
      name: "Power Drill Set",
      earnings: 675.00,
      orders: 25,
      avgRental: 27.00
    }
  ]
};

const getPayoutStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return { bg: "#dcfce7", text: "#16a34a" };
    case "pending":
      return { bg: "#fef3c7", text: "#d97706" };
    case "failed":
      return { bg: "#fee2e2", text: "#dc2626" };
    default:
      return { bg: "var(--light-sage)", text: "var(--dark-charcoal)" };
  }
};

export default function VendorEarnings() {
  const [selectedPeriod, setSelectedPeriod] = useState("thisMonth");

  const handleRequestPayout = () => {
    // In a real app, this would initiate a payout request
    alert("Payout request submitted! You'll receive confirmation within 24 hours.");
  };

  const handleDownloadReport = () => {
    // In a real app, this would generate and download an earnings report
    alert("Downloading earnings report...");
  };

  const monthlyGrowth = ((mockEarnings.overview.thisMonth - mockEarnings.overview.lastMonth) / mockEarnings.overview.lastMonth * 100);
  const isGrowthPositive = monthlyGrowth > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">
            Earnings Dashboard
          </h1>
          <p className="mt-2 text-secondary-600">
            Track your rental income and manage payouts
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button
            onClick={handleDownloadReport}
            className="inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-90 bg-primary-100 text-primary-600"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Download Report
          </button>
          <button
            onClick={handleRequestPayout}
            className="inline-flex items-center px-6 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg transform hover:scale-105 bg-gradient-to-r from-primary-600 to-primary-700"
          >
            <BanknotesIcon className="h-5 w-5 mr-2" />
            Request Payout
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
              <CurrencyDollarIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className={`flex items-center text-sm font-medium ${
              isGrowthPositive ? "text-green-600" : "text-red-600"
            }`}>
              {isGrowthPositive ? (
                <ArrowUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 mr-1" />
              )}
              {Math.abs(monthlyGrowth).toFixed(1)}%
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1 text-secondary-900">
            ${mockEarnings.overview.thisMonth.toLocaleString()}
          </h3>
          <p className="text-sm text-secondary-600">
            This Month
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <BanknotesIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1 text-secondary-900">
            ${mockEarnings.overview.totalEarnings.toLocaleString()}
          </h3>
          <p className="text-sm text-secondary-600">
            Total Earnings
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
              <CalendarIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1 text-secondary-900">
            ${mockEarnings.overview.pendingPayouts.toLocaleString()}
          </h3>
          <p className="text-sm text-secondary-600">
            Pending Payouts
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <CreditCardIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1 text-secondary-900">
            ${mockEarnings.overview.availableBalance.toLocaleString()}
          </h3>
          <p className="text-sm text-secondary-600">
            Available Balance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Earnings Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-secondary-900">
              Monthly Earnings
            </h2>
            <ChartBarIcon className="h-6 w-6 text-primary-600" />
          </div>
          
          <div className="space-y-4">
            {mockEarnings.monthlyData.map((month, index) => {
              const maxEarnings = Math.max(...mockEarnings.monthlyData.map(m => m.earnings));
              const widthPercentage = (month.earnings / maxEarnings) * 100;
              
              return (
                <div key={month.month} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-secondary-900">
                      {month.month}
                    </span>
                    <span className="text-sm font-bold text-primary-600">
                      ${month.earnings.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${widthPercentage}%`,
                        background: `linear-gradient(135deg, var(--medium-gray) 0%, var(--dark-charcoal) 100%)`
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-secondary-600">
                    <span>{month.orders} orders</span>
                    <span>Avg: ${month.avgOrder}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Earning Products */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-secondary-900">
              Top Earning Products
            </h2>
            <ArrowUpIcon className="h-6 w-6 text-primary-600" />
          </div>
          
          <div className="space-y-4">
            {mockEarnings.topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between p-4 rounded-lg hover:shadow-md transition-shadow bg-secondary-100">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 bg-primary-600 text-white">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-secondary-900">
                      {product.name}
                    </h4>
                    <p className="text-sm text-secondary-600">
                      {product.orders} orders • Avg: ${product.avgRental}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-primary-600">
                    ${product.earnings.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Payouts */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-secondary-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-secondary-900">
              Recent Payouts
            </h2>
            <BanknotesIcon className="h-6 w-6 text-primary-600" />
          </div>
        </div>
        
        <div className="divide-y divide-secondary-200">
          {mockEarnings.recentPayouts.map((payout) => {
            const statusColor = getPayoutStatusColor(payout.status);
            
            return (
              <div key={payout.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center mr-4">
                      <CreditCardIcon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <div className="flex items-center mb-1">
                        <h4 className="font-semibold mr-3 text-secondary-900">
                          {payout.id}
                        </h4>
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                        >
                          {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-secondary-600">
                        {payout.method} • {payout.reference}
                      </p>
                      <p className="text-sm text-secondary-600">
                        {new Date(payout.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary-600">
                      ${payout.amount.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payout Information */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-secondary-900">
          Payout Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-lg bg-secondary-100">
            <h3 className="font-semibold mb-2 text-secondary-900">
              Payout Schedule
            </h3>
            <p className="text-sm text-secondary-600">
              Payouts are processed monthly on the last business day. Minimum payout amount is $100.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-secondary-100">
            <h3 className="font-semibold mb-2 text-secondary-900">
              Processing Time
            </h3>
            <p className="text-sm text-secondary-600">
              Bank transfers: 3-5 business days<br />
              PayPal: 1-2 business days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}