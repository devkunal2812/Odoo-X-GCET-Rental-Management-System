import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export const POST = requireRole("VENDOR")(
  async (request: NextRequest, { params, user }: any) => {
    try {
      const { orderId } = await params;
      const order = await prisma.saleOrder.findUnique({
        where: { id: orderId },
        include: {
          lines: {
            include: {
              product: true,
            },
          },
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

      if (order.status !== "CONFIRMED") {
        return NextResponse.json(
          { error: "Order must be confirmed" },
          { status: 400 }
        );
      }

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`;

      // Create invoice
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          saleOrderId: order.id,
          totalAmount: order.totalAmount,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          lines: {
            create: order.lines.map((line) => ({
              productId: line.productId,
              description: line.product.name,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              amount: line.unitPrice * line.quantity,
            })),
          },
        },
        include: {
          lines: true,
        },
      });

      // Update order status
      await prisma.saleOrder.update({
        where: { id: order.id },
        data: { status: "INVOICED" },
      });

      return NextResponse.json({ success: true, invoice });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || "Invoice creation failed" },
        { status: 400 }
      );
    }
  }
);
