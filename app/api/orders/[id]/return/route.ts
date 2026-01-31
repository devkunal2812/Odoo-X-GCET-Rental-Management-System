import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { calculateLateFee } from "@/app/lib/late-fee";

/**
 * POST /api/orders/[id]/return
 * 
 * Return API - Processes return of rented items
 * 
 * Workflow:
 * 1. Order must be in PICKED_UP status
 * 2. Calculate late fee if return is past endDate
 * 3. Release reservations (items back in inventory)
 * 4. Update order status to RETURNED
 * 5. If late fee exists and invoice is POSTED, create adjustment
 * 6. Create audit log entry
 * 
 * Late Fee Logic:
 * - Compare actual return date with planned endDate
 * - Calculate extra days/hours
 * - Apply configured late fee rate
 * - Add to order.lateFee field
 */
export const POST = requireRole("VENDOR", "ADMIN")(
  async (request: NextRequest, { params, user }: any) => {
    try {
      const { id } = await params;
      const body = await request.json();
      const { returnDate } = body; // Optional: allow manual return date

      const order = await prisma.saleOrder.findUnique({
        where: { id },
        include: {
          lines: {
            include: {
              product: true,
            },
          },
          reservations: true,
          invoices: true,
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
      if (order.status !== "PICKED_UP") {
        return NextResponse.json(
          { error: `Order must be PICKED_UP. Current status: ${order.status}` },
          { status: 400 }
        );
      }

      const actualReturnDate = returnDate ? new Date(returnDate) : new Date();

      // Calculate late fee if return is late
      let lateFee = 0;
      if (order.endDate && actualReturnDate > order.endDate) {
        lateFee = await calculateLateFee(
          order.endDate,
          actualReturnDate,
          order.totalAmount
        );
      }

      // Process return in transaction
      const result = await prisma.$transaction(async (tx) => {
        // 1. Delete reservations (release inventory)
        await tx.reservation.deleteMany({
          where: { saleOrderId: order.id },
        });

        // 2. Update order status
        const updatedOrder = await tx.saleOrder.update({
          where: { id },
          data: {
            status: "RETURNED",
            actualReturnDate,
            lateFee,
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

        // 3. If late fee exists and there's a posted invoice, create adjustment line
        if (lateFee > 0 && order.invoices.length > 0) {
          const postedInvoice = order.invoices.find((inv) => inv.status === "POSTED");
          
          if (postedInvoice) {
            // Create a new invoice for late fee (cannot modify posted invoice)
            const lateFeeInvoice = await tx.invoice.create({
              data: {
                invoiceNumber: `INV-LATE-${Date.now()}`,
                saleOrderId: order.id,
                status: "DRAFT",
                totalAmount: lateFee,
                lines: {
                  create: {
                    productId: order.lines[0].productId, // Link to first product
                    description: `Late fee for order ${order.orderNumber}`,
                    quantity: 1,
                    unitPrice: lateFee,
                    amount: lateFee,
                  },
                },
              },
            });

            return { updatedOrder, lateFeeInvoice };
          }
        }

        return { updatedOrder, lateFeeInvoice: null };
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "ORDER_RETURNED",
          entity: "SaleOrder",
          entityId: order.id,
          metadata: JSON.stringify({
            orderNumber: order.orderNumber,
            returnDate: actualReturnDate.toISOString(),
            lateFee,
            wasLate: lateFee > 0,
          }),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Order returned successfully",
        order: result.updatedOrder,
        lateFee,
        lateFeeInvoice: result.lateFeeInvoice,
      });
    } catch (error: any) {
      console.error("Return error:", error);
      return NextResponse.json(
        { error: error.message || "Return operation failed" },
        { status: 400 }
      );
    }
  }
);
