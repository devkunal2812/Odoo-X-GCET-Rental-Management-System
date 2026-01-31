"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { generateInvoicePDF, generateSampleInvoiceData, InvoiceData } from '../../../lib/invoiceGenerator';

interface RentalOrder {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    company: string;
  };
  asset: {
    name: string;
    serialNumber: string;
    category: string;
  };
  partner: string;
  status: 'Pending' | 'Confirmed' | 'Active' | 'Pending Return' | 'Returned' | 'Overdue' | 'Cancelled';
  startDate: string;
  endDate: string;
  actualReturnDate?: string;
  dailyRate: number;
  totalDays: number;
  totalAmount: number;
  securityDeposit: number;
  paymentStatus: 'Pending' | 'Partial' | 'Paid' | 'Refunded';
  createdDate: string;
  notes?: string;
}

const mockRentalOrders: RentalOrder[] = [
  {
    id: '1',
    orderNumber: 'RNT-2024-001',
    customer: {
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1 (555) 123-4567',
      company: 'Tech Solutions Inc.'
    },
    asset: {
      name: 'Professional DSLR Camera Kit',
      serialNumber: 'CAM-2024-001',
      category: 'Photography Equipment'
    },
    partner: 'TechRent Pro',
    status: 'Active',
    startDate: '2024-01-28',
    endDate: '2024-02-05',
    dailyRate: 45,
    totalDays: 8,
    totalAmount: 360,
    securityDeposit: 500,
    paymentStatus: 'Paid',
    createdDate: '2024-01-25',
    notes: 'Customer requested early pickup at 8 AM'
  },
  {
    id: '2',
    orderNumber: 'RNT-2024-002',
    customer: {
      name: 'Sarah Smith',
      email: 'sarah.smith@email.com',
      phone: '+1 (555) 234-5678',
      company: 'Creative Agency'
    },
    asset: {
      name: 'Power Drill Set Professional',
      serialNumber: 'TOOL-2024-002',
      category: 'Construction Tools'
    },
    partner: 'ToolMaster',
    status: 'Pending Return',
    startDate: '2024-01-25',
    endDate: '2024-01-31',
    dailyRate: 25,
    totalDays: 6,
    totalAmount: 150,
    securityDeposit: 200,
    paymentStatus: 'Paid',
    createdDate: '2024-01-22'
  },
  {
    id: '3',
    orderNumber: 'RNT-2024-003',
    customer: {
      name: 'Mike Johnson',
      email: 'mike.johnson@email.com',
      phone: '+1 (555) 345-6789',
      company: 'Event Planners Co.'
    },
    asset: {
      name: 'Professional Sound System',
      serialNumber: 'AUD-2024-003',
      category: 'Audio Equipment'
    },
    partner: 'EventPro',
    status: 'Overdue',
    startDate: '2024-01-20',
    endDate: '2024-01-30',
    dailyRate: 75,
    totalDays: 10,
    totalAmount: 750,
    securityDeposit: 1000,
    paymentStatus: 'Paid',
    createdDate: '2024-01-18',
    notes: 'Large event rental - requires special handling'
  },
  {
    id: '4',
    orderNumber: 'RNT-2024-004',
    customer: {
      name: 'Lisa Chen',
      email: 'lisa.chen@email.com',
      phone: '+1 (555) 456-7890',
      company: 'Startup Hub'
    },
    asset: {
      name: 'Mountain Bike - Trek',
      serialNumber: 'BIKE-2024-004',
      category: 'Sports Equipment'
    },
    partner: 'BikeRentals',
    status: 'Returned',
    startDate: '2024-01-22',
    endDate: '2024-01-29',
    actualReturnDate: '2024-01-29',
    dailyRate: 35,
    totalDays: 7,
    totalAmount: 245,
    securityDeposit: 300,
    paymentStatus: 'Refunded',
    createdDate: '2024-01-20'
  },
  {
    id: '5',
    orderNumber: 'RNT-2024-005',
    customer: {
      name: 'David Wilson',
      email: 'david.wilson@email.com',
      phone: '+1 (555) 567-8901',
      company: 'Wilson Enterprises'
    },
    asset: {
      name: 'Electric Scooter',
      serialNumber: 'SCOOT-2024-005',
      category: 'Transportation'
    },
    partner: 'UrbanRide',
    status: 'Cancelled',
    startDate: '2024-01-26',
    endDate: '2024-02-02',
    dailyRate: 20,
    totalDays: 7,
    totalAmount: 140,
    securityDeposit: 150,
    paymentStatus: 'Refunded',
    createdDate: '2024-01-24',
    notes: 'Cancelled due to weather conditions'
  }
];

const RentalOrderDetailModal = ({ order, isOpen, onClose, onDownload }: {
  order: RentalOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (order: RentalOrder) => void;
}) => {
  if (!isOpen || !order) return null;

  const getDaysRemaining = () => {
    const today = new Date();
    const endDate = new Date(order.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#715A5A] mb-1">Status</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'Active' 
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'Pending Return'
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.status === 'Overdue'
                            ? 'bg-red-100 text-red-800'
                            : order.status === 'Returned'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'Confirmed'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'Pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#715A5A] mb-1">Payment Status</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.paymentStatus === 'Paid' 
                        ? 'bg-green-100 text-green-800'
                        : order.paymentStatus === 'Partial'
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.paymentStatus === 'Refunded'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#715A5A] mb-1">Created Date</label>
                  <p className="text-[#37353E]">{order.createdDate}</p>
                </div>
                {order.notes && (
                  <div>
                    <label className="block text-sm font-medium text-[#715A5A] mb-1">Notes</label>
                    <p className="text-[#37353E] bg-[#D3DAD9]/20 p-3 rounded-lg">{order.notes}</p>
                  </div>
                )}
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
                  <label className="block text-sm font-medium text-[#715A5A] mb-1">Company</label>
                  <p className="text-[#37353E]">{order.customer.company}</p>
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

          {/* Asset & Rental Details */}
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-[#37353E] mb-4">Asset Information</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[#715A5A] mb-1">Asset Name</label>
                  <p className="text-[#37353E] font-semibold">{order.asset.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#715A5A] mb-1">Serial Number</label>
                    <p className="text-[#37353E] font-mono">{order.asset.serialNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#715A5A] mb-1">Category</label>
                    <p className="text-[#37353E]">{order.asset.category}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#715A5A] mb-1">Partner</label>
                  <p className="text-[#37353E]">{order.partner}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-[#37353E] mb-4">Rental Period</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#715A5A] mb-1">Start Date</label>
                    <p className="text-[#37353E]">{order.startDate}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#715A5A] mb-1">End Date</label>
                    <p className="text-[#37353E]">{order.endDate}</p>
                  </div>
                </div>
                {order.actualReturnDate && (
                  <div>
                    <label className="block text-sm font-medium text-[#715A5A] mb-1">Actual Return Date</label>
                    <p className="text-[#37353E]">{order.actualReturnDate}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-[#715A5A] mb-1">Duration</label>
                  <p className="text-[#37353E]">{order.totalDays} days</p>
                </div>
                {order.status === 'Active' && (
                  <div>
                    <label className="block text-sm font-medium text-[#715A5A] mb-1">Time Remaining</label>
                    <p className={`font-semibold ${
                      daysRemaining > 0 ? 'text-green-600' : daysRemaining === 0 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {daysRemaining > 0 ? `${daysRemaining} days left` : 
                       daysRemaining === 0 ? 'Due today' : 
                       `${Math.abs(daysRemaining)} days overdue`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-[#37353E] mb-4">Financial Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#D3DAD9]/20 rounded-lg p-3">
                  <label className="block text-sm font-medium text-[#715A5A] mb-1">Daily Rate</label>
                  <p className="text-lg font-bold text-[#37353E]">₹{order.dailyRate}</p>
                </div>
                <div className="bg-[#D3DAD9]/20 rounded-lg p-3">
                  <label className="block text-sm font-medium text-[#715A5A] mb-1">Total Amount</label>
                  <p className="text-lg font-bold text-[#37353E]">₹{order.totalAmount}</p>
                </div>
                <div className="bg-[#D3DAD9]/20 rounded-lg p-3 col-span-2">
                  <label className="block text-sm font-medium text-[#715A5A] mb-1">Security Deposit</label>
                  <p className="text-lg font-bold text-[#37353E]">₹{order.securityDeposit}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button className="flex-1 px-4 py-2 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors">
                Update Status
              </button>
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Contact Customer
              </button>
              {(order.status === 'Returned' || order.status === 'Active' || order.paymentStatus === 'Paid') && (
                <button 
                  onClick={() => order && onDownload(order)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
  const [orders] = useState<RentalOrder[]>(mockRentalOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<RentalOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.asset.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewOrder = (order: RentalOrder) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleDownloadInvoice = (order: RentalOrder) => {
    try {
      // Convert RentalOrder to InvoiceData format
      const invoiceData: InvoiceData = {
        id: `INV-${order.orderNumber}`,
        orderId: order.orderNumber,
        product: order.asset.name,
        vendor: order.partner,
        amount: order.totalAmount,
        tax: Math.round(order.totalAmount * 0.18), // 18% GST
        serviceFee: 25, // Fixed service fee
        securityDeposit: order.securityDeposit,
        total: order.totalAmount + Math.round(order.totalAmount * 0.18) + 25,
        status: order.paymentStatus === 'Paid' ? 'paid' : 'pending',
        issueDate: order.createdDate,
        dueDate: order.endDate,
        paidDate: order.paymentStatus === 'Paid' ? order.createdDate : null,
        paymentMethod: order.paymentStatus === 'Paid' ? 'UPI - Google Pay' : '',
        rentalPeriod: `${order.startDate} to ${order.endDate} (${order.totalDays} days)`,
        customerInfo: {
          name: order.customer.name,
          email: order.customer.email,
          phone: order.customer.phone,
          address: `${order.customer.company}, Business Address, City, State - 560001`,
        },
        vendorInfo: {
          name: order.partner,
          email: 'partner@vendor.com',
          phone: '+91 80 2345 6789',
          address: '456, Business District, City, State - 560100',
          gstin: '29ABCDE1234F1Z5',
        },
        companyInfo: {
          name: 'RentERP Solutions',
          address: '789, Business Park, Whitefield, Bangalore, Karnataka - 560066',
          phone: '+91 80 1234 5678',
          email: 'support@rentalerp.com',
          website: 'www.rentalerp.com',
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
    Pending: orders.filter(o => o.status === 'Pending').length,
    Confirmed: orders.filter(o => o.status === 'Confirmed').length,
    Active: orders.filter(o => o.status === 'Active').length,
    'Pending Return': orders.filter(o => o.status === 'Pending Return').length,
    Returned: orders.filter(o => o.status === 'Returned').length,
    Overdue: orders.filter(o => o.status === 'Overdue').length,
    Cancelled: orders.filter(o => o.status === 'Cancelled').length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#37353E] mb-2">Rental Orders</h1>
        <p className="text-[#715A5A]">Manage and track all rental orders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#715A5A]">Active Rentals</p>
              <p className="text-2xl font-bold text-green-600">{statusCounts.Active}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#715A5A]">Pending Returns</p>
              <p className="text-2xl font-bold text-yellow-600">{statusCounts['Pending Return']}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#715A5A]">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{statusCounts.Overdue}</p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
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
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-[#D3DAD9]/20">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-[#37353E]">{order.orderNumber}</div>
                      <div className="text-sm text-[#715A5A]">{order.createdDate}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-[#37353E]">{order.customer.name}</div>
                      <div className="text-sm text-[#715A5A]">{order.customer.company}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-[#37353E]">{order.asset.name}</div>
                      <div className="text-sm text-[#715A5A]">{order.asset.serialNumber}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[#37353E]">
                      {order.startDate} to {order.endDate}
                    </div>
                    <div className="text-sm text-[#715A5A]">{order.totalDays} days</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-[#37353E]">₹{order.totalAmount}</div>
                    <div className="text-sm text-[#715A5A]">₹{order.dailyRate}/day</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'Active' 
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'Pending Return'
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.status === 'Overdue'
                            ? 'bg-red-100 text-red-800'
                            : order.status === 'Returned'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'Confirmed'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'Pending'
                                  ? 'bg-yellow-100 text-yellow-800'
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
                      {(order.status === 'Returned' || order.status === 'Active' || order.paymentStatus === 'Paid') && (
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
              ))}
            </tbody>
          </table>
        </div>
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