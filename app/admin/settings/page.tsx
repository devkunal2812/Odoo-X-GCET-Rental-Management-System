"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  UserIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

const settingSections = [
  {
    id: 'general',
    name: 'General Settings',
    icon: CogIcon,
    description: 'Basic platform configuration'
  },
  {
    id: 'notifications',
    name: 'Notifications',
    icon: BellIcon,
    description: 'Email and system notifications'
  },
  {
    id: 'security',
    name: 'Security',
    icon: ShieldCheckIcon,
    description: 'Security and authentication settings'
  },
  {
    id: 'payments',
    name: 'Payment Settings',
    icon: CurrencyDollarIcon,
    description: 'Payment gateways and fees'
  },
  {
    id: 'email',
    name: 'Email Templates',
    icon: EnvelopeIcon,
    description: 'Customize email templates'
  },
  {
    id: 'localization',
    name: 'Localization',
    icon: GlobeAltIcon,
    description: 'Language and regional settings'
  }
];

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'RentMarket',
    siteDescription: 'Your trusted marketplace for renting everything you need',
    maintenanceMode: false,
    allowRegistration: true,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    adminAlerts: true,
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordMinLength: 8,
    requireStrongPassword: true,
    
    // Payment Settings
    commissionRate: 5,
    paymentGateway: 'stripe',
    autoPayouts: true,
    minimumPayout: 50,
    
    // Email Settings
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    
    // Localization
    defaultLanguage: 'en',
    defaultCurrency: 'USD',
    timezone: 'UTC'
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    // Save settings logic here
    alert('Settings saved successfully!');
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-[#715A5A] mb-2">Site Name</label>
        <input
          type="text"
          value={settings.siteName}
          onChange={(e) => handleSettingChange('siteName', e.target.value)}
          className="w-full px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#715A5A] mb-2">Site Description</label>
        <textarea
          value={settings.siteDescription}
          onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent"
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
            checked={settings.maintenanceMode}
            onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
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
            checked={settings.allowRegistration}
            onChange={(e) => handleSettingChange('allowRegistration', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#44444E]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#37353E]"></div>
        </label>
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
            checked={settings.emailNotifications}
            onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
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
            checked={settings.smsNotifications}
            onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#44444E]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#37353E]"></div>
        </label>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-[#715A5A]">Push Notifications</label>
          <p className="text-xs text-[#715A5A]">Send push notifications to mobile apps</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.pushNotifications}
            onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
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
            checked={settings.adminAlerts}
            onChange={(e) => handleSettingChange('adminAlerts', e.target.checked)}
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
            checked={settings.twoFactorAuth}
            onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#44444E]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#37353E]"></div>
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#715A5A] mb-2">Session Timeout (minutes)</label>
        <input
          type="number"
          value={settings.sessionTimeout}
          onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#715A5A] mb-2">Minimum Password Length</label>
        <input
          type="number"
          value={settings.passwordMinLength}
          onChange={(e) => handleSettingChange('passwordMinLength', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent"
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
            checked={settings.requireStrongPassword}
            onChange={(e) => handleSettingChange('requireStrongPassword', e.target.checked)}
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
        <label className="block text-sm font-medium text-[#715A5A] mb-2">Commission Rate (%)</label>
        <input
          type="number"
          value={settings.commissionRate}
          onChange={(e) => handleSettingChange('commissionRate', parseFloat(e.target.value))}
          step="0.1"
          className="w-full px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#715A5A] mb-2">Payment Gateway</label>
        <select
          value={settings.paymentGateway}
          onChange={(e) => handleSettingChange('paymentGateway', e.target.value)}
          className="w-full px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent"
        >
          <option value="stripe">Stripe</option>
          <option value="paypal">PayPal</option>
          <option value="square">Square</option>
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
            checked={settings.autoPayouts}
            onChange={(e) => handleSettingChange('autoPayouts', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#44444E]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#37353E]"></div>
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#715A5A] mb-2">Minimum Payout Amount ($)</label>
        <input
          type="number"
          value={settings.minimumPayout}
          onChange={(e) => handleSettingChange('minimumPayout', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-[#D3DAD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44444E] focus:border-transparent"
        />
      </div>
    </div>
  );

  const renderCurrentSection = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      case 'payments':
        return renderPaymentSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#37353E] mb-2">Settings</h1>
        <p className="text-[#715A5A]">Configure platform settings and preferences</p>
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
                <button className="px-4 py-2 text-[#715A5A] hover:text-[#37353E] transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="px-6 py-2 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}