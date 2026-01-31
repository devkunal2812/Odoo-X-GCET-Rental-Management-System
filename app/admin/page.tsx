"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CubeIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { generateInvoicePDF, generateSampleInvoiceData } from '../../lib/invoiceGenerator';

const stats = [
  {
    name: 'Active Rentals',
    value: '1,247',
    change: '+8%',
    changeType: 'increase',
    icon: DocumentTextIcon,
  },
  {
    name: 'Available Assets',
    value: '3,456',
    change: '+12%',
    changeType: 'increase',
    icon: CubeIcon,
  },
  {
    name: 'Monthly Revenue',
    value: '₹234,567',
    change: '+15%',
    changeType: 'increase',
    icon: CurrencyDollarIcon,
  },
  {
    name: 'Assets Under Maintenance',
    value: '89',
    change: '-5%',
    changeType: 'decrease',
    icon: WrenchScrewdriverIcon,
  },
];

const recentRentals = [
  {
    id: 'RNT-001',
    customer: 'John Doe',
    asset: 'Professional Camera Kit',
    partner: 'TechRent Pro',
    amount: '₹450',
    status: 'Active',
    startDate: '2024-01-28',
    endDate: '2024-02-05',
    daysRemaining: 3,
  },
  {
    id: 'RNT-002',
    customer: 'Sarah Smith',
    asset: 'Power Drill Set',
    partner: 'ToolMaster',
    amount: '₹280',
    status: 'Pending Return',
    startDate: '2024-01-25',
    endDate: '2024-01-31',
    daysRemaining: 0,
  },
  {
    id: 'RNT-003',
    customer: 'Mike Johnson',
    asset: 'Sound System',
    partner: 'EventPro',
    amount: '₹750',
    status: 'Overdue',
    startDate: '2024-01-20',
    endDate: '2024-01-30',
    daysRemaining: -1,
  },
  {
    id: 'RNT-004',
    customer: 'Lisa Chen',
    asset: 'Mountain Bike',
    partner: 'BikeRentals',
    amount: '₹120',
    status: 'Returned',
    startDate: '2024-01-22',
    endDate: '2024-01-29',
    daysRemaining: 0,
  },
  {
    id: 'RNT-005',
    customer: 'David Wilson',
    asset: 'Electric Scooter',
    partner: 'UrbanRide',
    amount: '₹95',
    status: 'Cancelled',
    startDate: '2024-01-26',
    endDate: '2024-02-02',
    daysRemaining: 0,
  },
];

const topAssets = [
  { name: 'Professional Camera Kit', utilization: '85%', revenue: '₹12,450', rentals: 45 },
  { name: 'Power Tools Set', utilization: '78%', revenue: '₹9,800', rentals: 38 },
  { name: 'Sound System', utilization: '72%', revenue: '₹8,900', rentals: 28 },
  { name: 'Mountain Bikes', utilization: '68%', revenue: '₹7,650', rentals: 52 },
  { name: 'Electric Scooters', utilization: '65%', revenue: '₹6,200', rentals: 34 },
];

export default function AdminDashboard() {
  const handleDownloadInvoice = (rentalId: string) => {
    try {
      // Generate sample invoice data (in real app, this would come from API)
      const invoiceData = generateSampleInvoiceData(`INV-${rentalId.split('-')[1]}`);
      
      // Find the actual rental from recentRentals to get real data
      const actualRental = recentRentals.find(rental => rental.id === rentalId);
      if (actualRental) {
        // Update the sample data with actual rental data
        invoiceData.id = `INV-${rentalId}`;
        invoiceData.orderId = actualRental.id;
        invoiceData.product = actualRental.asset;
        invoiceData.vendor = actualRental.partner;
        invoiceData.amount = parseInt(actualRental.amount.replace('₹', ''));
        invoiceData.total = invoiceData.amount + (invoiceData.amount * 0.18) + 25; // Add tax and service fee
        invoiceData.status = actualRental.status === 'Returned' ? 'paid' : 'pending';
        invoiceData.rentalPeriod = `${actualRental.startDate} to ${actualRental.endDate}`;
        
        // Update customer info
        invoiceData.customerInfo.name = actualRental.customer;
        invoiceData.customerInfo.email = 'customer@email.com';
        invoiceData.customerInfo.phone = '+91 98765 43210';
        invoiceData.customerInfo.address = '123, Customer Address, City, State - 560001';
      }
      
      // Generate and download PDF
      generateInvoicePDF(invoiceData);
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successMessage.textContent = `Invoice for ${rentalId} downloaded successfully!`;
      document.body.appendChild(successMessage);
      
      // Remove success message after 3 seconds
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // Show error message
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      errorMessage.textContent = 'Error generating PDF. Please try again.';
      document.body.appendChild(errorMessage);
      
      // Remove error message after 3 seconds
      setTimeout(() => {
        document.body.removeChild(errorMessage);
      }, 3000);
    }
  };
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#37353E] mb-2">Rental ERP Dashboard</h1>
        <p className="text-[#715A5A]">Manage your rental operations and assets</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#715A5A]">{stat.name}</p>
                <p className="text-2xl font-bold text-[#37353E] mt-1">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.changeType === 'increase' ? (
                    <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-[#715A5A] ml-1">vs last month</span>
                </div>
              </div>
              <div className="p-3 bg-[#D3DAD9] rounded-lg">
                <stat.icon className="h-6 w-6 text-[#44444E]" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Rentals */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-[#D3DAD9]"
        >
          <div className="p-6 border-b border-[#D3DAD9]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#37353E]">Active Rentals</h3>
              <ClockIcon className="h-5 w-5 text-[#715A5A]" />
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentRentals.map((rental) => (
                <div key={rental.id} className="flex items-center justify-between p-4 bg-[#D3DAD9]/20 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-[#37353E]">{rental.id}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          rental.status === 'Active' 
                            ? 'bg-green-100 text-green-800'
                            : rental.status === 'Pending Return'
                              ? 'bg-yellow-100 text-yellow-800'
                              : rental.status === 'Overdue'
                                ? 'bg-red-100 text-red-800'
                                : rental.status === 'Returned'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                        }`}>
                          {rental.status}
                        </span>
                        {(rental.status === 'Returned' || rental.status === 'Active') && (
                          <button
                            onClick={() => handleDownloadInvoice(rental.id)}
                            className="p-1 rounded hover:bg-[#44444E]/20 transition-colors text-[#37353E]"
                            title="Download Invoice"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-[#715A5A] mb-1">{rental.customer} • {rental.asset}</p>
                    <p className="text-xs text-[#715A5A]">{rental.partner}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm font-semibold text-[#37353E]">{rental.amount}</p>
                      <div className="text-xs text-[#715A5A]">
                        {rental.daysRemaining > 0 ? (
                          <span className="text-green-600">{rental.daysRemaining} days left</span>
                        ) : rental.daysRemaining === 0 ? (
                          <span className="text-yellow-600">Due today</span>
                        ) : rental.daysRemaining < 0 ? (
                          <span className="text-red-600">{Math.abs(rental.daysRemaining)} days overdue</span>
                        ) : (
                          <span>{rental.endDate}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Top Assets */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-[#D3DAD9]"
        >
          <div className="p-6 border-b border-[#D3DAD9]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#37353E]">Top Performing Assets</h3>
              <ChartBarIcon className="h-5 w-5 text-[#715A5A]" />
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topAssets.map((asset, index) => (
                <div key={asset.name} className="flex items-center justify-between p-4 bg-[#D3DAD9]/20 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#37353E] to-[#44444E] flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#37353E]">{asset.name}</p>
                      <p className="text-xs text-[#715A5A]">{asset.rentals} rentals • {asset.utilization} utilization</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#37353E]">{asset.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]"
      >
        <h3 className="text-lg font-semibold text-[#37353E] mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors text-left">
            <CubeIcon className="h-6 w-6 mb-2" />
            <p className="font-medium">Asset Management</p>
            <p className="text-sm opacity-80">View and manage rental assets</p>
          </button>
          <button className="p-4 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors text-left">
            <WrenchScrewdriverIcon className="h-6 w-6 mb-2" />
            <p className="font-medium">Schedule Maintenance</p>
            <p className="text-sm opacity-80">Plan asset maintenance and repairs</p>
          </button>
          <button className="p-4 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors text-left">
            <DocumentTextIcon className="h-6 w-6 mb-2" />
            <p className="font-medium">Generate Contracts</p>
            <p className="text-sm opacity-80">Create rental agreements and contracts</p>
          </button>
        </div>
      </motion.div>
    </div>
  );
}