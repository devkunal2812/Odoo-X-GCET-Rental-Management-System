import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

// Delete coupon (Admin only)
export const DELETE = requireRole("ADMIN")(
  async (request: NextRequest, context: any) => {
    try {
      const couponId = context.params.id;

      // Check if coupon exists
      const coupon = await prisma.coupon.findUnique({
        where: { id: couponId },
      });

      if (!coupon) {
        return NextResponse.json(
          { error: "Coupon not found" },
          { status: 404 }
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
