import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export const POST = requireRole("VENDOR")(
  async (request: NextRequest, { params, user }: any) => {
    try {
      const { id } = await params;
      const order = await prisma.saleOrder.findUnique({
        where: { id },
      });

      if (!order) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      if (order.vendorId !== user.vendorProfile.id) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        );
      }

      if (order.status !== "QUOTATION") {
        return NextResponse.json(
          { error: "Order must be in QUOTATION status" },
          { status: 400 }
        );
      }

      const updatedOrder = await prisma.saleOrder.update({
        where: { id },
        data: { status: "SENT" },
        include: {
          lines: {
            include: {
              product: true,
            },
          },
        },
      });

      return NextResponse.json({ success: true, order: updatedOrder });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || "Failed to send order" },
        { status: 400 }
      );
    }
  }
);
