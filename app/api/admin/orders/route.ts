import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getUserFromRequest } from '@/app/lib/auth';

// GET /api/admin/orders - Get all rental orders (admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');

    const where: any = {};
    if (status && status !== 'All' && status !== 'undefined') {
      where.status = status;
    }

    console.log('📊 Fetching orders with filter:', where);

    const orders = await prisma.saleOrder.findMany({
      where,
      include: {
        customer: {
          include: {
            user: true
          }
        },
        vendor: {
          include: {
            user: true
          }
        },
        lines: {
          include: {
            product: true,
            variant: true
          }
        },
        coupon: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    console.log(`✅ Found ${orders.length} orders`);

    // Transform data to match frontend format
    const transformedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: {
        id: order.customer.id,
        name: `${order.customer.user.firstName} ${order.customer.user.lastName}`,
        email: order.customer.user.email,
        phone: order.customer.phone || 'N/A',
        company: 'N/A' // Not in schema, can be added if needed
      },
      vendor: {
        id: order.vendor.id,
        name: order.vendor.companyName,
        email: order.vendor.user.email
      },
      products: order.lines.map(line => ({
        id: line.product.id,
        name: line.product.name,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        variant: line.variant ? line.variant.name : null
      })),
      status: order.status,
      startDate: order.startDate,
      endDate: order.endDate,
      pickupDate: order.pickupDate,
      actualReturnDate: order.actualReturnDate,
      orderDate: order.orderDate,
      totalAmount: order.totalAmount,
      discount: order.discount,
      lateFee: order.lateFee,
      coupon: order.coupon ? {
        code: order.coupon.code,
        discountType: order.coupon.discountType,
        value: order.coupon.value
      } : null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));

    return NextResponse.json({
      success: true,
      orders: transformedOrders,
      count: transformedOrders.length
    });
  } catch (error: any) {
    console.error('❌ Error fetching admin orders:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch orders',
        details: error.message
      },
      { status: 500 }
    );
  }
}
