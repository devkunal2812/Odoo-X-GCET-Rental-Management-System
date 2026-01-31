"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BuildingStorefrontIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  StarIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { mockVendors, Vendor } from '../../../lib/adminData';

const VendorDetailModal = ({ vendor, isOpen, onClose }: {
  vendor: Vendor | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen || !vendor) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-[#37353E]">Partner Details</h3>
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
              <label className="block text-sm font-medium text-[#715A5A] mb-1">Company Name</label>
              <p className="text-[#37353E] font-semibold">{vendor.companyName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#715A5A] mb-1">Contact Person</label>
              <p className="text-[#37353E] font-semibold">{vendor.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#715A5A] mb-1">Email</label>
              <p className="text-[#37353E]">{vendor.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#715A5A] mb-1">GSTIN</label>
              <p className="text-[#37353E] font-mono">{vendor.gstin}</p>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#D3DAD9] rounded-lg p-4 text-center">
              <CubeIcon className="h-8 w-8 text-[#37353E] mx-auto mb-2" />
              <p className="text-2xl font-bold text-[#37353E]">{vendor.totalProducts}</p>
              <p className="text-sm text-[#715A5A]">Assets</p>
            </div>
            <div className="bg-[#D3DAD9] rounded-lg p-4 text-center">
              <ClipboardDocumentListIcon className="h-8 w-8 text-[#37353E] mx-auto mb-2" />
              <p className="text-2xl font-bold text-[#37353E]">{vendor.totalOrders}</p>
              <p className="text-sm text-[#715A5A]">Rentals</p>
            </div>
            <div className="bg-[#D3DAD9] rounded-lg p-4 text-center">
              <CurrencyDollarIcon className="h-8 w-8 text-[#37353E] mx-auto mb-2" />
              <p className="text-2xl font-bold text-[#37353E]">₹{vendor.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-[#715A5A]">Revenue</p>
            </div>
            <div className="bg-[#D3DAD9] rounded-lg p-4 text-center">
              <StarIcon className="h-8 w-8 text-[#37353E] mx-auto mb-2" />
              <p className="text-2xl font-bold text-[#37353E]">{vendor.rating}</p>
              <p className="text-sm text-[#715A5A]">Rating</p>
            </div>
          </div>

          {/* Status and Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#D3DAD9]">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-[#715A5A]">Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                vendor.status === 'Active' 
                  ? 'bg-green-100 text-green-800' 
                  : vendor.status === 'Pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}>
                {vendor.status}
              </span>
            </div>
            <div className="flex space-x-2">
              {vendor.status === 'Pending' && (
                <>
                  <button className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                    Approve
                  </button>
                  <button className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function AdminPartnersPage() {
  const [vendors] = useState<Vendor[]>(mockVendors);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || vendor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };

  const statusCounts = {
    All: vendors.length,
    Active: vendors.filter(v => v.status === 'Active').length,
    Pending: vendors.filter(v => v.status === 'Pending').length,
    Suspended: vendors.filter(v => v.status === 'Suspended').length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#37353E] mb-2">Rental Partners</h1>
        <p className="text-[#715A5A]">Manage and monitor rental partner accounts</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#715A5A]">{status} Partners</p>
                <p className="text-2xl font-bold text-[#37353E]">{count}</p>
              </div>
              <BuildingStorefrontIcon className="h-8 w-8 text-[#44444E]" />
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
              placeholder="Search partners..."
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

      {/* Partners Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#D3DAD9] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#D3DAD9]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Partner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Assets
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Rating
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
              {filteredVendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-[#D3DAD9]/20">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-[#37353E]">{vendor.companyName}</div>
                      <div className="text-sm text-[#715A5A]">{vendor.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[#37353E]">{vendor.email}</div>
                    <div className="text-sm text-[#715A5A]">GSTIN: {vendor.gstin}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#37353E]">
                    {vendor.totalProducts}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#37353E]">
                    ₹{vendor.totalRevenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-[#37353E]">{vendor.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      vendor.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : vendor.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {vendor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewVendor(vendor)}
                      className="text-[#44444E] hover:text-[#37353E] mr-3"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    {vendor.status === 'Pending' && (
                      <div className="inline-flex space-x-1">
                        <button className="text-green-600 hover:text-green-800">
                          <CheckIcon className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Partner Detail Modal */}
      <AnimatePresence>
        <VendorDetailModal
          vendor={selectedVendor}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </AnimatePresence>
    </div>
  );
}