"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BuildingStorefrontIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  StarIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  ArrowPathIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { reportService } from '@/app/lib/services/reports';
import type { AdminVendorsReport } from '@/types/api';

interface Vendor {
  vendorId: string;
  vendorName: string;
  email: string;
  gstin?: string;
  joinedDate: string;
  totalProducts: number;
  publishedProducts: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

const VendorDetailModal = ({ vendor, isOpen, onClose }: {
  vendor: Vendor | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen || !vendor) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-[#37353E]">Vendor Details</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#D3DAD9] rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-[#715A5A]" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Company Info */}
          <div>
            <h4 className="text-lg font-semibold text-[#37353E] mb-3">Company Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#715A5A] mb-1">Company Name</label>
                <p className="text-[#37353E] font-medium">{vendor.vendorName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#715A5A] mb-1">Email</label>
                <p className="text-[#37353E]">{vendor.email}</p>
              </div>
              {vendor.gstin && (
                <div>
                  <label className="block text-sm font-medium text-[#715A5A] mb-1">GSTIN</label>
                  <p className="text-[#37353E] font-mono">{vendor.gstin}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[#715A5A] mb-1">Joined Date</label>
                <p className="text-[#37353E]">
                  {new Date(vendor.joinedDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div>
            <h4 className="text-lg font-semibold text-[#37353E] mb-3">Performance Metrics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#D3DAD9] rounded-lg p-4 text-center">
                <CubeIcon className="h-8 w-8 text-[#37353E] mx-auto mb-2" />
                <p className="text-2xl font-bold text-[#37353E]">{vendor.totalProducts}</p>
                <p className="text-sm text-[#715A5A]">Products</p>
              </div>
              <div className="bg-green-100 rounded-lg p-4 text-center">
                <CheckCircleIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{vendor.publishedProducts}</p>
                <p className="text-sm text-[#715A5A]">Published</p>
              </div>
              <div className="bg-blue-100 rounded-lg p-4 text-center">
                <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{vendor.totalOrders}</p>
                <p className="text-sm text-[#715A5A]">Orders</p>
              </div>
              <div className="bg-purple-100 rounded-lg p-4 text-center">
                <CurrencyDollarIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">
                  Rs. {vendor.totalRevenue.toLocaleString('en-IN')}
                </p>
                <p className="text-sm text-[#715A5A]">Revenue</p>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div>
            <h4 className="text-lg font-semibold text-[#37353E] mb-3">Statistics</h4>
            <div className="bg-[#D3DAD9] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-[#715A5A]">Average Order Value</span>
                <span className="text-[#37353E] font-bold">
                  Rs. {vendor.averageOrderValue.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await reportService.getAdminReport('vendors') as AdminVendorsReport;
      
      if (response.success) {
        setVendors(response.vendors);
      }
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (vendor.gstin && vendor.gstin.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const handleViewVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };

  const totalRevenue = vendors.reduce((sum, v) => sum + v.totalRevenue, 0);
  const totalOrders = vendors.reduce((sum, v) => sum + v.totalOrders, 0);
  const totalProducts = vendors.reduce((sum, v) => sum + v.totalProducts, 0);
  const activeVendors = vendors.filter(v => v.totalOrders > 0).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#37353E] mb-4"></div>
        <p className="text-[#715A5A]">Loading vendors...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#37353E]">Vendor Management</h1>
          <p className="text-[#715A5A]">Manage and monitor vendor accounts</p>
        </div>
        <button
          onClick={fetchVendors}
          className="flex items-center space-x-2 px-4 py-2 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors"
        >
          <ArrowPathIcon className="h-5 w-5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#715A5A]">Total Vendors</p>
              <p className="text-2xl font-bold text-[#37353E]">{vendors.length}</p>
            </div>
            <BuildingStorefrontIcon className="h-8 w-8 text-[#44444E]" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#715A5A]">Active Vendors</p>
              <p className="text-2xl font-bold text-green-600">{activeVendors}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#715A5A]">Total Products</p>
              <p className="text-2xl font-bold text-blue-600">{totalProducts}</p>
            </div>
            <CubeIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#715A5A]">Total Revenue</p>
              <p className="text-2xl font-bold text-purple-600">
                Rs. {totalRevenue.toLocaleString('en-IN')}
              </p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#715A5A]" />
            <input
              type="text"
              placeholder="Search vendors by name, email, or GSTIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent"
            />
          </div>
          <div className="text-sm text-[#715A5A]">
            Showing {filteredVendors.length} of {vendors.length} vendors
          </div>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#D3DAD9] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#D3DAD9]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Avg Order
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D3DAD9]">
              <AnimatePresence>
                {filteredVendors.map((vendor) => (
                  <motion.tr
                    key={vendor.vendorId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-[#D3DAD9]/20 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#37353E] to-[#44444E] rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-semibold text-sm">
                            {vendor.vendorName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[#37353E]">{vendor.vendorName}</div>
                          <div className="text-xs text-[#715A5A]">
                            Joined {new Date(vendor.joinedDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#37353E]">{vendor.email}</div>
                      {vendor.gstin && (
                        <div className="text-xs text-[#715A5A] font-mono">GSTIN: {vendor.gstin}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#37353E]">{vendor.totalProducts}</div>
                      <div className="text-xs text-green-600">{vendor.publishedProducts} published</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#37353E]">
                      {vendor.totalOrders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#37353E]">
                      Rs. {vendor.totalRevenue.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#37353E]">
                      Rs. {vendor.averageOrderValue.toLocaleString('en-IN', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewVendor(vendor)}
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

        {filteredVendors.length === 0 && (
          <div className="text-center py-12">
            <BuildingStorefrontIcon className="h-12 w-12 text-[#715A5A] mx-auto mb-4" />
            <p className="text-[#715A5A]">No vendors found</p>
          </div>
        )}
      </div>

      {/* Vendor Detail Modal */}
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
