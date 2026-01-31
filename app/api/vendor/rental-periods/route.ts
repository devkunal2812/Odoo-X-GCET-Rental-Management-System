import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

/**
 * GET /api/vendor/rental-periods
 * 
 * Retrieve all available rental periods for vendor product creation
 * 
 * Rental periods are system-wide configurations set by admin.
 * Vendors can read them to set pricing for their products.
 */
export const GET = requireRole("VENDOR")(async (request: NextRequest) => {
    try {
        const rentalPeriods = await prisma.rentalPeriodConfig.findMany({
            orderBy: { duration: "asc" },
        });

        return NextResponse.json({
            success: true,
            rentalPeriods,
        });
    } catch (error: any) {
        console.error("Rental periods fetch error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch rental periods" },
            { status: 500 }
        );
    }
});
