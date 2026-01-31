"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";

// Mock data
const mockOrders = [
  {
    id: "ORD-001",
    customer: {
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "+1 (555) 123-4567"
    },
    product: {
      name: "Professional Camera Kit",
      image: "/api/placeholder/80/80"
    },
    amount: 150,
    duration: 3,
    unit: "days",
    status: "confirmed",
    orderDate: "2024-01-30",
    startDate: "2024-02-01",
    endDate: "2024-02-04",
    pickupLocation: "Downtown Store",
    notes: "Customer requested early pickup at 8 AM"
  },
  {
    id: "ORD-002",
    customer: {
      name: "Sarah Johnson", 
      email: "sarah.j@email.com",
      phone: "+1 (555) 234-5678"
    },
    product: {
      name: "Power Drill Set",
      image: "/api/placeholder/80/80"
    },
    amount: 45,
    duration: 1,
    unit: "day",
    status: "in-progress",
    orderDate: "2024-01-29",
    startDate: "2024-01-30",
    endDate: "2024-01-31",
    pickupLocation: "North Branch",
    notes: ""
  },
  {
    id: "ORD-003",
    customer: {
      name: "Mike Wilson",
      email: "mike.wilson@email.com", 
      phone: "+1 (555) 345-6789"
    },
    product: {
      name: "Party Sound System",
      image: "/api/placeholder/80/80"
    },
    amount: 200,
    duration: 2,
    unit: "days",
    status: "completed",
    orderDate: "2024-01-28",
    startDate: "2024-01-29",
    endDate: "2024-01-31",
    pickupLocation: "Main Store",
    notes: "Equipment returned in excellent condition"
  },
  {
    id: "ORD-004",
    customer: {
      name: "Emily Davis",
      email: "emily.davis@email.com",
      phone: "+1 (555) 456-7890"
    },
    product: {
      name: "Mountain Bike",
      image: "/api/placeholder/80/80"
    },
    amount: 90,
    duration: 3,
    unit: "days", 
    status: "pending",
    orderDate: "2024-01-27",
    startDate: "2024-02-02",
    endDate: "2024-02-05",
    pickupLocation: "South Location",
    notes: "Customer will provide own helmet"
  },
  {
    id: "ORD-005",
    customer: {
      name: "David Brown",
      email: "david.brown@email.com",
      phone: "+1 (555) 567-8901"
    },
    product: {
      name: "Projector & Screen",
      image: "/api/placeholder/80/80"
    },
    amount: 120,
    duration: 2,
    unit: "days",
    status: "cancelled",
    orderDate: "2024-01-26",
    startDate: "2024-01-28",
    endDate: "2024-01-30",
    pickupLocation: "Downtown Store",
    notes: "Customer cancelled due to event postponement"
  }
];

const statusOptions = ["All", "Pending", "Confirmed", "In-Progress", "Completed", "Cancelled"];

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return { bg: "#fef3c7", text: "#d97706", icon: ClockIcon };
    case "confirmed":
      return { bg: "#dcfce7", text: "#16a34a", icon: CheckCircleIcon };
    case "in-progress":
      return { bg: "#dbeafe", text: "#2563eb", icon: ClockIcon };
    case "completed":
      return { bg: "#f0f9ff", text: "#0369a1", icon: CheckCircleIcon };
    case "cancelled":
      return { bg: "#fee2e2", text: "#dc2626", icon: XCircleIcon };
    default:
      return { bg: "#f0f9ff", text: "#1e40af", icon: ClockIcon };
  }
};

export default function VendorOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "All" || order.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    // In a real app, this would make an API call
    console.log(`Updating order ${orderId} to ${newStatus}`);
  };

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
                          {order.id}
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
                        {order.product.name}
                      </h4>
                      
                      <div className="text-sm space-y-1 text-secondary-600">
                        <p><strong>Customer:</strong> {order.customer.name}</p>
                        <p><strong>Duration:</strong> {order.duration} {order.unit}</p>
                        <p><strong>Pickup:</strong> {order.pickupLocation}</p>
                        <p><strong>Dates:</strong> {new Date(order.startDate).toLocaleDateString()} - {new Date(order.endDate).toLocaleDateString()}</p>
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
                      
                      <Link
                        href={`/vendor/invoices/${order.id}`}
                        className="p-2 rounded-lg hover:bg-secondary-100 transition-colors text-primary-600"
                        title="Generate Invoice"
                      >
                        <DocumentTextIcon className="h-5 w-5" />
                      </Link>

                      {order.status === "pending" && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, "confirmed")}
                          className="px-4 py-2 rounded-lg font-medium text-sm transition-colors hover:opacity-90"
                          style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}
                        >
                          Confirm
                        </button>
                      )}

                      {order.status === "confirmed" && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, "in-progress")}
                          className="px-4 py-2 rounded-lg font-medium text-sm transition-colors hover:opacity-90"
                          style={{ backgroundColor: "#dbeafe", color: "#2563eb" }}
                        >
                          Start Rental
                        </button>
                      )}

                      {order.status === "in-progress" && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, "completed")}
                          className="px-4 py-2 rounded-lg font-medium text-sm transition-colors hover:opacity-90"
                          style={{ backgroundColor: "#f0f9ff", color: "#0369a1" }}
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {order.notes && (
                  <div className="mt-4 pt-4 border-t border-secondary-200">
                    <p className="text-sm text-secondary-600">
                      <strong>Notes:</strong> {order.notes}
                    </p>
                  </div>
                )}
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
            Try adjusting your search or filters
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedStatus("All");
            }}
            className="px-6 py-3 rounded-lg font-semibold transition-colors hover:opacity-90 bg-primary-600 text-white"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}