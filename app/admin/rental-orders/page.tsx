"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/app/lib/api-client';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  CubeIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { generateInvoicePDF, generateSampleInvoiceData, InvoiceData } from '../../../lib/invoiceGenerator';

interface RentalOrder {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
  };
  vendor: {
    id: string;
    name: string;
    email: string;
  };
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    variant: string | null;
  }>;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  pickupDate: Date | null;
  actualReturnDate: Date | null;
  orderDate: Date;
  totalAmount: number;
  discount: number;
  lateFee: number;
  coupon: {
    code: string;
    discountType: string;
    value: number;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

const RentalOrderDetailModal = ({ order, isOpen, onClose, onDownload }: {
  order: RentalOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (order: RentalOrder) => void;
}) => {
  if (!isOpen || !order) return null;

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const totalDays = order.startDate && order.endDate
    ? Math.ceil((new Date(order.endDate).getTime() - new Date(order.startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-[#37353E]">Rental Order Details</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#D3DAD9] rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-[#715A5A]" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Information */}
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-[#37353E] mb-4">Order Information</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[#715A5A] mb-1">Order Number</label>
                  <p className="text-[#37353E] font-semibold">{order.orderNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#715A5A] mb-1">Status</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'PICKED_UP' 
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'CONFIRMED'
                        ? 'bg-blue-100 text-blue-800'
                        : order.status === 'RETURNED'
                          ? 'bg-purple-100 text-purple-800'
                          : order.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#715A5A] mb-1">Created Date</label>
                  <p className="text-[#37353E]">{formatDate(order.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div>
              <h4 className="text-lg font-semibold text-[#37353E] mb-4">Customer Information</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[#715A5A] mb-1">Name</label>
                  <p className="text-[#37353E] font-semibold">{order.customer.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#715A5A] mb-1">Email</label>
                  <p className="text-[#37353E]">{order.customer.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#715A5A] mb-1">Phone</label>
                  <p className="text-[#37353E]">{order.customer.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Products & Rental Details */}
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-[#37353E] mb-4">Products</h4>
              <div className="space-y-2">
                {order.products.map((product, index) => (
                  <div key={index} className="bg-[#D3DAD9]/20 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-[#37353E]">{product.name}</p>
                        {product.variant && (
                          <p className="text-xs text-[#715A5A]">Variant: {product.variant}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[#37353E]">₹{product.unitPrice}</p>
                        <p className="text-xs text-[#715A5A]">Qty: {product.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-[#37353E] mb-4">Rental Period</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#715A5A] mb-1">Start Date</label>
                    <p className="text-[#37353E]">{formatDate(order.startDate)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#715A5A] mb-1">End Date</label>
                    <p className="text-[#37353E]">{formatDate(order.endDate)}</p>
                  </div>
                </div>
                {order.pickupDate && (
                  <div>
                    <label className="block text-sm font-medium text-[#715A5A] mb-1">Pickup Date</label>
                    <p className="text-[#37353E]">{formatDate(order.pickupDate)}</p>
                  </div>
                )}
                {order.actualReturnDate && (
                  <div>
                    <label className="block text-sm font-medium text-[#715A5A] mb-1">Actual Return Date</label>
                    <p className="text-[#37353E]">{formatDate(order.actualReturnDate)}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-[#715A5A] mb-1">Duration</label>
                  <p className="text-[#37353E]">{totalDays} days</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-[#37353E] mb-4">Financial Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between bg-[#D3DAD9]/20 rounded-lg p-3">
                  <span className="text-sm text-[#715A5A]">Subtotal</span>
                  <span className="text-sm font-semibold text-[#37353E]">₹{order.totalAmount.toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between bg-green-50 rounded-lg p-3">
                    <span className="text-sm text-green-700">Discount</span>
                    <span className="text-sm font-semibold text-green-700">-₹{order.discount.toFixed(2)}</span>
                  </div>
                )}
                {order.lateFee > 0 && (
                  <div className="flex justify-between bg-red-50 rounded-lg p-3">
                    <span className="text-sm text-red-700">Late Fee</span>
                    <span className="text-sm font-semibold text-red-700">+₹{order.lateFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between bg-[#37353E] text-white rounded-lg p-3">
                  <span className="text-sm font-medium">Total</span>
                  <span className="text-lg font-bold">₹{(order.totalAmount - order.discount + order.lateFee).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Vendor Info */}
            <div>
              <h4 className="text-lg font-semibold text-[#37353E] mb-4">Vendor</h4>
              <div className="bg-[#D3DAD9]/20 rounded-lg p-3">
                <p className="text-sm font-medium text-[#37353E]">{order.vendor.name}</p>
                <p className="text-xs text-[#715A5A]">{order.vendor.email}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              {(order.status === 'RETURNED' || order.status === 'PICKED_UP' || order.status === 'INVOICED') && (
                <button 
                  onClick={() => order && onDownload(order)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Download Invoice
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function RentalOrdersPage() {
  const [orders, setOrders] = useState<RentalOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<RentalOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params: Record<string, string> = {};
      if (statusFilter && statusFilter !== 'All') {
        params.status = statusFilter;
      }

      console.log('Fetching orders with params:', params);

      const response = await api.get<{
        success: boolean;
        orders: RentalOrder[];
        error?: string;
      }>('/admin/orders', params);

      console.log('API Response:', response);

      if (response.success) {
        setOrders(response.orders || []);
      } else {
        console.error('Failed to fetch orders:', response.error);
        alert(`Failed to fetch orders: ${response.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Failed to fetch orders:', error);
      alert(`Error: ${error.message || 'Failed to fetch orders'}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.products.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewOrder = (order: RentalOrder) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleDownloadInvoice = (order: RentalOrder) => {
    try {
      const firstProduct = order.products[0];
      // Convert RentalOrder to InvoiceData format
      const invoiceData: InvoiceData = {
        id: `INV-${order.orderNumber}`,
        orderId: order.orderNumber,
        product: firstProduct?.name || 'Multiple Products',
        vendor: order.vendor.name,
        amount: order.totalAmount,
        tax: Math.round(order.totalAmount * 0.18), // 18% GST
        serviceFee: 25, // Fixed service fee
        securityDeposit: 0, // Not in current schema
        total: order.totalAmount + Math.round(order.totalAmount * 0.18) + 25,
        status: 'paid',
        issueDate: new Date(order.createdAt).toISOString().split('T')[0],
        dueDate: order.endDate ? new Date(order.endDate).toISOString().split('T')[0] : '',
        paidDate: new Date(order.createdAt).toISOString().split('T')[0],
        paymentMethod: 'UPI - Google Pay',
        rentalPeriod: order.startDate && order.endDate 
          ? `${new Date(order.startDate).toLocaleDateString('en-IN')} to ${new Date(order.endDate).toLocaleDateString('en-IN')}`
          : 'N/A',
        customerInfo: {
          name: order.customer.name,
          email: order.customer.email,
          phone: order.customer.phone,
          address: `${order.customer.company || 'N/A'}, Business Address, City, State - 560001`,
        },
        vendorInfo: {
          name: order.vendor.name,
          email: order.vendor.email,
          phone: '+91 80 2345 6789',
          address: '456, Business District, City, State - 560100',
          gstin: '29ABCDE1234F1Z5',
        },
        companyInfo: {
          name: 'RentMarket',
          address: '789, Business Park, Whitefield, Bangalore, Karnataka - 560066',
          phone: '+91 80 1234 5678',
          email: 'support@rentmarket.com',
          website: 'www.rentmarket.com',
          gstin: '29XYZAB1234C1D6'
        }
      };

      // Generate and download PDF
      generateInvoicePDF(invoiceData);

      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successMessage.textContent = `Invoice for ${order.orderNumber} downloaded successfully!`;
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

  const statusCounts = {
    All: orders.length,
    QUOTATION: orders.filter(o => o.status === 'QUOTATION').length,
    SENT: orders.filter(o => o.status === 'SENT').length,
    CONFIRMED: orders.filter(o => o.status === 'CONFIRMED').length,
    INVOICED: orders.filter(o => o.status === 'INVOICED').length,
    PICKED_UP: orders.filter(o => o.status === 'PICKED_UP').length,
    RETURNED: orders.filter(o => o.status === 'RETURNED').length,
    CANCELLED: orders.filter(o => o.status === 'CANCELLED').length,
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateDays = (start: Date | null, end: Date | null) => {
    if (!start || !end) return 0;
    const diffTime = new Date(end).getTime() - new Date(start).getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#37353E] mb-4"></div>
        <p className="text-[#715A5A]">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#37353E] mb-2">Rental Orders</h1>
          <p className="text-[#715A5A]">Manage and track all rental orders</p>
        </div>
        <button
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#715A5A]">Picked Up</p>
              <p className="text-2xl font-bold text-green-600">{statusCounts.PICKED_UP}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#715A5A]">Confirmed</p>
              <p className="text-2xl font-bold text-yellow-600">{statusCounts.CONFIRMED}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#715A5A]">Returned</p>
              <p className="text-2xl font-bold text-blue-600">{statusCounts.RETURNED}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#715A5A]">Total Orders</p>
              <p className="text-2xl font-bold text-[#37353E]">{statusCounts.All}</p>
            </div>
            <DocumentTextIcon className="h-8 w-8 text-[#44444E]" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9] mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#715A5A]" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent"
            >
              {Object.keys(statusCounts).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#D3DAD9] overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-12 w-12 text-[#715A5A] mx-auto mb-4" />
            <p className="text-[#715A5A] text-lg mb-2">No orders found</p>
            <p className="text-[#715A5A] text-sm">
              {orders.length === 0 
                ? 'There are no rental orders in the system yet.' 
                : 'No orders match your current filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#D3DAD9]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Rental Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D3DAD9]">
              {filteredOrders.map((order) => {
                const totalDays = calculateDays(order.startDate, order.endDate);
                const firstProduct = order.products[0];
                
                return (
                  <tr key={order.id} className="hover:bg-[#D3DAD9]/20">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-[#37353E]">{order.orderNumber}</div>
                        <div className="text-sm text-[#715A5A]">{formatDate(order.createdAt)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-[#37353E]">{order.customer.name}</div>
                        <div className="text-sm text-[#715A5A]">{order.customer.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-[#37353E]">
                          {firstProduct ? firstProduct.name : 'No products'}
                        </div>
                        {order.products.length > 1 && (
                          <div className="text-sm text-[#715A5A]">
                            +{order.products.length - 1} more
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#37353E]">
                        {formatDate(order.startDate)} to {formatDate(order.endDate)}
                      </div>
                      <div className="text-sm text-[#715A5A]">{totalDays} days</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-[#37353E]">₹{order.totalAmount.toFixed(2)}</div>
                      {order.discount > 0 && (
                        <div className="text-sm text-green-600">-₹{order.discount.toFixed(2)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'PICKED_UP' 
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'CONFIRMED'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'RETURNED'
                              ? 'bg-purple-100 text-purple-800'
                              : order.status === 'INVOICED'
                                ? 'bg-yellow-100 text-yellow-800'
                                : order.status === 'SENT'
                                  ? 'bg-cyan-100 text-cyan-800'
                                  : order.status === 'CANCELLED'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="text-[#44444E] hover:text-[#37353E]"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {(order.status === 'RETURNED' || order.status === 'PICKED_UP' || order.status === 'INVOICED') && (
                          <button
                            onClick={() => handleDownloadInvoice(order)}
                            className="text-[#44444E] hover:text-[#37353E]"
                            title="Download Invoice"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        <RentalOrderDetailModal
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onDownload={handleDownloadInvoice}
        />
      </AnimatePresence>
    </div>
  );
}