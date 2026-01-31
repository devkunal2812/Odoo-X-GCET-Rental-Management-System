"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CubeIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  XMarkIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { productService } from '@/app/lib/services/products';
import type { Product } from '@/types/api';

const AssetDetailModal = ({ asset, isOpen, onClose }: {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen || !asset) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-[#37353E]">Asset Details</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#D3DAD9] rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-[#715A5A]" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-[#37353E] mb-4">Basic Information</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[#715A5A] mb-1">Asset Name</label>
                  <p className="text-[#37353E] font-semibold">{asset.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#715A5A] mb-1">Category</label>
                    <p className="text-[#37353E]">{asset.category}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#715A5A] mb-1">Serial Number</label>
                    <p className="text-[#37353E] font-mono">{asset.serialNumber}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#715A5A] mb-1">Status</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      asset.status === 'Available' 
                        ? 'bg-green-100 text-green-800' 
                        : asset.status === 'Rented'
                          ? 'bg-blue-100 text-blue-800'
                          : asset.status === 'Maintenance'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                    }`}>
                      {asset.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#715A5A] mb-1">Condition</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      asset.condition === 'Excellent' 
                        ? 'bg-green-100 text-green-800' 
                        : asset.condition === 'Good'
                          ? 'bg-blue-100 text-blue-800'
                          : asset.condition === 'Fair'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                    }`}>
                      {asset.condition}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#715A5A] mb-1">Location</label>
                  <p className="text-[#37353E]">{asset.location}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#715A5A] mb-1">Partner</label>
                  <p className="text-[#37353E]">{asset.partner}</p>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div>
              <h4 className="text-lg font-semibold text-[#37353E] mb-4">Financial Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#D3DAD9]/20 rounded-lg p-3">
                  <label className="block text-sm font-medium text-[#715A5A] mb-1">Purchase Price</label>
                  <p className="text-lg font-bold text-[#37353E]">₹{asset.purchasePrice.toLocaleString()}</p>
                </div>
                <div className="bg-[#D3DAD9]/20 rounded-lg p-3">
                  <label className="block text-sm font-medium text-[#715A5A] mb-1">Current Value</label>
                  <p className="text-lg font-bold text-[#37353E]">₹{asset.currentValue.toLocaleString()}</p>
                </div>
                <div className="bg-[#D3DAD9]/20 rounded-lg p-3">
                  <label className="block text-sm font-medium text-[#715A5A] mb-1">Daily Rate</label>
                  <p className="text-lg font-bold text-[#37353E]">₹{asset.dailyRate}</p>
                </div>
                <div className="bg-[#D3DAD9]/20 rounded-lg p-3">
                  <label className="block text-sm font-medium text-[#715A5A] mb-1">Total Revenue</label>
                  <p className="text-lg font-bold text-green-600">₹{asset.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance & Maintenance */}
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-[#37353E] mb-4">Performance Metrics</h4>
              <div className="space-y-4">
                <div className="bg-[#D3DAD9]/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#715A5A]">Utilization Rate</span>
                    <span className="text-lg font-bold text-[#37353E]">{asset.utilization}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#37353E] h-2 rounded-full" 
                      style={{ width: `${asset.utilization}%` }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#D3DAD9]/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-[#37353E]">{asset.totalRentals}</p>
                    <p className="text-sm text-[#715A5A]">Total Rentals</p>
                  </div>
                  <div className="bg-[#D3DAD9]/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-[#37353E]">{Math.round(asset.totalRevenue / asset.totalRentals)}</p>
                    <p className="text-sm text-[#715A5A]">Avg Revenue/Rental</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-[#37353E] mb-4">Maintenance Schedule</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[#715A5A] mb-1">Last Maintenance</label>
                  <p className="text-[#37353E]">{asset.lastMaintenanceDate}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#715A5A] mb-1">Next Maintenance</label>
                  <p className="text-[#37353E]">{asset.nextMaintenanceDate}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#715A5A] mb-1">Purchase Date</label>
                  <p className="text-[#37353E]">{asset.purchaseDate}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button className="flex-1 px-4 py-2 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors">
                <PencilIcon className="h-4 w-4 inline mr-2" />
                Edit Asset
              </button>
              <button className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                <WrenchScrewdriverIcon className="h-4 w-4 inline mr-2" />
                Schedule Maintenance
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function AssetsPage() {
  const [assets] = useState<Asset[]>(mockAssets);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || asset.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || asset.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleViewAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsModalOpen(true);
  };

  const statusCounts = {
    All: assets.length,
    Available: assets.filter(a => a.status === 'Available').length,
    Rented: assets.filter(a => a.status === 'Rented').length,
    Maintenance: assets.filter(a => a.status === 'Maintenance').length,
    'Out of Service': assets.filter(a => a.status === 'Out of Service').length,
  };

  const categories = ['All', ...Array.from(new Set(assets.map(a => a.category)))];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#37353E] mb-2">Asset Management</h1>
            <p className="text-[#715A5A]">Manage and track all rental assets</p>
          </div>
          <button className="px-4 py-2 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Asset
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#715A5A]">{status}</p>
                <p className="text-2xl font-bold text-[#37353E]">{count}</p>
              </div>
              <CubeIcon className="h-8 w-8 text-[#44444E]" />
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
              placeholder="Search assets..."
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
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#D3DAD9] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#D3DAD9]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Condition
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Daily Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Utilization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D3DAD9]">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-[#D3DAD9]/20">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-[#37353E]">{asset.name}</div>
                      <div className="text-sm text-[#715A5A]">{asset.serialNumber}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#37353E]">
                    {asset.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      asset.status === 'Available' 
                        ? 'bg-green-100 text-green-800' 
                        : asset.status === 'Rented'
                          ? 'bg-blue-100 text-blue-800'
                          : asset.status === 'Maintenance'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                    }`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      asset.condition === 'Excellent' 
                        ? 'bg-green-100 text-green-800' 
                        : asset.condition === 'Good'
                          ? 'bg-blue-100 text-blue-800'
                          : asset.condition === 'Fair'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                    }`}>
                      {asset.condition}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#37353E]">
                    ₹{asset.dailyRate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#37353E]">
                    {asset.utilization}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#37353E]">
                    ₹{asset.totalRevenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewAsset(asset)}
                      className="text-[#44444E] hover:text-[#37353E] mr-3"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button className="text-[#44444E] hover:text-[#37353E] mr-3">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button className="text-yellow-600 hover:text-yellow-800">
                      <WrenchScrewdriverIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asset Detail Modal */}
      <AnimatePresence>
        <AssetDetailModal
          asset={selectedAsset}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </AnimatePresence>
    </div>
  );
}