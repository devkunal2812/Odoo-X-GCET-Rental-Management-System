import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

/**
 * GET /api/orders/user
 * 
 * Get User Orders API - Retrieves orders for the current user
 * This is a simplified version that works without authentication for demo purposes
 */
export async function GET(request: NextRequest) {
  try {
    // In production, you would get the user ID from authentication
    // For now, we'll return orders from localStorage format or database
    
    // Try to get orders from database (when available)
    try {
      const orders = await prisma.saleOrder.findMany({
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

      // Transform database orders to match frontend format
      const transformedOrders = orders.map(order => ({
        id: order.orderNumber,
        product: {
          name: order.lines[0]?.product?.name || "Rental Items",
          image: "/api/placeholder/100/100",
          description: `${order.lines.length} item(s) rental`
        },
        vendor: {
          name: order.vendor?.companyName || "Vendor",
          phone: "+1 (555) 123-4567",
          email: "support@rentmarket.com"
        },
        amount: order.totalAmount,
        status: order.status.toLowerCase(),
        orderDate: order.createdAt.toISOString().split('T')[0],
        startDate: order.startDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        endDate: order.endDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        duration: order.endDate && order.startDate 
          ? Math.ceil((order.endDate.getTime() - order.startDate.getTime()) / (1000 * 60 * 60 * 24))
          : 1,
        unit: "days",
        pickupLocation: "Store Location - 123 Main St",
        pickupTime: "10:00 AM",
        returnLocation: "Store Location - 123 Main St", 
        returnTime: "5:00 PM",
        paymentStatus: order.status === "CONFIRMED" ? "paid" : "pending",
        paymentMethod: "Razorpay",
        paymentVerified: order.status === "CONFIRMED",
        items: order.lines.map(line => ({
          id: line.id,
          name: line.product?.name || "Item",
          vendor: order.vendor?.companyName || "Vendor",
          quantity: line.quantity,
          rentalDuration: 1,
          rentalUnit: "days",
          unitPrice: line.unitPrice,
          totalPrice: line.unitPrice * line.quantity
        })),
        notes: `Database order - Order Number: ${order.orderNumber}`,
        createdAt: order.createdAt.toISOString()
      }));

      return NextResponse.json({ 
        success: true, 
        orders: transformedOrders,
        source: "database",
        count: transformedOrders.length
      });

    } catch (dbError) {
      console.log('Database not available or no orders found, returning empty array');
      
      return NextResponse.json({ 
        success: true, 
        orders: [],
        source: "database_empty",
        message: "No orders found in database. Orders are currently stored in localStorage."
      });
    }

  } catch (error: any) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}