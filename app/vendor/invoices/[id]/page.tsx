"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { generateInvoicePDF, buildInvoiceData } from "../../../../lib/invoiceGenerator";
import { api } from "@/app/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";

// Types for invoice detail
interface InvoiceDetail {
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
    discount: number;
    customer: {
      user: {
        firstName: string;
        lastName: string;
        email: string;
      };
      phone: string | null;
      defaultAddress: string | null;
    };
    vendor: {
      companyName: string;
      gstin: string | null;
      address: string | null;
      logoUrl: string | null;
    };
  };
  lines: {
    product: {
      name: string;
      description: string | null;
    };
    quantity: number;
    unitPrice: number;
    amount: number;
    description: string | null;
  }[];
  payments: {
    id: string;
    method: string;
    amount: number;
    status: string;
    transactionRef: string | null;
    createdAt: string;
  }[];
}

const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case "POSTED":
      return { bg: "#dcfce7", text: "#16a34a", icon: CheckCircleIcon };
    case "DRAFT":
      return { bg: "#fef3c7", text: "#d97706", icon: ClockIcon };
    case "CANCELLED":
      return { bg: "#fee2e2", text: "#dc2626", icon: ExclamationTriangleIcon };
    default:
      return { bg: "#f0f9ff", text: "#1e40af", icon: DocumentTextIcon };
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const calculateDays = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default function VendorInvoiceDetail() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all invoices and find the one we need
        const response = await api.get<{ success: boolean; invoices: InvoiceDetail[] }>('/invoices');
        
        if (!response.success) {
          throw new Error('Failed to fetch invoices');
        }

        const foundInvoice = response.invoices.find(inv => inv.id === params.id);
        
        if (!foundInvoice) {
          throw new Error('Invoice not found');
        }

        setInvoice(foundInvoice);
      } catch (err: any) {
        console.error('Error fetching invoice:', err);
        setError(err.message || 'Failed to load invoice');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchInvoice();
    }
  }, [params.id]);

  const handleDownloadPDF = async () => {
    if (!invoice) return;

    try {
      // Get company settings
      const settingsResponse = await fetch('/api/settings/company');
      const settingsData = await settingsResponse.json();
      const companyInfo = settingsData.companyInfo || {
        name: 'RentMarket Platform',
        address: '123 Platform Street, Tech City, CA 94000',
        phone: '+1-800-RENTALS',
        email: 'support@rentmarket.com',
        website: 'www.rentmarket.com',
        gstin: '29PLATFORM1234F1Z5'
      };

      const invoiceData = buildInvoiceData({
        invoiceNumber: invoice.invoiceNumber,
        orderId: invoice.saleOrder.id,
        orderNumber: invoice.saleOrder.orderNumber,
        status: invoice.status,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        totalAmount: invoice.totalAmount,
        subtotal: invoice.subtotal,
        taxAmount: invoice.taxAmount,
        serviceFee: 0,
        paidDate: invoice.payments.find(p => p.status === 'COMPLETED')?.createdAt || null,
        paymentMethod: invoice.payments[0]?.method || 'Razorpay',
        startDate: invoice.saleOrder.startDate,
        endDate: invoice.saleOrder.endDate,
        customer: {
          name: `${invoice.saleOrder.customer.user.firstName} ${invoice.saleOrder.customer.user.lastName}`,
          email: invoice.saleOrder.customer.user.email,
          phone: invoice.saleOrder.customer.phone || '+91 XXXXX XXXXX',
          address: invoice.saleOrder.customer.defaultAddress || 'Address not provided'
        },
        vendor: {
          name: invoice.saleOrder.vendor.companyName,
          gstin: invoice.saleOrder.vendor.gstin,
          logoUrl: invoice.saleOrder.vendor.logoUrl,
          email: user?.email || '',
          phone: '',
          address: invoice.saleOrder.vendor.address || ''
        },
        lines: invoice.lines.map(line => ({
          name: line.product.name,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          amount: line.amount
        })),
        companyInfo
      });

      await generateInvoicePDF(invoiceData);

      // Show success message
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

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">Invoice Not Found</h2>
          <p className="text-secondary-600 mb-6">{error || 'The invoice you are looking for does not exist.'}</p>
          <Link
            href="/vendor/invoices"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Invoices
          </Link>
        </div>
      </div>
    );
  }

  const statusColor = getStatusColor(invoice.status);
  const StatusIcon = statusColor.icon;
  const rentalDays = calculateDays(invoice.saleOrder.startDate, invoice.saleOrder.endDate);
  const completedPayments = invoice.payments.filter(p => p.status === 'COMPLETED');

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/vendor/invoices"
          className="flex items-center text-secondary-600 hover:text-secondary-900 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Invoices
        </Link>

        <div className="flex items-center space-x-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors text-secondary-700"
          >
            <PrinterIcon className="h-5 w-5 mr-2" />
            Print
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Invoice Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Invoice Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">INVOICE</h1>
              <p className="text-primary-100">#{invoice.invoiceNumber}</p>
            </div>
            <div
              className="px-4 py-2 rounded-full text-sm font-medium flex items-center"
              style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
            >
              <StatusIcon className="h-5 w-5 mr-2" />
              {invoice.status}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-primary-100 text-sm mb-1">Invoice Date</p>
              <p className="font-semibold">{formatDate(invoice.invoiceDate)}</p>
            </div>
            <div>
              <p className="text-primary-100 text-sm mb-1">Due Date</p>
              <p className="font-semibold">{formatDate(invoice.dueDate)}</p>
            </div>
            <div>
              <p className="text-primary-100 text-sm mb-1">Order Number</p>
              <p className="font-semibold">{invoice.saleOrder.orderNumber}</p>
            </div>
          </div>
        </div>

        {/* Invoice Body */}
        <div className="p-8">
          {/* Parties Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Vendor (From) */}
            <div className="bg-secondary-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <BuildingOfficeIcon className="h-6 w-6 text-primary-600 mr-2" />
                <h3 className="font-bold text-lg text-secondary-900">From (Vendor)</h3>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-secondary-900">{invoice.saleOrder.vendor.companyName}</p>
                {invoice.saleOrder.vendor.gstin && (
                  <p className="text-sm text-secondary-600">GSTIN: {invoice.saleOrder.vendor.gstin}</p>
                )}
                {invoice.saleOrder.vendor.address && (
                  <p className="text-sm text-secondary-600">{invoice.saleOrder.vendor.address}</p>
                )}
                <p className="text-sm text-secondary-600">{user?.email}</p>
              </div>
            </div>

            {/* Customer (To) */}
            <div className="bg-secondary-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <UserIcon className="h-6 w-6 text-primary-600 mr-2" />
                <h3 className="font-bold text-lg text-secondary-900">To (Customer)</h3>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-secondary-900">
                  {invoice.saleOrder.customer.user.firstName} {invoice.saleOrder.customer.user.lastName}
                </p>
                <p className="text-sm text-secondary-600">{invoice.saleOrder.customer.user.email}</p>
                {invoice.saleOrder.customer.phone && (
                  <p className="text-sm text-secondary-600">{invoice.saleOrder.customer.phone}</p>
                )}
                {invoice.saleOrder.customer.defaultAddress && (
                  <p className="text-sm text-secondary-600">{invoice.saleOrder.customer.defaultAddress}</p>
                )}
              </div>
            </div>
          </div>

          {/* Rental Period */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-3">
              <CalendarIcon className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="font-bold text-lg text-secondary-900">Rental Period</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-secondary-600 mb-1">Start Date</p>
                <p className="font-semibold text-secondary-900">{formatDate(invoice.saleOrder.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-600 mb-1">End Date</p>
                <p className="font-semibold text-secondary-900">{formatDate(invoice.saleOrder.endDate)}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-600 mb-1">Duration</p>
                <p className="font-semibold text-secondary-900">{rentalDays} day{rentalDays !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-8">
            <h3 className="font-bold text-lg text-secondary-900 mb-4">Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-900">#</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-900">Product</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-secondary-900">Quantity</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-secondary-900">Unit Price</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-secondary-900">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200">
                  {invoice.lines.map((line, index) => (
                    <tr key={index} className="hover:bg-secondary-50">
                      <td className="px-4 py-4 text-sm text-secondary-600">{index + 1}</td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-secondary-900">{line.product.name}</p>
                        {line.product.description && (
                          <p className="text-sm text-secondary-600">{line.product.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-secondary-900">{line.quantity}</td>
                      <td className="px-4 py-4 text-right text-sm text-secondary-900">₹{line.unitPrice.toFixed(2)}</td>
                      <td className="px-4 py-4 text-right font-medium text-secondary-900">₹{line.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="flex justify-end mb-8">
            <div className="w-full md:w-1/2 lg:w-1/3">
              <div className="bg-secondary-50 rounded-lg p-6 space-y-3">
                <div className="flex justify-between text-secondary-700">
                  <span>Subtotal:</span>
                  <span>₹{invoice.subtotal}</span>
                </div>
                {invoice.saleOrder.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-₹{invoice.saleOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-secondary-700">
                  <span>Tax (GST):</span>
                  <span>₹{invoice.taxAmount}</span>
                </div>
                <div className="border-t border-secondary-300 pt-3">
                  <div className="flex justify-between text-lg font-bold text-secondary-900">
                    <span>Total Amount:</span>
                    <span>₹{invoice.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
                {invoice.paidAmount > 0 && (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span>Paid Amount:</span>
                      <span>₹{invoice.paidAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-yellow-600 font-semibold">
                      <span>Balance Due:</span>
                      <span>₹{invoice.balanceDue.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {completedPayments.length > 0 && (
            <div className="bg-green-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <CreditCardIcon className="h-6 w-6 text-green-600 mr-2" />
                <h3 className="font-bold text-lg text-secondary-900">Payment Information</h3>
              </div>
              <div className="space-y-3">
                {completedPayments.map((payment, index) => (
                  <div key={payment.id} className="flex items-center justify-between bg-white rounded-lg p-4">
                    <div>
                      <p className="font-medium text-secondary-900">Payment #{index + 1}</p>
                      <p className="text-sm text-secondary-600">
                        {payment.method} • {formatDate(payment.createdAt)}
                      </p>
                      {payment.transactionRef && (
                        <p className="text-xs text-secondary-500">Ref: {payment.transactionRef}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">₹{payment.amount.toFixed(2)}</p>
                      <p className="text-xs text-green-600">{payment.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Notes */}
          <div className="mt-8 pt-8 border-t border-secondary-200">
            <p className="text-sm text-secondary-600 text-center">
              Thank you for your business! For any queries, please contact us at {user?.email}
            </p>
            <p className="text-xs text-secondary-500 text-center mt-2">
              This is a computer-generated invoice and does not require a signature.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
