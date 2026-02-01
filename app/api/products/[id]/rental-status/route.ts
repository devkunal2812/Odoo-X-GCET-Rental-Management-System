import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const now = new Date();

    // Check for active reservations (product is currently rented)
    const activeReservations = await prisma.reservation.findMany({
      where: {
        productId: productId,
        startDate: { lte: now },
        endDate: { gte: now },
        saleOrder: {
          status: {
            in: ['CONFIRMED', 'PICKED_UP'] // Only consider confirmed and picked up orders
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
            endDate: true,
            customer: {
              select: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Check for active order lines (alternative check)
    const activeOrderLines = await prisma.saleOrderLine.findMany({
      where: {
        productId: productId,
        order: {
          status: {
            in: ['CONFIRMED', 'PICKED_UP']
          },
          startDate: { lte: now },
          endDate: { gte: now }
        }
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            startDate: true,
            endDate: true,
            customer: {
              select: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      }
    });

    const isCurrentlyRented = activeReservations.length > 0 || activeOrderLines.length > 0;
    
    // Get rental details if currently rented
    let rentalDetails = null;
    if (isCurrentlyRented) {
      const rental = activeReservations[0]?.saleOrder || activeOrderLines[0]?.order;
      if (rental) {
        rentalDetails = {
          orderNumber: rental.orderNumber,
          status: rental.status,
          startDate: rental.startDate,
          endDate: rental.endDate,
          customerName: rental.customer?.user 
            ? `${rental.customer.user.firstName} ${rental.customer.user.lastName}`
            : 'Unknown Customer'
        };
      }
    }

    // Check upcoming rentals (within next 7 days)
    const upcomingDate = new Date();
    upcomingDate.setDate(upcomingDate.getDate() + 7);

    const upcomingReservations = await prisma.reservation.findMany({
      where: {
        productId: productId,
        startDate: { 
          gte: now,
          lte: upcomingDate 
        },
        saleOrder: {
          status: {
            in: ['CONFIRMED', 'SENT']
          }
        }
      },
      include: {
        saleOrder: {
          select: {
            orderNumber: true,
            startDate: true,
            endDate: true,
            customer: {
              select: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      },
      take: 3 // Get next 3 upcoming rentals
    });

    return NextResponse.json({
      success: true,
      productId,
      isCurrentlyRented,
      rentalDetails,
      upcomingRentals: upcomingReservations.map(reservation => ({
        orderNumber: reservation.saleOrder.orderNumber,
        startDate: reservation.saleOrder.startDate,
        endDate: reservation.saleOrder.endDate,
        customerName: reservation.saleOrder.customer?.user
          ? `${reservation.saleOrder.customer.user.firstName} ${reservation.saleOrder.customer.user.lastName}`
          : 'Unknown Customer'
      })),
      totalQuantityRented: activeReservations.reduce((sum, r) => sum + r.quantity, 0) +
                          activeOrderLines.reduce((sum, ol) => sum + ol.quantity, 0)
    });

  } catch (error: any) {
    console.error('Error checking rental status:', error);
    return NextResponse.json(
      { error: error.message || "Failed to check rental status" },
      { status: 500 }
    );
  }
}