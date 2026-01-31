import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, orderAmount, vendorId } = body;

    if (!code || !orderAmount || !vendorId) {
      return NextResponse.json(
        { error: "code, orderAmount, and vendorId are required" },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findFirst({
      where: {
        code,
        vendorId, // Coupon must belong to the vendor
        isActive: true,
        validFrom: { lte: new Date() },
        validTo: { gte: new Date() },
      },
      include: {
        vendor: {
          select: {
            companyName: true,
          },
        },
      },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Invalid, expired, or coupon not applicable for this vendor" },
        { status: 404 }
      );
    }

    // Check usage limit
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json(
        { error: "Coupon usage limit reached" },
        { status: 400 }
      );
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discount = (orderAmount * coupon.value) / 100;
    } else {
      discount = coupon.value;
    }

    // Ensure discount doesn't exceed order amount
    discount = Math.min(discount, orderAmount);

    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        value: coupon.value,
        vendorName: coupon.vendor.companyName,
      },
      discount,
      finalAmount: orderAmount - discount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Validation failed" },
      { status: 400 }
    );
  }
}
