"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import {
  EyeIcon,
  ChatBubbleLeftIcon,
  XCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  CalendarIcon,
  MapPinIcon,
  PhoneIcon,
  DocumentTextIcon,
  ShoppingBagIcon,
  ArrowDownTrayIcon
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

// Load orders from database API only (no localStorage fallback)
const loadOrdersFromDatabase = async () => {
  try {
    const response = await fetch('/api/orders/user');
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Loaded ${result.orders.length} orders from ${result.source}`);
      return result.orders;
    } else {
      console.log('❌ Database API failed');
      return [];
    }
  } catch (error) {
    console.error('❌ Error loading orders from database:', error);
    return [];
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return { bg: "#fef3c7", text: "#d97706", icon: ClockIcon };
    case "confirmed":
      return { bg: "#dcfce7", text: "#16a34a", icon: CheckCircleIcon };
    case "in-progress":
      return { bg: "#dbeafe", text: "#2563eb", icon: TruckIcon };
    case "completed":
      return { bg: "#f0f9ff", text: "#0369a1", icon: CheckCircleIcon };
    case "cancelled":
      return { bg: "#fee2e2", text: "#dc2626", icon: XCircleIcon };
    default:
      return { bg: "var(--light-sage)", text: "var(--dark-charcoal)", icon: ClockIcon };
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
      return { bg: "#dcfce7", text: "#16a34a" };
    case "pending":
      return { bg: "#fef3c7", text: "#d97706" };
    case "failed":
      return { bg: "#fee2e2", text: "#dc2626" };
    default:
      return { bg: "var(--light-sage)", text: "var(--dark-charcoal)" };
  }
};

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load orders when component mounts
  useEffect(() => {
    const loadOrders = async () => {
      try {
        console.log('🔍 Loading orders from database only...');
        
        // Only load from database - no localStorage fallback
        const dbOrders = await loadOrdersFromDatabase();
        
        console.log(`📊 Found ${dbOrders.length} orders from database`);
        setOrders(dbOrders);
        setLoading(false);
        
        if (dbOrders.length > 0) {
          console.log('✅ Loaded orders from database successfully');
        } else {
          console.log('ℹ️ No orders found in database - user needs to make a purchase');
        }
        
      } catch (error) {
        console.error('❌ Error loading orders:', error);
        setOrders([]);
        setLoading(false);
      }
    };

    loadOrders();

    // Listen for order updates to refresh orders
    const handleOrderUpdate = () => loadOrders();
    window.addEventListener('orderUpdated', handleOrderUpdate);
    
    return () => window.removeEventListener('orderUpdated', handleOrderUpdate);
  }, []);

  const handleCancelOrder = (orderId: string) => {
    if (confirm("Are you sure you want to cancel this order?")) {
      // In a real app, this would make an API call
      console.log("Cancelling order:", orderId);
      alert("Order cancellation request submitted!");
    }
  };

  const handleContactVendor = (vendorPhone: string) => {
    // In a real app, this would initiate a call or open messaging
    console.log("Contacting vendor:", vendorPhone);
    alert(`Calling ${vendorPhone}...`);
  };

  const handleDownloadInvoice = (orderId: string) => {
    try {
      // Generate sample invoice data (in real app, this would come from API)
      const invoiceData = generateSampleInvoiceData(`INV-${orderId.split('-')[1]}`);
      
      // Find the actual order from orders to get real data
      const actualOrder = orders.find(order => order.id === orderId);
      if (actualOrder) {
        // Update the sample data with actual order data
        invoiceData.id = `INV-${orderId}`;
        invoiceData.orderId = actualOrder.id;
        invoiceData.product = actualOrder.product.name;
        invoiceData.vendor = actualOrder.vendor.name;
        invoiceData.amount = actualOrder.amount;
        invoiceData.total = actualOrder.amount + (actualOrder.amount * 0.18) + 25; // Add tax and service fee
        invoiceData.status = actualOrder.paymentStatus === 'paid' ? 'paid' : 'pending';
        invoiceData.rentalPeriod = `${formatDate(actualOrder.startDate)} to ${formatDate(actualOrder.endDate)} (${actualOrder.duration} ${actualOrder.unit})`;
        
        // Update customer info with delivery address if available
        if (actualOrder.deliveryAddress) {
          invoiceData.customerInfo.name = actualOrder.deliveryAddress.name;
          invoiceData.customerInfo.email = actualOrder.deliveryAddress.email;
          invoiceData.customerInfo.phone = actualOrder.deliveryAddress.phone;
          invoiceData.customerInfo.address = `${actualOrder.deliveryAddress.street}, ${actualOrder.deliveryAddress.city}, ${actualOrder.deliveryAddress.state} - ${actualOrder.deliveryAddress.zip}`;
        }
      }
      
      // Generate and download PDF
      generateInvoicePDF(invoiceData);
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successMessage.textContent = `Invoice for ${orderId} downloaded successfully!`;
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

  const activeOrders = orders.filter(order => 
    order.status !== "completed" && order.status !== "cancelled"
  );

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <Header currentPage="orders" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2 text-secondary-900">Loading Orders...</h3>
            <p className="text-secondary-600">Please wait while we fetch your orders.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header currentPage="orders" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">
              My Orders
            </h1>
            <p className="mt-2 text-secondary-600">
              Track and manage your rental orders
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <Link
              href="/invoices"
              className="inline-flex items-center px-6 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg transform hover:scale-105 bg-gradient-to-r from-primary-600 to-primary-700"
            >
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              View All Invoices
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Total Orders</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {orders.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Active Orders</p>
                <p className="text-2xl font-bold text-green-600">{activeOrders.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Completed</p>
                <p className="text-2xl font-bold text-blue-600">
                  {orders.filter(order => order.status === "completed").length}
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
                <p className="text-sm font-medium text-secondary-600">Total Spent</p>
                <p className="text-2xl font-bold text-secondary-900">
                  ₹{orders.reduce((sum, order) => sum + order.amount, 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                <DocumentTextIcon className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order) => {
            const statusColor = getStatusColor(order.status);
            const paymentColor = getPaymentStatusColor(order.paymentStatus);
            const StatusIcon = statusColor.icon;
            const isExpanded = selectedOrder === order.id;
            
            return (
              <div key={order.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b border-secondary-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                      {/* Product Image */}
                      <div className="w-20 h-20 rounded-lg flex-shrink-0 bg-secondary-200">
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-2">
                          <h3 className="font-bold text-xl mr-3 text-secondary-900">
                            {order.id}
                          </h3>
                          <span
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mr-2"
                            style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                          >
                            <StatusIcon className="h-4 w-4 mr-1" />
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                          <span
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                            style={{ backgroundColor: paymentColor.bg, color: paymentColor.text }}
                          >
                            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                          </span>
                        </div>
                        
                        <h4 className="font-semibold text-lg mb-1 text-secondary-900">
                          {order.product.name}
                        </h4>
                        <p className="text-sm mb-2 text-secondary-600">
                          by {order.vendor.name}
                        </p>
                        <div className="flex items-center text-sm text-secondary-600">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          <span>
                            {formatDate(order.startDate)} - {formatDate(order.endDate)}
                          </span>
                          <span className="mx-2">•</span>
                          <span>{order.duration} {order.unit}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Actions */}
                    <div className="flex flex-col items-end space-y-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary-600">
                          ₹{order.amount}
                        </div>
                        <div className="text-sm text-secondary-600">
                          Total Amount
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedOrder(isExpanded ? null : order.id)}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-primary-600"
                          title="View Details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        
                        <button
                          onClick={() => handleContactVendor(order.vendor.phone)}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-primary-600"
                          title="Contact Vendor"
                        >
                          <PhoneIcon className="h-5 w-5" />
                        </button>

                        {(order.status === "completed" || order.paymentStatus === "paid") && (
                          <button
                            onClick={() => handleDownloadInvoice(order.id)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-primary-600"
                            title="Download Invoice"
                          >
                            <ArrowDownTrayIcon className="h-5 w-5" />
                          </button>
                        )}

                        {order.status === "pending" && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="px-4 py-2 rounded-lg font-medium text-sm transition-colors hover:opacity-90"
                            style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}
                          >
                            Cancel
                          </button>
                        )}

                        {order.paymentStatus === "pending" && (
                          <Link
                            href={`/orders/${order.id}/payment`}
                            className="px-4 py-2 rounded-lg font-medium text-sm transition-colors hover:opacity-90"
                            style={{ backgroundColor: "#fef3c7", color: "#d97706" }}
                          >
                            Pay Now
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-6 border-t border-secondary-300 bg-gray-50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Pickup Details */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg flex items-center text-secondary-900">
                          <TruckIcon className="h-5 w-5 mr-2" />
                          Pickup Details
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-start">
                            <MapPinIcon className="h-4 w-4 mr-2 mt-0.5 text-secondary-600" />
                            <div>
                              <p className="font-medium text-secondary-900">Location</p>
                              <p className="text-sm text-secondary-600">{order.pickupLocation}</p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <ClockIcon className="h-4 w-4 mr-2 mt-0.5 text-secondary-600" />
                            <div>
                              <p className="font-medium text-secondary-900">Time</p>
                              <p className="text-sm text-secondary-600">
                                {formatDate(order.startDate)} at {order.pickupTime}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Return Details */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg flex items-center text-secondary-900">
                          <TruckIcon className="h-5 w-5 mr-2 transform rotate-180" />
                          Return Details
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-start">
                            <MapPinIcon className="h-4 w-4 mr-2 mt-0.5 text-secondary-600" />
                            <div>
                              <p className="font-medium text-secondary-900">Location</p>
                              <p className="text-sm text-secondary-600">{order.returnLocation}</p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <ClockIcon className="h-4 w-4 mr-2 mt-0.5 text-secondary-600" />
                            <div>
                              <p className="font-medium text-secondary-900">Time</p>
                              <p className="text-sm text-secondary-600">
                                {formatDate(order.endDate)} by {order.returnTime}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Vendor Contact */}
                    <div className="mt-6 p-4 rounded-lg bg-secondary-200">
                      <h4 className="font-semibold mb-3 text-secondary-900">
                        Vendor Contact Information
                      </h4>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-medium text-secondary-900">{order.vendor.name}</p>
                          <p className="text-sm text-secondary-600">
                            📞 {order.vendor.phone} • ✉️ {order.vendor.email}
                          </p>
                        </div>
                        <div className="mt-3 sm:mt-0 flex items-center space-x-2">
                          <button
                            onClick={() => handleContactVendor(order.vendor.phone)}
                            className="px-4 py-2 rounded-lg font-medium text-sm transition-colors hover:opacity-90 bg-primary-600 text-white"
                          >
                            <PhoneIcon className="h-4 w-4 inline mr-1" />
                            Call
                          </button>
                          <button className="px-4 py-2 rounded-lg font-medium text-sm transition-colors hover:opacity-90 bg-white text-primary-600 border border-primary-600">
                            <ChatBubbleLeftIcon className="h-4 w-4 inline mr-1" />
                            Message
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Payment Verification Status */}
                    {order.paymentVerified && (
                      <div className="mt-4 p-4 rounded-lg bg-green-50 border border-green-200">
                        <h4 className="font-semibold mb-2 text-green-800 flex items-center">
                          <CheckCircleIcon className="h-5 w-5 mr-2" />
                          Payment Verified (Test Mode)
                        </h4>
                        <div className="text-sm text-green-700 space-y-1">
                          <p><strong>Payment ID:</strong> {order.paymentId}</p>
                          {order.razorpayOrderId && (
                            <p><strong>Razorpay Order ID:</strong> {order.razorpayOrderId}</p>
                          )}
                          {order.paymentMethod && (
                            <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                          )}
                          {order.paymentTimestamp && (
                            <p><strong>Payment Time:</strong> {new Date(order.paymentTimestamp).toLocaleString()}</p>
                          )}
                          <p className="text-xs text-green-600 mt-2">
                            ✅ This order was created after successful Razorpay test payment verification
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {order.notes && (
                      <div className="mt-4 p-4 rounded-lg bg-white">
                        <h4 className="font-semibold mb-2 text-secondary-900">
                          Order Notes
                        </h4>
                        <p className="text-sm text-secondary-600">
                          {order.notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {orders.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center bg-secondary-200">
              <ShoppingBagIcon className="h-12 w-12 text-secondary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-secondary-900">
              No orders found
            </h3>
            <p className="mb-6 text-secondary-600">
              You don't have any rental orders yet. Complete a purchase to see your orders here.
            </p>
            <Link
              href="/products"
              className="px-6 py-3 rounded-lg font-semibold transition-colors hover:opacity-90 bg-primary-600 text-white"
            >
              Browse Products
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-secondary-900 text-white py-12 mt-16">
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