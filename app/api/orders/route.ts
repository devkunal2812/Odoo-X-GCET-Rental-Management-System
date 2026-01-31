import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { orderSchema } from "@/app/lib/validation";

/**
 * POST /api/orders
 * 
 * Create Order API - Creates a new rental order
 * 
 * IMPORTANT: Initial Status is QUOTATION
 * ========================================
 * 
 * When an order is created, it starts as QUOTATION:
 * - This represents a rental quote/estimate
 * - NO inventory is reserved at this stage
 * - Customer can review pricing, dates, and terms
 * - Vendor can modify or send the quotation
 * 
 * Order Lifecycle:
 * QUOTATION → SENT → CONFIRMED → INVOICED → PICKED_UP → RETURNED
 * 
 * Reservations are ONLY created when order moves to CONFIRMED status.
 * This prevents premature inventory locking for quotes.
 */
export const POST = requireRole("CUSTOMER")(async (request: NextRequest, { user }: any) => {
  try {
    const body = await request.json();
    const data = orderSchema.parse(body);

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    // Calculate pricing
    let totalAmount = 0;
    const orderLines = [];

    for (const line of data.lines) {
      const product = await prisma.product.findUnique({
        where: { id: line.productId },
        include: {
          pricing: true,
          inventory: true,
        },
      });
      
      if (!product) {
        return NextResponse.json(
          { error: `Product ${line.productId} not found` },
          { status: 404 }
        );
      }

      // Use first pricing for simplicity
      const unitPrice = product.pricing[0]?.price || 0;
      totalAmount += unitPrice * line.quantity;

      orderLines.push({
        productId: line.productId,
        variantId: line.variantId,
        quantity: line.quantity,
        unitPrice,
        rentalStart: new Date(data.startDate),
        rentalEnd: new Date(data.endDate),
      });
    }

    // Apply coupon if provided
    let discount = 0;
    let couponId = null;
    if (data.couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: data.couponCode,
          isActive: true,
          validFrom: { lte: new Date() },
          validTo: { gte: new Date() },
        },
      });

      if (coupon) {
        couponId = coupon.id;
        if (coupon.discountType === "PERCENTAGE") {
          discount = (totalAmount * coupon.value) / 100;
        } else {
          discount = coupon.value;
        }
      }
    }

    const order = await prisma.saleOrder.create({
      data: {
        orderNumber,
        customerId: user.customerProfile.id,
        vendorId: data.vendorId,
        couponId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        totalAmount: totalAmount - discount,
        discount,
        lines: {
          create: orderLines,
        },
      },
      include: {
        lines: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Order creation failed" },
      { status: 400 }
    );
  }
});

export const GET = requireRole("CUSTOMER", "VENDOR", "ADMIN")(
  async (request: NextRequest, { user }: any) => {
    try {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get("status");

      const where: any = {};
      if (user.role === "CUSTOMER") {
        where.customerId = user.customerProfile.id;
      } else if (user.role === "VENDOR") {
        where.vendorId = user.vendorProfile.id;
      }
      if (status) where.status = status;

      const orders = await prisma.saleOrder.findMany({
        where,
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
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ success: true, orders });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || "Failed to fetch orders" },
        { status: 500 }
      );
    }
  }
);
