/**
 * Settings Utility
 * 
 * Centralized utility for fetching and using system settings
 * throughout the application
 */

import { prisma } from './prisma';

export interface SystemSettingsMap {
  // General Settings
  site_name: string;
  site_description: string;
  maintenance_mode: boolean;
  allow_registration: boolean;
  invoice_prefix: string;
  currency: string;
  
  // Company Details
  company_name: string;
  company_address: string;
  company_gstin: string;
  company_phone: string;
  company_email: string;
  
  // Payment & Fees
  platform_fee: number;
  gst_percentage: number;
  payment_gateway: string;
  auto_payouts: boolean;
  minimum_payout: number;
  security_deposit_percentage: number;
  late_fee_rate: number;
  late_fee_grace_period_hours: number;
  
  // Security
  two_factor_auth: boolean;
  session_timeout: number;
  password_min_length: number;
  require_strong_password: boolean;
  
  // Notifications
  email_notifications: boolean;
  sms_notifications: boolean;
  admin_alerts: boolean;
}

// Cache for settings (in-memory cache with TTL)
let settingsCache: { data: SystemSettingsMap | null; timestamp: number } = {
  data: null,
  timestamp: 0,
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get all system settings
 */
export async function getSystemSettings(): Promise<SystemSettingsMap> {
  // Check cache
  const now = Date.now();
  if (settingsCache.data && (now - settingsCache.timestamp) < CACHE_TTL) {
    return settingsCache.data;
  }

  // Fetch from database
  const settings = await prisma.systemSettings.findMany();
  
  // Convert to map with proper types
  const settingsMap: any = {};
  
  settings.forEach((setting) => {
    const value = setting.value;
    
    // Parse boolean values
    if (value === 'true' || value === 'false') {
      settingsMap[setting.key] = value === 'true';
    }
    // Parse numeric values
    else if (!isNaN(Number(value)) && value !== '') {
      settingsMap[setting.key] = Number(value);
    }
    // Keep as string
    else {
      settingsMap[setting.key] = value;
    }
  });
  
  // Set defaults for missing values
  const defaults: SystemSettingsMap = {
    site_name: 'RentMarket Platform',
    site_description: 'Your trusted marketplace for renting everything you need',
    maintenance_mode: false,
    allow_registration: true,
    invoice_prefix: 'INV',
    currency: 'INR',
    
    company_name: 'RentMarket Platform',
    company_address: '123 Platform Street, Tech City, CA 94000',
    company_gstin: '29PLATFORM1234F1Z5',
    company_phone: '+1-800-RENTALS',
    company_email: 'support@rentmarket.com',
    
    platform_fee: 5,
    gst_percentage: 18,
    payment_gateway: 'razorpay',
    auto_payouts: true,
    minimum_payout: 500,
    security_deposit_percentage: 20,
    late_fee_rate: 0.1,
    late_fee_grace_period_hours: 24,
    
    two_factor_auth: false,
    session_timeout: 30,
    password_min_length: 8,
    require_strong_password: true,
    
    email_notifications: true,
    sms_notifications: false,
    admin_alerts: true,
  };
  
  const result = { ...defaults, ...settingsMap };
  
  // Update cache
  settingsCache = {
    data: result,
    timestamp: now,
  };
  
  return result;
}

/**
 * Get a specific setting value
 */
export async function getSetting<K extends keyof SystemSettingsMap>(
  key: K
): Promise<SystemSettingsMap[K]> {
  const settings = await getSystemSettings();
  return settings[key];
}

/**
 * Get rental periods
 */
export async function getRentalPeriods() {
  return await prisma.rentalPeriodConfig.findMany({
    orderBy: { duration: 'asc' },
  });
}

/**
 * Calculate platform fee
 */
export async function calculatePlatformFee(amount: number): Promise<number> {
  const feePercentage = await getSetting('platform_fee');
  return (amount * feePercentage) / 100;
}

/**
 * Calculate GST/Tax
 */
export async function calculateGST(amount: number): Promise<number> {
  const gstPercentage = await getSetting('gst_percentage');
  return (amount * gstPercentage) / 100;
}

/**
 * Calculate security deposit
 */
export async function calculateSecurityDeposit(amount: number): Promise<number> {
  const depositPercentage = await getSetting('security_deposit_percentage');
  return (amount * depositPercentage) / 100;
}

/**
 * Calculate late fee
 */
export async function calculateLateFee(
  orderAmount: number,
  daysLate: number
): Promise<number> {
  const lateFeeRate = await getSetting('late_fee_rate');
  const gracePeriodHours = await getSetting('late_fee_grace_period_hours');
  
  // Convert grace period to days
  const gracePeriodDays = gracePeriodHours / 24;
  
  // Only charge if beyond grace period
  if (daysLate <= gracePeriodDays) {
    return 0;
  }
  
  const chargeableDays = daysLate - gracePeriodDays;
  return orderAmount * lateFeeRate * chargeableDays;
}

/**
 * Get company info for invoices
 */
export async function getCompanyInfo() {
  const settings = await getSystemSettings();
  
  return {
    name: settings.company_name,
    address: settings.company_address,
    phone: settings.company_phone,
    email: settings.company_email,
    gstin: settings.company_gstin,
    website: 'www.rentmarket.com', // Could be added to settings
  };
}

/**
 * Clear settings cache (useful after updates)
 */
export function clearSettingsCache() {
  settingsCache = {
    data: null,
    timestamp: 0,
  };
}

/**
 * Format currency based on system settings
 */
export async function formatCurrency(amount: number): Promise<string> {
  const currency = await getSetting('currency');
  
  const symbols: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };
  
  const symbol = symbols[currency] || currency;
  
  return `${symbol} ${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Get GST breakdown (CGST + SGST)
 */
export async function getGSTBreakdown(amount: number): Promise<{
  cgst: number;
  sgst: number;
  total: number;
}> {
  const total = await calculateGST(amount);
  const cgst = total / 2;
  const sgst = total / 2;
  
  return { cgst, sgst, total };
}
