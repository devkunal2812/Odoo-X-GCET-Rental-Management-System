"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BuildingStorefrontIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  StarIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  XMarkIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { reportService } from '@/app/lib/services/reports';
import type { AdminVendorsReport } from '@/types/api';

interface Partner {
  vendorId: string;
  vendorName: string;
  email: string;
  gstin?: string;
  totalProducts: number;
  publishedProducts: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

const PartnerDetailModal = ({ partner, isOpen, onClose }: {
  partner: Partner | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen || !partner) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto"
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
          <div>
            <h4 className="text-lg font-semibold text-[#37353E] mb-4">Company Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#715A5A] mb-1">Company Name</label>
                <p className="text-[#37353E] font-semibold">{partner.vendorName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#715A5A] mb-1">Email</label>
                <p className="text-[#37353E]">{partner.email}</p>
              </div>
              {partner.gstin && (
                <div>
                  <label className="block text-sm font-medium text-[#715A5A] mb-1">GSTIN</label>
                  <p className="text-[#37353E] font-mono">{partner.gstin}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[#715A5A] mb-1">Total Products</label>
                <p className="text-[#37353E] font-semibold">{partner.totalProducts}</p>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div>
            <h4 className="text-lg font-semibold text-[#37353E] mb-4">Performance Metrics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-100 rounded-lg p-4 text-center">
                <CubeIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{partner.totalProducts}</p>
                <p className="text-sm text-[#715A5A]">Total Assets</p>
              </div>
              <div className="bg-green-100 rounded-lg p-4 text-center">
                <CheckCircleIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{partner.publishedProducts}</p>
                <p className="text-sm text-[#715A5A]">Published</p>
              </div>
              <div className="bg-purple-100 rounded-lg p-4 text-center">
                <ClipboardDocumentListIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">{partner.totalOrders}</p>
                <p className="text-sm text-[#715A5A]">Total Rentals</p>
              </div>
              <div className="bg-yellow-100 rounded-lg p-4 text-center">
                <CurrencyDollarIcon className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-600">
                  Rs. {partner.totalRevenue.toLocaleString('en-IN')}
                </p>
                <p className="text-sm text-[#715A5A]">Total Revenue</p>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div>
            <h4 className="text-lg font-semibold text-[#37353E] mb-4">Business Statistics</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#D3DAD9]/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#715A5A]">Average Order Value</span>
                  <span className="text-lg font-bold text-[#37353E]">
                    Rs. {partner.averageOrderValue.toLocaleString('en-IN', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    })}
                  </span>
                </div>
              </div>
              <div className="bg-[#D3DAD9]/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#715A5A]">Publish Rate</span>
                  <span className="text-lg font-bold text-[#37353E]">
                    {partner.totalProducts > 0 
                      ? ((partner.publishedProducts / partner.totalProducts) * 100).toFixed(0)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Indicator */}
          <div>
            <h4 className="text-lg font-semibold text-[#37353E] mb-4">Partner Status</h4>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Active Partner</p>
                  <p className="text-sm text-green-600">
                    {partner.totalOrders > 0 
                      ? `${partner.totalOrders} successful rentals completed`
                      : 'New partner - No rentals yet'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [performanceFilter, setPerformanceFilter] = useState('All');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchPartners = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const response = await reportService.getAdminReport('vendors') as AdminVendorsReport;
      
      if (response.success) {
        setPartners(response.vendors);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch partners:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (partner.gstin && partner.gstin.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPerformance = performanceFilter === 'All' ||
                              (performanceFilter === 'Active' && partner.totalOrders > 0) ||
                              (performanceFilter === 'New' && partner.totalOrders === 0) ||
                              (performanceFilter === 'Top' && partner.totalRevenue > 10000);
    
    return matchesSearch && matchesPerformance;
  });

  const handleViewPartner = (partner: Partner) => {
    setSelectedPartner(partner);
    setIsModalOpen(true);
  };

  const totalPartners = partners.length;
  const activePartners = partners.filter(p => p.totalOrders > 0).length;
  const newPartners = partners.filter(p => p.totalOrders === 0).length;
  const totalRevenue = partners.reduce((sum, p) => sum + p.totalRevenue, 0);
  const totalAssets = partners.reduce((sum, p) => sum + p.totalProducts, 0);
  const totalRentals = partners.reduce((sum, p) => sum + p.totalOrders, 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#37353E] mb-4"></div>
        <p className="text-[#715A5A]">Loading rental partners...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#37353E]">Rental Partners</h1>
          <div className="flex items-center space-x-4 mt-1">
            <p className="text-[#715A5A]">Manage and monitor rental partner accounts</p>
            <span className="text-xs text-[#715A5A]">
              Last updated: {lastUpdated.toLocaleTimeString('en-IN')}
            </span>
          </div>
        </div>
        <button
          onClick={() => fetchPartners(true)}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#715A5A]">Total Partners</p>
              <p className="text-2xl font-bold text-[#37353E]">{totalPartners}</p>
            </div>
            <BuildingStorefrontIcon className="h-8 w-8 text-[#44444E]" />
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#715A5A]">Active Partners</p>
              <p className="text-2xl font-bold text-green-600">{activePartners}</p>
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
              <p className="text-sm font-medium text-[#715A5A]">New Partners</p>
              <p className="text-2xl font-bold text-blue-600">{newPartners}</p>
            </div>
            <StarIcon className="h-8 w-8 text-blue-600" />
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#715A5A]">Total Assets</p>
              <p className="text-2xl font-bold text-purple-600">{totalAssets}</p>
            </div>
            <CubeIcon className="h-8 w-8 text-purple-600" />
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#715A5A]">Total Rentals</p>
              <p className="text-2xl font-bold text-orange-600">{totalRentals}</p>
            </div>
            <ClipboardDocumentListIcon className="h-8 w-8 text-orange-600" />
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#715A5A]">Total Revenue</p>
              <p className="text-xl font-bold text-green-600">
                Rs. {(totalRevenue / 1000).toFixed(0)}K
              </p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
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
              placeholder="Search partners by name, email, or GSTIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={performanceFilter}
              onChange={(e) => setPerformanceFilter(e.target.value)}
              className="px-4 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent text-[#37353E] bg-white"
            >
              <option value="All">All Partners</option>
              <option value="Active">Active (Has Rentals)</option>
              <option value="New">New (No Rentals)</option>
              <option value="Top">Top Performers`&gt;`k</option>
            </select>
            <div className="text-sm text-[#715A5A]">
              Showing {filteredPartners.length} of {partners.length} partners
            </div>
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
                  Rentals
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Avg Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D3DAD9]">
              <AnimatePresence>
                {filteredPartners.map((partner) => (
                  <motion.tr
                    key={partner.vendorId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-[#D3DAD9]/20 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#37353E] to-[#44444E] rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-semibold text-sm">
                            {partner.vendorName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[#37353E]">{partner.vendorName}</div>
                          <div className="text-xs text-[#715A5A]">
                            {partner.totalOrders} rentals
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#37353E]">{partner.email}</div>
                      {partner.gstin && (
                        <div className="text-xs text-[#715A5A] font-mono">GSTIN: {partner.gstin}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#37353E]">{partner.totalProducts}</div>
                      <div className="text-xs text-green-600">{partner.publishedProducts} published</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#37353E]">
                      {partner.totalOrders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#37353E]">
                      Rs. {partner.totalRevenue.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#37353E]">
                      Rs. {partner.averageOrderValue.toLocaleString('en-IN', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        partner.totalOrders > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {partner.totalOrders > 0 ? 'Active' : 'New'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewPartner(partner)}
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

        {filteredPartners.length === 0 && (
          <div className="text-center py-12">
            <BuildingStorefrontIcon className="h-12 w-12 text-[#715A5A] mx-auto mb-4" />
            <p className="text-[#715A5A]">No partners found</p>
          </div>
        )}
      </div>

      {/* Partner Detail Modal */}
      <AnimatePresence>
        <PartnerDetailModal
          partner={selectedPartner}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </AnimatePresence>
    </div>
  );
}
