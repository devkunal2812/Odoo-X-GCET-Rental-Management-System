"use client";

import React from "react";
import { useState } from "react";
import Link from "next/link";
import { 
  PlusIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  PrinterIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon
} from "@heroicons/react/24/outline";
import { generateInvoicePDF, generateSampleInvoiceData } from "../../../lib/invoiceGenerator";

// Mock orders data
const mockOrders = [
  {
    id: "ORD-001",
    reference: "RO-2024-001",
    customer: { name: "John Smith", email: "john@example.com" },
    product: "Professional Camera Kit",
    totalAmount: 75,
    rentalDuration: "3 days",
    status: "quotation" as const,
    orderDate: "2024-01-20",
    vendor: "TechRent Pro"
  },
  {
    id: "ORD-002",
    reference: "RO-2024-002", 
    customer: { name: "Sarah Johnson", email: "sarah@example.com" },
    product: "Power Drill Set",
    totalAmount: 160,
    rentalDuration: "1 week",
    status: "quotation_sent" as const,
    orderDate: "2024-01-19",
    vendor: "TechRent Pro"
  },
  {
    id: "ORD-003",
    reference: "RO-2024-003",
    customer: { name: "Mike Davis", email: "mike@example.com" },
    product: "Party Sound System",
    totalAmount: 200,
    rentalDuration: "2 days",
    status: "sale_order" as const,
    orderDate: "2024-01-18",
    vendor: "TechRent Pro"
  },
  {
    id: "ORD-004",
    reference: "RO-2024-004",
    customer: { name: "Lisa Wilson", email: "lisa@example.com" },
    product: "Mountain Bike",
    totalAmount: 90,
    rentalDuration: "3 days",
    status: "confirmed" as const,
    orderDate: "2024-01-17",
    vendor: "TechRent Pro"
  },
  {
    id: "ORD-005",
    reference: "RO-2024-005",
    customer: { name: "Tom Brown", email: "tom@example.com" },
    product: "Projector & Screen",
    totalAmount: 120,
    rentalDuration: "1 day",
    status: "invoiced" as const,
    orderDate: "2024-01-16",
    vendor: "TechRent Pro"
  },
  {
    id: "ORD-006",
    reference: "RO-2024-006",
    customer: { name: "Emma Davis", email: "emma@example.com" },
    product: "Lawn Mower",
    totalAmount: 60,
    rentalDuration: "2 days",
    status: "cancelled" as const,
    orderDate: "2024-01-15",
    vendor: "TechRent Pro"
  }
];

const statusColumns = [
  { id: "quotation", name: "Quotation", color: "bg-yellow-100 border-yellow-300" },
  { id: "quotation_sent", name: "Quotation Sent", color: "bg-blue-100 border-blue-300" },
  { id: "sale_order", name: "Sale Order", color: "bg-purple-100 border-purple-300" },
  { id: "confirmed", name: "Confirmed", color: "bg-green-100 border-green-300" },
  { id: "invoiced", name: "Invoiced", color: "bg-indigo-100 border-indigo-300" },
  { id: "cancelled", name: "Cancelled", color: "bg-red-100 border-red-300" }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "quotation": return "bg-yellow-100 text-yellow-800";
    case "quotation_sent": return "bg-blue-100 text-blue-800";
    case "sale_order": return "bg-purple-100 text-purple-800";
    case "confirmed": return "bg-green-100 text-green-800";
    case "invoiced": return "bg-indigo-100 text-indigo-800";
    case "cancelled": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export default function OrdersPage() {
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getOrdersByStatus = (status: string) => {
    return filteredOrders.filter(order => order.status === status);
  };

  const handleDownloadInvoice = (orderId: string) => {
    try {
      // Generate sample invoice data (in real app, this would come from API)
      const invoiceData = generateSampleInvoiceData(`INV-${orderId.split('-')[1]}`);
      
      // Find the actual order from mockOrders to get real data
      const actualOrder = mockOrders.find(order => order.id === orderId);
      if (actualOrder) {
        // Update the sample data with actual order data
        invoiceData.id = `INV-${orderId}`;
        invoiceData.orderId = actualOrder.reference;
        invoiceData.product = actualOrder.product;
        invoiceData.vendor = actualOrder.vendor;
        invoiceData.amount = actualOrder.totalAmount;
        invoiceData.total = actualOrder.totalAmount + (actualOrder.totalAmount * 0.18) + 25; // Add tax and service fee
        invoiceData.status = actualOrder.status === 'invoiced' ? 'paid' : 'pending';
        invoiceData.rentalPeriod = actualOrder.rentalDuration;
        
        // Update customer info
        invoiceData.customerInfo.name = actualOrder.customer.name;
        invoiceData.customerInfo.email = actualOrder.customer.email;
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage your rental orders and quotations</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link
            href="/dashboard/orders/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Order
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("kanban")}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  viewMode === "kanban" 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Kanban
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  viewMode === "list" 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                List
              </button>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              {statusColumns.map(status => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {statusColumns.map(column => (
            <div key={column.id} className={`rounded-lg border-2 ${column.color} min-h-96`}>
              <div className="p-4 border-b border-gray-200 bg-white rounded-t-lg">
                <h3 className="font-semibold text-gray-900">{column.name}</h3>
                <p className="text-sm text-gray-600">
                  {getOrdersByStatus(column.id).length} orders
                </p>
              </div>
              <div className="p-4 space-y-3">
                {getOrdersByStatus(column.id).map(order => (
                  <div key={order.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{order.reference}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{order.customer.name}</p>
                    <p className="text-sm text-gray-500 mb-2">{order.product}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-gray-900">₹{order.totalAmount}</span>
                      <span className="text-gray-500">{order.rentalDuration}</span>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="flex-1 bg-blue-600 text-white text-xs py-1 px-2 rounded text-center hover:bg-blue-700"
                      >
                        View
                      </Link>
                      <button className="bg-gray-100 text-gray-600 text-xs py-1 px-2 rounded hover:bg-gray-200">
                        Edit
                      </button>
                      {(order.status === 'invoiced' || order.status === 'confirmed') && (
                        <button 
                          onClick={() => handleDownloadInvoice(order.id)}
                          className="bg-green-100 text-green-600 text-xs py-1 px-2 rounded hover:bg-green-200"
                          title="Download Invoice"
                        >
                          PDF
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.reference}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.customer.name}</div>
                      <div className="text-sm text-gray-500">{order.customer.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.product}</div>
                      <div className="text-sm text-gray-500">{order.rentalDuration}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₹{order.totalAmount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.orderDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                        <button className="text-gray-600 hover:text-gray-900">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <PrinterIcon className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <DocumentTextIcon className="h-4 w-4" />
                        </button>
                        {(order.status === 'invoiced' || order.status === 'confirmed') && (
                          <button 
                            onClick={() => handleDownloadInvoice(order.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Download Invoice"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
