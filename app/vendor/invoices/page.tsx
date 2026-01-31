"use client";

import React, { useState, useEffect } from "react";
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
import { generateInvoicePDF, buildInvoiceData } from "../../../lib/invoiceGenerator";
import { api } from "@/app/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";

// Types for API response
interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  subtotal: string;
  taxAmount: string;
  paidAmount: number;
  balanceDue: number;
  saleOrder: {
    id: string;
    orderNumber: string;
    startDate: string;
    endDate: string;
    customer: {
      user: {
        firstName: string;
        lastName: string;
        email: string;
      };
    };
    lines: {
      product: {
        name: string;
      };
      quantity: number;
    }[];
  };
  lines: {
    product: {
      name: string;
    };
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
  payments: {
    id: string;
    status: string;
    paidAt: string;
  }[];
}

const statusOptions = ["All", "DRAFT", "POSTED", "PAID"];

const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case "PAID":
      return { bg: "#dcfce7", text: "#16a34a", icon: CheckCircleIcon };
    case "POSTED":
      return { bg: "#fef3c7", text: "#d97706", icon: ClockIcon };
    case "DRAFT":
      return { bg: "#f3f4f6", text: "#6b7280", icon: DocumentTextIcon };
    case "CANCELLED":
      return { bg: "#fee2e2", text: "#dc2626", icon: ExclamationTriangleIcon };
    default:
      return { bg: "#f0f9ff", text: "#1e40af", icon: DocumentTextIcon };
  }
};

// Calculate rental period display
const formatRentalPeriod = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
};

export default function VendorInvoices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch invoices from API
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const response = await api.get<{ success: boolean; invoices: Invoice[] }>('/invoices');
        if (response.success) {
          setInvoices(response.invoices || []);
        }
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchInvoices();
    }
  }, [user]);

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    const customerName = invoice.saleOrder?.customer?.user ?
      `${invoice.saleOrder.customer.user.firstName} ${invoice.saleOrder.customer.user.lastName}` : '';
    const productName = invoice.lines?.[0]?.product?.name ||
      invoice.saleOrder?.lines?.[0]?.product?.name || '';

    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "All" || invoice.status.toUpperCase() === selectedStatus.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      const customerName = invoice.saleOrder?.customer?.user ?
        `${invoice.saleOrder.customer.user.firstName} ${invoice.saleOrder.customer.user.lastName}` : 'Customer';

      // Build real invoice data from API response
      const invoiceData = buildInvoiceData({
        invoiceNumber: invoice.invoiceNumber,
        orderNumber: invoice.saleOrder?.orderNumber,
        status: invoice.status,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        totalAmount: invoice.totalAmount,
        subtotal: invoice.subtotal,
        taxAmount: invoice.taxAmount,
        startDate: invoice.saleOrder?.startDate,
        endDate: invoice.saleOrder?.endDate,
        paidDate: invoice.payments?.find(p => p.status === 'COMPLETED')?.paidAt || null,
        customer: {
          name: customerName,
          email: invoice.saleOrder?.customer?.user?.email || ''
        },
        vendor: {
          name: user?.vendorProfile?.companyName || 'Vendor',
          gstin: user?.vendorProfile?.gstin,
          logoUrl: user?.vendorProfile?.logoUrl
        },
        lines: invoice.lines?.map(line => ({
          name: line.product?.name || 'Item',
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          amount: line.amount
        })) || []
      });

      await generateInvoicePDF(invoiceData);

      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successMessage.textContent = `Invoice ${invoice.invoiceNumber} downloaded successfully!`;
      document.body.appendChild(successMessage);
      setTimeout(() => document.body.removeChild(successMessage), 3000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      errorMessage.textContent = 'Error generating PDF. Please try again.';
      document.body.appendChild(errorMessage);
      setTimeout(() => document.body.removeChild(errorMessage), 3000);
    }
  };

  const handleSendInvoice = async (invoiceId: string) => {
    try {
      await api.post(`/invoices/${invoiceId}/post`, {});
      // Refresh invoices
      const response = await api.get<{ success: boolean; invoices: Invoice[] }>('/invoices');
      if (response.success) {
        setInvoices(response.invoices || []);
      }
      alert('Invoice sent successfully!');
    } catch (error) {
      console.error('Error sending invoice:', error);
      alert('Failed to send invoice.');
    }
  };

  // Calculate stats from real data
  const totalRevenue = filteredInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const paidInvoices = filteredInvoices.filter(inv => inv.status === "PAID");
  const pendingInvoices = filteredInvoices.filter(inv => inv.status === "POSTED");
  const draftInvoices = filteredInvoices.filter(inv => inv.status === "DRAFT");

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">Invoices Management</h1>
            <p className="mt-2 text-secondary-600">Create, manage and track your rental invoices</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
              <div className="w-20 h-4 bg-gray-200 rounded mb-2"></div>
              <div className="w-16 h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-32 h-6 bg-gray-200 rounded"></div>
                <div className="w-20 h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
                ₹{totalRevenue.toFixed(2)}
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
              <p className="text-sm font-medium text-secondary-600">Drafts</p>
              <p className="text-2xl font-bold text-gray-600">{draftInvoices.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
              <DocumentTextIcon className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center px-4 py-3 rounded-lg border-2 border-primary-600 text-primary-600 transition-colors"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filters
          </button>

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
          const customerName = invoice.saleOrder?.customer?.user ?
            `${invoice.saleOrder.customer.user.firstName} ${invoice.saleOrder.customer.user.lastName}` : 'Unknown';
          const productName = invoice.lines?.[0]?.product?.name ||
            invoice.saleOrder?.lines?.[0]?.product?.name || 'N/A';
          const rentalPeriod = invoice.saleOrder?.startDate && invoice.saleOrder?.endDate ?
            formatRentalPeriod(invoice.saleOrder.startDate, invoice.saleOrder.endDate) : 'N/A';

          return (
            <div key={invoice.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  {/* Invoice Info */}
                  <div className="flex-1 mb-4 lg:mb-0">
                    <div className="flex items-center mb-3">
                      <h3 className="font-bold text-xl mr-4 text-secondary-900">
                        {invoice.invoiceNumber}
                      </h3>
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                        style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                      >
                        <StatusIcon className="h-4 w-4 mr-1" />
                        {invoice.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-1 text-secondary-900">
                          {productName}
                        </h4>
                        <p className="text-sm mb-1 text-secondary-600">
                          <strong>Customer:</strong> {customerName}
                        </p>
                        <p className="text-sm text-secondary-600">
                          <strong>Order:</strong> {invoice.saleOrder?.orderNumber || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm mb-1 text-secondary-600">
                          <strong>Issue Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm mb-1 text-secondary-600">
                          <strong>Due Date:</strong> {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                        </p>
                        <p className="text-sm text-secondary-600">
                          <strong>Rental Period:</strong> {rentalPeriod}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Amount and Actions */}
                  <div className="flex flex-col items-end space-y-3">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-600">
                        ₹{invoice.totalAmount.toFixed(2)}
                      </div>
                      <div className="text-sm text-secondary-600">
                        Amount: ₹{invoice.subtotal} + Tax: ₹{invoice.taxAmount}
                      </div>
                      {invoice.paidAmount > 0 && (
                        <div className="text-sm text-green-600">
                          Paid: ₹{invoice.paidAmount.toFixed(2)}
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
                        onClick={() => handleDownloadInvoice(invoice)}
                        className="p-2 rounded-lg hover:bg-secondary-100 transition-colors text-primary-600"
                        title="Download PDF"
                      >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                      </button>

                      {invoice.status === "DRAFT" && (
                        <button
                          onClick={() => handleSendInvoice(invoice.id)}
                          className="px-4 py-2 rounded-lg font-medium text-sm transition-colors hover:opacity-90"
                          style={{ backgroundColor: "#dbeafe", color: "#2563eb" }}
                        >
                          Send
                        </button>
                      )}

                      {invoice.status === "POSTED" && (
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
            {invoices.length === 0 ? "Create your first invoice from a confirmed order." : "Try adjusting your search or filters"}
          </p>
          {invoices.length > 0 && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedStatus("All");
              }}
              className="px-6 py-3 rounded-lg font-semibold transition-colors hover:opacity-90 bg-primary-600 text-white"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}