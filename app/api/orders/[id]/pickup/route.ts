import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

/**
 * POST /api/orders/[id]/pickup
 * 
 * Pickup API - Marks order as picked up by customer
 * 
 * Workflow:
 * 1. Order must be in CONFIRMED status
 * 2. Updates order status to PICKED_UP
 * 3. Records pickup date
 * 4. Creates audit log entry
 * 
 * Note: Inventory is already reserved when order was CONFIRMED.
 * This API marks the physical handover of items to customer.
 */
export const POST = requireRole("VENDOR", "ADMIN")(
  async (request: NextRequest, { params, user }: any) => {
    try {
      const { id } = await params;

      const order = await prisma.saleOrder.findUnique({
        where: { id },
        include: {
          lines: {
            include: {
              product: true,
            },
          },
          vendor: true,
        },
      });

      if (!order) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      // Authorization check for vendors
      if (user.role === "VENDOR" && order.vendorId !== user.vendorProfile.id) {
        return NextResponse.json(
          { error: "Unauthorized - not your order" },
          { status: 403 }
        );
      }

      // Validate order status
      if (order.status !== "CONFIRMED") {
        return NextResponse.json(
          { error: `Order must be CONFIRMED. Current status: ${order.status}` },
          { status: 400 }
        );
      }

      // Update order to PICKED_UP
      const updatedOrder = await prisma.saleOrder.update({
        where: { id },
        data: {
          status: "PICKED_UP",
          pickupDate: new Date(),
        },
        include: {
          lines: {
            include: {
              product: true,
            },
          },
          customer: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "ORDER_PICKED_UP",
          entity: "SaleOrder",
          entityId: order.id,
          metadata: JSON.stringify({
            orderNumber: order.orderNumber,
            pickupDate: new Date().toISOString(),
            itemCount: order.lines.length,
          }),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Order marked as picked up successfully",
        order: updatedOrder,
      });
    } catch (error: any) {
      console.error("Pickup error:", error);
      return NextResponse.json(
        { error: error.message || "Pickup operation failed" },
        { status: 400 }
      );
    }
  }
);
