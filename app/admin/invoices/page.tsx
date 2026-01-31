"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  vendorName: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Cancelled';
  issueDate: string;
  dueDate: string;
  items: {
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }[];
}

const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    customerName: 'John Doe',
    vendorName: 'TechRent Pro',
    amount: 450,
    status: 'Paid',
    issueDate: '2024-01-25',
    dueDate: '2024-02-10',
    items: [
      { description: 'Professional Camera Kit Rental', quantity: 1, rate: 450, amount: 450 }
    ]
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    customerName: 'Sarah Smith',
    vendorName: 'ToolMaster',
    amount: 280,
    status: 'Pending',
    issueDate: '2024-01-28',
    dueDate: '2024-02-12',
    items: [
      { description: 'Power Drill Set Rental', quantity: 1, rate: 280, amount: 280 }
    ]
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-003',
    customerName: 'Mike Johnson',
    vendorName: 'EventPro',
    amount: 750,
    status: 'Overdue',
    issueDate: '2024-01-20',
    dueDate: '2024-02-05',
    items: [
      { description: 'Sound System Rental', quantity: 1, rate: 750, amount: 750 }
    ]
  },
  {
    id: '4',
    invoiceNumber: 'INV-2024-004',
    customerName: 'Lisa Chen',
    vendorName: 'BikeRentals',
    amount: 120,
    status: 'Paid',
    issueDate: '2024-01-30',
    dueDate: '2024-02-15',
    items: [
      { description: 'Mountain Bike Rental', quantity: 1, rate: 120, amount: 120 }
    ]
  },
  {
    id: '5',
    invoiceNumber: 'INV-2024-005',
    customerName: 'David Wilson',
    vendorName: 'UrbanRide',
    amount: 95,
    status: 'Cancelled',
    issueDate: '2024-01-22',
    dueDate: '2024-02-07',
    items: [
      { description: 'Electric Scooter Rental', quantity: 1, rate: 95, amount: 95 }
    ]
  }
];

export default function AdminInvoicesPage() {
  const [invoices] = useState<Invoice[]>(mockInvoices);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    All: invoices.length,
    Paid: invoices.filter(i => i.status === 'Paid').length,
    Pending: invoices.filter(i => i.status === 'Pending').length,
    Overdue: invoices.filter(i => i.status === 'Overdue').length,
    Cancelled: invoices.filter(i => i.status === 'Cancelled').length,
  };

  const totalRevenue = invoices
    .filter(i => i.status === 'Paid')
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const pendingAmount = invoices
    .filter(i => i.status === 'Pending' || i.status === 'Overdue')
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#37353E] mb-2">Invoice Management</h1>
        <p className="text-[#715A5A]">Track and manage all invoices</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#715A5A]">Total Invoices</p>
              <p className="text-2xl font-bold text-[#37353E]">{invoices.length}</p>
            </div>
            <DocumentTextIcon className="h-8 w-8 text-[#44444E]" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#715A5A]">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#715A5A]">Pending Amount</p>
              <p className="text-2xl font-bold text-yellow-600">${pendingAmount.toLocaleString()}</p>
            </div>
            <CalendarIcon className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#715A5A]">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{statusCounts.Overdue}</p>
            </div>
            <DocumentTextIcon className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9] mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#715A5A]" />
            <input
              type="text"
              placeholder="Search invoices..."
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
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent"
            >
              <option value="All">All Dates</option>
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
              <option value="This Year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#D3DAD9] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#D3DAD9]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Issue Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase tracking-wider">
                  Due Date
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
              {filteredInvoices.map((invoice) => (
                <motion.tr
                  key={invoice.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-[#D3DAD9]/20"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-[#37353E]">{invoice.invoiceNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[#37353E]">{invoice.customerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[#37353E]">{invoice.vendorName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-[#37353E]">${invoice.amount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[#37353E]">{invoice.issueDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[#37353E]">{invoice.dueDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      invoice.status === 'Paid' 
                        ? 'bg-green-100 text-green-800' 
                        : invoice.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : invoice.status === 'Overdue'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-[#44444E] hover:text-[#37353E]">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="text-[#44444E] hover:text-[#37353E]">
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]">
        <h3 className="text-lg font-semibold text-[#37353E] mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors text-left">
            <DocumentTextIcon className="h-6 w-6 mb-2" />
            <p className="font-medium">Generate Report</p>
            <p className="text-sm opacity-80">Export invoice summary</p>
          </button>
          <button className="p-4 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors text-left">
            <CalendarIcon className="h-6 w-6 mb-2" />
            <p className="font-medium">Send Reminders</p>
            <p className="text-sm opacity-80">Notify overdue customers</p>
          </button>
          <button className="p-4 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors text-left">
            <CurrencyDollarIcon className="h-6 w-6 mb-2" />
            <p className="font-medium">Payment Analytics</p>
            <p className="text-sm opacity-80">View payment trends</p>
          </button>
        </div>
      </div>
    </div>
  );
}