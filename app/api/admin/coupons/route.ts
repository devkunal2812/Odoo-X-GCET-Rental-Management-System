import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { couponSchema } from "@/app/lib/validation";

export const POST = requireRole("ADMIN")(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const data = couponSchema.parse(body);

    const coupon = await prisma.coupon.create({
      data: {
        code: data.code,
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

export const GET = requireRole("ADMIN")(async (request: NextRequest) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { validFrom: "desc" },
    });

    return NextResponse.json({ success: true, coupons });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch coupons" },
      { status: 500 }
    );
  }
});
