"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BellIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

interface NotificationResult {
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerEmail: string;
  productName: string;
  expiryTime: Date;
  status: 'sent' | 'failed';
  sentAt: Date;
  error?: string;
}

export default function AdminNotificationsPage() {
  const [schedulerRunning, setSchedulerRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [intervalMinutes, setIntervalMinutes] = useState(5);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [notifications, setNotifications] = useState<NotificationResult[]>([]);
  const [stats, setStats] = useState({ checked: 0, sent: 0, failed: 0 });

  // Check scheduler status on mount
  useEffect(() => {
    checkSchedulerStatus();
  }, []);

  const checkSchedulerStatus = async () => {
    try {
      const response = await fetch('/api/admin/scheduler');
      const data = await response.json();
      if (data.success) {
        setSchedulerRunning(data.running);
      }
    } catch (error) {
      console.error('Failed to check scheduler status:', error);
    }
  };

  const handleStartScheduler = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', intervalMinutes })
      });
      const data = await response.json();
      if (data.success) {
        setSchedulerRunning(true);
        alert(`Scheduler started! Checking every ${intervalMinutes} minutes.`);
      } else {
        alert('Failed to start scheduler: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to start scheduler:', error);
      alert('Failed to start scheduler');
    } finally {
      setLoading(false);
    }
  };

  const handleStopScheduler = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' })
      });
      const data = await response.json();
      if (data.success) {
        setSchedulerRunning(false);
        alert('Scheduler stopped!');
      } else {
        alert('Failed to stop scheduler: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to stop scheduler:', error);
      alert('Failed to stop scheduler');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckNow = async () => {
    setChecking(true);
    try {
      const response = await fetch('/api/notifications/check-expiring');
      const data = await response.json();
      if (data.success) {
        setLastCheck(new Date());
        setNotifications(data.data.notifications || []);
        setStats({
          checked: data.data.checked || 0,
          sent: data.data.notifications?.filter((n: NotificationResult) => n.status === 'sent').length || 0,
          failed: data.data.notifications?.filter((n: NotificationResult) => n.status === 'failed').length || 0
        });
        alert(data.message);
      } else {
        alert('Failed to check: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to check expiring rentals:', error);
      alert('Failed to check expiring rentals');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#37353E]">Rental Expiry Notifications</h1>
        <p className="text-[#715A5A]">Manage automated notifications for expiring rentals</p>
      </div>

      {/* Scheduler Control */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-[#37353E] mb-2">Notification Scheduler</h2>
            <p className="text-sm text-[#715A5A]">
              Automatically checks for rentals expiring in 5 minutes and sends email notifications
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full ${schedulerRunning ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${schedulerRunning ? 'bg-green-600 animate-pulse' : 'bg-red-600'}`}></div>
              <span className="font-medium">{schedulerRunning ? 'Running' : 'Stopped'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#715A5A] mb-2">
              Check Interval (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={intervalMinutes}
              onChange={(e) => setIntervalMinutes(parseInt(e.target.value) || 5)}
              disabled={schedulerRunning}
              className="w-full px-4 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] disabled:bg-gray-100 text-[#37353E]"
            />
            <p className="text-xs text-[#715A5A] mt-1">
              How often to check for expiring rentals
            </p>
          </div>

          <div className="flex items-end space-x-3">
            {!schedulerRunning ? (
              <button
                onClick={handleStartScheduler}
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <PlayIcon className="h-5 w-5" />
                <span>{loading ? 'Starting...' : 'Start Scheduler'}</span>
              </button>
            ) : (
              <button
                onClick={handleStopScheduler}
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <StopIcon className="h-5 w-5" />
                <span>{loading ? 'Stopping...' : 'Stop Scheduler'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Manual Check */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-[#37353E] mb-2">Manual Check</h2>
            <p className="text-sm text-[#715A5A]">
              Manually trigger a check for expiring rentals right now
            </p>
          </div>
          <button
            onClick={handleCheckNow}
            disabled={checking}
            className="flex items-center space-x-2 px-6 py-3 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-5 w-5 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Checking...' : 'Check Now'}</span>
          </button>
        </div>

        {lastCheck && (
          <div className="text-sm text-[#715A5A]">
            Last checked: {lastCheck.toLocaleString('en-IN')}
          </div>
        )}
      </div>

      {/* Stats */}
      {stats.checked > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#715A5A]">Orders Checked</p>
                <p className="text-2xl font-bold text-[#37353E]">{stats.checked}</p>
              </div>
              <ClockIcon className="h-8 w-8 text-[#44444E]" />
            </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#715A5A]">Notifications Sent</p>
                <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-xl p-6 shadow-sm border border-[#D3DAD9]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#715A5A]">Failed</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <XCircleIcon className="h-8 w-8 text-red-600" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Notification History */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-[#D3DAD9] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#D3DAD9]">
            <h2 className="text-xl font-semibold text-[#37353E]">Recent Notifications</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#D3DAD9]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase">Expiry Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#37353E] uppercase">Sent At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D3DAD9]">
                {notifications.map((notification, index) => (
                  <tr key={index} className="hover:bg-[#D3DAD9]/20">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#37353E] font-medium">
                      {notification.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#37353E]">
                      <div className="flex items-center space-x-2">
                        <EnvelopeIcon className="h-4 w-4 text-[#715A5A]" />
                        <span>{notification.customerEmail}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#37353E]">
                      {notification.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#37353E]">
                      {new Date(notification.expiryTime).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        notification.status === 'sent'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {notification.status === 'sent' ? '✓ Sent' : '✗ Failed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#715A5A]">
                      {new Date(notification.sentAt).toLocaleTimeString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <BellIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">How It Works</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• The scheduler checks for rentals expiring in 5-10 minutes</li>
              <li>• Customers receive an email notification with order details</li>
              <li>• Only orders with status "PICKED_UP" are checked</li>
              <li>• Notifications are sent once per check cycle</li>
              <li>• You can manually trigger checks anytime using "Check Now"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
