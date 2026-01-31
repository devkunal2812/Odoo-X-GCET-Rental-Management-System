import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publishedParam = searchParams.get("published");
    const vendorId = searchParams.get("vendorId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};
    // Only filter by published if explicitly set to "true"
    // published=false means show ALL products (for vendor dashboard)
    // published=true or not set means show only published (for public catalog)
    if (publishedParam === "true" || publishedParam === null) {
      where.published = true;
    }
    // If publishedParam === "false", don't add published filter (show all)
    if (vendorId) where.vendorId = vendorId;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          vendor: {
            select: {
              companyName: true,
            },
          },
          pricing: {
            include: {
              rentalPeriod: true,
            },
          },
          inventory: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}
