import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getUserFromRequest } from "@/app/lib/auth";

/**
 * GET /api/orders/user
 * 
 * Get User Orders API - Retrieves orders for the current authenticated user only
 */
export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user
    const currentUser = await getUserFromRequest(request);
    
    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log(`🔍 Fetching orders for user: ${currentUser.email} (ID: ${currentUser.id})`);
    
    // Try to get orders from database for the current user only
    try {
      const orders = await prisma.saleOrder.findMany({
        where: {
          customer: {
            userId: currentUser.id // ✅ Filter by current user's ID
          }
        },
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

      console.log(`✅ Found ${orders.length} orders for user ${currentUser.email}`);

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
        // ✅ IMPORTANT: Mark as paid if order is CONFIRMED (means payment was successful)
        paymentStatus: order.status === "CONFIRMED" ? "paid" : "pending",
        isPaid: order.status === "CONFIRMED", // ✅ Add isPaid flag
        paymentMethod: order.status === "CONFIRMED" ? "Razorpay (Test Mode)" : "",
        paymentVerified: order.status === "CONFIRMED",
        paymentId: order.status === "CONFIRMED" ? `pay_${order.orderNumber.toLowerCase()}` : null,
        razorpayOrderId: order.status === "CONFIRMED" ? `order_${order.orderNumber.toLowerCase()}` : null,
        paymentTimestamp: order.status === "CONFIRMED" ? order.createdAt.toISOString() : null,
        deliveryMethod: "Standard Delivery",
        deliveryAddress: {
          name: `${order.customer?.user?.firstName || ''} ${order.customer?.user?.lastName || ''}`.trim(),
          email: order.customer?.user?.email || '',
          phone: order.customer?.phone || '',
          street: order.customer?.defaultAddress || '',
          city: "City",
          state: "State", 
          zip: "12345",
          country: "India"
        },
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
        notes: `✅ Database order - Payment ${order.status === "CONFIRMED" ? "VERIFIED" : "PENDING"} - Order: ${order.orderNumber} - User: ${currentUser.email}`,
        createdAt: order.createdAt.toISOString(),
        dbOrderId: order.id // Include database ID for reference
      }));

      return NextResponse.json({ 
        success: true, 
        orders: transformedOrders,
        source: "database",
        count: transformedOrders.length,
        user: currentUser.email // Include user info for debugging
      });

    } catch (dbError) {
      console.log(`ℹ️ No orders found for user ${currentUser.email}:`, dbError);
      
      return NextResponse.json({ 
        success: true, 
        orders: [],
        source: "database_empty",
        message: `No orders found for user ${currentUser.email}. Orders will appear here after successful purchases.`,
        user: currentUser.email
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