"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

const stats = [
  {
    name: 'Total Customers',
    value: '2,847',
    change: '+12%',
    changeType: 'increase',
    icon: UsersIcon,
  },
  {
    name: 'Active Vendors',
    value: '156',
    change: '+8%',
    changeType: 'increase',
    icon: BuildingStorefrontIcon,
  },
  {
    name: 'Total Revenue',
    value: '$1,234,567',
    change: '+23%',
    changeType: 'increase',
    icon: CurrencyDollarIcon,
  },
  {
    name: 'Total Orders',
    value: '8,945',
    change: '-2%',
    changeType: 'decrease',
    icon: ShoppingBagIcon,
  },
];

const recentOrders = [
  {
    id: 'ORD-001',
    customer: 'John Doe',
    vendor: 'TechRent Pro',
    amount: '$450',
    status: 'Completed',
    date: '2024-01-31',
  },
  {
    id: 'ORD-002',
    customer: 'Sarah Smith',
    vendor: 'ToolMaster',
    amount: '$280',
    status: 'In Progress',
    date: '2024-01-31',
  },
  {
    id: 'ORD-003',
    customer: 'Mike Johnson',
    vendor: 'EventPro',
    amount: '$750',
    status: 'Pending',
    date: '2024-01-30',
  },
  {
    id: 'ORD-004',
    customer: 'Lisa Chen',
    vendor: 'BikeRentals',
    amount: '$120',
    status: 'Completed',
    date: '2024-01-30',
  },
  {
    id: 'ORD-005',
    customer: 'David Wilson',
    vendor: 'UrbanRide',
    amount: '$95',
    status: 'Cancelled',
    date: '2024-01-29',
  },
];

const topVendors = [
  { name: 'TechRent Pro', revenue: '$45,230', orders: 234 },
  { name: 'ToolMaster', revenue: '$38,450', orders: 189 },
  { name: 'EventPro', revenue: '$32,100', orders: 156 },
  { name: 'BikeRentals', revenue: '$28,900', orders: 203 },
  { name: 'UrbanRide', revenue: '$19,800', orders: 94 },
];

export default function AdminDashboard() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#37353E] mb-2">Dashboard</h1>
        <p className="text-[#715A5A]">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]"
          >
            <div className="flex items-center justify-between">
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
                  <span className="text-sm text-[#715A5A] ml-1">vs last month</span>
                </div>
              </div>
              <div className="p-3 bg-[#D3DAD9] rounded-lg">
                <stat.icon className="h-6 w-6 text-[#44444E]" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-[#D3DAD9]"
        >
          <div className="p-6 border-b border-[#D3DAD9]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#37353E]">Recent Orders</h3>
              <DocumentTextIcon className="h-5 w-5 text-[#715A5A]" />
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-[#D3DAD9]/20 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-[#37353E]">{order.id}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'Completed' 
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-[#715A5A]">{order.customer} • {order.vendor}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm font-semibold text-[#37353E]">{order.amount}</p>
                      <p className="text-xs text-[#715A5A]">{order.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Top Vendors */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-[#D3DAD9]"
        >
          <div className="p-6 border-b border-[#D3DAD9]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#37353E]">Top Vendors</h3>
              <ChartBarIcon className="h-5 w-5 text-[#715A5A]" />
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topVendors.map((vendor, index) => (
                <div key={vendor.name} className="flex items-center justify-between p-4 bg-[#D3DAD9]/20 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#37353E] to-[#44444E] flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#37353E]">{vendor.name}</p>
                      <p className="text-xs text-[#715A5A]">{vendor.orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#37353E]">{vendor.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]"
      >
        <h3 className="text-lg font-semibold text-[#37353E] mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors text-left">
            <UsersIcon className="h-6 w-6 mb-2" />
            <p className="font-medium">Manage Customers</p>
            <p className="text-sm opacity-80">View and manage customer accounts</p>
          </button>
          <button className="p-4 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors text-left">
            <BuildingStorefrontIcon className="h-6 w-6 mb-2" />
            <p className="font-medium">Approve Vendors</p>
            <p className="text-sm opacity-80">Review pending vendor applications</p>
          </button>
          <button className="p-4 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors text-left">
            <ChartBarIcon className="h-6 w-6 mb-2" />
            <p className="font-medium">View Reports</p>
            <p className="text-sm opacity-80">Generate detailed analytics reports</p>
          </button>
        </div>
      </motion.div>
    </div>
  );
}