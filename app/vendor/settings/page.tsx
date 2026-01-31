"use client";

import React, { useState, useEffect } from "react";
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
import { api } from "@/app/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";

// Types for user data
interface VendorSettings {
  profile: {
    businessName: string;
    ownerName: string;
    email: string;
    phone: string;
    address: string;
    description: string;
    website: string;
    gstin: string;
  };
  business: {
    businessType: string;
    taxId: string;
    licenseNumber: string;
    operatingHours: {
      [key: string]: { open: string; close: string; closed: boolean };
    };
  };
  payment: {
    bankAccount: {
      accountHolder: string;
      bankName: string;
      accountNumber: string;
      routingNumber: string;
    };
    upi: {
      upiId: string;
      verified: boolean;
    };
  };
  notifications: {
    emailNotifications: {
      newOrders: boolean;
      orderUpdates: boolean;
      paymentReceived: boolean;
      customerMessages: boolean;
      marketingEmails: boolean;
    };
    smsNotifications: {
      urgentOrders: boolean;
      paymentIssues: boolean;
      systemAlerts: boolean;
    };
  };
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
    loginSessions: number;
  };
}

const defaultSettings: VendorSettings = {
  profile: {
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    website: "",
    gstin: ""
  },
  business: {
    businessType: "LLC",
    taxId: "",
    licenseNumber: "",
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
      accountHolder: "",
      bankName: "",
      accountNumber: "",
      routingNumber: ""
    },
    upi: {
      upiId: "",
      verified: false
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
    twoFactorEnabled: false,
    lastPasswordChange: new Date().toISOString(),
    loginSessions: 1
  }
};

export default function VendorSettings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [settings, setSettings] = useState<VendorSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  // Load settings from user profile
  useEffect(() => {
    if (user) {
      const vendorProfile = user.vendorProfile;
      setSettings(prev => ({
        ...prev,
        profile: {
          businessName: vendorProfile?.companyName || '',
          ownerName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          email: user.email || '',
          phone: vendorProfile?.phone || '',
          address: vendorProfile?.address || '',
          description: vendorProfile?.description || '',
          website: vendorProfile?.website || '',
          gstin: vendorProfile?.gstin || ''
        },
        business: {
          ...prev.business,
          taxId: vendorProfile?.gstin || ''
        }
      }));
      if (vendorProfile?.logoUrl) {
        setLogoUrl(vendorProfile.logoUrl);
      }
      setLoading(false);
    }
  }, [user]);

  // Handle logo file selection
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpeg|jpg|gif|webp)$/)) {
      alert('Please select a valid image file (PNG, JPG, GIF, or WebP)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setLogoPreview(base64);

      setUploadingLogo(true);
      try {
        const response = await api.post<{ success: boolean; logoUrl: string; error?: string }>('/vendor/logo', {
          image: base64,
          filename: file.name
        });

        if (response.success) {
          setLogoUrl(response.logoUrl);
          setLogoPreview(null);
          alert('Logo uploaded! It will appear as watermark in invoices.');
        } else {
          alert(response.error || 'Failed to upload logo');
          setLogoPreview(null);
        }
      } catch (error: any) {
        alert(error.message || 'Failed to upload logo');
        setLogoPreview(null);
      } finally {
        setUploadingLogo(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update vendor profile
      await api.patch('/users/me', {
        firstName: settings.profile.ownerName.split(' ')[0],
        lastName: settings.profile.ownerName.split(' ').slice(1).join(' ')
      });

      // Update vendor profile data
      await api.patch('/vendor/profile', {
        companyName: settings.profile.businessName,
        phone: settings.profile.phone,
        address: settings.profile.address,
        description: settings.profile.description,
        website: settings.profile.website,
        gstin: settings.profile.gstin
      });

      alert("Settings saved successfully!");
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (section: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as Record<string, any>),
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleNestedInputChange = (section: string, subsection: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as Record<string, any>),
        [subsection]: {
          ...((prev[section as keyof typeof prev] as Record<string, any>)[subsection] as Record<string, any>),
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

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">Settings</h1>
            <p className="mt-2 text-secondary-600">Manage your account and business preferences</p>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-64">
            <div className="bg-white rounded-xl shadow-lg p-4 animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded-lg mb-2"></div>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-lg p-8 animate-pulse">
              <div className="w-48 h-8 bg-gray-200 rounded mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            disabled={saving}
            className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg transform hover:scale-105 bg-gradient-to-r from-primary-600 to-primary-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
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
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id
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
                  <div className="w-24 h-24 rounded-full flex items-center justify-center bg-secondary-200 overflow-hidden border-2 border-secondary-300">
                    {logoPreview || logoUrl ? (
                      <img
                        src={logoPreview || logoUrl || ''}
                        alt="Business logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-12 w-12 text-secondary-500" />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLogoChange}
                      accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingLogo}
                      className="inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-90 bg-primary-100 text-primary-600 disabled:opacity-50"
                    >
                      <CameraIcon className="h-5 w-5 mr-2" />
                      {uploadingLogo ? 'Uploading...' : 'Change Logo'}
                    </button>
                    <p className="text-sm mt-2 text-secondary-600">
                      JPG, PNG, GIF or WebP. Max 2MB. Used as invoice watermark.
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
                        disabled
                        className="w-full pl-10 pr-4 py-3 border-2 border-secondary-200 rounded-lg bg-gray-50 text-secondary-600"
                      />
                    </div>
                    <p className="text-xs text-secondary-500 mt-1">Email cannot be changed</p>
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

                  <div>
                    <label className="block text-sm font-medium mb-2 text-secondary-900">
                      GSTIN
                    </label>
                    <input
                      type="text"
                      value={settings.profile.gstin}
                      onChange={(e) => handleInputChange("profile", "gstin", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900"
                    />
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
                      <option value="Private Limited">Private Limited</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-secondary-900">
                      Tax ID / GSTIN
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
                        <label className="block text-sm font-medium mb-2 text-secondary-900">
                          Account Holder Name
                        </label>
                        <input
                          type="text"
                          value={settings.payment.bankAccount.accountHolder}
                          onChange={(e) => handleNestedInputChange("payment", "bankAccount", "accountHolder", e.target.value)}
                          className="w-full px-4 py-3 border-2 border-secondary-200 rounded-lg focus:outline-none text-secondary-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-secondary-900">
                          Bank Name
                        </label>
                        <input
                          type="text"
                          value={settings.payment.bankAccount.bankName}
                          onChange={(e) => handleNestedInputChange("payment", "bankAccount", "bankName", e.target.value)}
                          className="w-full px-4 py-3 border-2 border-secondary-200 rounded-lg focus:outline-none text-secondary-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-secondary-900">
                          Account Number
                        </label>
                        <input
                          type="text"
                          value={settings.payment.bankAccount.accountNumber}
                          onChange={(e) => handleNestedInputChange("payment", "bankAccount", "accountNumber", e.target.value)}
                          className="w-full px-4 py-3 border-2 border-secondary-200 rounded-lg focus:outline-none text-secondary-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-secondary-900">
                          IFSC Code
                        </label>
                        <input
                          type="text"
                          value={settings.payment.bankAccount.routingNumber}
                          onChange={(e) => handleNestedInputChange("payment", "bankAccount", "routingNumber", e.target.value)}
                          className="w-full px-4 py-3 border-2 border-secondary-200 rounded-lg focus:outline-none text-secondary-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* UPI */}
                  <div className="p-6 rounded-lg border-2 border-secondary-200">
                    <h3 className="text-lg font-semibold mb-4 flex items-center text-secondary-900">
                      <EnvelopeIcon className="h-5 w-5 mr-2" />
                      UPI Account
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={settings.payment.upi.upiId}
                          onChange={(e) => handleNestedInputChange("payment", "upi", "upiId", e.target.value)}
                          placeholder="yourname@upi"
                          className="w-full px-4 py-3 border-2 border-secondary-200 rounded-lg focus:outline-none text-secondary-900"
                        />
                      </div>
                      <div className="ml-4">
                        {settings.payment.upi.verified ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            ✓ Verified
                          </span>
                        ) : (
                          <button className="px-4 py-2 rounded-lg font-medium bg-primary-100 text-primary-600">
                            Verify
                          </button>
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
                <h2 className="text-2xl font-bold text-secondary-900">
                  Notification Preferences
                </h2>

                <div className="space-y-8">
                  {/* Email Notifications */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center text-secondary-900">
                      <EnvelopeIcon className="h-5 w-5 mr-2" />
                      Email Notifications
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(settings.notifications.emailNotifications).map(([key, value]) => (
                        <label key={key} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
                          <div>
                            <span className="font-medium text-secondary-900">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </span>
                          </div>
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => handleNestedInputChange("notifications", "emailNotifications", key, e.target.checked)}
                            className="h-5 w-5 rounded accent-primary-600"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* SMS Notifications */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center text-secondary-900">
                      <DevicePhoneMobileIcon className="h-5 w-5 mr-2" />
                      SMS Notifications
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(settings.notifications.smsNotifications).map(([key, value]) => (
                        <label key={key} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
                          <div>
                            <span className="font-medium text-secondary-900">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </span>
                          </div>
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => handleNestedInputChange("notifications", "smsNotifications", key, e.target.checked)}
                            className="h-5 w-5 rounded accent-primary-600"
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
                <h2 className="text-2xl font-bold text-secondary-900">
                  Security Settings
                </h2>

                <div className="space-y-6">
                  {/* Password */}
                  <div className="p-6 rounded-lg border-2 border-secondary-200">
                    <h3 className="text-lg font-semibold mb-4 text-secondary-900">
                      Password
                    </h3>
                    <p className="text-sm mb-4 text-secondary-600">
                      Last changed: {new Date(settings.security.lastPasswordChange).toLocaleDateString()}
                    </p>
                    <button className="px-6 py-3 rounded-lg font-semibold transition-colors hover:opacity-90 bg-primary-600 text-white">
                      Change Password
                    </button>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="p-6 rounded-lg border-2 border-secondary-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-secondary-900">
                          Two-Factor Authentication
                        </h3>
                        <p className="text-sm text-secondary-600">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.security.twoFactorEnabled}
                          onChange={(e) => handleInputChange("security", "twoFactorEnabled", e.target.checked)}
                          className="h-5 w-5 rounded accent-primary-600"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Active Sessions */}
                  <div className="p-6 rounded-lg border-2 border-secondary-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-secondary-900">
                          Active Sessions
                        </h3>
                        <p className="text-sm text-secondary-600">
                          You have {settings.security.loginSessions} active login sessions
                        </p>
                      </div>
                      <button className="px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-90 bg-red-100 text-red-600">
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