import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export const GET = requireRole("CUSTOMER", "VENDOR", "ADMIN")(
  async (request: NextRequest, { params, user }: any) => {
    try {
      const { id } = await params;
      const order = await prisma.saleOrder.findUnique({
        where: { id },
        include: {
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
          vendor: {
            select: {
              companyName: true,
            },
          },
          lines: {
            include: {
              product: true,
              variant: true,
            },
          },
          reservations: true,
          invoices: true,
        },
      });

      if (!order) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      // Check authorization
      if (
        user.role === "CUSTOMER" &&
        order.customerId !== user.customerProfile.id
      ) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        );
      }

      if (
        user.role === "VENDOR" &&
        order.vendorId !== user.vendorProfile.id
      ) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        );
      }

      return NextResponse.json({ success: true, order });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || "Failed to fetch order" },
        { status: 500 }
      );
    }
  }
);
