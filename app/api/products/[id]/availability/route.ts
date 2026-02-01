import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const body = await request.json();
    const { startDate, endDate, requestedQuantity } = body;

    if (!productId || !startDate || !endDate || requestedQuantity == null || requestedQuantity < 0) {
      return NextResponse.json(
        { error: "Missing required fields: productId, startDate, endDate, requestedQuantity" },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start >= end) {
      return NextResponse.json(
        { error: "Start date must be before end date" },
        { status: 400 }
      );
    }

    if (start < now) {
      return NextResponse.json(
        { error: "Start date cannot be in the past" },
        { status: 400 }
      );
    }

    // Get product with inventory
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        inventory: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const totalQuantity = product.inventory?.quantityOnHand || 0;

    if (totalQuantity === 0) {
      return NextResponse.json({
        success: true,
        requestedQuantity,
        availableQuantity: 0,
        totalQuantity,
        status: "NONE",
        message: "Product is out of stock"
      });
    }

    // Find overlapping reservations
    const overlappingReservations = await prisma.reservation.findMany({
      where: {
        productId: productId,
        // Check for time overlap: existing.start < requested.end AND existing.end > requested.start
        AND: [
          { startDate: { lt: end } },
          { endDate: { gt: start } }
        ],
        saleOrder: {
          status: {
            in: ['CONFIRMED', 'SENT', 'PICKED_UP'] // Only consider active orders
          }
        }
      },
      include: {
        saleOrder: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            startDate: true,
            endDate: true
          }
        }
      }
    });

    // Calculate total quantity booked during the requested period
    const bookedQuantity = overlappingReservations.reduce((total, reservation) => {
      return total + reservation.quantity;
    }, 0);

    const availableQuantity = totalQuantity - bookedQuantity;

    // Determine status
    let status: "FULL" | "PARTIAL" | "NONE";
    let message: string;

    if (availableQuantity === 0) {
      status = "NONE";
      message = "This product is not available for the selected time duration.";
    } else if (availableQuantity < requestedQuantity) {
      status = "PARTIAL";
      message = `Only ${availableQuantity} unit${availableQuantity > 1 ? 's are' : ' is'} available for the selected time duration.`;
    } else {
      status = "FULL";
      message = "Product is fully available for the selected time duration.";
    }

    return NextResponse.json({
      success: true,
      requestedQuantity,
      availableQuantity,
      totalQuantity,
      bookedQuantity,
      status,
      message,
      overlappingBookings: overlappingReservations.map(r => ({
        orderNumber: r.saleOrder.orderNumber,
        quantity: r.quantity,
        startDate: r.startDate,
        endDate: r.endDate,
        status: r.saleOrder.status
      }))
    });

  } catch (error: any) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { error: error.message || "Failed to check availability" },
      { status: 500 }
    );
  }
}