"use client";

import React from 'react';
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
import { getDashboardStats, mockRentalOrders, mockInvoices } from '../../../lib/adminData';

const StatCard = ({ title, value, icon: Icon, color, trend }: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  trend?: string;
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
        {trend && (
          <p className="text-sm text-green-600 mt-1">{trend}</p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </motion.div>
);

export default function AdminDashboard() {
  const stats = getDashboardStats();

  const recentOrders = mockRentalOrders.slice(0, 5);
  const recentInvoices = mockInvoices.slice(0, 5);

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
          value={stats.totalUsers}
          icon={UsersIcon}
          color="bg-blue-500"
          trend="+12% this month"
        />
        <StatCard
          title="Active Vendors"
          value={stats.totalVendors}
          icon={BuildingStorefrontIcon}
          color="bg-green-500"
          trend="+3 new vendors"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={CubeIcon}
          color="bg-purple-500"
          trend="+8 this week"
        />
        <StatCard
          title="Active Orders"
          value={stats.activeOrders}
          icon={ClipboardDocumentListIcon}
          color="bg-orange-500"
        />
      </div>

      {/* Revenue and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          icon={CurrencyDollarIcon}
          color="bg-green-600"
          trend="+15% vs last month"
        />
        <StatCard
          title="Pending Vendors"
          value={stats.pendingVendors}
          icon={ExclamationTriangleIcon}
          color="bg-yellow-500"
        />
        <StatCard
          title="Overdue Invoices"
          value={stats.overdueInvoices}
          icon={ClockIcon}
          color="bg-red-500"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-[#D3DAD9]"
        >
          <h3 className="text-lg font-semibold text-[#37353E] mb-4">Recent Orders</h3>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-[#D3DAD9] rounded-lg">
                <div>
                  <p className="font-medium text-[#37353E]">{order.productName}</p>
                  <p className="text-sm text-[#715A5A]">{order.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#37353E]">${order.totalAmount}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    order.status === 'active' ? 'bg-green-100 text-green-800' :
                    order.status === 'returned' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Invoices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-[#D3DAD9]"
        >
          <h3 className="text-lg font-semibold text-[#37353E] mb-4">Recent Invoices</h3>
          <div className="space-y-4">
            {recentInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 bg-[#D3DAD9] rounded-lg">
                <div>
                  <p className="font-medium text-[#37353E]">#{invoice.id}</p>
                  <p className="text-sm text-[#715A5A]">{invoice.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#37353E]">${invoice.total}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                    invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm p-6 border border-[#D3DAD9]"
      >
        <h3 className="text-lg font-semibold text-[#37353E] mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors">
            <UsersIcon className="h-5 w-5 mr-2" />
            Manage Users
          </button>
          <button className="flex items-center justify-center p-4 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors">
            <BuildingStorefrontIcon className="h-5 w-5 mr-2" />
            Approve Vendors
          </button>
          <button className="flex items-center justify-center p-4 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors">
            <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
            View Reports
          </button>
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