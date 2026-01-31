import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test database connection and fetch some data
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    const orderCount = await prisma.saleOrder.count();

    // Fetch sample data
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
      take: 5,
    });

    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        published: true,
        vendor: {
          select: {
            companyName: true,
          },
        },
      },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      message: "Database connection successful ✅",
      stats: {
        users: userCount,
        products: productCount,
        orders: orderCount,
      },
      sampleData: {
        users,
        products,
      },
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}