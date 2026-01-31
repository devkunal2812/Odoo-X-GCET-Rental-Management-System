// Late fee calculation utilities
import { prisma } from "./prisma";

/**
 * Calculate late fee based on return delay
 * 
 * Logic:
 * 1. Get late fee configuration from settings
 * 2. Calculate extra days/hours
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

  // Convert to days (rounded up)
  const delayDays = Math.ceil(delayMs / (1000 * 60 * 60 * 24));

  // Get late fee rate from settings (default: 10% of daily rate per day)
  const lateFeeSettings = await prisma.systemSettings.findUnique({
    where: { key: "late_fee_rate" },
  });

  const lateFeeRate = lateFeeSettings 
    ? parseFloat(lateFeeSettings.value) 
    : 0.1; // Default 10% per day

  // Calculate late fee
  const dailyRate = orderAmount / 7; // Assume weekly rental, adjust as needed
  const lateFee = dailyRate * lateFeeRate * delayDays;

  return Math.round(lateFee * 100) / 100; // Round to 2 decimals
}

/**
 * Get late fee configuration
 */
export async function getLateFeeConfig() {
  const settings = await prisma.systemSettings.findMany({
    where: {
      key: {
        in: ["late_fee_rate", "late_fee_grace_period_hours"],
      },
    },
  });

  const config: any = {
    rate: 0.1, // 10% per day default
    gracePeriodHours: 0,
  };

  settings.forEach((setting: any) => {
    if (setting.key === "late_fee_rate") {
      config.rate = parseFloat(setting.value);
    } else if (setting.key === "late_fee_grace_period_hours") {
      config.gracePeriodHours = parseInt(setting.value);
    }
  });

  return config;
}
