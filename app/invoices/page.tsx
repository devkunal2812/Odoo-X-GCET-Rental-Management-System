"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import { useAuth } from "@/contexts/AuthContext";
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
import { generateInvoicePDF, buildInvoiceData, type InvoiceAPIData } from "../../lib/invoiceGenerator";
import { api } from "@/app/lib/api-client";

// Utility function for consistent date formatting
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

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
    startDate: string | null;
    endDate: string | null;
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
    };
    lines: Array<{
      product: {
        name: string;
      };
      quantity: number;
      unitPrice: number;
    }>;
  };
  lines: Array<{
    product: {
      name: string;
    };
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  payments: Array<{
    method: string;
    amount: number;
    status: string;
    transactionRef: string | null;
    createdAt: string;
  }>;
}

// Load invoices from database API
const loadInvoicesFromDatabase = async (): Promise<Invoice[]> => {
  try {
    console.log('🔗 Fetching invoices from database...');
    
    // Try to fetch from the invoices API (works for vendors/admins)
    try {
      const result = await api.get<{ success: boolean; invoices: any[] }>('/invoices');
      
      if (result.success && result.invoices.length > 0) {
        console.log(`✅ Loaded ${result.invoices.length} real invoices from database (vendor/admin endpoint)`);
        // This endpoint returns the full Invoice structure with lines already populated
        return result.invoices as Invoice[];
      }
    } catch (apiError) {
      console.log('ℹ️ Vendor/Admin endpoint not accessible, trying customer endpoint...');
    }
    
    // If that fails, we're likely a customer - fetch from user endpoint
    // But we need to get REAL data, not mock data
    const response = await fetch('/api/invoices/user', {
      credentials: 'include', // ✅ Include cookies for authentication
    });
    
    if (response.status === 401) {
      console.log('❌ Authentication required - redirecting to login');
      window.location.href = '/login?message=Please login to view your invoices';
      return [];
    }
    
    const result = await response.json();
    
    if (!result.success || !result.invoices || result.invoices.length === 0) {
      console.log(`ℹ️ No invoices found for user: ${result.user || 'unknown'}`);
      return [];
    }
    
    console.log(`✅ Loaded ${result.invoices.length} invoices for user: ${result.user || 'unknown'}`);
    console.log('📄 Invoice data:', result.invoices[0]); // Log first invoice to see structure
    
    // The user endpoint returns data in a different format, transform it
    return result.invoices.map((inv: any) => ({
      id: inv.dbInvoiceId || inv.id,
      invoiceNumber: inv.id,
      status: inv.status === 'paid' ? 'POSTED' : 'DRAFT',
      invoiceDate: inv.issueDate,
      dueDate: inv.dueDate,
      totalAmount: inv.total,
      subtotal: String(inv.amount),
      taxAmount: String(inv.tax),
      paidAmount: inv.status === 'paid' ? inv.total : 0,
      balanceDue: inv.status === 'paid' ? 0 : inv.total,
      saleOrder: {
        id: inv.dbOrderId || inv.orderId,
        orderNumber: inv.orderId,
        startDate: null,
        endDate: null,
        customer: {
          user: {
            firstName: inv.orderData?.deliveryAddress?.name?.split(' ')[0] || 'Customer',
            lastName: inv.orderData?.deliveryAddress?.name?.split(' ').slice(1).join(' ') || '',
            email: inv.orderData?.deliveryAddress?.email || '',
          },
          phone: inv.orderData?.deliveryAddress?.phone || null,
          defaultAddress: inv.orderData?.deliveryAddress?.street || null,
        },
        vendor: {
          companyName: inv.vendor,
        },
        lines: inv.orderData?.items?.map((item: any) => ({
          product: {
            name: item.name,
          },
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })) || [],
      },
      lines: inv.orderData?.items?.map((item: any) => ({
        product: {
          name: item.name,
        },
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.totalPrice,
      })) || [{
        product: { name: inv.product },
        quantity: 1,
        unitPrice: inv.amount,
        amount: inv.amount,
      }],
      payments: inv.paymentVerified ? [{
        method: inv.paymentMethod || 'Razorpay',
        amount: inv.total,
        status: 'COMPLETED',
        transactionRef: inv.paymentId || null,
        createdAt: inv.paidDate || inv.issueDate,
      }] : [],
    }));
    
  } catch (error) {
    console.error('❌ Error loading invoices:', error);
    return [];
  }
};

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
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/login?message=Please login to view your invoices';
      return;
    }
  }, [authLoading, isAuthenticated]);

  // Load invoices from database when component mounts and user is authenticated
  useEffect(() => {
    if (!isAuthenticated || authLoading) return;

    const loadInvoices = async () => {
      try {
        console.log(`🔍 Loading invoices for user: ${user?.email}...`);
        setLoading(true);
        setError(null);
        
        const dbInvoices = await loadInvoicesFromDatabase();
        setInvoices(dbInvoices);
        
        if (dbInvoices.length > 0) {
          console.log(`✅ Loaded ${dbInvoices.length} invoices for user ${user?.email}`);
        } else {
          console.log(`ℹ️ No invoices found for user ${user?.email}`);
        }
      } catch (error: any) {
        console.error('❌ Error loading invoices:', error);
        setError(error.message || 'Failed to load invoices');
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();

    // Listen for order updates to refresh invoices
    const handleOrderUpdate = () => loadInvoices();
    window.addEventListener('orderUpdated', handleOrderUpdate);
    
    return () => window.removeEventListener('orderUpdated', handleOrderUpdate);
  }, [isAuthenticated, authLoading, user]);

  const filteredInvoices = invoices.filter(invoice => {
    const productName = invoice.lines[0]?.product.name || '';
    const vendorName = invoice.saleOrder.vendor.companyName;
    
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Map invoice status to display status
    const displayStatus = invoice.status === 'POSTED' ? 'pending' : invoice.status.toLowerCase();
    const matchesStatus = selectedStatus === "All" || displayStatus === selectedStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      // Find the invoice
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      console.log('📄 Generating PDF for invoice:', invoice.invoiceNumber);
      console.log('📦 Invoice lines:', invoice.lines);
      console.log('🛒 Order lines:', invoice.saleOrder.lines);

      // Get company info from public settings endpoint
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

      // Build invoice data from real data
      const invoiceAPIData: InvoiceAPIData = {
        invoiceNumber: invoice.invoiceNumber,
        orderId: invoice.saleOrder.id,
        orderNumber: invoice.saleOrder.orderNumber,
        status: invoice.status,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        totalAmount: invoice.totalAmount,
        subtotal: invoice.subtotal,
        taxAmount: invoice.taxAmount,
        serviceFee: 0, // Calculate if needed
        paidDate: invoice.payments.find(p => p.status === 'COMPLETED')?.createdAt || null,
        paymentMethod: invoice.payments[0]?.method || 'Razorpay',
        startDate: invoice.saleOrder.startDate || undefined,
        endDate: invoice.saleOrder.endDate || undefined,
        customer: {
          name: `${invoice.saleOrder.customer.user.firstName} ${invoice.saleOrder.customer.user.lastName}`,
          email: invoice.saleOrder.customer.user.email,
          phone: invoice.saleOrder.customer.phone || '+91 XXXXX XXXXX',
          address: invoice.saleOrder.customer.defaultAddress || 'Address not provided'
        },
        vendor: {
          name: invoice.saleOrder.vendor.companyName,
          email: '',
          phone: '',
          address: ''
        },
        lines: invoice.lines.map(line => ({
          name: line.product.name,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          amount: line.amount
        })),
        companyInfo
      };

      console.log('📋 Invoice API Data being sent to PDF generator:', invoiceAPIData);
      console.log('📋 Lines being sent:', invoiceAPIData.lines);

      // Build and generate PDF
      const invoiceData = buildInvoiceData(invoiceAPIData);
      console.log('📋 Built invoice data:', invoiceData);
      console.log('📋 Product lines in built data:', invoiceData.productLines);
      
      await generateInvoicePDF(invoiceData);
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successMessage.textContent = `Invoice ${invoice.invoiceNumber} downloaded successfully!`;
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
      }, 3000);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      errorMessage.textContent = 'Error generating PDF. Please try again.';
      document.body.appendChild(errorMessage);
      
      setTimeout(() => {
        if (document.body.contains(errorMessage)) {
          document.body.removeChild(errorMessage);
        }
      }, 3000);
    }
  };

  const handlePayInvoice = (invoiceId: string) => {
    // In a real app, this would redirect to payment page
    console.log(`Paying invoice ${invoiceId}`);
    alert(`Redirecting to payment for invoice ${invoiceId}...`);
  };

  const totalPaid = filteredInvoices
    .filter(inv => inv.paidAmount > 0)
    .reduce((sum, inv) => sum + inv.paidAmount, 0);
  
  const pendingAmount = filteredInvoices
    .filter(inv => inv.balanceDue > 0)
    .reduce((sum, inv) => sum + inv.balanceDue, 0);

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#D3DAD9]">
        <Header currentPage="invoices" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#37353E] mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2 text-[#37353E]">
              {authLoading ? 'Checking Authentication...' : 'Loading Invoices...'}
            </h3>
            <p className="text-[#715A5A]">
              {authLoading ? 'Please wait while we verify your login.' : `Please wait while we fetch your invoices${user ? ` for ${user.email}` : ''}.`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#D3DAD9]">
      <Header currentPage="invoices" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/orders"
              className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-[#37353E]"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-[#37353E]">
                My Invoices
              </h1>
              <p className="mt-2 text-[#715A5A]">
                View and manage your rental invoices{user ? ` for ${user.email}` : ''}
              </p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <span className="text-sm font-medium text-[#715A5A]">
              {filteredInvoices.length} invoices
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#44444E]/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#715A5A]">Total Invoices</p>
                <p className="text-2xl font-bold text-[#37353E]">
                  {filteredInvoices.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-[#D3DAD9] flex items-center justify-center">
                <DocumentTextIcon className="h-6 w-6 text-[#37353E]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#44444E]/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#715A5A]">Paid Invoices</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredInvoices.filter(inv => inv.paidAmount >= inv.totalAmount).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#44444E]/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#715A5A]">Total Paid</p>
                <p className="text-2xl font-bold text-[#37353E]">
                  ₹{totalPaid.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-[#D3DAD9] flex items-center justify-center">
                <CalendarIcon className="h-6 w-6 text-[#37353E]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#44444E]/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#715A5A]">Pending Amount</p>
                <p className="text-2xl font-bold text-yellow-600">
                  ₹{pendingAmount.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-[#44444E]/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#715A5A]" />
              <input
                type="text"
                placeholder="Search invoices, products, vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent text-[#37353E]"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center px-4 py-3 rounded-lg border-2 border-[#37353E] text-[#37353E] transition-colors hover:bg-[#37353E] hover:text-white"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters
            </button>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center space-x-4">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 border-2 border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] text-[#37353E]"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="lg:hidden mt-4 pt-4 border-t border-[#D3DAD9]">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] text-[#37353E]"
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
            const productName = invoice.lines[0]?.product.name || 'Rental Items';
            const vendorName = invoice.saleOrder.vendor.companyName;
            const displayStatus = invoice.paidAmount >= invoice.totalAmount ? 'paid' : 
                                 invoice.balanceDue > 0 ? 'pending' : 'pending';
            
            const statusColor = getStatusColor(displayStatus);
            const StatusIcon = statusColor.icon;
            
            // Format rental period
            const formatPeriod = (start: string | null, end: string | null): string => {
              if (!start || !end) return 'N/A';
              const startDate = new Date(start);
              const endDate = new Date(end);
              const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
              return `${startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} (${days} days)`;
            };
            
            const rentalPeriod = formatPeriod(invoice.saleOrder.startDate, invoice.saleOrder.endDate);
            const paidDate = invoice.payments.find(p => p.status === 'COMPLETED')?.createdAt;
            const paymentMethod = invoice.payments[0]?.method || 'Razorpay';
            
            return (
              <div key={invoice.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-[#44444E]/20">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    {/* Invoice Info */}
                    <div className="flex-1 mb-4 lg:mb-0">
                      <div className="flex items-center mb-3">
                        <h3 className="font-bold text-xl mr-4 text-[#37353E]">
                          {invoice.invoiceNumber}
                        </h3>
                        <span
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                          style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                        >
                          <StatusIcon className="h-4 w-4 mr-1" />
                          {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-1 text-[#37353E]">
                            {productName}
                          </h4>
                          <p className="text-sm mb-1 text-[#715A5A]">
                            <strong>Vendor:</strong> {vendorName}
                          </p>
                          <p className="text-sm mb-1 text-[#715A5A]">
                            <strong>Order:</strong> {invoice.saleOrder.orderNumber}
                          </p>
                          <p className="text-sm text-[#715A5A]">
                            <strong>Rental Period:</strong> {rentalPeriod}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm mb-1 text-[#715A5A]">
                            <strong>Issue Date:</strong> {formatDate(invoice.invoiceDate)}
                          </p>
                          <p className="text-sm mb-1 text-[#715A5A]">
                            <strong>Due Date:</strong> {formatDate(invoice.dueDate)}
                          </p>
                          {paidDate && (
                            <p className="text-sm mb-1 text-green-600">
                              <strong>Paid:</strong> {formatDate(paidDate)}
                            </p>
                          )}
                          <p className="text-sm text-[#715A5A]">
                            <strong>Payment:</strong> {paymentMethod}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Amount and Actions */}
                    <div className="flex flex-col items-end space-y-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#37353E]">
                          ₹{invoice.totalAmount.toFixed(2)}
                        </div>
                        <div className="text-sm text-[#715A5A]">
                          Subtotal: ₹{invoice.subtotal} + Tax: ₹{invoice.taxAmount}
                        </div>
                        {invoice.paidAmount > 0 && (
                          <div className="text-sm text-green-600">
                            Paid: ₹{invoice.paidAmount.toFixed(2)}
                          </div>
                        )}
                        {invoice.balanceDue > 0 && (
                          <div className="text-sm text-yellow-600">
                            Balance: ₹{invoice.balanceDue.toFixed(2)}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="p-2 rounded-lg hover:bg-[#D3DAD9] transition-colors text-[#715A5A]"
                          title="View Invoice"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        
                        <button
                          onClick={() => handleDownloadInvoice(invoice.id)}
                          className="p-2 rounded-lg hover:bg-[#D3DAD9] transition-colors text-[#715A5A] hover:text-[#37353E]"
                          title="Download PDF"
                        >
                          <ArrowDownTrayIcon className="h-5 w-5" />
                        </button>

                        {invoice.balanceDue > 0 && (
                          <button
                            onClick={() => handlePayInvoice(invoice.id)}
                            className="px-4 py-2 rounded-lg font-medium text-sm transition-colors hover:opacity-90 bg-yellow-100 text-yellow-700"
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
            <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center bg-[#D3DAD9]">
              <DocumentTextIcon className="h-12 w-12 text-[#715A5A]" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#37353E]">
              {invoices.length === 0 ? "No invoices available" : "No invoices found"}
            </h3>
            <p className="mb-6 text-[#715A5A]">
              {invoices.length === 0 
                ? `Complete a purchase to generate your first invoice${user ? ` for ${user.email}` : ''}` 
                : "Try adjusting your search or filters"
              }
            </p>
            {invoices.length === 0 ? (
              <Link
                href="/products"
                className="px-6 py-3 rounded-lg font-semibold transition-colors hover:opacity-90 bg-[#37353E] text-white"
              >
                Browse Products
              </Link>
            ) : (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedStatus("All");
                }}
                className="px-6 py-3 rounded-lg font-semibold transition-colors hover:opacity-90 bg-[#37353E] text-white"
              >
                Clear Filters
              </button>
            )}
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