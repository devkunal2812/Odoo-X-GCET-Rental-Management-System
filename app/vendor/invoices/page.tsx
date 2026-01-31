"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  DocumentTextIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

// Mock data
const mockInvoices = [
  {
    id: "INV-001",
    orderId: "ORD-001",
    customer: {
      name: "John Smith",
      email: "john.smith@email.com",
      address: "123 Main St, City, State 12345"
    },
    product: "Professional Camera Kit",
    amount: 150,
    tax: 12,
    total: 162,
    status: "paid",
    issueDate: "2024-01-30",
    dueDate: "2024-02-14",
    paidDate: "2024-01-31",
    rentalPeriod: "Feb 1-4, 2024"
  },
  {
    id: "INV-002",
    orderId: "ORD-002",
    customer: {
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      address: "456 Oak Ave, City, State 12345"
    },
    product: "Power Drill Set",
    amount: 45,
    tax: 3.6,
    total: 48.6,
    status: "pending",
    issueDate: "2024-01-29",
    dueDate: "2024-02-13",
    paidDate: null,
    rentalPeriod: "Jan 30-31, 2024"
  },
  {
    id: "INV-003",
    orderId: "ORD-003",
    customer: {
      name: "Mike Wilson",
      email: "mike.wilson@email.com",
      address: "789 Pine St, City, State 12345"
    },
    product: "Party Sound System",
    amount: 200,
    tax: 16,
    total: 216,
    status: "paid",
    issueDate: "2024-01-28",
    dueDate: "2024-02-12",
    paidDate: "2024-01-29",
    rentalPeriod: "Jan 29-31, 2024"
  },
  {
    id: "INV-004",
    orderId: "ORD-004",
    customer: {
      name: "Emily Davis",
      email: "emily.davis@email.com",
      address: "321 Elm St, City, State 12345"
    },
    product: "Mountain Bike",
    amount: 90,
    tax: 7.2,
    total: 97.2,
    status: "overdue",
    issueDate: "2024-01-27",
    dueDate: "2024-02-11",
    paidDate: null,
    rentalPeriod: "Feb 2-5, 2024"
  },
  {
    id: "INV-005",
    orderId: "ORD-005",
    customer: {
      name: "David Brown",
      email: "david.brown@email.com",
      address: "654 Maple Dr, City, State 12345"
    },
    product: "Projector & Screen",
    amount: 120,
    tax: 9.6,
    total: 129.6,
    status: "draft",
    issueDate: "2024-01-26",
    dueDate: "2024-02-10",
    paidDate: null,
    rentalPeriod: "Jan 28-30, 2024"
  }
];

const statusOptions = ["All", "Draft", "Pending", "Paid", "Overdue"];

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
      return { bg: "#dcfce7", text: "#16a34a", icon: CheckCircleIcon };
    case "pending":
      return { bg: "#fef3c7", text: "#d97706", icon: ClockIcon };
    case "overdue":
      return { bg: "#fee2e2", text: "#dc2626", icon: ExclamationTriangleIcon };
    case "draft":
      return { bg: "#f3f4f6", text: "#6b7280", icon: DocumentTextIcon };
    default:
      return { bg: "var(--light-sage)", text: "var(--dark-charcoal)", icon: DocumentTextIcon };
  }
};

export default function VendorInvoices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const filteredInvoices = mockInvoices.filter(invoice => {
    const matchesSearch = 
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "All" || invoice.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleDownloadInvoice = (invoiceId: string) => {
    // In a real app, this would generate and download the PDF
    console.log(`Downloading invoice ${invoiceId}`);
    alert(`Downloading invoice ${invoiceId}...`);
  };

  const handleSendInvoice = (invoiceId: string) => {
    // In a real app, this would send the invoice via email
    console.log(`Sending invoice ${invoiceId}`);
    alert(`Invoice ${invoiceId} sent to customer!`);
  };

  const totalRevenue = filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const paidInvoices = filteredInvoices.filter(inv => inv.status === "paid");
  const pendingInvoices = filteredInvoices.filter(inv => inv.status === "pending");
  const overdueInvoices = filteredInvoices.filter(inv => inv.status === "overdue");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">
            Invoices Management
          </h1>
          <p className="mt-2 text-secondary-600">
            Create, manage and track your rental invoices
          </p>
        </div>
        <Link
          href="/vendor/invoices/new"
          className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg transform hover:scale-105 bg-gradient-to-r from-primary-600 to-primary-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Invoice
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Total Revenue</p>
              <p className="text-2xl font-bold text-secondary-900">
                ${totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
              <DocumentTextIcon className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Paid Invoices</p>
              <p className="text-2xl font-bold text-green-600">{paidInvoices.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingInvoices.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{overdueInvoices.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-500" />
            <input
              type="text"
              placeholder="Search invoices, customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center px-4 py-3 rounded-lg border-2 border-primary-600 text-primary-600 transition-colors"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filters
          </button>

          {/* Desktop Filters */}
          <div className="hidden lg:flex items-center space-x-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 border-2 border-secondary-200 rounded-lg focus:outline-none text-secondary-900"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Mobile Filters */}
        {showFilters && (
          <div className="lg:hidden mt-4 pt-4 border-t border-secondary-200">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 border-2 border-secondary-200 rounded-lg focus:outline-none text-secondary-900"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        {filteredInvoices.map((invoice) => {
          const statusColor = getStatusColor(invoice.status);
          const StatusIcon = statusColor.icon;
          
          return (
            <div key={invoice.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  {/* Invoice Info */}
                  <div className="flex-1 mb-4 lg:mb-0">
                    <div className="flex items-center mb-3">
                      <h3 className="font-bold text-xl mr-4 text-secondary-900">
                        {invoice.id}
                      </h3>
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                        style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                      >
                        <StatusIcon className="h-4 w-4 mr-1" />
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-1 text-secondary-900">
                          {invoice.product}
                        </h4>
                        <p className="text-sm mb-1 text-secondary-600">
                          <strong>Customer:</strong> {invoice.customer.name}
                        </p>
                        <p className="text-sm text-secondary-600">
                          <strong>Order:</strong> {invoice.orderId}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm mb-1 text-secondary-600">
                          <strong>Issue Date:</strong> {new Date(invoice.issueDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm mb-1 text-secondary-600">
                          <strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-secondary-600">
                          <strong>Rental Period:</strong> {invoice.rentalPeriod}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Amount and Actions */}
                  <div className="flex flex-col items-end space-y-3">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-600">
                        ${invoice.total}
                      </div>
                      <div className="text-sm text-secondary-600">
                        Amount: ${invoice.amount} + Tax: ${invoice.tax}
                      </div>
                      {invoice.paidDate && (
                        <div className="text-sm text-green-600">
                          Paid: {new Date(invoice.paidDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/vendor/invoices/${invoice.id}`}
                        className="p-2 rounded-lg hover:bg-secondary-100 transition-colors text-primary-600"
                        title="View Invoice"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                      
                      <button
                        onClick={() => handleDownloadInvoice(invoice.id)}
                        className="p-2 rounded-lg hover:bg-secondary-100 transition-colors text-primary-600"
                        title="Download PDF"
                      >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                      </button>

                      {invoice.status === "draft" && (
                        <button
                          onClick={() => handleSendInvoice(invoice.id)}
                          className="px-4 py-2 rounded-lg font-medium text-sm transition-colors hover:opacity-90"
                          style={{ backgroundColor: "#dbeafe", color: "#2563eb" }}
                        >
                          Send
                        </button>
                      )}

                      {invoice.status === "pending" && (
                        <button
                          onClick={() => handleSendInvoice(invoice.id)}
                          className="px-4 py-2 rounded-lg font-medium text-sm transition-colors hover:opacity-90"
                          style={{ backgroundColor: "#fef3c7", color: "#d97706" }}
                        >
                          Resend
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center bg-secondary-200">
            <DocumentTextIcon className="h-12 w-12 text-secondary-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-secondary-900">
            No invoices found
          </h3>
          <p className="mb-6 text-secondary-600">
            Try adjusting your search or filters
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedStatus("All");
            }}
            className="px-6 py-3 rounded-lg font-semibold transition-colors hover:opacity-90 bg-primary-600 text-white"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}