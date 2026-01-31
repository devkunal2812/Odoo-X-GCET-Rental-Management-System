"use client";

import React, { useState, useEffect } from "react";
import {
  CurrencyDollarIcon,
  CalendarIcon,
  ChartBarIcon,
  BanknotesIcon,
  CreditCardIcon,
  ArrowDownTrayIcon
} from "@heroicons/react/24/outline";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/outline";
import { api } from "@/app/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";

// Types for API response
interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  lines: {
    product: {
      id: string;
      name: string;
    };
    quantity: number;
    unitPrice: number;
  }[];
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  totalAmount: number;
  paidAmount: number;
  invoiceDate: string;
  payments: {
    id: string;
    status: string;
    amount: number;
    paidAt: string;
    paymentMethod?: string;
    transactionId?: string;
  }[];
}

interface EarningsData {
  thisMonth: number;
  lastMonth: number;
  totalEarnings: number;
  pendingPayouts: number;
  availableBalance: number;
}

interface MonthlyData {
  month: string;
  earnings: number;
  orders: number;
  avgOrder: number;
}

interface ProductEarnings {
  name: string;
  earnings: number;
  orders: number;
  avgRental: number;
}

interface PayoutData {
  id: string;
  amount: number;
  date: string;
  status: string;
  method: string;
  reference: string;
}

const getPayoutStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return { bg: "#dcfce7", text: "#16a34a" };
    case "pending":
      return { bg: "#fef3c7", text: "#d97706" };
    case "failed":
      return { bg: "#fee2e2", text: "#dc2626" };
    default:
      return { bg: "#f3f4f6", text: "#6b7280" };
  }
};

export default function VendorEarnings() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const { user } = useAuth();

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ordersRes, invoicesRes] = await Promise.all([
          api.get<{ success: boolean; orders: Order[] }>('/orders'),
          api.get<{ success: boolean; invoices: Invoice[] }>('/invoices')
        ]);

        if (ordersRes.success) {
          setOrders(ordersRes.orders || []);
        }
        if (invoicesRes.success) {
          setInvoices(invoicesRes.invoices || []);
        }
      } catch (error) {
        console.error('Error fetching earnings data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // Calculate earnings data from orders
  const calculateEarnings = (): EarningsData => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const completedOrders = orders.filter(o =>
      ['RETURNED', 'INVOICED', 'PICKED_UP'].includes(o.status)
    );

    const thisMonthOrders = completedOrders.filter(o =>
      new Date(o.createdAt) >= thisMonthStart
    );
    const lastMonthOrders = completedOrders.filter(o => {
      const date = new Date(o.createdAt);
      return date >= lastMonthStart && date <= lastMonthEnd;
    });

    const thisMonth = thisMonthOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const lastMonth = lastMonthOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalEarnings = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // Calculate pending payouts from unpaid invoices
    const pendingPayouts = invoices
      .filter(i => i.status === 'POSTED')
      .reduce((sum, i) => sum + i.totalAmount - (i.paidAmount || 0), 0);

    // Calculate available balance from paid invoices
    const availableBalance = invoices
      .filter(i => i.status === 'PAID')
      .reduce((sum, i) => sum + i.paidAmount, 0);

    return { thisMonth, lastMonth, totalEarnings, pendingPayouts, availableBalance };
  };

  // Calculate monthly data
  const calculateMonthlyData = (): MonthlyData[] => {
    const monthlyMap = new Map<string, { orders: Order[] }>();
    const now = new Date();

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyMap.set(key, { orders: [] });
    }

    // Group orders by month
    orders.filter(o => ['RETURNED', 'INVOICED', 'PICKED_UP'].includes(o.status))
      .forEach(order => {
        const date = new Date(order.createdAt);
        const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const existing = monthlyMap.get(key);
        if (existing) {
          existing.orders.push(order);
        }
      });

    return Array.from(monthlyMap.entries()).map(([month, data]) => {
      const earnings = data.orders.reduce((sum, o) => sum + o.totalAmount, 0);
      const orderCount = data.orders.length;
      return {
        month,
        earnings,
        orders: orderCount,
        avgOrder: orderCount > 0 ? earnings / orderCount : 0
      };
    });
  };

  // Calculate top earning products
  const calculateTopProducts = (): ProductEarnings[] => {
    const productMap = new Map<string, { name: string; earnings: number; orders: number }>();

    orders.filter(o => ['RETURNED', 'INVOICED', 'PICKED_UP'].includes(o.status))
      .forEach(order => {
        order.lines?.forEach(line => {
          const key = line.product?.id || line.product?.name || 'Unknown';
          const name = line.product?.name || 'Unknown Product';
          const earnings = line.unitPrice * line.quantity;

          const existing = productMap.get(key);
          if (existing) {
            existing.earnings += earnings;
            existing.orders += 1;
          } else {
            productMap.set(key, { name, earnings, orders: 1 });
          }
        });
      });

    return Array.from(productMap.values())
      .map(p => ({
        ...p,
        avgRental: p.orders > 0 ? p.earnings / p.orders : 0
      }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 4);
  };

  // Get recent payouts from invoice payments
  const getRecentPayouts = (): PayoutData[] => {
    const payouts: PayoutData[] = [];

    invoices.forEach(invoice => {
      invoice.payments?.forEach(payment => {
        payouts.push({
          id: payment.id.slice(0, 8).toUpperCase(),
          amount: payment.amount,
          date: payment.paidAt,
          status: payment.status.toLowerCase(),
          method: payment.paymentMethod || 'Bank Transfer',
          reference: payment.transactionId || `TXN-${payment.id.slice(0, 6)}`
        });
      });
    });

    return payouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  };

  const handleDownloadReport = () => {
    alert("Downloading earnings report...");
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">Earnings Dashboard</h1>
            <p className="mt-2 text-secondary-600">Track your rental income and manage payouts</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
              <div className="w-20 h-8 bg-gray-200 rounded mb-2"></div>
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const earnings = calculateEarnings();
  const monthlyData = calculateMonthlyData();
  const topProducts = calculateTopProducts();
  const recentPayouts = getRecentPayouts();

  const monthlyGrowth = earnings.lastMonth > 0
    ? ((earnings.thisMonth - earnings.lastMonth) / earnings.lastMonth * 100)
    : earnings.thisMonth > 0 ? 100 : 0;
  const isGrowthPositive = monthlyGrowth > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">
            Earnings Dashboard
          </h1>
          <p className="mt-2 text-secondary-600">
            Track your rental income and manage payouts
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button
            onClick={handleDownloadReport}
            className="inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-90 bg-primary-100 text-primary-600"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Download Report
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
              <CurrencyDollarIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className={`flex items-center text-sm font-medium ${isGrowthPositive ? "text-green-600" : "text-red-600"
              }`}>
              {isGrowthPositive ? (
                <ArrowUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 mr-1" />
              )}
              {Math.abs(monthlyGrowth).toFixed(1)}%
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1 text-secondary-900">
            ₹{earnings.thisMonth.toLocaleString()}
          </h3>
          <p className="text-sm text-secondary-600">
            This Month
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <BanknotesIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1 text-secondary-900">
            ₹{earnings.totalEarnings.toLocaleString()}
          </h3>
          <p className="text-sm text-secondary-600">
            Total Earnings
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
              <CalendarIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1 text-secondary-900">
            ₹{earnings.pendingPayouts.toLocaleString()}
          </h3>
          <p className="text-sm text-secondary-600">
            Pending Payouts
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <CreditCardIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1 text-secondary-900">
            ₹{earnings.availableBalance.toLocaleString()}
          </h3>
          <p className="text-sm text-secondary-600">
            Available Balance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Earnings Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-secondary-900">
              Monthly Earnings
            </h2>
            <ChartBarIcon className="h-6 w-6 text-primary-600" />
          </div>

          <div className="space-y-4">
            {monthlyData.map((month) => {
              const maxEarnings = Math.max(...monthlyData.map(m => m.earnings), 1);
              const widthPercentage = (month.earnings / maxEarnings) * 100;

              return (
                <div key={month.month} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-secondary-900">
                      {month.month}
                    </span>
                    <span className="text-sm font-bold text-primary-600">
                      ₹{month.earnings.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${widthPercentage}%`,
                        background: `linear-gradient(135deg, #6b7280 0%, #374151 100%)`
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-secondary-600">
                    <span>{month.orders} orders</span>
                    <span>Avg: ₹{month.avgOrder.toFixed(0)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {monthlyData.every(m => m.orders === 0) && (
            <div className="text-center py-8 text-secondary-500">
              No earnings data available yet.
            </div>
          )}
        </div>

        {/* Top Earning Products */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-secondary-900">
              Top Earning Products
            </h2>
            <ArrowUpIcon className="h-6 w-6 text-primary-600" />
          </div>

          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between p-4 rounded-lg hover:shadow-md transition-shadow bg-secondary-100">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 bg-primary-600 text-white">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-secondary-900">
                      {product.name}
                    </h4>
                    <p className="text-sm text-secondary-600">
                      {product.orders} orders • Avg: ₹{product.avgRental.toFixed(0)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-primary-600">
                    ₹{product.earnings.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {topProducts.length === 0 && (
            <div className="text-center py-8 text-secondary-500">
              No product earnings data available yet.
            </div>
          )}
        </div>
      </div>

      {/* Recent Payouts */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-secondary-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-secondary-900">
              Recent Payouts
            </h2>
            <BanknotesIcon className="h-6 w-6 text-primary-600" />
          </div>
        </div>

        <div className="divide-y divide-secondary-200">
          {recentPayouts.map((payout) => {
            const statusColor = getPayoutStatusColor(payout.status);

            return (
              <div key={payout.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center mr-4">
                      <CreditCardIcon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <div className="flex items-center mb-1">
                        <h4 className="font-semibold mr-3 text-secondary-900">
                          {payout.id}
                        </h4>
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                        >
                          {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-secondary-600">
                        {payout.method} • {payout.reference}
                      </p>
                      <p className="text-sm text-secondary-600">
                        {new Date(payout.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary-600">
                      ₹{payout.amount.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {recentPayouts.length === 0 && (
          <div className="p-6 text-center text-secondary-500">
            No payout history available yet.
          </div>
        )}
      </div>

      {/* Payout Information */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-secondary-900">
          Payout Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-lg bg-secondary-100">
            <h3 className="font-semibold mb-2 text-secondary-900">
              Payout Schedule
            </h3>
            <p className="text-sm text-secondary-600">
              Payouts are processed monthly on the last business day. Minimum payout amount is ₹100.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-secondary-100">
            <h3 className="font-semibold mb-2 text-secondary-900">
              Processing Time
            </h3>
            <p className="text-sm text-secondary-600">
              Bank transfers: 3-5 business days<br />
              PayPal: 1-2 business days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}