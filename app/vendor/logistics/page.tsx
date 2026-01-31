"use client";

import React, { useState } from "react";
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

// Mock data
const mockLogistics = [
  {
    id: "LOG-001",
    orderId: "ORD-001",
    type: "pickup",
    customer: {
      name: "John Smith",
      phone: "+1 (555) 123-4567",
      email: "john.smith@email.com"
    },
    product: "Professional Camera Kit",
    location: {
      name: "Downtown Store",
      address: "123 Main St, Downtown, City 12345"
    },
    scheduledDate: "2024-02-01",
    scheduledTime: "10:00 AM",
    status: "scheduled",
    notes: "Customer requested early pickup at 8 AM",
    rentalPeriod: "Feb 1-4, 2024"
  },
  {
    id: "LOG-002",
    orderId: "ORD-002",
    type: "return",
    customer: {
      name: "Sarah Johnson",
      phone: "+1 (555) 234-5678",
      email: "sarah.j@email.com"
    },
    product: "Power Drill Set",
    location: {
      name: "North Branch",
      address: "456 Oak Ave, North District, City 12345"
    },
    scheduledDate: "2024-01-31",
    scheduledTime: "3:00 PM",
    status: "completed",
    notes: "Equipment returned in excellent condition",
    rentalPeriod: "Jan 30-31, 2024"
  },
  {
    id: "LOG-003",
    orderId: "ORD-003",
    type: "pickup",
    customer: {
      name: "Mike Wilson",
      phone: "+1 (555) 345-6789",
      email: "mike.wilson@email.com"
    },
    product: "Party Sound System",
    location: {
      name: "Main Store",
      address: "789 Pine St, Central, City 12345"
    },
    scheduledDate: "2024-01-29",
    scheduledTime: "2:00 PM",
    status: "in-progress",
    notes: "Large item - requires van for transport",
    rentalPeriod: "Jan 29-31, 2024"
  },
  {
    id: "LOG-004",
    orderId: "ORD-004",
    type: "return",
    customer: {
      name: "Emily Davis",
      phone: "+1 (555) 456-7890",
      email: "emily.davis@email.com"
    },
    product: "Mountain Bike",
    location: {
      name: "South Location",
      address: "321 Elm St, South District, City 12345"
    },
    scheduledDate: "2024-02-05",
    scheduledTime: "11:00 AM",
    status: "scheduled",
    notes: "Customer will provide own helmet",
    rentalPeriod: "Feb 2-5, 2024"
  },
  {
    id: "LOG-005",
    orderId: "ORD-005",
    type: "pickup",
    customer: {
      name: "David Brown",
      phone: "+1 (555) 567-8901",
      email: "david.brown@email.com"
    },
    product: "Projector & Screen",
    location: {
      name: "Downtown Store",
      address: "123 Main St, Downtown, City 12345"
    },
    scheduledDate: "2024-01-28",
    scheduledTime: "9:00 AM",
    status: "overdue",
    notes: "Customer missed scheduled pickup time",
    rentalPeriod: "Jan 28-30, 2024"
  }
];

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

export default function VendorLogistics() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const filteredLogistics = mockLogistics.filter(item => {
    const matchesSearch = 
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "All" || item.type.toLowerCase() === selectedType.toLowerCase();
    const matchesStatus = selectedStatus === "All" || item.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleUpdateStatus = (logId: string, newStatus: string) => {
    // In a real app, this would make an API call
    console.log(`Updating logistics ${logId} to ${newStatus}`);
    alert(`Status updated to ${newStatus}!`);
  };

  const handleCallCustomer = (phone: string) => {
    // In a real app, this would initiate a call
    console.log(`Calling ${phone}`);
    alert(`Calling ${phone}...`);
  };

  const todayItems = filteredLogistics.filter(item => 
    new Date(item.scheduledDate).toDateString() === new Date().toDateString()
  );
  const scheduledItems = filteredLogistics.filter(item => item.status === "scheduled");
  const overdueItems = filteredLogistics.filter(item => item.status === "overdue");

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
                {filteredLogistics.filter(item => item.status === "in-progress").length}
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
          {/* Search */}
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

        {/* Mobile Filters */}
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
                          <strong>Order:</strong> {item.orderId}
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
                        {item.notes && (
                          <p className="text-sm italic text-secondary-600">
                            <strong>Notes:</strong> {item.notes}
                          </p>
                        )}
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
                        href={`/vendor/logistics/${item.id}`}
                        className="p-2 rounded-lg hover:bg-secondary-100 transition-colors text-primary-600"
                        title="View Details"
                      >
                        <MapPinIcon className="h-5 w-5" />
                      </Link>
                    </div>

                    <div className="flex items-center space-x-2">
                      {item.status === "scheduled" && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, "in-progress")}
                          className="px-4 py-2 rounded-lg font-medium text-sm transition-colors hover:opacity-90"
                          style={{ backgroundColor: "#fef3c7", color: "#d97706" }}
                        >
                          Start
                        </button>
                      )}

                      {item.status === "in-progress" && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, "completed")}
                          className="px-4 py-2 rounded-lg font-medium text-sm transition-colors hover:opacity-90"
                          style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}
                        >
                          Complete
                        </button>
                      )}

                      {item.status === "overdue" && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, "scheduled")}
                          className="px-4 py-2 rounded-lg font-medium text-sm transition-colors hover:opacity-90"
                          style={{ backgroundColor: "#dbeafe", color: "#2563eb" }}
                        >
                          Reschedule
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
      {filteredLogistics.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center bg-secondary-200">
            <TruckIcon className="h-12 w-12 text-secondary-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-secondary-900">
            No logistics found
          </h3>
          <p className="mb-6 text-secondary-600">
            Try adjusting your search or filters
          </p>
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
        </div>
      )}
    </div>
  );
}