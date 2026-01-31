import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export const POST = requireRole("VENDOR")(
  async (request: NextRequest, { params, user }: any) => {
    try {
      const { id } = await params;
      const invoice = await prisma.invoice.findUnique({
        where: { id },
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

      if (invoice.saleOrder.vendorId !== user.vendorProfile.id) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        );
      }

      if (invoice.status !== "DRAFT") {
        return NextResponse.json(
          { error: "Invoice must be in DRAFT status" },
          { status: 400 }
        );
      }

      const updatedInvoice = await prisma.invoice.update({
        where: { id },
        data: { status: "POSTED" },
        include: {
          lines: true,
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "INVOICE_POSTED",
          entity: "Invoice",
          entityId: invoice.id,
        },
      });

      return NextResponse.json({
        success: true,
        invoice: updatedInvoice,
      });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || "Failed to post invoice" },
        { status: 400 }
      );
    }
  }
);
