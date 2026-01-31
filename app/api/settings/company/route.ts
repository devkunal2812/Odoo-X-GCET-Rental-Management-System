import { NextResponse } from "next/server";
import { getCompanyInfo } from "@/app/lib/settings";

/**
 * GET /api/settings/company
 * 
 * Public endpoint to get company information for invoices
 * No authentication required - this is public company info
 */
export async function GET() {
  try {
    const companyInfo = await getCompanyInfo();
    
    return NextResponse.json({
      success: true,
      companyInfo
    });
  } catch (error: any) {
    console.error("Error fetching company info:", error);
    
    // Return default values if database fails
    return NextResponse.json({
      success: true,
      companyInfo: {
        name: 'RentMarket Platform',
        address: '123 Platform Street, Tech City, CA 94000',
        phone: '+1-800-RENTALS',
        email: 'support@rentmarket.com',
        website: 'www.rentmarket.com',
        gstin: '29PLATFORM1234F1Z5'
      }
    });
  }
}
