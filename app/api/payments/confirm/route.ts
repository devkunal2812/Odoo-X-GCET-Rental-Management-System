import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export const POST = requireRole("CUSTOMER", "ADMIN")(
  async (request: NextRequest, { user }: any) => {
    try {
      const body = await request.json();
      const { paymentId, transactionRef } = body;

      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          invoice: {
            include: {
              saleOrder: true,
            },
          },
        },
      });

      if (!payment) {
        return NextResponse.json(
          { error: "Payment not found" },
          { status: 404 }
        );
      }

      if (
        user.role === "CUSTOMER" &&
        payment.invoice.saleOrder.customerId !== user.customerProfile.id
      ) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        );
      }

      // Update payment status
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "COMPLETED",
          transactionRef: transactionRef || payment.transactionRef,
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "PAYMENT_COMPLETED",
          entity: "Payment",
          entityId: paymentId,
          metadata: JSON.stringify({ amount: payment.amount }),
        },
      });

      return NextResponse.json({
        success: true,
        payment: updatedPayment,
        message: "Payment confirmed successfully",
      });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || "Payment confirmation failed" },
        { status: 400 }
      );
    }
  }
);
