"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  PlusIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { generateInvoicePDF, generateSampleInvoiceData, InvoiceData } from '../../../lib/invoiceGenerator';

interface RentalInvoice {
  id: string;
  invoiceNumber: string;
  rentalOrderId: string;
  customer: {
    name: string;
    email: string;
    company: string;
    address: string;
    gstin?: string;
  };
  partner: {
    name: string;
    company: string;
    gstin: string;
  };
  asset: {
    name: string;
    serialNumber: string;
  };
  billingPeriod: {
    startDate: string;
    endDate: string;
    totalDays: number;
  };
  charges: {
    dailyRate: number;
    totalRentalAmount: number;
    securityDeposit: number;
    lateFees: number;
    damageFees: number;
    cleaningFees: number;
    deliveryFees: number;
    taxAmount: number;
    totalAmount: number;
  };
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled' | 'Refunded';
  paymentStatus: 'Pending' | 'Partial' | 'Paid' | 'Failed' | 'Refunded';
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
  notes?: string;
}

const mockInvoices: RentalInvoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-RNT-2024-001',
    rentalOrderId: 'RNT-2024-001',
    customer: {
      name: 'John Doe',
      email: 'john.doe@email.com',
      company: 'Tech Solutions Inc.',
      address: '123 Business St, City, State 12345',
      gstin: '29ABCDE1234F1Z5'
    },
    partner: {
      name: 'TechRent Pro',
      company: 'TechRent Pro Solutions',
      gstin: '27FGHIJ5678K2L9'
    },
    asset: {
      name: 'Professional DSLR Camera Kit',
      serialNumber: 'CAM-2024-001'
    },
    billingPeriod: {
      startDate: '2024-01-28',
      endDate: '2024-02-05',
      totalDays: 8
    },
    charges: {
      dailyRate: 45,
      totalRentalAmount: 360,
      securityDeposit: 500,
      lateFees: 0,
      damageFees: 0,
      cleaningFees: 25,
      deliveryFees: 50,
      taxAmount: 78.30,
      totalAmount: 513.30
    },
    status: 'Paid',
    paymentStatus: 'Paid',
    issueDate: '2024-01-28',
    dueDate: '2024-02-12',
    paidDate: '2024-02-01',
    paymentMethod: 'Credit Card',
    notes: 'Payment received on time. Security deposit to be refunded after asset return.'
  },
  {
    id: '2',
    invoiceNumber: 'INV-RNT-2024-002',
    rentalOrderId: 'RNT-2024-002',
    customer: {
      name: 'Sarah Smith',
      email: 'sarah.smith@email.com',
      company: 'Creative Agency',
      address: '456 Design Ave, City, State 12345'
    },
    partner: {
      name: 'ToolMaster',
      company: 'ToolMaster Equipment',
      gstin: '19MNOPQ9012R3S4'
    },
    asset: {
      name: 'Power Drill Set Professional',
      serialNumber: 'TOOL-2024-002'
    },
    billingPeriod: {
      startDate: '2024-01-25',
      endDate: '2024-01-31',
      totalDays: 6
    },
    charges: {
      dailyRate: 25,
      totalRentalAmount: 150,
      securityDeposit: 200,
      lateFees: 15,
      damageFees: 0,
      cleaningFees: 0,
      deliveryFees: 30,
      taxAmount: 35.10,
      totalAmount: 230.10
    },
    status: 'Overdue',
    paymentStatus: 'Pending',
    issueDate: '2024-01-25',
    dueDate: '2024-02-08',
    notes: 'Asset returned late. Late fees applied.'
  },
  {
    id: '3',
    invoiceNumber: 'INV-RNT-2024-003',
    rentalOrderId: 'RNT-2024-003',
    customer: {
      name: 'Mike Johnson',
      email: 'mike.johnson@email.com',
      company: 'Event Planners Co.',
      address: '789 Event Plaza, City, State 12345',
      gstin: '33TUVWX3456Y7Z8'
    },
    partner: {
      name: 'EventPro',
      company: 'EventPro Audio Solutions',
      gstin: '12ABCDE7890F1G2'
    },
    asset: {
      name: 'Professional Sound System',
      serialNumber: 'AUD-2024-003'
    },
    billingPeriod: {
      startDate: '2024-01-20',
      endDate: '2024-01-30',
      totalDays: 10
    },
    charges: {
      dailyRate: 75,
      totalRentalAmount: 750,
      securityDeposit: 1000,
      lateFees: 75,
      damageFees: 150,
      cleaningFees: 50,
      deliveryFees: 100,
      taxAmount: 208.50,
      totalAmount: 1333.50
    },
    status: 'Sent',
    paymentStatus: 'Partial',
    issueDate: '2024-01-30',
    dueDate: '2024-02-15',
    notes: 'Minor damage to speaker grill. Damage fees applied. Partial payment received.'
  },
  {
    id: '4',
    invoiceNumber: 'INV-RNT-2024-004',
    rentalOrderId: 'RNT-2024-004',
    customer: {
      name: 'Lisa Chen',
      email: 'lisa.chen@email.com',
      company: 'Startup Hub',
      address: '321 Innovation Dr, City, State 12345'
    },
    partner: {
      name: 'BikeRentals',
      company: 'BikeRentals Co.',
      gstin: '45GHIJK1234L5M6'
    },
    asset: {
      name: 'Mountain Bike - Trek',
      serialNumber: 'BIKE-2024-004'
    },
    billingPeriod: {
      startDate: '2024-01-22',
      endDate: '2024-01-29',
      totalDays: 7
    },
    charges: {
      dailyRate: 35,
      totalRentalAmount: 245,
      securityDeposit: 300,
      lateFees: 0,
      damageFees: 0,
      cleaningFees: 15,
      deliveryFees: 25,
      taxAmount: 51.30,
      totalAmount: 336.30
    },
    status: 'Refunded',
    paymentStatus: 'Refunded',
    issueDate: '2024-01-29',
    dueDate: '2024-02-12',
    paidDate: '2024-01-30',
    paymentMethod: 'Bank Transfer',
    notes: 'Asset returned in excellent condition. Security deposit refunded.'
  },
  {
    id: '5',
    invoiceNumber: 'INV-RNT-2024-005',
    rentalOrderId: 'RNT-2024-005',
    customer: {
      name: 'David Wilson',
      email: 'david.wilson@email.com',
      company: 'Wilson Enterprises',
      address: '654 Business Blvd, City, State 12345'
    },
    partner: {
      name: 'UrbanRide',
      company: 'UrbanRide Mobility',
      gstin: '78NOPQR9012S3T4'
    },
    asset: {
      name: 'Electric Scooter',
      serialNumber: 'SCOOT-2024-005'
    },
    billingPeriod: {
      startDate: '2024-01-26',
      endDate: '2024-02-02',
      totalDays: 7
    },
    charges: {
      dailyRate: 20,
      totalRentalAmount: 140,
      securityDeposit: 150,
      lateFees: 0,
      damageFees: 0,
      cleaningFees: 0,
      deliveryFees: 20,
      taxAmount: 28.80,
      totalAmount: 188.80
    },
    status: 'Draft',
    paymentStatus: 'Pending',
    issueDate: '2024-02-01',
    dueDate: '2024-02-15',
    notes: 'Invoice being prepared. Rental completed successfully.'
  }
];

const InvoiceDetailModal = ({ invoice, isOpen, onClose, onDownload }: {
  invoice: RentalInvoice | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (invoice: RentalInvoice) => void;
}) => {
  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-[#37353E]">Invoice Details</h3>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => invoice && onDownload(invoice)}
              className="p-2 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
            </button>
            <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <PaperAirplaneIcon className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#D3DAD9] rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-[#715A5A]" />
            </button>
          </div>
        </div>

        {/* Invoice Header */}
        <div className="bg-[#D3DAD9]/20 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-[#37353E] mb-3">Invoice Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#715A5A]">Invoice Number:</span>
                  <span className="font-semibold text-[#37353E]">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#715A5A]">Rental Order:</span>
                  <span className="font-semibold text-[#37353E]">{invoice.rentalOrderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#715A5A]">Issue Date:</span>
                  <span className="text-[#37353E]">{invoice.issueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#715A5A]">Due Date:</span>
                  <span className="text-[#37353E]">{invoice.dueDate}</span>
                </div>
                {invoice.paidDate && (
                  <div className="flex justify-between">
                    <span className="text-[#715A5A]">Paid Date:</span>
                    <span className="text-green-600 font-semibold">{invoice.paidDate}</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-[#37353E] mb-3">Status</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#715A5A]">Invoice Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    invoice.status === 'Paid' 
                      ? 'bg-green-100 text-green-800'
                      : invoice.status === 'Sent'
                        ? 'bg-blue-100 text-blue-800'
                        : invoice.status === 'Overdue'
                          ? 'bg-red-100 text-red-800'
                          : invoice.status === 'Draft'
                            ? 'bg-gray-100 text-gray-800'
                            : invoice.status === 'Refunded'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#715A5A]">Payment Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    invoice.paymentStatus === 'Paid' 
                      ? 'bg-green-100 text-green-800'
                      : invoice.paymentStatus === 'Partial'
                        ? 'bg-yellow-100 text-yellow-800'
                        : invoice.paymentStatus === 'Failed'
                          ? 'bg-red-100 text-red-800'
                          : invoice.paymentStatus === 'Refunded'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                  }`}>
                    {invoice.paymentStatus}
                  </span>
                </div>
                {invoice.paymentMethod && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#715A5A]">Payment Method:</span>
                    <span className="text-[#37353E]">{invoice.paymentMethod}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer & Asset Info */}
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-[#37353E] mb-3">Bill To</h4>
              <div className="bg-white border border-[#D3DAD9] rounded-lg p-4">
                <p className="font-semibold text-[#37353E]">{invoice.customer.name}</p>
                <p className="text-[#37353E]">{invoice.customer.company}</p>
                <p className="text-[#715A5A] text-sm mt-2">{invoice.customer.address}</p>
                <p className="text-[#715A5A] text-sm">{invoice.customer.email}</p>
                {invoice.customer.gstin && (
                  <p className="text-[#715A5A] text-sm">GSTIN: {invoice.customer.gstin}</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-[#37353E] mb-3">Asset Information</h4>
              <div className="bg-white border border-[#D3DAD9] rounded-lg p-4">
                <p className="font-semibold text-[#37353E]">{invoice.asset.name}</p>
                <p className="text-[#715A5A] text-sm">Serial: {invoice.asset.serialNumber}</p>
                <p className="text-[#715A5A] text-sm">Partner: {invoice.partner.name}</p>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-[#37353E] mb-3">Rental Period</h4>
              <div className="bg-white border border-[#D3DAD9] rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[#715A5A] text-sm">Start Date</p>
                    <p className="font-semibold text-[#37353E]">{invoice.billingPeriod.startDate}</p>
                  </div>
                  <div>
                    <p className="text-[#715A5A] text-sm">End Date</p>
                    <p className="font-semibold text-[#37353E]">{invoice.billingPeriod.endDate}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-[#715A5A] text-sm">Total Days</p>
                  <p className="font-semibold text-[#37353E]">{invoice.billingPeriod.totalDays} days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charges Breakdown */}
          <div>
            <h4 className="text-lg font-semibold text-[#37353E] mb-3">Charges Breakdown</h4>
            <div className="bg-white border border-[#D3DAD9] rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#715A5A]">Daily Rate</span>
                  <span className="text-[#37353E]">₹{invoice.charges.dailyRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#715A5A]">Rental Amount ({invoice.billingPeriod.totalDays} days)</span>
                  <span className="text-[#37353E]">₹{invoice.charges.totalRentalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#715A5A]">Security Deposit</span>
                  <span className="text-[#37353E]">₹{invoice.charges.securityDeposit}</span>
                </div>
                {invoice.charges.lateFees > 0 && (
                  <div className="flex justify-between">
                    <span className="text-red-600">Late Fees</span>
                    <span className="text-red-600">₹{invoice.charges.lateFees}</span>
                  </div>
                )}
                {invoice.charges.damageFees > 0 && (
                  <div className="flex justify-between">
                    <span className="text-red-600">Damage Fees</span>
                    <span className="text-red-600">₹{invoice.charges.damageFees}</span>
                  </div>
                )}
                {invoice.charges.cleaningFees > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#715A5A]">Cleaning Fees</span>
                    <span className="text-[#37353E]">₹{invoice.charges.cleaningFees}</span>
                  </div>
                )}
                {invoice.charges.deliveryFees > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#715A5A]">Delivery Fees</span>
                    <span className="text-[#37353E]">₹{invoice.charges.deliveryFees}</span>
                  </div>
                )}
                <div className="border-t border-[#D3DAD9] pt-3">
                  <div className="flex justify-between">
                    <span className="text-[#715A5A]">Tax (18%)</span>
                    <span className="text-[#37353E]">₹{invoice.charges.taxAmount}</span>
                  </div>
                </div>
                <div className="border-t border-[#D3DAD9] pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-[#37353E]">Total Amount</span>
                    <span className="text-[#37353E]">₹{invoice.charges.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            {invoice.notes && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-[#37353E] mb-3">Notes</h4>
                <div className="bg-[#D3DAD9]/20 rounded-lg p-4">
                  <p className="text-[#37353E] text-sm">{invoice.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-[#D3DAD9]">
          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            Mark as Paid
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Send Reminder
          </button>
          <button 
            onClick={() => invoice && onDownload(invoice)}
            className="px-4 py-2 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors"
          >
            Download PDF
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function BillingPage() {
  const [invoices] = useState<RentalInvoice[]>(mockInvoices);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedInvoice, setSelectedInvoice] = useState<RentalInvoice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customer.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewInvoice = (invoice: RentalInvoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleDownloadInvoice = (invoice: RentalInvoice) => {
    try {
      // Convert RentalInvoice to InvoiceData format
      const invoiceData: InvoiceData = {
        id: invoice.invoiceNumber,
        orderId: invoice.rentalOrderId,
        product: invoice.asset.name,
        vendor: invoice.partner.company,
        amount: invoice.charges.totalRentalAmount,
        tax: invoice.charges.taxAmount,
        serviceFee: 0, // Not in RentalInvoice, set to 0
        securityDeposit: invoice.charges.securityDeposit,
        deliveryFee: invoice.charges.deliveryFees,
        cleaningFee: invoice.charges.cleaningFees,
        lateFee: invoice.charges.lateFees,
        damageFee: invoice.charges.damageFees,
        total: invoice.charges.totalAmount,
        status: invoice.status.toLowerCase(),
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        paidDate: invoice.paidDate,
        paymentMethod: invoice.paymentMethod,
        rentalPeriod: `${invoice.billingPeriod.startDate} to ${invoice.billingPeriod.endDate} (${invoice.billingPeriod.totalDays} days)`,
        customerInfo: {
          name: invoice.customer.name,
          email: invoice.customer.email,
          phone: '+91 98765 43210', // Mock phone
          address: invoice.customer.address,
        },
        vendorInfo: {
          name: invoice.partner.name,
          email: 'vendor@partner.com', // Mock email
          phone: '+91 80 2345 6789', // Mock phone
          address: '456, Business District, City, State - 560100', // Mock address
          gstin: invoice.partner.gstin,
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
      successMessage.textContent = `Invoice ${invoice.invoiceNumber} downloaded successfully!`;
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
    All: invoices.length,
    Draft: invoices.filter(i => i.status === 'Draft').length,
    Sent: invoices.filter(i => i.status === 'Sent').length,
    Paid: invoices.filter(i => i.status === 'Paid').length,
    Overdue: invoices.filter(i => i.status === 'Overdue').length,
    Cancelled: invoices.filter(i => i.status === 'Cancelled').length,
    Refunded: invoices.filter(i => i.status === 'Refunded').length,
  };

  const totalRevenue = invoices
    .filter(i => i.status === 'Paid')
    .reduce((sum, invoice) => sum + invoice.charges.totalAmount, 0);

  const pendingAmount = invoices
    .filter(i => i.status === 'Sent' || i.status === 'Overdue')
    .reduce((sum, invoice) => sum + invoice.charges.totalAmount, 0);

  const overdueAmount = invoices
    .filter(i => i.status === 'Overdue')
    .reduce((sum, invoice) => sum + invoice.charges.totalAmount, 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#37353E] mb-2">Billing & Invoices</h1>
            <p className="text-[#715A5A]">Manage rental invoices and billing</p>
          </div>
          <button className="px-4 py-2 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#715A5A]">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#715A5A]">Pending Amount</p>
              <p className="text-2xl font-bold text-yellow-600">₹{pendingAmount.toLocaleString()}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#715A5A]">Overdue Amount</p>
              <p className="text-2xl font-bold text-red-600">₹{overdueAmount.toLocaleString()}</p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#715A5A]">Total Invoices</p>
              <p className="text-2xl font-bold text-[#37353E]">{invoices.length}</p>
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
              placeholder="Search invoices..."
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

      {/* Invoices Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#D3DAD9] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#D3DAD9]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Issue Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Due Date
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
              {filteredInvoices.map((invoice) => (
                <motion.tr
                  key={invoice.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-[#D3DAD9]/20"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-[#37353E]">{invoice.invoiceNumber}</div>
                      <div className="text-sm text-[#715A5A]">{invoice.rentalOrderId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-[#37353E]">{invoice.customer.name}</div>
                      <div className="text-sm text-[#715A5A]">{invoice.customer.company}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-[#37353E]">{invoice.asset.name}</div>
                      <div className="text-sm text-[#715A5A]">{invoice.asset.serialNumber}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-[#37353E]">₹{invoice.charges.totalAmount}</div>
                    <div className="text-sm text-[#715A5A]">{invoice.billingPeriod.totalDays} days</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[#37353E]">{invoice.issueDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[#37353E]">{invoice.dueDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      invoice.status === 'Paid' 
                        ? 'bg-green-100 text-green-800'
                        : invoice.status === 'Sent'
                          ? 'bg-blue-100 text-blue-800'
                          : invoice.status === 'Overdue'
                            ? 'bg-red-100 text-red-800'
                            : invoice.status === 'Draft'
                              ? 'bg-gray-100 text-gray-800'
                              : invoice.status === 'Refunded'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewInvoice(invoice)}
                        className="text-[#44444E] hover:text-[#37353E]"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadInvoice(invoice)}
                        className="text-[#44444E] hover:text-[#37353E]"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-800">
                        <PaperAirplaneIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      <AnimatePresence>
        <InvoiceDetailModal
          invoice={selectedInvoice}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onDownload={handleDownloadInvoice}
        />
      </AnimatePresence>
    </div>
  );
}