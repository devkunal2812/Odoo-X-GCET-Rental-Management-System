// Late fee calculation utilities
import { calculateLateFee as calculateLateFeeFromSettings, getSetting } from "./settings";

/**
 * Calculate late fee based on return delay
 * 
 * Logic:
 * 1. Get late fee configuration from settings
 * 2. Calculate extra days/hours beyond grace period
 * 3. Apply rate per day
 * 
 * @param plannedEndDate - Original planned return date
 * @param actualReturnDate - Actual return date
 * @param orderAmount - Original order amount (for percentage-based fees)
 * @returns Late fee amount
 */
export async function calculateLateFee(
  plannedEndDate: Date,
  actualReturnDate: Date,
  orderAmount: number
): Promise<number> {
  // Calculate delay in milliseconds
  const delayMs = actualReturnDate.getTime() - plannedEndDate.getTime();
  
  if (delayMs <= 0) {
    return 0; // No delay, no fee
  }

  // Get grace period from settings
  const gracePeriodHours = await getSetting('late_fee_grace_period_hours');
  const gracePeriodMs = gracePeriodHours * 60 * 60 * 1000;

  // Check if within grace period
  if (delayMs <= gracePeriodMs) {
    return 0; // Within grace period, no fee
  }

  // Calculate chargeable delay (beyond grace period)
  const chargeableDelayMs = delayMs - gracePeriodMs;
  const chargeableDelayDays = chargeableDelayMs / (1000 * 60 * 60 * 24);

  // Use the settings utility to calculate late fee
  const lateFee = await calculateLateFeeFromSettings(orderAmount, chargeableDelayDays);

  return Math.round(lateFee * 100) / 100; // Round to 2 decimals
}

/**
 * Get late fee configuration
 */
export async function getLateFeeConfig() {
  const rate = await getSetting('late_fee_rate');
  const gracePeriodHours = await getSetting('late_fee_grace_period_hours');

  return {
    rate,
    gracePeriodHours,
  };
}
