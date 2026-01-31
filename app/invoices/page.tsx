"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import {
  DocumentTextIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/outline";

// Utility function for consistent date formatting
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
const mockInvoices = [
  {
    id: "INV-001",
    orderId: "ORD-001",
    product: "Professional Camera Kit",
    vendor: "TechRent Pro",
    amount: 150,
    tax: 12,
    serviceFee: 3,
    total: 165,
    status: "paid",
    issueDate: "2024-01-30",
    dueDate: "2024-02-14",
    paidDate: "2024-01-31",
    paymentMethod: "Visa •••• 4242",
    rentalPeriod: "Feb 1-4, 2024"
  },
  {
    id: "INV-002",
    orderId: "ORD-002",
    product: "Power Drill Set",
    vendor: "ToolMaster",
    amount: 45,
    tax: 3.6,
    serviceFee: 1.4,
    total: 50,
    status: "paid",
    issueDate: "2024-01-29",
    dueDate: "2024-02-13",
    paidDate: "2024-01-30",
    paymentMethod: "Mastercard •••• 8888",
    rentalPeriod: "Jan 30-31, 2024"
  },
  {
    id: "INV-003",
    orderId: "ORD-003",
    product: "Party Sound System",
    vendor: "EventPro",
    amount: 200,
    tax: 16,
    serviceFee: 4,
    total: 220,
    status: "paid",
    issueDate: "2024-01-28",
    dueDate: "2024-02-12",
    paidDate: "2024-01-29",
    paymentMethod: "Visa •••• 4242",
    rentalPeriod: "Jan 29-31, 2024"
  },
  {
    id: "INV-004",
    orderId: "ORD-004",
    product: "Mountain Bike",
    vendor: "BikeRentals",
    amount: 90,
    tax: 7.2,
    serviceFee: 2.8,
    total: 100,
    status: "pending",
    issueDate: "2024-01-27",
    dueDate: "2024-02-11",
    paidDate: null,
    paymentMethod: "",
    rentalPeriod: "Feb 2-5, 2024"
  },
  {
    id: "INV-005",
    orderId: "ORD-005",
    product: "Electric Scooter",
    vendor: "UrbanRide",
    amount: 75,
    tax: 6,
    serviceFee: 2,
    total: 83,
    status: "paid",
    issueDate: "2024-01-25",
    dueDate: "2024-02-09",
    paidDate: "2024-01-26",
    paymentMethod: "Visa •••• 4242",
    rentalPeriod: "Feb 10-12, 2024"
  },
  {
    id: "INV-006",
    orderId: "ORD-006",
    product: "Projector & Screen",
    vendor: "TechRent Pro",
    amount: 120,
    tax: 9.6,
    serviceFee: 3.4,
    total: 133,
    status: "overdue",
    issueDate: "2024-01-20",
    dueDate: "2024-02-04",
    paidDate: null,
    paymentMethod: "",
    rentalPeriod: "Jan 22-24, 2024"
  }
];

const statusOptions = ["All", "Paid", "Pending", "Overdue"];

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
      return { bg: "#dcfce7", text: "#16a34a", icon: CheckCircleIcon };
    case "pending":
      return { bg: "#fef3c7", text: "#d97706", icon: ClockIcon };
    case "overdue":
      return { bg: "#fee2e2", text: "#dc2626", icon: ExclamationTriangleIcon };
    default:
      return { bg: "#f0f9ff", text: "#1e40af", icon: DocumentTextIcon };
  }
};

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const filteredInvoices = mockInvoices.filter(invoice => {
    const matchesSearch = 
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "All" || invoice.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleDownloadInvoice = (invoiceId: string) => {
    // In a real app, this would generate and download the PDF
    console.log(`Downloading invoice ${invoiceId}`);
    alert(`Downloading invoice ${invoiceId}...`);
  };

  const handlePayInvoice = (invoiceId: string) => {
    // In a real app, this would redirect to payment page
    console.log(`Paying invoice ${invoiceId}`);
    alert(`Redirecting to payment for invoice ${invoiceId}...`);
  };

  const totalPaid = filteredInvoices
    .filter(inv => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.total, 0);
  
  const pendingAmount = filteredInvoices
    .filter(inv => inv.status === "pending" || inv.status === "overdue")
    .reduce((sum, inv) => sum + inv.total, 0);

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header currentPage="invoices" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/orders"
              className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-primary-600"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-secondary-900">
                My Invoices
              </h1>
              <p className="mt-2 text-secondary-600">
                View and manage your rental invoices
              </p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <span className="text-sm font-medium text-secondary-600">
              {filteredInvoices.length} invoices
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Total Invoices</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {filteredInvoices.length}
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
                <p className="text-2xl font-bold text-green-600">
                  {filteredInvoices.filter(inv => inv.status === "paid").length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Total Paid</p>
                <p className="text-2xl font-bold text-secondary-900">
                  ${totalPaid.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Pending Amount</p>
                <p className="text-2xl font-bold text-yellow-600">
                  ${pendingAmount.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-500" />
              <input
                type="text"
                placeholder="Search invoices, products, vendors..."
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
                            <strong>Vendor:</strong> {invoice.vendor}
                          </p>
                          <p className="text-sm mb-1 text-secondary-600">
                            <strong>Order:</strong> {invoice.orderId}
                          </p>
                          <p className="text-sm text-secondary-600">
                            <strong>Rental Period:</strong> {invoice.rentalPeriod}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm mb-1 text-secondary-600">
                            <strong>Issue Date:</strong> {formatDate(invoice.issueDate)}
                          </p>
                          <p className="text-sm mb-1 text-secondary-600">
                            <strong>Due Date:</strong> {formatDate(invoice.dueDate)}
                          </p>
                          {invoice.paidDate && (
                            <p className="text-sm mb-1 text-green-600">
                              <strong>Paid:</strong> {formatDate(invoice.paidDate)}
                            </p>
                          )}
                          {invoice.paymentMethod && (
                            <p className="text-sm text-secondary-600">
                              <strong>Payment:</strong> {invoice.paymentMethod}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Amount and Actions */}
                    <div className="flex flex-col items-end space-y-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-secondary-900">
                          ${invoice.total.toFixed(2)}
                        </div>
                        <div className="text-sm text-secondary-600">
                          Amount: ${invoice.amount} + Tax: ${invoice.tax} + Fee: ${invoice.serviceFee}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-secondary-600"
                          title="View Invoice"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        
                        <button
                          onClick={() => handleDownloadInvoice(invoice.id)}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-secondary-600"
                          title="Download PDF"
                        >
                          <ArrowDownTrayIcon className="h-5 w-5" />
                        </button>

                        {(invoice.status === "pending" || invoice.status === "overdue") && (
                          <button
                            onClick={() => handlePayInvoice(invoice.id)}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors hover:opacity-90 ${
                              invoice.status === "overdue" ? "animate-pulse" : ""
                            }`}
                            style={{ 
                              backgroundColor: invoice.status === "overdue" ? "#fee2e2" : "#fef3c7", 
                              color: invoice.status === "overdue" ? "#dc2626" : "#d97706" 
                            }}
                          >
                            Pay Now
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
              className="px-6 py-3 rounded-lg font-semibold transition-colors hover:opacity-90 bg-secondary-600 text-white"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-secondary-900 text-black py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">RentMarket</h3>
              <p className="text-secondary-400">
                Your trusted marketplace for renting everything you need.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/products" className="hover:opacity-80 transition-opacity text-secondary-400">Products</Link></li>
                <li><Link href="/orders" className="hover:opacity-80 transition-opacity text-secondary-400">My Orders</Link></li>
                <li><Link href="/about" className="hover:opacity-80 transition-opacity text-secondary-400">About Us</Link></li>
                <li><Link href="/contact" className="hover:opacity-80 transition-opacity text-secondary-400">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-2">
                <li><Link href="/help" className="hover:opacity-80 transition-opacity text-secondary-400">Help Center</Link></li>
                <li><Link href="/terms" className="hover:opacity-80 transition-opacity text-secondary-400">Terms & Conditions</Link></li>
                <li><Link href="/privacy" className="hover:opacity-80 transition-opacity text-secondary-400">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Contact Info</h4>
              <div className="space-y-2 text-secondary-400">
                <p>Email: support@rentmarket.com</p>
                <p>Phone: (555) 123-4567</p>
              </div>
            </div>
          </div>
          <div className="border-t border-secondary-700 mt-8 pt-8 text-center text-secondary-400">
            <p>&copy; 2024 RentMarket. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}