import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export const POST = requireRole("CUSTOMER")(
  async (request: NextRequest, { user }: any) => {
    try {
      const body = await request.json();
      const { invoiceId, amount, method } = body;

      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          saleOrder: true,
        },
      });

      if (!invoice) {
        return NextResponse.json(
          { error: "Invoice not found" },
          { status: 404 }
        );
      }

      if (invoice.saleOrder.customerId !== user.customerProfile.id) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        );
      }

      if (invoice.status !== "POSTED") {
        return NextResponse.json(
          { error: "Invoice must be posted" },
          { status: 400 }
        );
      }

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          invoiceId,
          method,
          amount,
          status: "PENDING",
          transactionRef: `TXN-${Date.now()}`,
        },
      });

      // In production, integrate with payment gateway here
      // For now, return payment details

      return NextResponse.json({
        success: true,
        payment,
        message: "Payment initiated. Complete payment using the transaction reference.",
      });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || "Payment initiation failed" },
        { status: 400 }
      );
    }
  }
);
