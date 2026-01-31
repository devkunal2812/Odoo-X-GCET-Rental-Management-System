"use client";

import React from "react";
import { 
  ShoppingBagIcon, 
  CubeIcon, 
  UsersIcon, 
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarIcon,
  ArrowDownTrayIcon
} from "@heroicons/react/24/outline";
import { generateInvoicePDF, generateSampleInvoiceData } from "../../lib/invoiceGenerator";

// Mock data
const stats = [
  {
    name: "Total Orders",
    value: "156",
    change: "+12%",
    changeType: "increase" as const,
    icon: ShoppingBagIcon
  },
  {
    name: "Active Rentals",
    value: "89",
    change: "+8%", 
    changeType: "increase" as const,
    icon: CubeIcon
  },
  {
    name: "Total Customers",
    value: "234",
    change: "+15%",
    changeType: "increase" as const,
    icon: UsersIcon
  },
  {
    name: "Revenue",
    value: "₹12,450",
    change: "-3%",
    changeType: "decrease" as const,
    icon: CurrencyDollarIcon
  }
];

const recentOrders = [
  {
    id: "ORD-001",
    customer: "John Smith",
    product: "Professional Camera Kit",
    amount: "$75",
    status: "confirmed" as const,
    date: "2024-01-20"
  },
  {
    id: "ORD-002", 
    customer: "Sarah Johnson",
    product: "Power Drill Set",
    amount: "$160",
    status: "invoiced" as const,
    date: "2024-01-19"
  },
  {
    id: "ORD-003",
    customer: "Mike Davis",
    product: "Party Sound System",
    amount: "$200",
    status: "quotation" as const,
    date: "2024-01-18"
  },
  {
    id: "ORD-004",
    customer: "Lisa Wilson",
    product: "Mountain Bike",
    amount: "$90",
    status: "confirmed" as const,
    date: "2024-01-17"
  }
];

const lowStockProducts = [
  { name: "Professional Camera Kit", stock: 2, threshold: 5 },
  { name: "Power Drill Set", stock: 1, threshold: 3 },
  { name: "Projector & Screen", stock: 3, threshold: 5 }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "quotation": return "bg-yellow-100 text-yellow-800";
    case "confirmed": return "bg-green-100 text-green-800";
    case "invoiced": return "bg-blue-100 text-blue-800";
    case "cancelled": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export default function DashboardPage() {
  const handleDownloadInvoice = (orderId: string) => {
    try {
      // Generate sample invoice data (in real app, this would come from API)
      const invoiceData = generateSampleInvoiceData(`INV-${orderId.split('-')[1]}`);
      
      // Find the actual order from recentOrders to get real data
      const actualOrder = recentOrders.find(order => order.id === orderId);
      if (actualOrder) {
        // Update the sample data with actual order data
        invoiceData.id = `INV-${orderId}`;
        invoiceData.orderId = actualOrder.id;
        invoiceData.product = actualOrder.product;
        invoiceData.amount = parseInt(actualOrder.amount.replace('₹', ''));
        invoiceData.total = invoiceData.amount + (invoiceData.amount * 0.18) + 25; // Add tax and service fee
        invoiceData.status = actualOrder.status === 'invoiced' ? 'paid' : 'pending';
        
        // Update customer info
        invoiceData.customerInfo.name = actualOrder.customer;
        invoiceData.customerInfo.email = 'customer@email.com';
        invoiceData.customerInfo.phone = '+91 98765 43210';
        invoiceData.customerInfo.address = '123, Customer Address, City, State - 560001';
      }
      
      // Generate and download PDF
      generateInvoicePDF(invoiceData);
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successMessage.textContent = `Invoice for ${orderId} downloaded successfully!`;
      document.body.appendChild(successMessage);
      
      // Remove success message after 3 seconds
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // Show error message
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      errorMessage.textContent = 'Error generating PDF. Please try again.';
      document.body.appendChild(errorMessage);
      
      // Remove error message after 3 seconds
      setTimeout(() => {
        document.body.removeChild(errorMessage);
      }, 3000);
    }
  };
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
        <p className="text-secondary-600">Welcome back! Here's what's happening with your rental business.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">{stat.name}</p>
                <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary-400">
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stat.changeType === "increase" ? (
                <ArrowUpIcon className="h-4 w-4 mr-1 text-primary-600" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 mr-1 text-secondary-600" />
              )}
              <span className={`text-sm font-medium ${
                stat.changeType === "increase" ? 'text-primary-600' : 'text-secondary-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm ml-1 text-secondary-600">from last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-secondary-300">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-secondary-900">Recent Orders</h2>
              <a href="/dashboard/orders" className="text-sm font-medium hover:opacity-80 transition-opacity text-primary-600">
                View all
              </a>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-0 border-secondary-300">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-secondary-900">{order.id}</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-secondary-600">{order.customer}</p>
                    <p className="text-sm text-secondary-600">{order.product}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-secondary-900">{order.amount}</p>
                    <p className="text-sm text-secondary-600">{order.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-secondary-300">
            <h2 className="text-lg font-semibold text-secondary-900">Low Stock Alert</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {lowStockProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b last:border-0 border-secondary-300">
                  <div>
                    <p className="font-medium text-secondary-900">{product.name}</p>
                    <p className="text-sm text-secondary-600">Threshold: {product.threshold} units</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white bg-primary-600">
                      {product.stock} left
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <a href="/dashboard/products" className="text-sm font-medium hover:opacity-80 transition-opacity text-primary-600">
                Manage inventory →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4 text-secondary-900">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/dashboard/orders/new"
            className="flex items-center justify-center p-4 border-2 border-dashed border-secondary-400 rounded-lg hover:opacity-80 transition-colors"
          >
            <div className="text-center">
              <ShoppingBagIcon className="h-8 w-8 mx-auto mb-2 text-secondary-400" />
              <p className="text-sm font-medium text-secondary-600">Create New Order</p>
            </div>
          </a>
          <a
            href="/dashboard/products/new"
            className="flex items-center justify-center p-4 border-2 border-dashed border-secondary-400 rounded-lg hover:opacity-80 transition-colors"
          >
            <div className="text-center">
              <CubeIcon className="h-8 w-8 mx-auto mb-2 text-secondary-400" />
              <p className="text-sm font-medium text-secondary-600">Add New Product</p>
            </div>
          </a>
          <a
            href="/dashboard/reports"
            className="flex items-center justify-center p-4 border-2 border-dashed border-secondary-400 rounded-lg hover:opacity-80 transition-colors"
          >
            <div className="text-center">
              <ChartBarIcon className="h-8 w-8 mx-auto mb-2 text-secondary-400" />
              <p className="text-sm font-medium text-secondary-600">View Reports</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
