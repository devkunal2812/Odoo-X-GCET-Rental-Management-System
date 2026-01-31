"use client";

import React, { useState } from "react";
import {
  UserIcon,
  BuildingStorefrontIcon,
  CreditCardIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  MapPinIcon,
  CameraIcon
} from "@heroicons/react/24/outline";

// Mock data
const mockSettings = {
  profile: {
    businessName: "TechRent Pro",
    ownerName: "John Smith",
    email: "john@techrentpro.com",
    phone: "+1 (555) 123-4567",
    address: "123 Business Ave, City, State 12345",
    description: "Professional equipment rental service specializing in cameras, audio equipment, and tech gear.",
    website: "https://techrentpro.com",
    logo: "/api/placeholder/100/100"
  },
  business: {
    businessType: "LLC",
    taxId: "12-3456789",
    licenseNumber: "BL-2024-001",
    operatingHours: {
      monday: { open: "09:00", close: "18:00", closed: false },
      tuesday: { open: "09:00", close: "18:00", closed: false },
      wednesday: { open: "09:00", close: "18:00", closed: false },
      thursday: { open: "09:00", close: "18:00", closed: false },
      friday: { open: "09:00", close: "18:00", closed: false },
      saturday: { open: "10:00", close: "16:00", closed: false },
      sunday: { open: "", close: "", closed: true }
    }
  },
  payment: {
    bankAccount: {
      accountHolder: "TechRent Pro LLC",
      bankName: "First National Bank",
      accountNumber: "****1234",
      routingNumber: "****5678"
    },
    paypal: {
      email: "payments@techrentpro.com",
      verified: true
    }
  },
  notifications: {
    emailNotifications: {
      newOrders: true,
      orderUpdates: true,
      paymentReceived: true,
      customerMessages: true,
      marketingEmails: false
    },
    smsNotifications: {
      urgentOrders: true,
      paymentIssues: true,
      systemAlerts: true
    }
  },
  security: {
    twoFactorEnabled: true,
    lastPasswordChange: "2024-01-15",
    loginSessions: 3
  }
};

export default function VendorSettings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [settings, setSettings] = useState(mockSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = () => {
    // In a real app, this would save to the backend
    console.log("Saving settings:", settings);
    alert("Settings saved successfully!");
    setHasChanges(false);
  };

  const handleInputChange = (section: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleNestedInputChange = (section: string, subsection: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [subsection]: {
          ...(prev[section as keyof typeof prev] as any)[subsection],
          [field]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const tabs = [
    { id: "profile", name: "Profile", icon: UserIcon },
    { id: "business", name: "Business", icon: BuildingStorefrontIcon },
    { id: "payment", name: "Payment", icon: CreditCardIcon },
    { id: "notifications", name: "Notifications", icon: BellIcon },
    { id: "security", name: "Security", icon: ShieldCheckIcon }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">
            Settings
          </h1>
          <p className="mt-2 text-secondary-600">
            Manage your account and business preferences
          </p>
        </div>
        {hasChanges && (
          <button
            onClick={handleSave}
            className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg transform hover:scale-105 bg-gradient-to-r from-primary-600 to-primary-700"
          >
            Save Changes
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-64">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <nav className="space-y-1 p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-600 text-white'
                        : 'text-secondary-600 hover:bg-secondary-100'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-secondary-900">
                  Profile Information
                </h2>

                {/* Logo Upload */}
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center bg-secondary-600">
                    <UserIcon className="h-12 w-12 text-white" />
                  </div>
                  <div>
                    <button className="inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-90 bg-primary-100 text-primary-600">
                      <CameraIcon className="h-5 w-5 mr-2" />
                      Change Logo
                    </button>
                    <p className="text-sm mt-2 text-secondary-600">
                      JPG, PNG or GIF. Max size 2MB.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-secondary-900">
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={settings.profile.businessName}
                      onChange={(e) => handleInputChange("profile", "businessName", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-secondary-900">
                      Owner Name
                    </label>
                    <input
                      type="text"
                      value={settings.profile.ownerName}
                      onChange={(e) => handleInputChange("profile", "ownerName", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-secondary-900">
                      Email Address
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-500" />
                      <input
                        type="email"
                        value={settings.profile.email}
                        onChange={(e) => handleInputChange("profile", "email", e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-secondary-900">
                      Phone Number
                    </label>
                    <div className="relative">
                      <DevicePhoneMobileIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-500" />
                      <input
                        type="tel"
                        value={settings.profile.phone}
                        onChange={(e) => handleInputChange("profile", "phone", e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-secondary-900">
                    Business Address
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-secondary-500" />
                    <textarea
                      value={settings.profile.address}
                      onChange={(e) => handleInputChange("profile", "address", e.target.value)}
                      rows={3}
                      className="w-full pl-10 pr-4 py-3 border-2 border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-secondary-900">
                    Website
                  </label>
                  <div className="relative">
                    <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-500" />
                    <input
                      type="url"
                      value={settings.profile.website}
                      onChange={(e) => handleInputChange("profile", "website", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-secondary-900">
                    Business Description
                  </label>
                  <textarea
                    value={settings.profile.description}
                    onChange={(e) => handleInputChange("profile", "description", e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900"
                    placeholder="Describe your business and services..."
                  />
                </div>
              </div>
            )}

            {/* Business Tab */}
            {activeTab === "business" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-secondary-900">
                  Business Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-secondary-900">
                      Business Type
                    </label>
                    <select
                      value={settings.business.businessType}
                      onChange={(e) => handleInputChange("business", "businessType", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900"
                    >
                      <option value="LLC">LLC</option>
                      <option value="Corporation">Corporation</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Sole Proprietorship">Sole Proprietorship</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-secondary-900">
                      Tax ID / EIN
                    </label>
                    <input
                      type="text"
                      value={settings.business.taxId}
                      onChange={(e) => handleInputChange("business", "taxId", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-secondary-900">
                      Business License Number
                    </label>
                    <input
                      type="text"
                      value={settings.business.licenseNumber}
                      onChange={(e) => handleInputChange("business", "licenseNumber", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 text-secondary-900">
                    Operating Hours
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(settings.business.operatingHours).map(([day, hours]) => (
                      <div key={day} className="flex items-center space-x-4">
                        <div className="w-24">
                          <span className="text-sm font-medium capitalize text-secondary-900">
                            {day}
                          </span>
                        </div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={!hours.closed}
                            onChange={(e) => handleNestedInputChange("business", "operatingHours", day, {
                              ...hours,
                              closed: !e.target.checked
                            })}
                            className="mr-2 accent-primary-600"
                          />
                          <span className="text-sm text-secondary-600">Open</span>
                        </label>
                        {!hours.closed && (
                          <>
                            <input
                              type="time"
                              value={hours.open}
                              onChange={(e) => handleNestedInputChange("business", "operatingHours", day, {
                                ...hours,
                                open: e.target.value
                              })}
                              className="px-3 py-2 border-2 border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900"
                            />
                            <span className="text-secondary-600">to</span>
                            <input
                              type="time"
                              value={hours.close}
                              onChange={(e) => handleNestedInputChange("business", "operatingHours", day, {
                                ...hours,
                                close: e.target.value
                              })}
                              className="px-3 py-2 border-2 border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900"
                            />
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Payment Tab */}
            {activeTab === "payment" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-secondary-900">
                  Payment Methods
                </h2>

                <div className="space-y-8">
                  {/* Bank Account */}
                  <div className="p-6 rounded-lg border-2 border-secondary-200">
                    <h3 className="text-lg font-semibold mb-4 flex items-center text-secondary-900">
                      <CreditCardIcon className="h-5 w-5 mr-2" />
                      Bank Account
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--dark-charcoal)" }}>
                          Account Holder Name
                        </label>
                        <input
                          type="text"
                          value={settings.payment.bankAccount.accountHolder}
                          onChange={(e) => handleNestedInputChange("payment", "bankAccount", "accountHolder", e.target.value)}
                          className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                          style={{ 
                            borderColor: "var(--light-sage)",
                            color: "var(--dark-charcoal)"
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--dark-charcoal)" }}>
                          Bank Name
                        </label>
                        <input
                          type="text"
                          value={settings.payment.bankAccount.bankName}
                          onChange={(e) => handleNestedInputChange("payment", "bankAccount", "bankName", e.target.value)}
                          className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                          style={{ 
                            borderColor: "var(--light-sage)",
                            color: "var(--dark-charcoal)"
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--dark-charcoal)" }}>
                          Account Number
                        </label>
                        <input
                          type="text"
                          value={settings.payment.bankAccount.accountNumber}
                          className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                          style={{ 
                            borderColor: "var(--light-sage)",
                            color: "var(--dark-charcoal)"
                          }}
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--dark-charcoal)" }}>
                          Routing Number
                        </label>
                        <input
                          type="text"
                          value={settings.payment.bankAccount.routingNumber}
                          className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                          style={{ 
                            borderColor: "var(--light-sage)",
                            color: "var(--dark-charcoal)"
                          }}
                          disabled
                        />
                      </div>
                    </div>
                  </div>

                  {/* PayPal */}
                  <div className="p-6 rounded-lg border-2" style={{ borderColor: "var(--light-sage)" }}>
                    <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: "var(--dark-charcoal)" }}>
                      <EnvelopeIcon className="h-5 w-5 mr-2" />
                      PayPal Account
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <input
                          type="email"
                          value={settings.payment.paypal.email}
                          onChange={(e) => handleNestedInputChange("payment", "paypal", "email", e.target.value)}
                          className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                          style={{ 
                            borderColor: "var(--light-sage)",
                            color: "var(--dark-charcoal)"
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        {settings.payment.paypal.verified ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            ✓ Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold" style={{ color: "var(--dark-charcoal)" }}>
                  Notification Preferences
                </h2>

                <div className="space-y-8">
                  {/* Email Notifications */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: "var(--dark-charcoal)" }}>
                      <EnvelopeIcon className="h-5 w-5 mr-2" />
                      Email Notifications
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(settings.notifications.emailNotifications).map(([key, value]) => (
                        <label key={key} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
                          <div>
                            <span className="font-medium" style={{ color: "var(--dark-charcoal)" }}>
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </span>
                          </div>
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => handleNestedInputChange("notifications", "emailNotifications", key, e.target.checked)}
                            className="h-5 w-5 rounded"
                            style={{ accentColor: "var(--medium-gray)" }}
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* SMS Notifications */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: "var(--dark-charcoal)" }}>
                      <DevicePhoneMobileIcon className="h-5 w-5 mr-2" />
                      SMS Notifications
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(settings.notifications.smsNotifications).map(([key, value]) => (
                        <label key={key} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
                          <div>
                            <span className="font-medium" style={{ color: "var(--dark-charcoal)" }}>
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </span>
                          </div>
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => handleNestedInputChange("notifications", "smsNotifications", key, e.target.checked)}
                            className="h-5 w-5 rounded"
                            style={{ accentColor: "var(--medium-gray)" }}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold" style={{ color: "var(--dark-charcoal)" }}>
                  Security Settings
                </h2>

                <div className="space-y-6">
                  {/* Password */}
                  <div className="p-6 rounded-lg border-2" style={{ borderColor: "var(--light-sage)" }}>
                    <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--dark-charcoal)" }}>
                      Password
                    </h3>
                    <p className="text-sm mb-4" style={{ color: "var(--warm-brown)" }}>
                      Last changed: {new Date(settings.security.lastPasswordChange).toLocaleDateString()}
                    </p>
                    <button className="px-6 py-3 rounded-lg font-semibold transition-colors hover:opacity-90"
                            style={{ backgroundColor: "var(--medium-gray)", color: "var(--white)" }}>
                      Change Password
                    </button>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="p-6 rounded-lg border-2" style={{ borderColor: "var(--light-sage)" }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold" style={{ color: "var(--dark-charcoal)" }}>
                          Two-Factor Authentication
                        </h3>
                        <p className="text-sm" style={{ color: "var(--warm-brown)" }}>
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.security.twoFactorEnabled}
                          onChange={(e) => handleInputChange("security", "twoFactorEnabled", e.target.checked)}
                          className="h-5 w-5 rounded"
                          style={{ accentColor: "var(--medium-gray)" }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Active Sessions */}
                  <div className="p-6 rounded-lg border-2" style={{ borderColor: "var(--light-sage)" }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold" style={{ color: "var(--dark-charcoal)" }}>
                          Active Sessions
                        </h3>
                        <p className="text-sm" style={{ color: "var(--warm-brown)" }}>
                          You have {settings.security.loginSessions} active login sessions
                        </p>
                      </div>
                      <button className="px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-90"
                              style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>
                        Sign Out All
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}