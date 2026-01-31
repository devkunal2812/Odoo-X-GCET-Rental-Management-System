import { NextResponse } from "next/server";
import { getSetting } from "@/app/lib/settings";

/**
 * GET /api/settings/public
 * 
 * Public endpoint to get public system settings (like GST percentage)
 * No authentication required
 */
export async function GET() {
  try {
    const gstPercentage = await getSetting('gst_percentage');
    const currency = await getSetting('currency');
    
    return NextResponse.json({
      success: true,
      settings: {
        gst_percentage: gstPercentage,
        currency: currency,
      }
    });
  } catch (error: any) {
    console.error("Error fetching public settings:", error);
    
    // Return default values if database fails
    return NextResponse.json({
      success: true,
      settings: {
        gst_percentage: 18,
        currency: 'INR',
      }
    });
  }
}
