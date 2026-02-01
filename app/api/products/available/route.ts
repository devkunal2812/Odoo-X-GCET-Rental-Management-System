import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

/**
 * GET /api/products/available
 * 
 * Returns products with real-time availability calculation
 * Excludes products that are completely out of stock due to active rentals
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publishedParam = searchParams.get("published");
    const vendorId = searchParams.get("vendorId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const includeOutOfStock = searchParams.get("includeOutOfStock") === "true";

    const where: any = {};
    // If vendorId is provided, show all products for that vendor (published and unpublished)
    // Otherwise, only show published products for public view
    if (vendorId) {
      where.vendorId = vendorId;
      // Don't filter by published status for vendor's own products
    } else {
      // For public view, only show published products
      if (publishedParam === "true" || publishedParam === null) {
        where.published = true;
      } else if (publishedParam === "false") {
        where.published = false;
      }
    }

    // Get all products first
    const products = await prisma.product.findMany({
      where,
      include: {
        vendor: {
          select: {
            companyName: true,
            category: true,
          },
        },
        pricing: {
          include: {
            rentalPeriod: true,
          },
        },
        inventory: true,
        reservations: {
          where: {
            saleOrder: {
              status: {
                in: ['CONFIRMED', 'SENT', 'PICKED_UP'] // Active rental statuses
              }
            },
            // Only current and future reservations
            endDate: {
              gte: new Date()
            }
          },
          include: {
            saleOrder: {
              select: {
                orderNumber: true,
                status: true,
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
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    // Calculate real-time availability for each product
    const productsWithAvailability = products.map(product => {
      const totalStock = product.inventory?.quantityOnHand || 0;
      
      // Calculate reserved/booked quantity (including future reservations)
      // This includes all confirmed reservations that haven't ended yet
      const reservedQuantity = product.reservations.reduce((total, reservation) => {
        // Count all reservations that haven't ended yet (current + future)
        const now = new Date();
        if (reservation.endDate >= now) {
          return total + reservation.quantity;
        }
        return total;
      }, 0);

      // Calculate currently active rentals (for display purposes)
      const currentlyRentedQuantity = product.reservations.reduce((total, reservation) => {
        const now = new Date();
        // Only count reservations that are currently active
        if (reservation.startDate <= now && reservation.endDate >= now) {
          return total + reservation.quantity;
        }
        return total;
      }, 0);

      // Available quantity = Total - All Reserved (current + future)
      const availableQuantity = Math.max(0, totalStock - reservedQuantity);
      const isOutOfStock = availableQuantity === 0;
      
      // Get current rental details if any
      const currentRentals = product.reservations.filter(reservation => {
        const now = new Date();
        return reservation.startDate <= now && reservation.endDate >= now;
      });

      // 🔍 Debug: Log calculation for products with reservations
      if (product.reservations.length > 0) {
        console.log(`🔍 Product "${product.name}" availability calculation:`, {
          totalStock,
          reservationsCount: product.reservations.length,
          reservedQuantity, // Total reserved (current + future)
          currentlyRentedQuantity, // Only currently active
          availableQuantity,
          reservations: product.reservations.map(r => ({
            quantity: r.quantity,
            startDate: r.startDate,
            endDate: r.endDate,
            orderStatus: r.saleOrder.status,
            isActive: r.startDate <= new Date() && r.endDate >= new Date(),
            isFuture: r.startDate > new Date()
          }))
        });
      }

      return {
        ...product,
        // Remove reservations from response for cleaner data
        reservations: undefined,
        // Add calculated availability
        realTimeInventory: {
          totalStock,
          currentlyRentedQuantity, // Currently active rentals
          reservedQuantity, // Total reserved (current + future)
          availableQuantity, // Available = Total - Reserved
          isOutOfStock,
          isPartiallyAvailable: availableQuantity > 0 && availableQuantity < totalStock
        },
        // Add current rental info if rented
        currentRentals: currentRentals.length > 0 ? currentRentals.map(rental => ({
          orderNumber: rental.saleOrder.orderNumber,
          quantity: rental.quantity,
          customerName: `${rental.saleOrder.customer.user.firstName} ${rental.saleOrder.customer.user.lastName}`,
          startDate: rental.startDate,
          endDate: rental.endDate,
          status: rental.saleOrder.status
        })) : []
      };
    });

    // Filter out completely out of stock products unless specifically requested
    const filteredProducts = includeOutOfStock 
      ? productsWithAvailability 
      : productsWithAvailability.filter(product => !product.realTimeInventory.isOutOfStock);

    const total = filteredProducts.length;

    return NextResponse.json({
      success: true,
      products: filteredProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      metadata: {
        totalProductsInDatabase: products.length,
        availableProducts: filteredProducts.length,
        outOfStockProducts: products.length - filteredProducts.length
      }
    });
  } catch (error: any) {
    console.error('Error fetching available products:', error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch available products" },
      { status: 500 }
    );
  }
}