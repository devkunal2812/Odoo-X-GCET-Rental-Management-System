import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

/**
 * GET /api/rental-periods
 * 
 * Get all rental period configurations
 * Public endpoint - needed for product creation/editing
 */
export async function GET() {
  try {
    const periods = await prisma.rentalPeriodConfig.findMany({
      orderBy: { duration: "asc" },
    });

    return NextResponse.json({
      success: true,
      periods,
    });
  } catch (error: any) {
    console.error("Failed to fetch rental periods:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch rental periods" },
      { status: 500 }
    );
  }
}
