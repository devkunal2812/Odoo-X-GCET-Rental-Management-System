"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon
} from "@heroicons/react/24/outline";
import { generateInvoicePDF, buildInvoiceData } from "../../../lib/invoiceGenerator";
import { api } from "@/app/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";

// Types for API response
interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  discount: number;
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
}

const statusOptions = ["All", "QUOTATION", "SENT", "CONFIRMED", "INVOICED", "PICKED_UP", "RETURNED", "CANCELLED"];

const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case "QUOTATION":
      return { bg: "#fef3c7", text: "#d97706", icon: ClockIcon };
    case "SENT":
      return { bg: "#e0e7ff", text: "#4f46e5", icon: ClockIcon };
    case "CONFIRMED":
      return { bg: "#dcfce7", text: "#16a34a", icon: CheckCircleIcon };
    case "INVOICED":
      return { bg: "#dbeafe", text: "#2563eb", icon: DocumentTextIcon };
    case "PICKED_UP":
      return { bg: "#fef3c7", text: "#d97706", icon: ClockIcon };
    case "RETURNED":
      return { bg: "#f0f9ff", text: "#0369a1", icon: CheckCircleIcon };
    case "CANCELLED":
      return { bg: "#fee2e2", text: "#dc2626", icon: XCircleIcon };
    default:
      return { bg: "#f0f9ff", text: "#1e40af", icon: ClockIcon };
  }
};

// Calculate days between dates
const calculateDays = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
};

export default function VendorOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get<{ success: boolean; orders: Order[] }>('/orders');
        if (response.success) {
          setOrders(response.orders || []);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const customerName = order.customer?.user ?
      `${order.customer.user.firstName} ${order.customer.user.lastName}` : '';
    const productName = order.lines?.[0]?.product?.name || '';

    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "All" || order.status.toUpperCase() === selectedStatus.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      // Map status to API endpoint
      const statusEndpoints: Record<string, string> = {
        'SENT': `/orders/${orderId}/send`,
        'CONFIRMED': `/orders/${orderId}/confirm`,
        'PICKED_UP': `/orders/${orderId}/pickup`,
        'RETURNED': `/orders/${orderId}/return`,
      };

      const endpoint = statusEndpoints[newStatus];
      if (endpoint) {
        await api.post(endpoint, {});
        // Refresh orders after update
        const response = await api.get<{ success: boolean; orders: Order[] }>('/orders');
        if (response.success) {
          setOrders(response.orders || []);
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleDownloadInvoice = async (order: Order) => {
    try {
      const customerName = order.customer?.user ?
        `${order.customer.user.firstName} ${order.customer.user.lastName}` : 'Customer';
      const tax = order.totalAmount * 0.18;

      const invoiceData = buildInvoiceData({
        invoiceNumber: `INV-${order.orderNumber}`,
        orderNumber: order.orderNumber,
        status: order.status === 'RETURNED' ? 'paid' : 'pending',
        invoiceDate: order.createdAt,
        totalAmount: order.totalAmount + tax,
        subtotal: order.totalAmount,
        taxAmount: tax,
        startDate: order.startDate,
        endDate: order.endDate,
        customer: {
          name: customerName,
          email: order.customer?.user?.email || ''
        },
        vendor: {
          name: user?.vendorProfile?.companyName || 'Vendor',
          gstin: user?.vendorProfile?.gstin,
          logoUrl: user?.vendorProfile?.logoUrl
        },
        lines: order.lines?.map(line => ({
          name: line.product?.name || 'Item',
          quantity: line.quantity,
          unitPrice: order.totalAmount / (order.lines?.reduce((sum, l) => sum + l.quantity, 0) || 1),
          amount: order.totalAmount / (order.lines?.length || 1)
        })) || []
      });

      await generateInvoicePDF(invoiceData);

      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successMessage.textContent = `Invoice for ${order.orderNumber} downloaded successfully!`;
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

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">Orders Management</h1>
            <p className="mt-2 text-secondary-600">Track and manage your rental orders</p>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 rounded-lg bg-gray-200"></div>
                <div className="flex-1">
                  <div className="w-32 h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="w-48 h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="w-40 h-4 bg-gray-200 rounded"></div>
                </div>
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
            Orders Management
          </h1>
          <p className="mt-2 text-secondary-600">
            Track and manage your rental orders
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <span className="text-sm font-medium text-secondary-600">
            {filteredOrders.length} orders
          </span>
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
              placeholder="Search orders, customers, products..."
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

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const statusColor = getStatusColor(order.status);
          const StatusIcon = statusColor.icon;
          const customerName = order.customer?.user ?
            `${order.customer.user.firstName} ${order.customer.user.lastName}` : 'Unknown';
          const productName = order.lines?.[0]?.product?.name || 'N/A';
          const duration = order.startDate && order.endDate ? calculateDays(order.startDate, order.endDate) : 'N/A';

          return (
            <div key={order.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  {/* Order Info */}
                  <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                    {/* Product Image */}
                    <div className="w-20 h-20 rounded-lg flex-shrink-0 bg-secondary-300">
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-2">
                        <h3 className="font-bold text-lg mr-3 text-secondary-900">
                          {order.orderNumber}
                        </h3>
                        <span
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                          style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                        >
                          <StatusIcon className="h-4 w-4 mr-1" />
                          {order.status}
                        </span>
                      </div>

                      <h4 className="font-semibold mb-1 text-secondary-900">
                        {productName}
                      </h4>

                      <div className="text-sm space-y-1 text-secondary-600">
                        <p><strong>Customer:</strong> {customerName}</p>
                        <p><strong>Duration:</strong> {duration}</p>
                        <p><strong>Dates:</strong> {order.startDate && order.endDate ?
                          `${new Date(order.startDate).toLocaleDateString()} - ${new Date(order.endDate).toLocaleDateString()}` : 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Actions */}
                  <div className="flex flex-col items-end space-y-3">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-600">
                        ₹{order.totalAmount?.toLocaleString() || 0}
                      </div>
                      <div className="text-sm text-secondary-600">
                        Order Total
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/vendor/orders/${order.id}`}
                        className="p-2 rounded-lg hover:bg-secondary-100 transition-colors text-primary-600"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>

                      {['RETURNED', 'CONFIRMED', 'INVOICED'].includes(order.status) && (
                        <button
                          onClick={() => handleDownloadInvoice(order)}
                          className="p-2 rounded-lg hover:bg-secondary-100 transition-colors text-primary-600"
                          title="Download Invoice"
                        >
                          <ArrowDownTrayIcon className="h-5 w-5" />
                        </button>
                      )}

                      <Link
                        href={`/vendor/invoices/${order.id}`}
                        className="p-2 rounded-lg hover:bg-secondary-100 transition-colors text-primary-600"
                        title="Generate Invoice"
                      >
                        <DocumentTextIcon className="h-5 w-5" />
                      </Link>

                      {order.status === "QUOTATION" && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, "SENT")}
                          className="px-4 py-2 rounded-lg font-medium text-sm transition-colors hover:opacity-90"
                          style={{ backgroundColor: "#e0e7ff", color: "#4f46e5" }}
                        >
                          Send Quote
                        </button>
                      )}

                      {order.status === "SENT" && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, "CONFIRMED")}
                          className="px-4 py-2 rounded-lg font-medium text-sm transition-colors hover:opacity-90"
                          style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}
                        >
                          Confirm
                        </button>
                      )}

                      {order.status === "CONFIRMED" && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, "PICKED_UP")}
                          className="px-4 py-2 rounded-lg font-medium text-sm transition-colors hover:opacity-90"
                          style={{ backgroundColor: "#dbeafe", color: "#2563eb" }}
                        >
                          Start Rental
                        </button>
                      )}

                      {order.status === "PICKED_UP" && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, "RETURNED")}
                          className="px-4 py-2 rounded-lg font-medium text-sm transition-colors hover:opacity-90"
                          style={{ backgroundColor: "#f0f9ff", color: "#0369a1" }}
                        >
                          Complete
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
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center bg-secondary-200">
            <MagnifyingGlassIcon className="h-12 w-12 text-secondary-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-secondary-900">
            No orders found
          </h3>
          <p className="mb-6 text-secondary-600">
            {orders.length === 0 ? "You don't have any orders yet." : "Try adjusting your search or filters"}
          </p>
          {orders.length > 0 && (
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