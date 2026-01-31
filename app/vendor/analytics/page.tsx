"use client";

import React, { useState } from "react";
import {
  ChartBarIcon,
  EyeIcon,
  UserGroupIcon,
  ClockIcon,
  StarIcon,
  CalendarIcon,
  ArrowDownTrayIcon
} from "@heroicons/react/24/outline";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/outline";

// Mock data
const mockAnalytics = {
  overview: {
    totalViews: 12450,
    totalBookings: 324,
    conversionRate: 2.6,
    avgRating: 4.7,
    repeatCustomers: 68,
    avgRentalDuration: 2.3
  },
  trends: {
    viewsChange: 15.2,
    bookingsChange: 8.7,
    conversionChange: -2.1,
    ratingChange: 0.3
  },
  monthlyData: [
    { month: "Jan", views: 1850, bookings: 45, revenue: 2890 },
    { month: "Feb", views: 2100, bookings: 52, revenue: 3240 },
    { month: "Mar", views: 1950, bookings: 41, revenue: 2750 },
    { month: "Apr", views: 2300, bookings: 48, revenue: 3180 },
    { month: "May", views: 2450, bookings: 55, revenue: 3359 },
    { month: "Jun", views: 2200, bookings: 49, revenue: 3100 }
  ],
  topProducts: [
    {
      name: "Professional Camera Kit",
      views: 2340,
      bookings: 45,
      conversionRate: 1.9,
      revenue: 2250,
      rating: 4.8
    },
    {
      name: "Party Sound System",
      views: 1890,
      bookings: 32,
      conversionRate: 1.7,
      revenue: 1800,
      rating: 4.9
    },
    {
      name: "Projector & Screen",
      views: 1650,
      bookings: 28,
      conversionRate: 1.7,
      revenue: 1320,
      rating: 4.5
    },
    {
      name: "Mountain Bike",
      views: 1420,
      bookings: 28,
      conversionRate: 2.0,
      revenue: 840,
      rating: 4.7
    },
    {
      name: "Power Drill Set",
      views: 980,
      bookings: 38,
      conversionRate: 3.9,
      revenue: 675,
      rating: 4.6
    }
  ],
  customerInsights: {
    demographics: [
      { age: "18-25", percentage: 15, bookings: 49 },
      { age: "26-35", percentage: 35, bookings: 113 },
      { age: "36-45", percentage: 28, bookings: 91 },
      { age: "46-55", percentage: 15, bookings: 49 },
      { age: "55+", percentage: 7, bookings: 22 }
    ],
    rentalDurations: [
      { duration: "1 day", percentage: 45, count: 146 },
      { duration: "2-3 days", percentage: 30, count: 97 },
      { duration: "4-7 days", percentage: 20, count: 65 },
      { duration: "1+ weeks", percentage: 5, count: 16 }
    ]
  }
};

export default function VendorAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("6months");
  const [selectedMetric, setSelectedMetric] = useState("bookings");

  const handleDownloadReport = () => {
    alert("Downloading analytics report...");
  };

  const getTrendColor = (change: number) => {
    return change > 0 ? "text-green-600" : "text-red-600";
  };

  const getTrendIcon = (change: number) => {
    return change > 0 ? ArrowUpIcon : ArrowDownIcon;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">
            Analytics Dashboard
          </h1>
          <p className="mt-2 text-secondary-600">
            Insights into your rental business performance
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border-2 border-secondary-200 rounded-lg focus:outline-none text-secondary-900"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
          <button
            onClick={handleDownloadReport}
            className="inline-flex items-center px-6 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg transform hover:scale-105 bg-gradient-to-r from-primary-600 to-primary-700"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <EyeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className={`flex items-center text-sm font-medium ${getTrendColor(mockAnalytics.trends.viewsChange)}`}>
              {React.createElement(getTrendIcon(mockAnalytics.trends.viewsChange), { className: "h-4 w-4 mr-1" })}
              {Math.abs(mockAnalytics.trends.viewsChange)}%
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1 text-secondary-900">
            {mockAnalytics.overview.totalViews.toLocaleString()}
          </h3>
          <p className="text-sm text-secondary-600">
            Total Views
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <CalendarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className={`flex items-center text-sm font-medium ${getTrendColor(mockAnalytics.trends.bookingsChange)}`}>
              {React.createElement(getTrendIcon(mockAnalytics.trends.bookingsChange), { className: "h-4 w-4 mr-1" })}
              {Math.abs(mockAnalytics.trends.bookingsChange)}%
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1 text-secondary-900">
            {mockAnalytics.overview.totalBookings}
          </h3>
          <p className="text-sm text-secondary-600">
            Total Bookings
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className={`flex items-center text-sm font-medium ${getTrendColor(mockAnalytics.trends.conversionChange)}`}>
              {React.createElement(getTrendIcon(mockAnalytics.trends.conversionChange), { className: "h-4 w-4 mr-1" })}
              {Math.abs(mockAnalytics.trends.conversionChange)}%
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1 text-secondary-900">
            {mockAnalytics.overview.conversionRate}%
          </h3>
          <p className="text-sm text-secondary-600">
            Conversion Rate
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
              <StarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className={`flex items-center text-sm font-medium ${getTrendColor(mockAnalytics.trends.ratingChange)}`}>
              {React.createElement(getTrendIcon(mockAnalytics.trends.ratingChange), { className: "h-4 w-4 mr-1" })}
              {Math.abs(mockAnalytics.trends.ratingChange)}
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1 text-secondary-900">
            {mockAnalytics.overview.avgRating}
          </h3>
          <p className="text-sm text-secondary-600">
            Average Rating
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-secondary-900">
              Performance Trends
            </h2>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-2 border-2 border-secondary-200 rounded-lg focus:outline-none text-sm text-secondary-900"
            >
              <option value="bookings">Bookings</option>
              <option value="views">Views</option>
              <option value="revenue">Revenue</option>
            </select>
          </div>
          
          <div className="space-y-4">
            {mockAnalytics.monthlyData.map((month) => {
              const maxValue = Math.max(...mockAnalytics.monthlyData.map(m => 
                selectedMetric === 'bookings' ? m.bookings : 
                selectedMetric === 'views' ? m.views : m.revenue
              ));
              const currentValue = selectedMetric === 'bookings' ? month.bookings : 
                                 selectedMetric === 'views' ? month.views : month.revenue;
              const widthPercentage = (currentValue / maxValue) * 100;
              
              return (
                <div key={month.month} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium" style={{ color: "var(--dark-charcoal)" }}>
                      {month.month}
                    </span>
                    <span className="text-sm font-bold" style={{ color: "var(--medium-gray)" }}>
                      {selectedMetric === 'revenue' ? `$${currentValue.toLocaleString()}` : currentValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${widthPercentage}%`,
                        background: selectedMetric === 'bookings' ? 
                          'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                          selectedMetric === 'views' ?
                          'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' :
                          'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products Performance */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-secondary-900">
              Product Performance
            </h2>
            <ChartBarIcon className="h-6 w-6 text-primary-600" />
          </div>
          
          <div className="space-y-4">
            {mockAnalytics.topProducts.map((product, index) => (
              <div key={product.name} className="p-4 rounded-lg hover:shadow-md transition-shadow bg-secondary-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 bg-primary-600 text-white">
                      {index + 1}
                    </div>
                    <h4 className="font-semibold text-secondary-900">
                      {product.name}
                    </h4>
                  </div>
                  <div className="flex items-center">
                    <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-sm font-medium text-secondary-600">
                      {product.rating}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-secondary-600">Views</p>
                    <p className="font-bold text-secondary-900">
                      {product.views.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-secondary-600">Bookings</p>
                    <p className="font-bold text-secondary-900">
                      {product.bookings}
                    </p>
                  </div>
                  <div>
                    <p className="text-secondary-600">Conv. Rate</p>
                    <p className="font-bold text-secondary-900">
                      {product.conversionRate}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Demographics */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-secondary-900">
              Customer Demographics
            </h2>
            <UserGroupIcon className="h-6 w-6 text-primary-600" />
          </div>
          
          <div className="space-y-4">
            {mockAnalytics.customerInsights.demographics.map((demo) => (
              <div key={demo.age} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-secondary-900">
                    {demo.age} years
                  </span>
                  <span className="text-sm font-bold text-primary-600">
                    {demo.percentage}% ({demo.bookings} bookings)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${demo.percentage}%`,
                      background: `linear-gradient(135deg, var(--medium-gray) 0%, var(--dark-charcoal) 100%)`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rental Duration Insights */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-secondary-900">
              Rental Duration Patterns
            </h2>
            <ClockIcon className="h-6 w-6 text-primary-600" />
          </div>
          
          <div className="space-y-4">
            {mockAnalytics.customerInsights.rentalDurations.map((duration) => (
              <div key={duration.duration} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-secondary-900">
                    {duration.duration}
                  </span>
                  <span className="text-sm font-bold text-primary-600">
                    {duration.percentage}% ({duration.count} rentals)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${duration.percentage}%`,
                      background: `linear-gradient(135deg, #10b981 0%, #059669 100%)`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-primary-100">
            <UserGroupIcon className="h-8 w-8 text-primary-600" />
          </div>
          <h3 className="text-2xl font-bold mb-2 text-secondary-900">
            {mockAnalytics.overview.repeatCustomers}
          </h3>
          <p className="text-sm text-secondary-600">
            Repeat Customers
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-primary-100">
            <ClockIcon className="h-8 w-8 text-primary-600" />
          </div>
          <h3 className="text-2xl font-bold mb-2 text-secondary-900">
            {mockAnalytics.overview.avgRentalDuration} days
          </h3>
          <p className="text-sm text-secondary-600">
            Avg Rental Duration
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-primary-100">
            <ArrowUpIcon className="h-8 w-8 text-primary-600" />
          </div>
          <h3 className="text-2xl font-bold mb-2 text-secondary-900">
            {((mockAnalytics.overview.totalBookings / mockAnalytics.overview.totalViews) * 100).toFixed(1)}%
          </h3>
          <p className="text-sm text-secondary-600">
            Overall Conversion
          </p>
        </div>
      </div>
    </div>
  );
}