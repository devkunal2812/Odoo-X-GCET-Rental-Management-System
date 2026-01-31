"use client";

import React, { useState } from "react";
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
  ShoppingBagIcon
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

// Mock data
const mockOrders = [
  {
    id: "ORD-001",
    product: {
      name: "Professional Camera Kit",
      image: "/api/placeholder/100/100",
      description: "Complete DSLR camera kit with lenses and accessories"
    },
    vendor: {
      name: "TechRent Pro",
      phone: "+1 (555) 123-4567",
      email: "support@techrentpro.com"
    },
    amount: 150,
    status: "confirmed",
    orderDate: "2024-01-30",
    startDate: "2024-02-01",
    endDate: "2024-02-04",
    duration: 3,
    unit: "days",
    pickupLocation: "Downtown Store - 123 Main St",
    pickupTime: "10:00 AM",
    returnLocation: "Downtown Store - 123 Main St",
    returnTime: "5:00 PM",
    paymentStatus: "paid",
    notes: "Customer requested early pickup at 8 AM if possible"
  },
  {
    id: "ORD-002",
    product: {
      name: "Power Drill Set",
      image: "/api/placeholder/100/100",
      description: "Professional cordless drill with bits and case"
    },
    vendor: {
      name: "ToolMaster",
      phone: "+1 (555) 234-5678",
      email: "rentals@toolmaster.com"
    },
    amount: 45,
    status: "in-progress",
    orderDate: "2024-01-29",
    startDate: "2024-01-30",
    endDate: "2024-01-31",
    duration: 1,
    unit: "day",
    pickupLocation: "North Branch - 456 Oak Ave",
    pickupTime: "9:00 AM",
    returnLocation: "North Branch - 456 Oak Ave",
    returnTime: "6:00 PM",
    paymentStatus: "paid",
    notes: ""
  },
  {
    id: "ORD-003",
    product: {
      name: "Party Sound System",
      image: "/api/placeholder/100/100",
      description: "Professional sound system for events"
    },
    vendor: {
      name: "EventPro",
      phone: "+1 (555) 345-6789",
      email: "info@eventpro.com"
    },
    amount: 200,
    status: "completed",
    orderDate: "2024-01-28",
    startDate: "2024-01-29",
    endDate: "2024-01-31",
    duration: 2,
    unit: "days",
    pickupLocation: "Main Store - 789 Pine St",
    pickupTime: "2:00 PM",
    returnLocation: "Main Store - 789 Pine St",
    returnTime: "4:00 PM",
    paymentStatus: "paid",
    notes: "Equipment returned in excellent condition"
  },
  {
    id: "ORD-004",
    product: {
      name: "Mountain Bike",
      image: "/api/placeholder/100/100",
      description: "High-performance mountain bike for trails"
    },
    vendor: {
      name: "BikeRentals",
      phone: "+1 (555) 456-7890",
      email: "info@bikerentals.com"
    },
    amount: 90,
    status: "pending",
    orderDate: "2024-01-27",
    startDate: "2024-02-05",
    endDate: "2024-02-08",
    duration: 3,
    unit: "days",
    pickupLocation: "South Location - 789 Pine St",
    pickupTime: "11:00 AM",
    returnLocation: "South Location - 789 Pine St",
    returnTime: "4:00 PM",
    paymentStatus: "pending",
    notes: "Customer will provide own helmet and safety gear"
  },
  {
    id: "ORD-005",
    product: {
      name: "Electric Scooter",
      image: "/api/placeholder/100/100",
      description: "Electric scooter for city commuting"
    },
    vendor: {
      name: "UrbanRide",
      phone: "+1 (555) 567-8901",
      email: "support@urbanride.com"
    },
    amount: 75,
    status: "confirmed",
    orderDate: "2024-01-25",
    startDate: "2024-02-10",
    endDate: "2024-02-12",
    duration: 2,
    unit: "days",
    pickupLocation: "City Center - 321 Elm St",
    pickupTime: "12:00 PM",
    returnLocation: "City Center - 321 Elm St",
    returnTime: "3:00 PM",
    paymentStatus: "paid",
    notes: "Helmet and safety gear included"
  }
];

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

  const activeOrders = mockOrders.filter(order => 
    order.status !== "completed" && order.status !== "cancelled"
  );

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
                  {mockOrders.length}
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
                  {mockOrders.filter(order => order.status === "completed").length}
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
                  ${mockOrders.reduce((sum, order) => sum + order.amount, 0)}
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
          {mockOrders.map((order) => {
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
                          ${order.amount}
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
        {mockOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center bg-secondary-200">
              <ShoppingBagIcon className="h-12 w-12 text-secondary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-secondary-900">
              No orders found
            </h3>
            <p className="mb-6 text-secondary-600">
              You don't have any rental orders at the moment
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