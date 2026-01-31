"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BuildingOfficeIcon,
  ArrowPathIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { api } from '@/app/lib/api-client';

const settingSections = [
  {
    id: 'general',
    name: 'General Settings',
    icon: CogIcon,
    description: 'Basic platform configuration'
  },
  {
    id: 'company',
    name: 'Company Details',
    icon: BuildingOfficeIcon,
    description: 'Company information for invoices'
  },
  {
    id: 'rental',
    name: 'Rental Periods',
    icon: ClockIcon,
    description: 'Configure rental period options'
  },
  {
    id: 'payments',
    name: 'Payment & Fees',
    icon: CurrencyDollarIcon,
    description: 'Payment gateways, fees, and taxes'
  },
  {
    id: 'security',
    name: 'Security',
    icon: ShieldCheckIcon,
    description: 'Security and authentication settings'
  },
  {
    id: 'notifications',
    name: 'Notifications',
    icon: BellIcon,
    description: 'Email and system notifications'
  }
];

interface RentalPeriod {
  id?: string;
  name: string;
  unit: string;
  duration: number;
}

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rentalPeriods, setRentalPeriods] = useState<RentalPeriod[]>([]);
  const [newRentalPeriod, setNewRentalPeriod] = useState<RentalPeriod>({
    name: '',
    unit: 'day',
    duration: 1
  });
  const [settings, setSettings] = useState({
    // General Settings
    site_name: 'RentERP Solutions',
    site_description: 'Your trusted marketplace for renting everything you need',
    maintenance_mode: 'false',
    allow_registration: 'true',
    
    // Company Details
    company_name: '',
    company_address: '',
    company_gstin: '',
    company_phone: '',
    company_email: '',
    
    // Payment & Fee Settings
    platform_fee: '5',
    gst_percentage: '18',
    currency: 'INR',
    payment_gateway: 'razorpay',
    auto_payouts: 'true',
    minimum_payout: '500',
    
    // Late Fee Settings
    late_fee_rate: '0.1',
    late_fee_grace_period_hours: '24',
    
    // Security Settings
    two_factor_auth: 'false',
    session_timeout: '30',
    password_min_length: '8',
    require_strong_password: 'true',
    
    // Notification Settings
    email_notifications: 'true',
    sms_notifications: 'false',
    admin_alerts: 'true',
    
    // Invoice Settings
    invoice_prefix: 'INV',
    security_deposit_percentage: '20'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get<{
        success: boolean;
        settings: Record<string, { value: string; description?: string }>;
        rentalPeriods: RentalPeriod[];
      }>('/admin/settings');

      if (response.success) {
        // Convert settings object to flat structure
        const flatSettings: any = {};
        Object.keys(response.settings).forEach(key => {
          // Parse the value - handle both string and object formats
          const settingValue = response.settings[key];
          flatSettings[key] = typeof settingValue === 'object' && settingValue.value 
            ? settingValue.value 
            : settingValue;
        });
        
        console.log('Fetched settings:', flatSettings);
        setSettings(prev => ({ ...prev, ...flatSettings }));
        setRentalPeriods(response.rentalPeriods || []);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      showNotification('Failed to fetch settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white px-6 py-3 rounded-lg shadow-lg z-50`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 3000);
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      console.log('Saving settings:', settings);
      console.log('Saving rental periods:', rentalPeriods);
      
      const response = await api.put<{
        success: boolean;
        message: string;
      }>('/admin/settings', {
        settings,
        rentalPeriods
      });

      console.log('Save response:', response);

      if (response.success) {
        showNotification(response.message || 'Settings saved successfully!', 'success');
        await fetchSettings();
      }
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      showNotification(error.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddRentalPeriod = () => {
    if (!newRentalPeriod.name || !newRentalPeriod.unit || newRentalPeriod.duration <= 0) {
      showNotification('Please fill all rental period fields', 'error');
      return;
    }
    
    setRentalPeriods([...rentalPeriods, { ...newRentalPeriod }]);
    setNewRentalPeriod({ name: '', unit: 'day', duration: 1 });
  };

  const handleDeleteRentalPeriod = (index: number) => {
    setRentalPeriods(rentalPeriods.filter((_, i) => i !== index));
  };

  const handleUpdateRentalPeriod = (index: number, field: keyof RentalPeriod, value: any) => {
    const updated = [...rentalPeriods];
    updated[index] = { ...updated[index], [field]: value };
    setRentalPeriods(updated);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-[#715A5A] mb-2">Site Name</label>
        <input
          type="text"
          value={settings.site_name}
          onChange={(e) => handleSettingChange('site_name', e.target.value)}
          className="w-full px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent text-[#37353E]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#715A5A] mb-2">Site Description</label>
        <textarea
          value={settings.site_description}
          onChange={(e) => handleSettingChange('site_description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent text-[#37353E]"
        />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-[#715A5A]">Maintenance Mode</label>
          <p className="text-xs text-[#715A5A]">Temporarily disable the site for maintenance</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.maintenance_mode === 'true'}
            onChange={(e) => handleSettingChange('maintenance_mode', e.target.checked ? 'true' : 'false')}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#44444E]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#37353E]"></div>
        </label>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-[#715A5A]">Allow User Registration</label>
          <p className="text-xs text-[#715A5A]">Allow new users to register on the platform</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.allow_registration === 'true'}
            onChange={(e) => handleSettingChange('allow_registration', e.target.checked ? 'true' : 'false')}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#44444E]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#37353E]"></div>
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#715A5A] mb-2">Invoice Prefix</label>
        <input
          type="text"
          value={settings.invoice_prefix}
          onChange={(e) => handleSettingChange('invoice_prefix', e.target.value)}
          placeholder="INV"
          className="w-full px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent text-[#37353E]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#715A5A] mb-2">Currency</label>
        <select
          value={settings.currency}
          onChange={(e) => handleSettingChange('currency', e.target.value)}
          className="w-full px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent bg-white text-[#37353E]"
        >
          <option value="INR">INR (₹)</option>
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
        </select>
      </div>
    </div>
  );

  const renderCompanySettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-[#715A5A] mb-2">Company Name</label>
        <input
          type="text"
          value={settings.company_name}
          onChange={(e) => handleSettingChange('company_name', e.target.value)}
          placeholder="Your Company Name"
          className="w-full px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent text-[#37353E]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#715A5A] mb-2">Company Address</label>
        <textarea
          value={settings.company_address}
          onChange={(e) => handleSettingChange('company_address', e.target.value)}
          rows={3}
          placeholder="Full company address"
          className="w-full px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent text-[#37353E]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#715A5A] mb-2">GSTIN</label>
        <input
          type="text"
          value={settings.company_gstin}
          onChange={(e) => handleSettingChange('company_gstin', e.target.value)}
          placeholder="29ABCDE1234F1Z5"
          className="w-full px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent text-[#37353E]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#715A5A] mb-2">Company Phone</label>
        <input
          type="tel"
          value={settings.company_phone}
          onChange={(e) => handleSettingChange('company_phone', e.target.value)}
          placeholder="+91 1234567890"
          className="w-full px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent text-[#37353E]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#715A5A] mb-2">Company Email</label>
        <input
          type="email"
          value={settings.company_email}
          onChange={(e) => handleSettingChange('company_email', e.target.value)}
          placeholder="info@company.com"
          className="w-full px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent text-[#37353E]"
        />
      </div>
    </div>
  );

  const renderRentalPeriodSettings = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          Configure rental period options that vendors can use for their products. These periods will be available when setting product pricing.
        </p>
      </div>

      {/* Existing Rental Periods */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[#37353E]">Configured Rental Periods</h3>
        {rentalPeriods.length === 0 ? (
          <p className="text-sm text-[#715A5A]">No rental periods configured yet.</p>
        ) : (
          rentalPeriods.map((period, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <input
                type="text"
                value={period.name}
                onChange={(e) => handleUpdateRentalPeriod(index, 'name', e.target.value)}
                placeholder="Name (e.g., Daily)"
                className="flex-1 px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] text-[#37353E]"
              />
              <input
                type="number"
                value={period.duration}
                onChange={(e) => handleUpdateRentalPeriod(index, 'duration', parseInt(e.target.value))}
                placeholder="Duration"
                className="w-24 px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] text-[#37353E]"
              />
              <select
                value={period.unit}
                onChange={(e) => handleUpdateRentalPeriod(index, 'unit', e.target.value)}
                className="w-32 px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] bg-white text-[#37353E]"
              >
                <option value="hour">Hour(s)</option>
                <option value="day">Day(s)</option>
                <option value="week">Week(s)</option>
                <option value="month">Month(s)</option>
              </select>
              <button
                onClick={() => handleDeleteRentalPeriod(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add New Rental Period */}
      <div className="border-t border-[#D3DAD9] pt-6">
        <h3 className="text-sm font-semibold text-[#37353E] mb-3">Add New Rental Period</h3>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newRentalPeriod.name}
            onChange={(e) => setNewRentalPeriod({ ...newRentalPeriod, name: e.target.value })}
            placeholder="Name (e.g., Weekly)"
            className="flex-1 px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] text-[#37353E]"
          />
          <input
            type="number"
            value={newRentalPeriod.duration}
            onChange={(e) => setNewRentalPeriod({ ...newRentalPeriod, duration: parseInt(e.target.value) || 1 })}
            placeholder="Duration"
            min="1"
            className="w-24 px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] text-[#37353E]"
          />
          <select
            value={newRentalPeriod.unit}
            onChange={(e) => setNewRentalPeriod({ ...newRentalPeriod, unit: e.target.value })}
            className="w-32 px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] bg-white text-[#37353E]"
          >
            <option value="hour">Hour(s)</option>
            <option value="day">Day(s)</option>
            <option value="week">Week(s)</option>
            <option value="month">Month(s)</option>
          </select>
          <button
            onClick={handleAddRentalPeriod}
            className="px-4 py-2 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-[#715A5A]">Email Notifications</label>
          <p className="text-xs text-[#715A5A]">Send email notifications to users</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.email_notifications === 'true'}
            onChange={(e) => handleSettingChange('email_notifications', e.target.checked ? 'true' : 'false')}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#44444E]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#37353E]"></div>
        </label>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-[#715A5A]">SMS Notifications</label>
          <p className="text-xs text-[#715A5A]">Send SMS notifications to users</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.sms_notifications === 'true'}
            onChange={(e) => handleSettingChange('sms_notifications', e.target.checked ? 'true' : 'false')}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#44444E]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#37353E]"></div>
        </label>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-[#715A5A]">Admin Alerts</label>
          <p className="text-xs text-[#715A5A]">Receive alerts for important admin events</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.admin_alerts === 'true'}
            onChange={(e) => handleSettingChange('admin_alerts', e.target.checked ? 'true' : 'false')}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#44444E]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#37353E]"></div>
        </label>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-[#715A5A]">Two-Factor Authentication</label>
          <p className="text-xs text-[#715A5A]">Require 2FA for admin accounts</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.two_factor_auth === 'true'}
            onChange={(e) => handleSettingChange('two_factor_auth', e.target.checked ? 'true' : 'false')}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#44444E]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#37353E]"></div>
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#715A5A] mb-2">Session Timeout (minutes)</label>
        <input
          type="number"
          value={settings.session_timeout}
          onChange={(e) => handleSettingChange('session_timeout', e.target.value)}
          className="w-full px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent text-[#37353E]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#715A5A] mb-2">Minimum Password Length</label>
        <input
          type="number"
          value={settings.password_min_length}
          onChange={(e) => handleSettingChange('password_min_length', e.target.value)}
          className="w-full px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent text-[#37353E]"
        />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-[#715A5A]">Require Strong Passwords</label>
          <p className="text-xs text-[#715A5A]">Enforce strong password requirements</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.require_strong_password === 'true'}
            onChange={(e) => handleSettingChange('require_strong_password', e.target.checked ? 'true' : 'false')}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#44444E]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#37353E]"></div>
        </label>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-[#715A5A] mb-2">Platform Fee (%)</label>
        <input
          type="number"
          value={settings.platform_fee}
          onChange={(e) => handleSettingChange('platform_fee', e.target.value)}
          step="0.1"
          className="w-full px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent text-[#37353E]"
        />
        <p className="text-xs text-[#715A5A] mt-1">Commission charged on each rental transaction</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#715A5A] mb-2">GST/Tax Rate (%)</label>
        <input
          type="number"
          value={settings.gst_percentage}
          onChange={(e) => handleSettingChange('gst_percentage', e.target.value)}
          step="0.1"
          className="w-full px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent text-[#37353E]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#715A5A] mb-2">Payment Gateway</label>
        <select
          value={settings.payment_gateway}
          onChange={(e) => handleSettingChange('payment_gateway', e.target.value)}
          className="w-full px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent text-[#37353E] bg-white"
        >
          <option value="razorpay">Razorpay</option>
          <option value="stripe">Stripe</option>
          <option value="paypal">PayPal</option>
          <option value="paytm">Paytm</option>
        </select>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-[#715A5A]">Automatic Payouts</label>
          <p className="text-xs text-[#715A5A]">Automatically process vendor payouts</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.auto_payouts === 'true'}
            onChange={(e) => handleSettingChange('auto_payouts', e.target.checked ? 'true' : 'false')}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#44444E]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#37353E]"></div>
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#715A5A] mb-2">Minimum Payout Amount (₹)</label>
        <input
          type="number"
          value={settings.minimum_payout}
          onChange={(e) => handleSettingChange('minimum_payout', e.target.value)}
          className="w-full px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent text-[#37353E]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#715A5A] mb-2">Security Deposit (%)</label>
        <input
          type="number"
          value={settings.security_deposit_percentage}
          onChange={(e) => handleSettingChange('security_deposit_percentage', e.target.value)}
          step="0.1"
          className="w-full px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent text-[#37353E]"
        />
        <p className="text-xs text-[#715A5A] mt-1">Percentage of order amount held as security deposit</p>
      </div>
      <div className="border-t border-[#D3DAD9] pt-6">
        <h3 className="text-sm font-semibold text-[#37353E] mb-4">Late Fee Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#715A5A] mb-2">Late Fee Rate (per day)</label>
            <input
              type="number"
              value={settings.late_fee_rate}
              onChange={(e) => handleSettingChange('late_fee_rate', e.target.value)}
              step="0.01"
              className="w-full px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent text-[#37353E]"
            />
            <p className="text-xs text-[#715A5A] mt-1">Decimal value (e.g., 0.1 = 10% per day)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#715A5A] mb-2">Grace Period (hours)</label>
            <input
              type="number"
              value={settings.late_fee_grace_period_hours}
              onChange={(e) => handleSettingChange('late_fee_grace_period_hours', e.target.value)}
              className="w-full px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent text-[#37353E]"
            />
            <p className="text-xs text-[#715A5A] mt-1">Hours before late fees start applying</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentSection = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#37353E]"></div>
        </div>
      );
    }

    switch (activeSection) {
      case 'general':
        return renderGeneralSettings();
      case 'company':
        return renderCompanySettings();
      case 'rental':
        return renderRentalPeriodSettings();
      case 'payments':
        return renderPaymentSettings();
      case 'security':
        return renderSecuritySettings();
      case 'notifications':
        return renderNotificationSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#37353E] mb-2">Settings</h1>
            <p className="text-[#715A5A]">Configure platform settings and preferences</p>
          </div>
          <button
            onClick={fetchSettings}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-[#D3DAD9] p-4">
            <nav className="space-y-2">
              {settingSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-[#37353E] text-white'
                      : 'text-[#715A5A] hover:bg-[#D3DAD9] hover:text-[#37353E]'
                  }`}
                >
                  <section.icon className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <p>{section.name}</p>
                    <p className="text-xs opacity-75">{section.description}</p>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border border-[#D3DAD9] p-6"
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[#37353E]">
                {settingSections.find(s => s.id === activeSection)?.name}
              </h2>
              <p className="text-sm text-[#715A5A] mt-1">
                {settingSections.find(s => s.id === activeSection)?.description}
              </p>
            </div>

            {renderCurrentSection()}

            <div className="mt-8 pt-6 border-t border-[#D3DAD9]">
              <div className="flex justify-end space-x-4">
                <button 
                  onClick={fetchSettings}
                  disabled={loading || saving}
                  className="px-4 py-2 text-[#715A5A] hover:text-[#37353E] transition-colors disabled:opacity-50"
                >
                  Reset
                </button>
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="px-6 py-2 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}