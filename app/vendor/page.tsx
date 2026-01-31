"use client";

import React from "react";
import Link from "next/link";
import {
  CubeIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  TruckIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon
} from "@heroicons/react/24/outline";

// Mock data
const dashboardStats = [
  {
    title: "Total Products",
    value: "24",
    change: "+3",
    changeType: "increase",
    icon: CubeIcon,
    href: "/vendor/products"
  },
  {
    title: "Active Orders",
    value: "18",
    change: "+5",
    changeType: "increase", 
    icon: ClipboardDocumentListIcon,
    href: "/vendor/orders"
  },
  {
    title: "Monthly Earnings",
    value: "$3,240",
    change: "+12%",
    changeType: "increase",
    icon: CurrencyDollarIcon,
    href: "/vendor/earnings"
  },
  {
    title: "Pending Pickups",
    value: "7",
    change: "-2",
    changeType: "decrease",
    icon: TruckIcon,
    href: "/vendor/logistics"
  }
];

const recentOrders = [
  {
    id: "ORD-001",
    customer: "John Smith",
    product: "Professional Camera Kit",
    amount: "$150",
    status: "confirmed",
    date: "2024-01-30",
    duration: "3 days"
  },
  {
    id: "ORD-002", 
    customer: "Sarah Johnson",
    product: "Power Drill Set",
    amount: "$45",
    status: "in-progress",
    date: "2024-01-29",
    duration: "1 day"
  },
  {
    id: "ORD-003",
    customer: "Mike Wilson",
    product: "Party Sound System", 
    amount: "$200",
    status: "completed",
    date: "2024-01-28",
    duration: "2 days"
  },
  {
    id: "ORD-004",
    customer: "Emily Davis",
    product: "Mountain Bike",
    amount: "$90",
    status: "pending",
    date: "2024-01-27",
    duration: "3 days"
  }
];

const topProducts = [
  {
    name: "Professional Camera Kit",
    rentals: 45,
    revenue: "$1,125",
    rating: 4.8
  },
  {
    name: "Power Drill Set", 
    rentals: 38,
    revenue: "$570",
    rating: 4.6
  },
  {
    name: "Party Sound System",
    rentals: 32,
    revenue: "$1,600",
    rating: 4.9
  },
  {
    name: "Mountain Bike",
    rentals: 28,
    revenue: "$840",
    rating: 4.7
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return { bg: "#dcfce7", text: "#16a34a" };
    case "in-progress":
      return { bg: "#fef3c7", text: "#d97706" };
    case "completed":
      return { bg: "#dbeafe", text: "#2563eb" };
    case "pending":
      return { bg: "#fee2e2", text: "#dc2626" };
    default:
      return { bg: "#f0f9ff", text: "#1e40af" };
  }
};

export default function VendorDashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      {/* <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-xl p-8">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-2">Welcome to Your Dashboard</h1>
          <p className="text-lg opacity-90">
            Manage your rental business efficiently
          </p>
        </div>
      </div> */}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              href={stat.href}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-primary-100">
                  <Icon className="h-6 w-6 text-primary-600" />
                </div>
                <div className={`flex items-center text-sm font-medium ${
                  stat.changeType === "increase" ? "text-green-600" : "text-red-600"
                }`}>
                  {stat.changeType === "increase" ? (
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 mr-1" />
                  )}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1 text-secondary-900">
                {stat.value}
              </h3>
              <p className="text-sm text-secondary-600">
                {stat.title}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-secondary-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-secondary-900">
                Recent Orders
              </h2>
              <Link
                href="/vendor/orders"
                className="text-sm font-medium hover:opacity-80 transition-opacity text-primary-600"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="divide-y divide-secondary-200">
            {recentOrders.map((order) => {
              const statusColor = getStatusColor(order.status);
              return (
                <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="font-bold text-sm text-secondary-900">
                        {order.id}
                      </span>
                      <span
                        className="ml-3 px-2 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                      >
                        {order.status}
                      </span>
                    </div>
                    <span className="font-bold text-primary-600">
                      {order.amount}
                    </span>
                  </div>
                  <h4 className="font-medium mb-1 text-secondary-900">
                    {order.product}
                  </h4>
                  <div className="flex items-center justify-between text-sm text-secondary-600">
                    <span>{order.customer}</span>
                    <span>{order.duration}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-secondary-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-secondary-900">
                Top Performing Products
              </h2>
              <Link
                href="/vendor/analytics"
                className="text-sm font-medium hover:opacity-80 transition-opacity text-primary-600"
              >
                View Analytics
              </Link>
            </div>
          </div>
          <div className="divide-y divide-secondary-200">
            {topProducts.map((product, index) => (
              <div key={product.name} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 bg-primary-100 text-primary-600">
                      {index + 1}
                    </div>
                    <h4 className="font-medium text-secondary-900">
                      {product.name}
                    </h4>
                  </div>
                  <span className="font-bold text-primary-600">
                    {product.revenue}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-secondary-600">
                  <span>{product.rentals} rentals</span>
                  <div className="flex items-center">
                    <span className="text-yellow-400 mr-1">★</span>
                    <span>{product.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-6 text-secondary-900">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/vendor/products/new"
            className="flex items-center justify-center p-4 rounded-lg border-2 border-dashed border-primary-300 text-primary-600 transition-all hover:shadow-md hover:border-primary-400"
          >
            <CubeIcon className="h-6 w-6 mr-2" />
            Add New Product
          </Link>
          <Link
            href="/vendor/orders"
            className="flex items-center justify-center p-4 rounded-lg border-2 border-dashed border-primary-300 text-primary-600 transition-all hover:shadow-md hover:border-primary-400"
          >
            <EyeIcon className="h-6 w-6 mr-2" />
            View All Orders
          </Link>
          <Link
            href="/vendor/earnings"
            className="flex items-center justify-center p-4 rounded-lg border-2 border-dashed border-primary-300 text-primary-600 transition-all hover:shadow-md hover:border-primary-400"
          >
            <CurrencyDollarIcon className="h-6 w-6 mr-2" />
            Check Earnings
          </Link>
        </div>
      </div>
    </div>
  );
}