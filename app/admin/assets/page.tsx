"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CubeIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  XMarkIcon,
  CheckCircleIcon,
  PlusIcon,
  PencilIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { reportService } from '@/app/lib/services/reports';
import type { AdminProductsReport } from '@/types/api';

interface Asset {
  productId: string;
  productName: string;
  vendorName: string;
  totalRentals: number;
  totalQuantityRented: number;
  currentStock: number;
  utilizationRate?: number;
}

const AssetDetailModal = ({ asset, isOpen, onClose }: {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen || !asset) return null;

  const utilization = asset.utilizationRate || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto"
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

        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h4 className="text-lg font-semibold text-[#37353E] mb-4">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#715A5A] mb-1">Product Name</label>
                <p className="text-[#37353E] font-semibold">{asset.productName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#715A5A] mb-1">Vendor</label>
                <p className="text-[#37353E]">{asset.vendorName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#715A5A] mb-1">Current Stock</label>
                <p className="text-[#37353E] font-bold text-lg">{asset.currentStock} units</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#715A5A] mb-1">Total Rentals</label>
                <p className="text-[#37353E] font-bold text-lg">{asset.totalRentals}</p>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div>
            <h4 className="text-lg font-semibold text-[#37353E] mb-4">Performance Metrics</h4>
            <div className="space-y-4">
              <div className="bg-[#D3DAD9]/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#715A5A]">Utilization Rate</span>
                  <span className="text-lg font-bold text-[#37353E]">{utilization.toFixed(2)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#37353E] h-2 rounded-full transition-all" 
                    style={{ width: `${Math.min(utilization, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-100 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{asset.totalQuantityRented}</p>
                  <p className="text-sm text-[#715A5A]">Total Quantity Rented</p>
                </div>
                <div className="bg-green-100 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {asset.totalRentals > 0 ? (asset.totalQuantityRented / asset.totalRentals).toFixed(1) : 0}
                  </p>
                  <p className="text-sm text-[#715A5A]">Avg Qty per Rental</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stock Status */}
          <div>
            <h4 className="text-lg font-semibold text-[#37353E] mb-4">Stock Status</h4>
            <div className="bg-[#D3DAD9]/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#715A5A]">Current Availability</p>
                  <p className="text-2xl font-bold text-[#37353E]">{asset.currentStock} units</p>
                </div>
                <div className={`px-4 py-2 rounded-lg ${
                  asset.currentStock > 5 
                    ? 'bg-green-100 text-green-800' 
                    : asset.currentStock > 0
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}>
                  {asset.currentStock > 5 ? 'In Stock' : asset.currentStock > 0 ? 'Low Stock' : 'Out of Stock'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('All');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchAssets = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const response = await reportService.getAdminReport('products') as AdminProductsReport;
      
      if (response.success) {
        setAssets(response.products);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAssets();
  }, []);

  // Auto-refresh every 30 seconds when enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchAssets(true);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Check for low stock alerts
  useEffect(() => {
    const criticalStock = assets.filter(a => a.currentStock === 0);
    const lowStockItems = assets.filter(a => a.currentStock > 0 && a.currentStock <= 5);

    if (criticalStock.length > 0) {
      console.log(`🚨 Critical: ${criticalStock.length} assets out of stock`);
    }
    if (lowStockItems.length > 0) {
      console.log(`⚠️ Warning: ${lowStockItems.length} assets have low stock`);
    }
  }, [assets]);

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStock = stockFilter === 'All' || 
                        (stockFilter === 'In Stock' && asset.currentStock > 5) ||
                        (stockFilter === 'Low Stock' && asset.currentStock > 0 && asset.currentStock <= 5) ||
                        (stockFilter === 'Out of Stock' && asset.currentStock === 0);
    
    return matchesSearch && matchesStock;
  });

  const handleViewAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsModalOpen(true);
  };

  const totalAssets = assets.length;
  const inStock = assets.filter(a => a.currentStock > 5).length;
  const lowStock = assets.filter(a => a.currentStock > 0 && a.currentStock <= 5).length;
  const outOfStock = assets.filter(a => a.currentStock === 0).length;
  const totalRentals = assets.reduce((sum, a) => sum + a.totalRentals, 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#37353E] mb-4"></div>
        <p className="text-[#715A5A]">Loading assets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#37353E]">Asset Management</h1>
          <div className="flex items-center space-x-4 mt-1">
            <p className="text-[#715A5A]">Manage and track all rental assets</p>
            <span className="text-xs text-[#715A5A]">
              Last updated: {lastUpdated.toLocaleTimeString('en-IN')}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 text-sm text-[#715A5A] cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-[#D3DAD9] text-[#37353E] focus:ring-[#37353E]"
            />
            <span>Auto-refresh (30s)</span>
          </label>
          <button
            onClick={() => fetchAssets(true)}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-5 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#715A5A]">Total Assets</p>
              <p className="text-2xl font-bold text-[#37353E]">{totalAssets}</p>
            </div>
            <CubeIcon className="h-8 w-8 text-[#44444E]" />
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#715A5A]">In Stock</p>
              <p className="text-2xl font-bold text-green-600">{inStock}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#715A5A]">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600">{lowStock}</p>
              {lowStock > 0 && (
                <p className="text-xs text-yellow-600 mt-1">⚠️ Needs attention</p>
              )}
            </div>
            <CubeIcon className="h-8 w-8 text-yellow-600" />
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#715A5A]">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{outOfStock}</p>
              {outOfStock > 0 && (
                <p className="text-xs text-red-600 mt-1">🚨 Critical</p>
              )}
            </div>
            <XMarkIcon className="h-8 w-8 text-red-600" />
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#715A5A]">Total Rentals</p>
              <p className="text-2xl font-bold text-blue-600">{totalRentals}</p>
            </div>
            <CubeIcon className="h-8 w-8 text-blue-600" />
          </div>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#715A5A]" />
            <input
              type="text"
              placeholder="Search assets by name or vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-4 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent text-[#37353E] bg-white"
            >
              <option value="All">All Stock Levels</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <div className="text-sm text-[#715A5A]">
                {autoRefresh ? 'Live' : 'Static'} | {filteredAssets.length} of {assets.length} assets
              </div>
            </div>
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
                  Asset Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Stock Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Total Rentals
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Qty Rented
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Utilization
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D3DAD9]">
              <AnimatePresence>
                {filteredAssets.map((asset) => {
                  const stockStatus = asset.currentStock > 5 ? 'In Stock' : 
                                    asset.currentStock > 0 ? 'Low Stock' : 'Out of Stock';
                  const stockColor = asset.currentStock > 5 ? 'bg-green-100 text-green-800' :
                                   asset.currentStock > 0 ? 'bg-yellow-100 text-yellow-800' :
                                   'bg-red-100 text-red-800';
                  
                  return (
                    <motion.tr
                      key={asset.productId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-[#D3DAD9]/20 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-[#37353E] to-[#44444E] rounded-lg flex items-center justify-center mr-3">
                            <CubeIcon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[#37353E]">{asset.productName}</div>
                            <div className="text-xs text-[#715A5A]">ID: {asset.productId.substring(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#37353E]">
                        {asset.vendorName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockColor}`}>
                          {stockStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#37353E]">
                        {asset.currentStock} units
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#37353E]">
                        {asset.totalRentals}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#37353E]">
                        {asset.totalQuantityRented}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#37353E]">
                        {asset.utilizationRate ? `${asset.utilizationRate.toFixed(1)}%` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewAsset(asset)}
                          className="text-[#44444E] hover:text-[#37353E] p-1"
                          title="View details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredAssets.length === 0 && (
          <div className="text-center py-12">
            <CubeIcon className="h-12 w-12 text-[#715A5A] mx-auto mb-4" />
            <p className="text-[#715A5A]">No assets found</p>
          </div>
        )}
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
