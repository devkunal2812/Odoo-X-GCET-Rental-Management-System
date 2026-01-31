import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { couponSchema } from "@/app/lib/validation";

// Create coupon (Vendor only)
export const POST = requireRole("VENDOR")(async (request: NextRequest, context: any) => {
  try {
    const body = await request.json();
    const data = couponSchema.parse(body);
    const user = context.user;

    // Get vendor profile
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: user.id },
    });

    if (!vendorProfile) {
      return NextResponse.json(
        { error: "Vendor profile not found" },
        { status: 404 }
      );
    }

    // Check if coupon code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: data.code },
    });

    if (existingCoupon) {
      return NextResponse.json(
        { error: "Coupon code already exists" },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: data.code,
        vendorId: vendorProfile.id,
        discountType: data.discountType,
        value: data.value,
        validFrom: new Date(data.validFrom),
        validTo: new Date(data.validTo),
        maxUses: data.maxUses,
      },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Coupon creation failed" },
      { status: 400 }
    );
  }
});

// Get vendor's coupons
export const GET = requireRole("VENDOR")(async (request: NextRequest, context: any) => {
  try {
    const user = context.user;

    // Get vendor profile
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: user.id },
    });

    if (!vendorProfile) {
      return NextResponse.json(
        { error: "Vendor profile not found" },
        { status: 404 }
      );
    }

    const coupons = await prisma.coupon.findMany({
      where: { vendorId: vendorProfile.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, coupons });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch coupons" },
      { status: 500 }
    );
  }
});
