"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  totalOrders: number;
  totalSpent: number;
  joinedDate: string;
  lastOrderDate: string;
}

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    companyName: 'Tech Solutions Inc.',
    status: 'Active',
    totalOrders: 15,
    totalSpent: 2450,
    joinedDate: '2024-01-15',
    lastOrderDate: '2024-01-30'
  },
  {
    id: '2',
    name: 'Sarah Smith',
    email: 'sarah.smith@email.com',
    phone: '+1 (555) 234-5678',
    companyName: 'Creative Agency',
    status: 'Active',
    totalOrders: 8,
    totalSpent: 1280,
    joinedDate: '2024-01-20',
    lastOrderDate: '2024-01-29'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@email.com',
    phone: '+1 (555) 345-6789',
    companyName: 'Event Planners Co.',
    status: 'Active',
    totalOrders: 22,
    totalSpent: 3750,
    joinedDate: '2024-01-10',
    lastOrderDate: '2024-01-31'
  },
  {
    id: '4',
    name: 'Lisa Chen',
    email: 'lisa.chen@email.com',
    phone: '+1 (555) 456-7890',
    companyName: 'Startup Hub',
    status: 'Inactive',
    totalOrders: 3,
    totalSpent: 450,
    joinedDate: '2024-01-25',
    lastOrderDate: '2024-01-26'
  },
  {
    id: '5',
    name: 'David Wilson',
    email: 'david.wilson@email.com',
    phone: '+1 (555) 567-8901',
    companyName: 'Wilson Enterprises',
    status: 'Suspended',
    totalOrders: 12,
    totalSpent: 1890,
    joinedDate: '2024-01-05',
    lastOrderDate: '2024-01-20'
  }
];

const CustomerDetailModal = ({ customer, isOpen, onClose }: {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-[#37353E]">Customer Details</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#D3DAD9] rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-[#715A5A]" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#715A5A] mb-1">Full Name</label>
              <p className="text-[#37353E] font-semibold">{customer.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#715A5A] mb-1">Company</label>
              <p className="text-[#37353E] font-semibold">{customer.companyName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#715A5A] mb-1">Email</label>
              <div className="flex items-center">
                <EnvelopeIcon className="h-4 w-4 text-[#715A5A] mr-2" />
                <p className="text-[#37353E]">{customer.email}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#715A5A] mb-1">Phone</label>
              <div className="flex items-center">
                <PhoneIcon className="h-4 w-4 text-[#715A5A] mr-2" />
                <p className="text-[#37353E]">{customer.phone}</p>
              </div>
            </div>
          </div>

          {/* Activity Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#D3DAD9] rounded-lg p-4 text-center">
              <ShoppingBagIcon className="h-8 w-8 text-[#37353E] mx-auto mb-2" />
              <p className="text-2xl font-bold text-[#37353E]">{customer.totalOrders}</p>
              <p className="text-sm text-[#715A5A]">Total Orders</p>
            </div>
            <div className="bg-[#D3DAD9] rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-[#37353E] mb-2">$</div>
              <p className="text-2xl font-bold text-[#37353E]">{customer.totalSpent.toLocaleString()}</p>
              <p className="text-sm text-[#715A5A]">Total Spent</p>
            </div>
            <div className="bg-[#D3DAD9] rounded-lg p-4 text-center">
              <CalendarIcon className="h-8 w-8 text-[#37353E] mx-auto mb-2" />
              <p className="text-sm font-bold text-[#37353E]">{customer.joinedDate}</p>
              <p className="text-sm text-[#715A5A]">Joined Date</p>
            </div>
            <div className="bg-[#D3DAD9] rounded-lg p-4 text-center">
              <CalendarIcon className="h-8 w-8 text-[#37353E] mx-auto mb-2" />
              <p className="text-sm font-bold text-[#37353E]">{customer.lastOrderDate}</p>
              <p className="text-sm text-[#715A5A]">Last Order</p>
            </div>
          </div>

          {/* Status and Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#D3DAD9]">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-[#715A5A]">Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                customer.status === 'Active' 
                  ? 'bg-green-100 text-green-800' 
                  : customer.status === 'Inactive'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}>
                {customer.status}
              </span>
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors text-sm">
                Send Message
              </button>
              {customer.status === 'Suspended' && (
                <button className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                  Reactivate
                </button>
              )}
              {customer.status === 'Active' && (
                <button className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                  Suspend
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function AdminCustomersPage() {
  const [customers] = useState<Customer[]>(mockCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const statusCounts = {
    All: customers.length,
    Active: customers.filter(c => c.status === 'Active').length,
    Inactive: customers.filter(c => c.status === 'Inactive').length,
    Suspended: customers.filter(c => c.status === 'Suspended').length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#37353E] mb-2">Customer Management</h1>
        <p className="text-[#715A5A]">Manage and monitor customer accounts</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#715A5A]">{status} Customers</p>
                <p className="text-2xl font-bold text-[#37353E]">{count}</p>
              </div>
              <UsersIcon className="h-8 w-8 text-[#44444E]" />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9] mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#715A5A]" />
            <input
              type="text"
              placeholder="Search customers..."
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

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#D3DAD9] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#D3DAD9]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Total Spent
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
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-[#D3DAD9]/20">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-[#37353E]">{customer.name}</div>
                      <div className="text-sm text-[#715A5A]">{customer.companyName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[#37353E]">{customer.email}</div>
                    <div className="text-sm text-[#715A5A]">{customer.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#37353E]">
                    {customer.totalOrders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#37353E]">
                    ${customer.totalSpent.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      customer.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : customer.status === 'Inactive'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewCustomer(customer)}
                      className="text-[#44444E] hover:text-[#37353E] mr-3"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      <AnimatePresence>
        <CustomerDetailModal
          customer={selectedCustomer}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </AnimatePresence>
    </div>
  );
}