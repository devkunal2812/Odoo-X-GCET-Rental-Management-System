"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  BuildingStorefrontIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { reportService } from '@/app/lib/services/reports';
import type { AdminSummaryReport } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';

const StatCard = ({ title, value, icon: Icon, color }: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl shadow-sm p-6 border border-[#D3DAD9]"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-[#715A5A]">{title}</p>
        <p className="text-3xl font-bold text-[#37353E] mt-2">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </motion.div>
);

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminSummaryReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await reportService.getAdminReport('summary');
        setStats(response as AdminSummaryReport);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#37353E] mb-4"></div>
        <p className="text-[#715A5A]">Loading dashboard data...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center bg-white rounded-xl shadow-sm p-8 border border-[#D3DAD9]">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4 text-lg font-medium">{error || 'Failed to load dashboard'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#37353E] to-[#44444E] rounded-xl p-6 text-white"
      >
        <h1 className="text-3xl font-bold mb-2">Welcome to Admin Dashboard</h1>
        <p className="text-[#D3DAD9]">
          Complete system overview and management controls at your fingertips
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.metrics.totalVendors + stats.metrics.totalCustomers}
          icon={UsersIcon}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Vendors"
          value={stats.metrics.totalVendors}
          icon={BuildingStorefrontIcon}
          color="bg-green-500"
        />
        <StatCard
          title="Total Products"
          value={stats.metrics.totalProducts}
          icon={CubeIcon}
          color="bg-purple-500"
        />
        <StatCard
          title="Total Orders"
          value={stats.metrics.totalOrders}
          icon={ClipboardDocumentListIcon}
          color="bg-orange-500"
        />
      </div>

      {/* Revenue and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Revenue"
          value={`Rs. ${stats.metrics.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={CurrencyDollarIcon}
          color="bg-green-600"
        />
        <StatCard
          title="Active Reservations"
          value={stats.metrics.activeReservations}
          icon={CheckCircleIcon}
          color="bg-blue-500"
        />
        <StatCard
          title="Late Returns"
          value={stats.metrics.lateReturns}
          icon={ExclamationTriangleIcon}
          color={stats.metrics.lateReturns > 0 ? "bg-red-500" : "bg-gray-400"}
        />
      </div>

      {/* Order Status Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm p-6 border border-[#D3DAD9]"
      >
        <h3 className="text-lg font-semibold text-[#37353E] mb-4">Orders by Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.ordersByStatus.map((statusData) => {
            const statusColors: Record<string, string> = {
              QUOTATION: 'bg-yellow-100 text-yellow-800',
              SENT: 'bg-blue-100 text-blue-800',
              CONFIRMED: 'bg-green-100 text-green-800',
              INVOICED: 'bg-purple-100 text-purple-800',
              PICKED_UP: 'bg-orange-100 text-orange-800',
              RETURNED: 'bg-gray-100 text-gray-800',
              CANCELLED: 'bg-red-100 text-red-800',
            };
            const colorClass = statusColors[statusData.status] || 'bg-gray-100 text-gray-800';
            
            return (
              <div key={statusData.status} className={`p-4 rounded-lg ${colorClass}`}>
                <p className="text-sm font-medium mb-1">{statusData.status}</p>
                <p className="text-2xl font-bold">{statusData.count}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm p-6 border border-[#D3DAD9]"
      >
        <h3 className="text-lg font-semibold text-[#37353E] mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/users"
            className="flex items-center justify-center p-4 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors"
          >
            <UsersIcon className="h-5 w-5 mr-2" />
            Manage Users
          </a>
          <a
            href="/admin/vendors"
            className="flex items-center justify-center p-4 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors"
          >
            <BuildingStorefrontIcon className="h-5 w-5 mr-2" />
            Manage Vendors
          </a>
          <a
            href="/admin/reports"
            className="flex items-center justify-center p-4 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors"
          >
            <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
            View Reports
          </a>
        </div>
      </motion.div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm p-6 border border-[#D3DAD9]"
      >
        <h3 className="text-lg font-semibold text-[#37353E] mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="h-6 w-6 text-green-500" />
            <div>
              <p className="font-medium text-[#37353E]">Database</p>
              <p className="text-sm text-[#715A5A]">Operational</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="h-6 w-6 text-green-500" />
            <div>
              <p className="font-medium text-[#37353E]">Payment Gateway</p>
              <p className="text-sm text-[#715A5A]">Operational</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="h-6 w-6 text-green-500" />
            <div>
              <p className="font-medium text-[#37353E]">Email Service</p>
              <p className="text-sm text-[#715A5A]">Operational</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
