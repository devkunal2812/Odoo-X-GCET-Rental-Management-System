import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

/**
 * GET /api/test/db-connection
 * 
 * Tests database connection and shows current data
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing database connection...');

    // Test 1: Basic connection
    const connectionTest = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Basic connection test passed');

    // Test 2: Count records in main tables
    const [
      productCount,
      orderCount,
      reservationCount,
      inventoryCount,
      userCount
    ] = await Promise.all([
      prisma.product.count(),
      prisma.saleOrder.count(),
      prisma.reservation.count(),
      prisma.inventory.count(),
      prisma.user.count()
    ]);

    console.log('📊 Record counts retrieved');

    // Test 3: Get sample data with relationships
    const sampleProducts = await prisma.product.findMany({
      take: 3,
      include: {
        inventory: true,
        vendor: {
          select: {
            companyName: true
          }
        },
        reservations: {
          where: {
            endDate: {
              gte: new Date() // Only current/future reservations
            }
          },
          include: {
            saleOrder: {
              select: {
                orderNumber: true,
                status: true
              }
            }
          }
        }
      }
    });

    console.log('🔗 Sample data with relationships retrieved');

    // Test 4: Check for active rentals
    const activeRentals = await prisma.reservation.findMany({
      where: {
        startDate: {
          lte: new Date()
        },
        endDate: {
          gte: new Date()
        },
        saleOrder: {
          status: {
            in: ['CONFIRMED', 'SENT', 'PICKED_UP']
          }
        }
      },
      include: {
        product: {
          select: {
            name: true
          }
        },
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
    });

    console.log('🔒 Active rentals retrieved');

    // Calculate real-time availability for sample products
    const productsWithAvailability = sampleProducts.map(product => {
      const totalStock = product.inventory?.quantityOnHand || 0;
      const currentlyRented = product.reservations.reduce((sum, res) => {
        const now = new Date();
        if (res.startDate <= now && res.endDate >= now) {
          return sum + res.quantity;
        }
        return sum;
      }, 0);
      
      return {
        id: product.id,
        name: product.name,
        vendor: product.vendor?.companyName,
        totalStock,
        currentlyRented,
        available: totalStock - currentlyRented,
        isFullyRented: (totalStock - currentlyRented) === 0,
        activeReservations: product.reservations.length
      };
    });

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      databaseConnection: {
        status: 'connected',
        connectionTest: !!connectionTest
      },
      recordCounts: {
        products: productCount,
        orders: orderCount,
        reservations: reservationCount,
        inventory: inventoryCount,
        users: userCount
      },
      activeRentals: {
        count: activeRentals.length,
        details: activeRentals.map(rental => ({
          productName: rental.product.name,
          orderNumber: rental.saleOrder.orderNumber,
          customerName: `${rental.saleOrder.customer.user.firstName} ${rental.saleOrder.customer.user.lastName}`,
          quantity: rental.quantity,
          startDate: rental.startDate,
          endDate: rental.endDate,
          status: rental.saleOrder.status
        }))
      },
      sampleProductsAvailability: productsWithAvailability,
      systemStatus: {
        realTimeInventoryWorking: productsWithAvailability.some(p => p.currentlyRented > 0),
        databaseIntegrationActive: true,
        inventoryTrackingEnabled: true
      }
    };

    console.log('✅ Database connection test completed successfully');
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ Database connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      databaseConnection: {
        status: 'failed',
        errorType: error.constructor.name
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}