import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

// Delete coupon (Vendor only - own coupons)
export const DELETE = requireRole("VENDOR")(
  async (request: NextRequest, context: any) => {
    try {
      const user = context.user;
      const couponId = context.params.id;

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

      // Check if coupon exists and belongs to vendor
      const coupon = await prisma.coupon.findUnique({
        where: { id: couponId },
      });

      if (!coupon) {
        return NextResponse.json(
          { error: "Coupon not found" },
          { status: 404 }
        );
      }

      if (coupon.vendorId !== vendorProfile.id) {
        return NextResponse.json(
          { error: "Unauthorized to delete this coupon" },
          { status: 403 }
        );
      }

      // Check if coupon is being used in any orders
      const ordersUsingCoupon = await prisma.saleOrder.count({
        where: { couponId: couponId },
      });

      if (ordersUsingCoupon > 0) {
        return NextResponse.json(
          { error: `Cannot delete coupon. It is being used in ${ordersUsingCoupon} order(s)` },
          { status: 400 }
        );
      }

      await prisma.coupon.delete({
        where: { id: couponId },
      });

      return NextResponse.json({
        success: true,
        message: "Coupon deleted successfully",
      });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || "Failed to delete coupon" },
        { status: 500 }
      );
    }
  }
);

// Update coupon (Vendor only - own coupons)
export const PATCH = requireRole("VENDOR")(
  async (request: NextRequest, context: any) => {
    try {
      const user = context.user;
      const couponId = context.params.id;
      const body = await request.json();

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

      // Check if coupon exists and belongs to vendor
      const coupon = await prisma.coupon.findUnique({
        where: { id: couponId },
      });

      if (!coupon) {
        return NextResponse.json(
          { error: "Coupon not found" },
          { status: 404 }
        );
      }

      if (coupon.vendorId !== vendorProfile.id) {
        return NextResponse.json(
          { error: "Unauthorized to update this coupon" },
          { status: 403 }
        );
      }

      // Update coupon
      const updatedCoupon = await prisma.coupon.update({
        where: { id: couponId },
        data: {
          isActive: body.isActive !== undefined ? body.isActive : coupon.isActive,
          maxUses: body.maxUses !== undefined ? body.maxUses : coupon.maxUses,
          validTo: body.validTo ? new Date(body.validTo) : coupon.validTo,
        },
      });

      return NextResponse.json({
        success: true,
        coupon: updatedCoupon,
      });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || "Failed to update coupon" },
        { status: 500 }
      );
    }
  }
);
