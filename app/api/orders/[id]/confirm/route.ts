import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { checkAvailability } from "@/app/lib/reservation";

/**
 * POST /api/orders/[id]/confirm
 * 
 * Confirm Order API - Transitions order from SENT to CONFIRMED
 * 
 * IMPORTANT: Quotation vs Order Semantics
 * ========================================
 * 
 * QUOTATION Status:
 * - Represents a rental quote/estimate
 * - NO inventory reservation at this stage
 * - Customer can review pricing and terms
 * - Can be edited or cancelled freely
 * 
 * SENT Status:
 * - Quotation has been sent to customer
 * - Still NO inventory reservation
 * - Awaiting customer/vendor confirmation
 * 
 * CONFIRMED Status (this API):
 * - Order is confirmed and committed
 * - Inventory reservations are CREATED here
 * - Prevents overbooking via reservation logic
 * - Locks rental dates for the products
 * - Cannot be cancelled without releasing reservations
 * 
 * Workflow:
 * 1. Validate order is in SENT status
 * 2. Check product availability for requested dates
 * 3. Create reservation records (prevents double booking)
 * 4. Update order status to CONFIRMED
 * 5. Log audit entry
 */
export const POST = requireRole("VENDOR")(
  async (request: NextRequest, { params, user }: any) => {
    try {
      const { id } = await params;
      const order = await prisma.saleOrder.findUnique({
        where: { id },
        include: {
          lines: true,
        },
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

      if (order.status !== "SENT") {
        return NextResponse.json(
          { error: "Order must be in SENT status" },
          { status: 400 }
        );
      }

      // Check availability for all products
      for (const line of order.lines) {
        const available = await checkAvailability(
          line.productId,
          order.startDate!,
          order.endDate!,
          line.quantity
        );

        if (!available) {
          return NextResponse.json(
            { error: `Product ${line.productId} not available for requested dates` },
            { status: 400 }
          );
        }
      }

      // Create reservations and update order
      const updatedOrder = await prisma.$transaction(async (tx) => {
        // Create reservations
        for (const line of order.lines) {
          await tx.reservation.create({
            data: {
              productId: line.productId,
              quantity: line.quantity,
              startDate: order.startDate!,
              endDate: order.endDate!,
              saleOrderId: order.id,
            },
          });
        }

        // Update order status
        return tx.saleOrder.update({
          where: { id: order.id },
          data: { status: "CONFIRMED" },
          include: {
            lines: {
              include: {
                product: true,
              },
            },
            reservations: true,
          },
        });
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "ORDER_CONFIRMED",
          entity: "SaleOrder",
          entityId: order.id,
        },
      });

      return NextResponse.json({ success: true, order: updatedOrder });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || "Order confirmation failed" },
        { status: 400 }
      );
    }
  }
);
