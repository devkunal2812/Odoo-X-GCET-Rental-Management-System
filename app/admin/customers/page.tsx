"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  ShoppingBagIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { api } from '@/app/lib/api-client';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  customerProfile?: {
    phone?: string;
    defaultAddress?: string;
  };
}

const CustomerDetailModal = ({ customer, isOpen, onClose }: {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
          <div>
            <h4 className="text-lg font-semibold text-[#37353E] mb-4">Personal Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#715A5A] mb-1">Full Name</label>
                <p className="text-[#37353E] font-semibold">
                  {customer.firstName} {customer.lastName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#715A5A] mb-1">Email</label>
                <div className="flex items-center">
                  <EnvelopeIcon className="h-4 w-4 text-[#715A5A] mr-2" />
                  <p className="text-[#37353E]">{customer.email}</p>
                </div>
              </div>
              {customer.customerProfile?.phone && (
                <div>
                  <label className="block text-sm font-medium text-[#715A5A] mb-1">Phone</label>
                  <div className="flex items-center">
                    <PhoneIcon className="h-4 w-4 text-[#715A5A] mr-2" />
                    <p className="text-[#37353E]">{customer.customerProfile.phone}</p>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[#715A5A] mb-1">Member Since</label>
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 text-[#715A5A] mr-2" />
                  <p className="text-[#37353E]">
                    {new Date(customer.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {customer.customerProfile?.defaultAddress && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-[#715A5A] mb-1">Default Address</label>
                <p className="text-[#37353E]">{customer.customerProfile.defaultAddress}</p>
              </div>
            )}
          </div>

          {/* Account Status */}
          <div>
            <h4 className="text-lg font-semibold text-[#37353E] mb-4">Account Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`rounded-lg p-4 ${customer.isActive ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className={`h-5 w-5 ${customer.isActive ? 'text-green-600' : 'text-red-600'}`} />
                  <div>
                    <p className={`font-medium ${customer.isActive ? 'text-green-800' : 'text-red-800'}`}>
                      {customer.isActive ? 'Active Account' : 'Inactive Account'}
                    </p>
                    <p className={`text-sm ${customer.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {customer.isActive ? 'Customer can place orders' : 'Account is disabled'}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`rounded-lg p-4 ${customer.emailVerified ? 'bg-blue-50 border border-blue-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                <div className="flex items-center space-x-2">
                  <EnvelopeIcon className={`h-5 w-5 ${customer.emailVerified ? 'text-blue-600' : 'text-yellow-600'}`} />
                  <div>
                    <p className={`font-medium ${customer.emailVerified ? 'text-blue-800' : 'text-yellow-800'}`}>
                      {customer.emailVerified ? 'Email Verified' : 'Email Not Verified'}
                    </p>
                    <p className={`text-sm ${customer.emailVerified ? 'text-blue-600' : 'text-yellow-600'}`}>
                      {customer.emailVerified ? 'Email confirmed' : 'Pending verification'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchCustomers = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get<{
        success: boolean;
        users: Customer[];
      }>('/admin/users', { role: 'CUSTOMER', limit: 1000 });

      if (response.success) {
        setCustomers(response.users);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' ||
                         (statusFilter === 'Active' && customer.isActive) ||
                         (statusFilter === 'Inactive' && !customer.isActive) ||
                         (statusFilter === 'Verified' && customer.emailVerified) ||
                         (statusFilter === 'Unverified' && !customer.emailVerified);
    
    return matchesSearch && matchesStatus;
  });

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.isActive).length;
  const inactiveCustomers = customers.filter(c => !c.isActive).length;
  const verifiedCustomers = customers.filter(c => c.emailVerified).length;
  const unverifiedCustomers = customers.filter(c => !c.emailVerified).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#37353E] mb-4"></div>
        <p className="text-[#715A5A]">Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#37353E]">Customer Management</h1>
          <div className="flex items-center space-x-4 mt-1">
            <p className="text-[#715A5A]">Manage and monitor customer accounts</p>
            <span className="text-xs text-[#715A5A]">
              Last updated: {lastUpdated.toLocaleTimeString('en-IN')}
            </span>
          </div>
        </div>
        <button
          onClick={() => fetchCustomers(true)}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#715A5A]">Total Customers</p>
              <p className="text-2xl font-bold text-[#37353E]">{totalCustomers}</p>
            </div>
            <UsersIcon className="h-8 w-8 text-[#44444E]" />
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#715A5A]">Active</p>
              <p className="text-2xl font-bold text-green-600">{activeCustomers}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#715A5A]">Inactive</p>
              <p className="text-2xl font-bold text-red-600">{inactiveCustomers}</p>
            </div>
            <XMarkIcon className="h-8 w-8 text-red-600" />
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#715A5A]">Verified</p>
              <p className="text-2xl font-bold text-blue-600">{verifiedCustomers}</p>
            </div>
            <EnvelopeIcon className="h-8 w-8 text-blue-600" />
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#715A5A]">Unverified</p>
              <p className="text-2xl font-bold text-yellow-600">{unverifiedCustomers}</p>
            </div>
            <EnvelopeIcon className="h-8 w-8 text-yellow-600" />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#715A5A]" />
            <input
              type="text"
              placeholder="Search customers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent text-[#37353E] bg-white"
            >
              <option value="All">All Customers</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Verified">Verified</option>
              <option value="Unverified">Unverified</option>
            </select>
            <div className="text-sm text-[#715A5A]">
              Showing {filteredCustomers.length} of {customers.length} customers
            </div>
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
                  Member Since
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Account Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Email Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D3DAD9]">
              <AnimatePresence>
                {filteredCustomers.map((customer) => (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-[#D3DAD9]/20 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#37353E] to-[#44444E] rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-semibold text-sm">
                            {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[#37353E]">
                            {customer.firstName} {customer.lastName}
                          </div>
                          <div className="text-xs text-[#715A5A]">
                            ID: {customer.id.substring(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#37353E]">{customer.email}</div>
                      {customer.customerProfile?.phone && (
                        <div className="text-xs text-[#715A5A]">{customer.customerProfile.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#37353E]">
                      {new Date(customer.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        customer.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {customer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        customer.emailVerified 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {customer.emailVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewCustomer(customer)}
                        className="text-[#44444E] hover:text-[#37353E] p-1"
                        title="View details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon className="h-12 w-12 text-[#715A5A] mx-auto mb-4" />
            <p className="text-[#715A5A]">No customers found</p>
          </div>
        )}
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
