import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { z } from "zod";

/**
 * GET /api/admin/settings
 * 
 * Retrieve all system settings
 * 
 * Settings include:
 * - GST percentage
 * - Late fee rate
 * - Late fee grace period
 * - Company details (name, address, GSTIN)
 * - Security deposit percentage
 * - Default rental periods
 */
export const GET = requireRole("ADMIN")(async (request: NextRequest) => {
  try {
    const settings = await prisma.systemSettings.findMany({
      orderBy: { key: "asc" },
    });

    // Convert array to object for easier consumption
    const settingsObject: Record<string, any> = {};
    settings.forEach((setting) => {
      settingsObject[setting.key] = {
        value: setting.value,
        description: setting.description,
        updatedAt: setting.updatedAt,
      };
    });

    // Get rental period configurations
    const rentalPeriods = await prisma.rentalPeriodConfig.findMany({
      orderBy: { duration: "asc" },
    });

    return NextResponse.json({
      success: true,
      settings: settingsObject,
      rentalPeriods,
    });
  } catch (error: any) {
    console.error("Settings fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
});

const settingsUpdateSchema = z.object({
  settings: z.record(z.string(), z.any()).optional(),
  rentalPeriods: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    unit: z.string(),
    duration: z.number().int().positive(),
  })).optional(),
});

/**
 * PUT /api/admin/settings
 * 
 * Update system settings
 * 
 * Request body:
 * {
 *   "settings": {
 *     "gst_percentage": "18",
 *     "late_fee_rate": "0.1",
 *     "company_name": "ABC Rentals",
 *     "company_gstin": "29ABCDE1234F1Z5",
 *     "security_deposit_percentage": "20"
 *   },
 *   "rentalPeriods": [
 *     { "name": "Hourly", "unit": "hour", "duration": 1 },
 *     { "name": "Daily", "unit": "day", "duration": 1 }
 *   ]
 * }
 */
export const PUT = requireRole("ADMIN")(
  async (request: NextRequest, { user }: any) => {
    try {
      const body = await request.json();
      const data = settingsUpdateSchema.parse(body);

      const results: any = {
        updatedSettings: [],
        updatedRentalPeriods: [],
      };

      // Update settings
      if (data.settings) {
        for (const [key, value] of Object.entries(data.settings)) {
          // Convert value to string for storage
          const stringValue = String(value);
          
          const setting = await prisma.systemSettings.upsert({
            where: { key },
            update: { value: stringValue },
            create: {
              key,
              value: stringValue,
              description: getSettingDescription(key),
            },
          });
          results.updatedSettings.push(setting);
        }
      }

      // Update rental periods
      if (data.rentalPeriods && Array.isArray(data.rentalPeriods)) {
        // Get existing rental periods
        const existingPeriods = await prisma.rentalPeriodConfig.findMany();
        const existingIds = new Set(existingPeriods.map(p => p.id));
        const updatedIds = new Set<string>();

        for (const period of data.rentalPeriods) {
          if (period.id && existingIds.has(period.id)) {
            // Update existing by ID
            const updated = await prisma.rentalPeriodConfig.update({
              where: { id: period.id },
              data: {
                name: period.name,
                unit: period.unit,
                duration: period.duration,
              },
            });
            results.updatedRentalPeriods.push(updated);
            updatedIds.add(period.id);
          } else {
            // Create new or upsert by name
            const upserted = await prisma.rentalPeriodConfig.upsert({
              where: { name: period.name },
              update: {
                unit: period.unit,
                duration: period.duration,
              },
              create: {
                name: period.name,
                unit: period.unit,
                duration: period.duration,
              },
            });
            results.updatedRentalPeriods.push(upserted);
            if (upserted.id) updatedIds.add(upserted.id);
          }
        }

        // Delete rental periods that were removed (not in the updated list)
        const periodsToDelete = existingPeriods.filter(p => !updatedIds.has(p.id));
        for (const period of periodsToDelete) {
          try {
            await prisma.rentalPeriodConfig.delete({
              where: { id: period.id },
            });
          } catch (error) {
            console.warn(`Could not delete rental period ${period.id}, it may be in use`);
          }
        }
      }

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "SETTINGS_UPDATED",
          entity: "SystemSettings",
          entityId: "system",
          metadata: JSON.stringify({
            settingsCount: results.updatedSettings.length,
            rentalPeriodsCount: results.updatedRentalPeriods.length,
          }),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Settings updated successfully",
        ...results,
      });
    } catch (error: any) {
      console.error("Settings update error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to update settings" },
        { status: 400 }
      );
    }
  }
);

/**
 * Helper function to provide default descriptions for settings
 */
function getSettingDescription(key: string): string {
  const descriptions: Record<string, string> = {
    // General Settings
    site_name: "Name of the rental platform",
    site_description: "Description of the rental platform",
    maintenance_mode: "Enable/disable maintenance mode",
    allow_registration: "Allow new user registrations",
    invoice_prefix: "Invoice number prefix (e.g., INV)",
    currency: "Currency code (e.g., USD, INR)",
    
    // Company Details
    company_name: "Company name for invoices",
    company_address: "Company address for invoices",
    company_gstin: "Company GSTIN for invoices",
    company_phone: "Company phone number",
    company_email: "Company email address",
    
    // Payment & Fees
    platform_fee: "Platform fee percentage",
    gst_percentage: "GST/Tax percentage applied to invoices",
    payment_gateway: "Payment gateway provider",
    auto_payouts: "Enable automatic vendor payouts",
    minimum_payout: "Minimum payout amount",
    security_deposit_percentage: "Security deposit as percentage of order amount",
    late_fee_rate: "Late fee rate per day (as decimal, e.g., 0.1 = 10%)",
    late_fee_grace_period_hours: "Grace period in hours before late fees apply",
    
    // Security
    two_factor_auth: "Enable two-factor authentication",
    session_timeout: "Session timeout in minutes",
    password_min_length: "Minimum password length",
    require_strong_password: "Require strong passwords",
    
    // Notifications
    email_notifications: "Enable email notifications",
    sms_notifications: "Enable SMS notifications",
    admin_alerts: "Enable admin alerts",
  };

  return descriptions[key] || "";
}
