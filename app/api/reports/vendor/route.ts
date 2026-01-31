import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

/**
 * GET /api/reports/vendor
 * 
 * Vendor Reports & Dashboard
 * 
 * Query parameters:
 * - startDate: Filter from date (ISO string)
 * - endDate: Filter to date (ISO string)
 * - reportType: Type of report (earnings, bookings, products)
 */
export const GET = requireRole("VENDOR")(async (request: NextRequest, { user }: any) => {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const reportType = searchParams.get("reportType") || "summary";

    const vendorId = user.vendorProfile.id;

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    const hasDateFilter = Object.keys(dateFilter).length > 0;

    // Generate different reports based on type
    switch (reportType) {
      case "earnings":
        return await getEarningsReport(vendorId, dateFilter, hasDateFilter);
      
      case "bookings":
        return await getBookingsReport(vendorId, dateFilter, hasDateFilter);
      
      case "products":
        return await getProductsReport(vendorId, dateFilter, hasDateFilter);
      
      case "summary":
      default:
        return await getSummaryReport(vendorId, dateFilter, hasDateFilter);
    }
  } catch (error: any) {
    console.error("Vendor reports error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate report" },
      { status: 500 }
    );
  }
});

/**
 * Summary Report - Overview of vendor metrics
 */
async function getSummaryReport(vendorId: string, dateFilter: any, hasDateFilter: boolean) {
  const orderWhere = hasDateFilter 
    ? { vendorId, orderDate: dateFilter } 
    : { vendorId };

  const [
    totalOrders,
    totalEarnings,
    totalProducts,
    publishedProducts,
    upcomingPickups,
    upcomingReturns,
  ] = await Promise.all([
    prisma.saleOrder.count({ where: orderWhere }),
    prisma.invoice.aggregate({
      where: {
        saleOrder: orderWhere,
        status: "POSTED",
      },
      _sum: { totalAmount: true },
    }),
    prisma.product.count({ where: { vendorId } }),
    prisma.product.count({ where: { vendorId, published: true } }),
    prisma.saleOrder.count({
      where: {
        vendorId,
        status: "CONFIRMED",
        startDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
        },
      },
    }),
    prisma.saleOrder.count({
      where: {
        vendorId,
        status: "PICKED_UP",
        endDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
        },
      },
    }),
  ]);

  // Get order status breakdown
  const ordersByStatus = await prisma.saleOrder.groupBy({
    by: ["status"],
    where: orderWhere,
    _count: { id: true },
  });

  return NextResponse.json({
    success: true,
    reportType: "summary",
    dateRange: hasDateFilter ? { start: dateFilter.gte, end: dateFilter.lte } : "all-time",
    metrics: {
      totalOrders,
      totalEarnings: totalEarnings._sum.totalAmount || 0,
      totalProducts,
      publishedProducts,
      upcomingPickups,
      upcomingReturns,
    },
    ordersByStatus: ordersByStatus.map(item => ({
      status: item.status,
      count: item._count.id,
    })),
  });
}

/**
 * Earnings Report - Revenue by product and period
 */
async function getEarningsReport(vendorId: string, dateFilter: any, hasDateFilter: boolean) {
  const orderWhere = hasDateFilter 
    ? { vendorId, orderDate: dateFilter } 
    : { vendorId };

  const [
    invoices,
    payments,
  ] = await Promise.all([
    prisma.invoice.findMany({
      where: {
        saleOrder: orderWhere,
        status: "POSTED",
      },
      include: {
        saleOrder: {
          include: {
            lines: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        payments: true,
      },
    }),
    prisma.payment.aggregate({
      where: {
        invoice: {
          saleOrder: orderWhere,
        },
        status: "COMPLETED",
      },
      _sum: { amount: true },
    }),
  ]);

  // Calculate earnings by product
  const productEarnings: Record<string, any> = {};
  
  invoices.forEach(invoice => {
    invoice.saleOrder.lines.forEach(line => {
      const productId = line.productId;
      const productName = line.product.name;
      const lineAmount = line.unitPrice * line.quantity;
      
      if (!productEarnings[productId]) {
        productEarnings[productId] = {
          productId,
          productName,
          totalEarnings: 0,
          rentalCount: 0,
        };
      }
      
      productEarnings[productId].totalEarnings += lineAmount;
      productEarnings[productId].rentalCount += 1;
    });
  });

  const totalEarnings = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalPaid = payments._sum.amount || 0;
  const pendingPayments = totalEarnings - totalPaid;

  return NextResponse.json({
    success: true,
    reportType: "earnings",
    dateRange: hasDateFilter ? { start: dateFilter.gte, end: dateFilter.lte } : "all-time",
    summary: {
      totalEarnings,
      totalPaid,
      pendingPayments,
      invoiceCount: invoices.length,
      averageInvoiceValue: invoices.length > 0 ? totalEarnings / invoices.length : 0,
    },
    byProduct: Object.values(productEarnings).sort((a: any, b: any) => b.totalEarnings - a.totalEarnings),
  });
}

/**
 * Bookings Report - Upcoming and past bookings
 */
async function getBookingsReport(vendorId: string, dateFilter: any, hasDateFilter: boolean) {
  const orderWhere = hasDateFilter 
    ? { vendorId, orderDate: dateFilter } 
    : { vendorId };

  const [
    upcomingPickups,
    upcomingReturns,
    recentOrders,
  ] = await Promise.all([
    prisma.saleOrder.findMany({
      where: {
        vendorId,
        status: "CONFIRMED",
        startDate: { gte: new Date() },
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
        lines: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { startDate: "asc" },
      take: 20,
    }),
    prisma.saleOrder.findMany({
      where: {
        vendorId,
        status: "PICKED_UP",
        endDate: { gte: new Date() },
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
        lines: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { endDate: "asc" },
      take: 20,
    }),
    prisma.saleOrder.findMany({
      where: orderWhere,
      include: {
        customer: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { orderDate: "desc" },
      take: 50,
    }),
  ]);

  return NextResponse.json({
    success: true,
    reportType: "bookings",
    dateRange: hasDateFilter ? { start: dateFilter.gte, end: dateFilter.lte } : "all-time",
    upcomingPickups: upcomingPickups.map(order => ({
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: `${order.customer.user.firstName} ${order.customer.user.lastName}`,
      customerEmail: order.customer.user.email,
      pickupDate: order.startDate,
      returnDate: order.endDate,
      totalAmount: order.totalAmount,
      items: order.lines.map(line => ({
        product: line.product.name,
        quantity: line.quantity,
      })),
    })),
    upcomingReturns: upcomingReturns.map(order => ({
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: `${order.customer.user.firstName} ${order.customer.user.lastName}`,
      customerEmail: order.customer.user.email,
      returnDate: order.endDate,
      pickupDate: order.pickupDate,
      totalAmount: order.totalAmount,
      items: order.lines.map(line => ({
        product: line.product.name,
        quantity: line.quantity,
      })),
    })),
    recentOrders: recentOrders.map(order => ({
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: `${order.customer.user.firstName} ${order.customer.user.lastName}`,
      status: order.status,
      totalAmount: order.totalAmount,
      orderDate: order.orderDate,
    })),
  });
}

/**
 * Products Report - Product performance
 */
async function getProductsReport(vendorId: string, dateFilter: any, hasDateFilter: boolean) {
  const orderWhere = hasDateFilter 
    ? { order: { vendorId, orderDate: dateFilter } } 
    : { order: { vendorId } };

  // Get rental statistics by product
  const productStats = await prisma.saleOrderLine.groupBy({
    by: ["productId"],
    where: orderWhere,
    _sum: { quantity: true },
    _count: { id: true },
  });

  // Get product details
  const productIds = productStats.map(stat => stat.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, vendorId },
    include: {
      inventory: true,
      pricing: {
        include: {
          rentalPeriod: true,
        },
      },
    },
  });

  const productMap = new Map(products.map(p => [p.id, p]));

  const productReport = productStats.map(stat => {
    const product = productMap.get(stat.productId);
    const totalRentals = stat._count.id;
    const totalQuantityRented = stat._sum.quantity || 0;
    const currentStock = product?.inventory?.quantityOnHand || 0;
    
    // Calculate utilization rate
    const utilizationRate = currentStock > 0 
      ? ((totalQuantityRented / (currentStock * (hasDateFilter ? 30 : 365))) * 100).toFixed(2)
      : 0;

    return {
      productId: stat.productId,
      productName: product?.name || "Unknown",
      totalRentals,
      totalQuantityRented,
      currentStock,
      utilizationRate: parseFloat(utilizationRate as string),
      published: product?.published || false,
      pricing: product?.pricing.map(p => ({
        period: p.rentalPeriod.name,
        price: p.price,
      })) || [],
    };
  }).sort((a, b) => b.totalRentals - a.totalRentals);

  return NextResponse.json({
    success: true,
    reportType: "products",
    dateRange: hasDateFilter ? { start: dateFilter.gte, end: dateFilter.lte } : "all-time",
    products: productReport,
    totalProducts: productReport.length,
  });
}
