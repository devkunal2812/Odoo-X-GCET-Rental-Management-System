"use client";

import React, { useState, useEffect } from "react";
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
import { generateInvoicePDF, generateSampleInvoiceData } from "../../lib/invoiceGenerator";

// Utility function for consistent date formatting
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Load orders from localStorage
const loadOrdersFromStorage = () => {
  if (typeof window === 'undefined') return [];
  
  try {
    const orders = localStorage.getItem('userOrders');
    return orders ? JSON.parse(orders) : [];
  } catch (error) {
    console.error('Error loading orders from localStorage:', error);
    return [];
  }
};

// Load orders from database API
const loadOrdersFromDatabase = async () => {
  try {
    const response = await fetch('/api/orders/user');
    const result = await response.json();
    
    if (result.success) {
      console.log(`Loaded ${result.orders.length} orders from ${result.source} for invoices`);
      return result.orders;
    } else {
      console.log('Database API failed, falling back to localStorage for invoices');
      return loadOrdersFromStorage();
    }
  } catch (error) {
    console.error('Error loading orders from database for invoices:', error);
    console.log('Falling back to localStorage for invoices');
    return loadOrdersFromStorage();
  }
};

// Load invoices from database API
const loadInvoicesFromDatabase = async () => {
  try {
    const response = await fetch('/api/invoices/user');
    const result = await response.json();
    
    if (result.success && result.invoices.length > 0) {
      console.log(`Loaded ${result.invoices.length} invoices from ${result.source}`);
      return result.invoices;
    } else {
      console.log('No invoices in database, generating from orders');
      // Fall back to generating from orders
      const orders = await loadOrdersFromDatabase();
      return orders.map(generateInvoiceFromOrder);
    }
  } catch (error) {
    console.error('Error loading invoices from database:', error);
    console.log('Falling back to generating invoices from orders');
    const orders = await loadOrdersFromDatabase();
    return orders.map(generateInvoiceFromOrder);
  }
};

// Generate invoice data from order
const generateInvoiceFromOrder = (order: any) => {
  const invoiceId = `INV-${order.id.replace('ORD-', '')}`;
  const issueDate = order.orderDate || new Date().toISOString().split('T')[0];
  const dueDate = new Date(new Date(issueDate).getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  // Calculate tax and fees
  const subtotal = order.amount || 0;
  const tax = subtotal * 0.18; // 18% GST
  const serviceFee = subtotal * 0.05; // 5% service fee
  const total = subtotal + tax + serviceFee;
  
  return {
    id: invoiceId,
    orderId: order.id,
    product: order.product?.name || 'Rental Items',
    vendor: order.vendor?.name || 'Vendor',
    amount: subtotal,
    tax: tax,
    serviceFee: serviceFee,
    total: total,
    status: order.paymentStatus === 'paid' ? 'paid' : 'pending',
    issueDate: issueDate,
    dueDate: dueDate,
    paidDate: order.paymentStatus === 'paid' ? (order.paymentTimestamp ? order.paymentTimestamp.split('T')[0] : issueDate) : null,
    paymentMethod: order.paymentMethod || (order.paymentStatus === 'paid' ? 'Razorpay' : ''),
    rentalPeriod: order.startDate && order.endDate 
      ? `${formatDate(order.startDate)} - ${formatDate(order.endDate)} (${order.duration || 1} ${order.unit || 'days'})`
      : 'N/A',
    paymentId: order.paymentId,
    razorpayOrderId: order.razorpayOrderId,
    paymentVerified: order.paymentVerified || false,
    orderData: order // Store full order data for invoice generation
  };
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load invoices from database when component mounts
  useEffect(() => {
    const loadInvoices = async () => {
      try {
        // Try to load invoices directly from database first
        const dbInvoices = await loadInvoicesFromDatabase();
        
        if (dbInvoices.length > 0) {
          setInvoices(dbInvoices);
          setLoading(false);
          return;
        }
        
        // If no database invoices, fall back to generating from orders
        const localOrders = loadOrdersFromStorage();
        const generatedInvoices = localOrders.map(generateInvoiceFromOrder);
        setInvoices(generatedInvoices);
        setLoading(false);
        
      } catch (error) {
        console.error('Error loading invoices:', error);
        // Final fallback to localStorage orders
        const localOrders = loadOrdersFromStorage();
        const generatedInvoices = localOrders.map(generateInvoiceFromOrder);
        setInvoices(generatedInvoices);
        setLoading(false);
      }
    };

    loadInvoices();

    // Listen for order updates to refresh invoices
    const handleOrderUpdate = () => loadInvoices();
    window.addEventListener('orderUpdated', handleOrderUpdate);
    
    return () => window.removeEventListener('orderUpdated', handleOrderUpdate);
  }, []);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "All" || invoice.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleDownloadInvoice = (invoiceId: string) => {
    try {
      // Find the actual invoice from invoices to get real data
      const actualInvoice = invoices.find(inv => inv.id === invoiceId);
      if (!actualInvoice) {
        throw new Error('Invoice not found');
      }

      // Generate invoice data using real order data
      const invoiceData = generateSampleInvoiceData(invoiceId);
      
      // Update the sample data with actual invoice data
      invoiceData.id = actualInvoice.id;
      invoiceData.orderId = actualInvoice.orderId;
      invoiceData.product = actualInvoice.product;
      invoiceData.vendor = actualInvoice.vendor;
      invoiceData.amount = actualInvoice.amount;
      invoiceData.tax = actualInvoice.tax;
      invoiceData.serviceFee = actualInvoice.serviceFee;
      invoiceData.total = actualInvoice.total;
      invoiceData.status = actualInvoice.status;
      invoiceData.issueDate = actualInvoice.issueDate;
      invoiceData.dueDate = actualInvoice.dueDate;
      invoiceData.paidDate = actualInvoice.paidDate;
      invoiceData.paymentMethod = actualInvoice.paymentMethod || 'Razorpay';
      invoiceData.rentalPeriod = actualInvoice.rentalPeriod;

      // Use real order data if available
      if (actualInvoice.orderData) {
        const order = actualInvoice.orderData;
        
        // Update customer info with real delivery address
        if (order.deliveryAddress) {
          invoiceData.customerInfo.name = order.deliveryAddress.name;
          invoiceData.customerInfo.email = order.deliveryAddress.email;
          invoiceData.customerInfo.phone = order.deliveryAddress.phone;
          invoiceData.customerInfo.address = `${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} - ${order.deliveryAddress.zip}`;
        }

        // Add payment verification info
        if (order.paymentVerified && order.paymentId) {
          invoiceData.paymentMethod = `${order.paymentMethod || 'Razorpay'} - ID: ${order.paymentId}`;
        }

        // Add order items if available
        if (order.items && order.items.length > 0) {
          invoiceData.productLines = order.items.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.totalPrice
          }));
        }
      }
      
      // Generate and download PDF
      generateInvoicePDF(invoiceData);
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successMessage.textContent = `Invoice ${invoiceId} downloaded successfully!`;
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

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#D3DAD9]">
        <Header currentPage="invoices" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#37353E] mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2 text-[#37353E]">Loading Invoices...</h3>
            <p className="text-[#715A5A]">Please wait while we fetch your invoices.</p>
          </div>
        </div>
      </div>
    );
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
                View and manage your rental invoices
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
                  {filteredInvoices.filter(inv => inv.status === "paid").length}
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
            const statusColor = getStatusColor(invoice.status);
            const StatusIcon = statusColor.icon;
            
            return (
              <div key={invoice.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-[#44444E]/20">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    {/* Invoice Info */}
                    <div className="flex-1 mb-4 lg:mb-0">
                      <div className="flex items-center mb-3">
                        <h3 className="font-bold text-xl mr-4 text-[#37353E]">
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
                          <h4 className="font-semibold mb-1 text-[#37353E]">
                            {invoice.product}
                          </h4>
                          <p className="text-sm mb-1 text-[#715A5A]">
                            <strong>Vendor:</strong> {invoice.vendor}
                          </p>
                          <p className="text-sm mb-1 text-[#715A5A]">
                            <strong>Order:</strong> {invoice.orderId}
                          </p>
                          <p className="text-sm text-[#715A5A]">
                            <strong>Rental Period:</strong> {invoice.rentalPeriod}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm mb-1 text-[#715A5A]">
                            <strong>Issue Date:</strong> {formatDate(invoice.issueDate)}
                          </p>
                          <p className="text-sm mb-1 text-[#715A5A]">
                            <strong>Due Date:</strong> {formatDate(invoice.dueDate)}
                          </p>
                          {invoice.paidDate && (
                            <p className="text-sm mb-1 text-green-600">
                              <strong>Paid:</strong> {formatDate(invoice.paidDate)}
                            </p>
                          )}
                          {invoice.paymentMethod && (
                            <p className="text-sm text-[#715A5A]">
                              <strong>Payment:</strong> {invoice.paymentMethod}
                            </p>
                          )}
                          {invoice.paymentVerified && invoice.paymentId && (
                            <p className="text-sm text-green-600">
                              <strong>✅ Verified:</strong> {invoice.paymentId}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Amount and Actions */}
                    <div className="flex flex-col items-end space-y-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#37353E]">
                          ₹{invoice.total.toFixed(2)}
                        </div>
                        <div className="text-sm text-[#715A5A]">
                          Amount: ₹{invoice.amount} + Tax: ₹{invoice.tax} + Fee: ₹{invoice.serviceFee}
                        </div>
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
            <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center bg-[#D3DAD9]">
              <DocumentTextIcon className="h-12 w-12 text-[#715A5A]" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#37353E]">
              {invoices.length === 0 ? "No invoices available" : "No invoices found"}
            </h3>
            <p className="mb-6 text-[#715A5A]">
              {invoices.length === 0 
                ? "Complete an order to generate your first invoice" 
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