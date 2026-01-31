"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PhoneIcon,
  CalendarIcon
} from "@heroicons/react/24/outline";
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
  customer: {
    phone?: string;
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

interface LogisticsItem {
  id: string;
  orderId: string;
  orderNumber: string;
  type: 'pickup' | 'return';
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  product: string;
  location: {
    name: string;
    address: string;
  };
  scheduledDate: string;
  scheduledTime: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'overdue';
  notes: string;
  rentalPeriod: string;
}

const typeOptions = ["All", "Pickup", "Return"];
const statusOptions = ["All", "Scheduled", "In-Progress", "Completed", "Overdue"];

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "scheduled":
      return { bg: "#dbeafe", text: "#2563eb", icon: CalendarIcon };
    case "in-progress":
      return { bg: "#fef3c7", text: "#d97706", icon: TruckIcon };
    case "completed":
      return { bg: "#dcfce7", text: "#16a34a", icon: CheckCircleIcon };
    case "overdue":
      return { bg: "#fee2e2", text: "#dc2626", icon: ExclamationTriangleIcon };
    default:
      return { bg: "#f0f9ff", text: "#1e40af", icon: ClockIcon };
  }
};

const getTypeColor = (type: string) => {
  return type === "pickup"
    ? { bg: "#f0f9ff", text: "#0369a1" }
    : { bg: "#f0fdf4", text: "#15803d" };
};

// Format rental period display
const formatRentalPeriod = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
};

// Get logistics status from order status
const getLogisticsStatus = (orderStatus: string, type: 'pickup' | 'return', date: Date): 'scheduled' | 'in-progress' | 'completed' | 'overdue' => {
  const now = new Date();

  if (type === 'pickup') {
    if (orderStatus === 'PICKED_UP' || orderStatus === 'RETURNED') return 'completed';
    if (orderStatus === 'CONFIRMED') {
      if (date < now) return 'overdue';
      return 'scheduled';
    }
  } else {
    if (orderStatus === 'RETURNED') return 'completed';
    if (orderStatus === 'PICKED_UP') {
      if (date < now) return 'overdue';
      return 'scheduled';
    }
  }
  return 'scheduled';
};

export default function VendorLogistics() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
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

  // Transform orders to logistics items
  const getLogisticsItems = (): LogisticsItem[] => {
    const items: LogisticsItem[] = [];

    orders.forEach(order => {
      // Only include orders that need pickup or return tracking
      if (!['CONFIRMED', 'PICKED_UP', 'RETURNED'].includes(order.status)) return;

      const customerName = order.customer?.user
        ? `${order.customer.user.firstName} ${order.customer.user.lastName}`
        : 'Unknown';
      const productName = order.lines?.[0]?.product?.name || 'N/A';
      const rentalPeriod = order.startDate && order.endDate
        ? formatRentalPeriod(order.startDate, order.endDate)
        : 'N/A';

      // Add pickup item for confirmed orders
      if (order.status === 'CONFIRMED') {
        const pickupDate = new Date(order.startDate);
        items.push({
          id: `LOG-${order.orderNumber}-P`,
          orderId: order.id,
          orderNumber: order.orderNumber,
          type: 'pickup',
          customer: {
            name: customerName,
            phone: order.customer?.phone || '+91 98765 43210',
            email: order.customer?.user?.email || ''
          },
          product: productName,
          location: {
            name: 'Store Location',
            address: 'Pickup counter, Main Store'
          },
          scheduledDate: order.startDate,
          scheduledTime: '10:00 AM',
          status: getLogisticsStatus(order.status, 'pickup', pickupDate),
          notes: '',
          rentalPeriod
        });
      }

      // Add return item for picked up orders
      if (order.status === 'PICKED_UP') {
        const returnDate = new Date(order.endDate);
        items.push({
          id: `LOG-${order.orderNumber}-R`,
          orderId: order.id,
          orderNumber: order.orderNumber,
          type: 'return',
          customer: {
            name: customerName,
            phone: order.customer?.phone || '+91 98765 43210',
            email: order.customer?.user?.email || ''
          },
          product: productName,
          location: {
            name: 'Store Location',
            address: 'Return counter, Main Store'
          },
          scheduledDate: order.endDate,
          scheduledTime: '5:00 PM',
          status: getLogisticsStatus(order.status, 'return', returnDate),
          notes: '',
          rentalPeriod
        });
      }
    });

    // Sort by scheduled date
    return items.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  };

  const logisticsItems = getLogisticsItems();

  // Filter logistics items
  const filteredLogistics = logisticsItems.filter(item => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "All" || item.type.toLowerCase() === selectedType.toLowerCase();
    const matchesStatus = selectedStatus === "All" || item.status.toLowerCase() === selectedStatus.toLowerCase().replace('-', '');
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleUpdateStatus = async (orderId: string, newStatus: string, type: 'pickup' | 'return') => {
    try {
      const endpoint = type === 'pickup' ? `/orders/${orderId}/pickup` : `/orders/${orderId}/return`;
      await api.post(endpoint, {});

      // Refresh orders
      const response = await api.get<{ success: boolean; orders: Order[] }>('/orders');
      if (response.success) {
        setOrders(response.orders || []);
      }
      alert(`Status updated successfully!`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status.');
    }
  };

  const handleCallCustomer = (phone: string) => {
    alert(`Calling ${phone}...`);
  };

  const todayItems = filteredLogistics.filter(item =>
    new Date(item.scheduledDate).toDateString() === new Date().toDateString()
  );
  const scheduledItems = filteredLogistics.filter(item => item.status === "scheduled");
  const overdueItems = filteredLogistics.filter(item => item.status === "overdue");
  const inProgressItems = filteredLogistics.filter(item => item.status === "in-progress");

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">Pickups & Returns</h1>
            <p className="mt-2 text-secondary-600">Manage logistics and track equipment movement</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
              <div className="w-20 h-4 bg-gray-200 rounded mb-2"></div>
              <div className="w-12 h-8 bg-gray-200 rounded"></div>
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
            Pickups & Returns
          </h1>
          <p className="mt-2 text-secondary-600">
            Manage logistics and track equipment movement
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <span className="text-sm font-medium text-secondary-600">
            {filteredLogistics.length} items
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Today's Tasks</p>
              <p className="text-2xl font-bold text-secondary-900">
                {todayItems.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
              <CalendarIcon className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Scheduled</p>
              <p className="text-2xl font-bold text-blue-600">{scheduledItems.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">
                {inProgressItems.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
              <TruckIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{overdueItems.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-500" />
            <input
              type="text"
              placeholder="Search logistics, customers, products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center px-4 py-3 rounded-lg border-2 border-primary-600 text-primary-600 transition-colors"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filters
          </button>

          <div className="hidden lg:flex items-center space-x-4">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3 border-2 border-secondary-200 rounded-lg focus:outline-none text-secondary-900"
            >
              {typeOptions.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
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

        {showFilters && (
          <div className="lg:hidden mt-4 pt-4 border-t border-secondary-200 space-y-4">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-3 border-2 border-secondary-200 rounded-lg focus:outline-none text-secondary-900"
            >
              {typeOptions.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
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

      {/* Logistics List */}
      <div className="space-y-4">
        {filteredLogistics.map((item) => {
          const statusColor = getStatusColor(item.status);
          const typeColor = getTypeColor(item.type);
          const StatusIcon = statusColor.icon;

          return (
            <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  {/* Logistics Info */}
                  <div className="flex-1 mb-4 lg:mb-0">
                    <div className="flex items-center mb-3">
                      <h3 className="font-bold text-xl mr-4 text-secondary-900">
                        {item.id}
                      </h3>
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mr-2"
                        style={{ backgroundColor: typeColor.bg, color: typeColor.text }}
                      >
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </span>
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                        style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                      >
                        <StatusIcon className="h-4 w-4 mr-1" />
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2 text-secondary-900">
                          {item.product}
                        </h4>
                        <p className="text-sm mb-1 text-secondary-600">
                          <strong>Customer:</strong> {item.customer.name}
                        </p>
                        <p className="text-sm mb-1 text-secondary-600">
                          <strong>Order:</strong> {item.orderNumber}
                        </p>
                        <p className="text-sm text-secondary-600">
                          <strong>Rental:</strong> {item.rentalPeriod}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-start mb-2">
                          <MapPinIcon className="h-4 w-4 mr-2 mt-0.5 text-primary-600" />
                          <div>
                            <p className="text-sm font-medium text-secondary-900">
                              {item.location.name}
                            </p>
                            <p className="text-sm text-secondary-600">
                              {item.location.address}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center mb-2">
                          <ClockIcon className="h-4 w-4 mr-2 text-primary-600" />
                          <p className="text-sm text-secondary-600">
                            {new Date(item.scheduledDate).toLocaleDateString()} at {item.scheduledTime}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end space-y-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCallCustomer(item.customer.phone)}
                        className="p-2 rounded-lg hover:bg-secondary-100 transition-colors text-primary-600"
                        title="Call Customer"
                      >
                        <PhoneIcon className="h-5 w-5" />
                      </button>

                      <Link
                        href={`/vendor/orders/${item.orderId}`}
                        className="p-2 rounded-lg hover:bg-secondary-100 transition-colors text-primary-600"
                        title="View Order"
                      >
                        <MapPinIcon className="h-5 w-5" />
                      </Link>
                    </div>

                    <div className="flex items-center space-x-2">
                      {item.status === "scheduled" && item.type === 'pickup' && (
                        <button
                          onClick={() => handleUpdateStatus(item.orderId, "picked_up", 'pickup')}
                          className="px-4 py-2 rounded-lg font-medium text-sm transition-colors hover:opacity-90"
                          style={{ backgroundColor: "#fef3c7", color: "#d97706" }}
                        >
                          Mark Picked Up
                        </button>
                      )}

                      {item.status === "scheduled" && item.type === 'return' && (
                        <button
                          onClick={() => handleUpdateStatus(item.orderId, "returned", 'return')}
                          className="px-4 py-2 rounded-lg font-medium text-sm transition-colors hover:opacity-90"
                          style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}
                        >
                          Mark Returned
                        </button>
                      )}

                      {item.status === "overdue" && (
                        <span className="px-4 py-2 rounded-lg font-medium text-sm bg-red-100 text-red-600">
                          Overdue
                        </span>
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
      {filteredLogistics.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center bg-secondary-200">
            <TruckIcon className="h-12 w-12 text-secondary-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-secondary-900">
            No logistics found
          </h3>
          <p className="mb-6 text-secondary-600">
            {logisticsItems.length === 0
              ? "No pickups or returns scheduled. Create orders to see logistics items."
              : "Try adjusting your search or filters"}
          </p>
          {logisticsItems.length > 0 && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedType("All");
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