import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

/**
 * GET /api/reports/admin
 * 
 * Admin Reports & Dashboard
 * 
 * Query parameters:
 * - startDate: Filter from date (ISO string)
 * - endDate: Filter to date (ISO string)
 * - reportType: Type of report (revenue, products, vendors, orders)
 */
export const GET = requireRole("ADMIN")(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const reportType = searchParams.get("reportType") || "summary";

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
      case "revenue":
        return await getRevenueReport(dateFilter, hasDateFilter);
      
      case "products":
        return await getProductsReport(dateFilter, hasDateFilter);
      
      case "vendors":
        return await getVendorsReport(dateFilter, hasDateFilter);
      
      case "orders":
        return await getOrdersReport(dateFilter, hasDateFilter);
      
      case "summary":
      default:
        return await getSummaryReport(dateFilter, hasDateFilter);
    }
  } catch (error: any) {
    console.error("Admin reports error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate report" },
      { status: 500 }
    );
  }
});

/**
 * Summary Report - Overview of all metrics
 */
async function getSummaryReport(dateFilter: any, hasDateFilter: boolean) {
  const orderWhere = hasDateFilter ? { orderDate: dateFilter } : {};
  const invoiceWhere: any = hasDateFilter ? { invoiceDate: dateFilter } : {};

  const [
    totalOrders,
    totalRevenue,
    totalInvoices,
    totalPayments,
    totalVendors,
    totalCustomers,
    totalProducts,
    activeReservations,
  ] = await Promise.all([
    prisma.saleOrder.count({ where: orderWhere }),
    prisma.invoice.aggregate({
      where: { ...invoiceWhere, status: "POSTED" as const },
      _sum: { totalAmount: true },
    }),
    prisma.invoice.count({ where: invoiceWhere }),
    prisma.payment.aggregate({
      where: { status: "COMPLETED" as const },
      _sum: { amount: true },
    }),
    prisma.vendorProfile.count(),
    prisma.customerProfile.count(),
    prisma.product.count({ where: { published: true } }),
    prisma.reservation.count({
      where: {
        endDate: { gte: new Date() },
      },
    }),
  ]);

  // Get order status breakdown
  const ordersByStatus = await prisma.saleOrder.groupBy({
    by: ["status"],
    where: orderWhere,
    _count: { id: true },
  });

  // Get late returns
  const lateReturns = await prisma.saleOrder.count({
    where: {
      status: "PICKED_UP" as const,
      endDate: { lt: new Date() },
    },
  });

  return NextResponse.json({
    success: true,
    reportType: "summary",
    dateRange: hasDateFilter ? { start: dateFilter.gte, end: dateFilter.lte } : "all-time",
    metrics: {
      totalOrders,
      totalRevenue: totalRevenue._sum?.totalAmount || 0,
      totalInvoices,
      totalPayments: totalPayments._sum?.amount || 0,
      totalVendors,
      totalCustomers,
      totalProducts,
      activeReservations,
      lateReturns,
    },
    ordersByStatus: ordersByStatus.map(item => ({
      status: item.status,
      count: item._count.id,
    })),
  });
}

/**
 * Revenue Report - Detailed revenue analytics
 */
async function getRevenueReport(dateFilter: any, hasDateFilter: boolean) {
  const invoiceWhere: any = hasDateFilter 
    ? { invoiceDate: dateFilter, status: "POSTED" as const } 
    : { status: "POSTED" as const };

  const [
    totalRevenue,
    revenueByVendor,
    taxesCollected,
  ] = await Promise.all([
    prisma.invoice.aggregate({
      where: invoiceWhere,
      _sum: { totalAmount: true },
      _avg: { totalAmount: true },
      _count: true,
    }),
    prisma.invoice.findMany({
      where: invoiceWhere,
      include: {
        saleOrder: {
          include: {
            vendor: {
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
          },
        },
      },
    }),
    prisma.saleOrder.aggregate({
      where: hasDateFilter ? { orderDate: dateFilter } : {},
      _sum: { totalAmount: true, discount: true },
    }),
  ]);

  // Group revenue by vendor
  const vendorRevenue: Record<string, any> = {};
  revenueByVendor.forEach(invoice => {
    const vendorId = invoice.saleOrder.vendorId;
    const vendorName = invoice.saleOrder.vendor.companyName;
    
    if (!vendorRevenue[vendorId]) {
      vendorRevenue[vendorId] = {
        vendorId,
        vendorName,
        totalRevenue: 0,
        invoiceCount: 0,
      };
    }
    
    vendorRevenue[vendorId].totalRevenue += invoice.totalAmount;
    vendorRevenue[vendorId].invoiceCount += 1;
  });

  // Get GST percentage from settings
  const gstSetting = await prisma.systemSettings.findUnique({
    where: { key: "gst_percentage" },
  });
  const gstPercentage = gstSetting ? parseFloat(gstSetting.value) : 18;

  const totalAmount = totalRevenue._sum?.totalAmount || 0;
  const taxAmount = (totalAmount * gstPercentage) / (100 + gstPercentage);

  return NextResponse.json({
    success: true,
    reportType: "revenue",
    dateRange: hasDateFilter ? { start: dateFilter.gte, end: dateFilter.lte } : "all-time",
    summary: {
      totalRevenue: totalAmount,
      averageInvoiceValue: totalRevenue._avg?.totalAmount || 0,
      invoiceCount: totalRevenue._count || 0,
      taxesCollected: taxAmount,
      totalDiscounts: taxesCollected._sum?.discount || 0,
    },
    byVendor: Object.values(vendorRevenue).sort((a: any, b: any) => b.totalRevenue - a.totalRevenue),
  });
}

/**
 * Products Report - Most rented products
 */
async function getProductsReport(dateFilter: any, hasDateFilter: boolean) {
  const orderWhere = hasDateFilter ? { order: { orderDate: dateFilter } } : {};

  // Get most rented products
  const productStats = await prisma.saleOrderLine.groupBy({
    by: ["productId"],
    where: orderWhere,
    _sum: { quantity: true },
    _count: { id: true },
  });

  // Get product details
  const productIds = productStats.map(stat => stat.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: {
      vendor: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      inventory: true,
    },
  });

  const productMap = new Map(products.map(p => [p.id, p]));

  const productReport = productStats.map(stat => {
    const product = productMap.get(stat.productId);
    return {
      productId: stat.productId,
      productName: product?.name || "Unknown",
      vendorName: product?.vendor.companyName || "Unknown",
      totalRentals: stat._count.id,
      totalQuantityRented: stat._sum.quantity || 0,
      currentStock: product?.inventory?.quantityOnHand || 0,
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

/**
 * Vendors Report - Vendor performance
 */
async function getVendorsReport(dateFilter: any, hasDateFilter: boolean) {
  const orderWhere = hasDateFilter ? { orderDate: dateFilter } : {};

  const vendors = await prisma.vendorProfile.findMany({
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
        },
      },
      products: {
        select: {
          id: true,
          published: true,
        },
      },
      orders: {
        where: orderWhere,
        include: {
          invoices: {
            where: { status: "POSTED" },
          },
        },
      },
    },
  });

  const vendorReport = vendors.map(vendor => {
    const totalOrders = vendor.orders.length;
    const totalRevenue = vendor.orders.reduce((sum, order) => {
      const invoiceTotal = order.invoices.reduce((iSum, inv) => iSum + inv.totalAmount, 0);
      return sum + invoiceTotal;
    }, 0);

    return {
      vendorId: vendor.id,
      vendorName: vendor.companyName,
      email: vendor.user.email,
      gstin: vendor.gstin,
      joinedDate: vendor.user.createdAt,
      totalProducts: vendor.products.length,
      publishedProducts: vendor.products.filter(p => p.published).length,
      totalOrders,
      totalRevenue,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    };
  }).sort((a, b) => b.totalRevenue - a.totalRevenue);

  return NextResponse.json({
    success: true,
    reportType: "vendors",
    dateRange: hasDateFilter ? { start: dateFilter.gte, end: dateFilter.lte } : "all-time",
    vendors: vendorReport,
    totalVendors: vendorReport.length,
  });
}

/**
 * Orders Report - Order trends and analytics
 */
async function getOrdersReport(dateFilter: any, hasDateFilter: boolean) {
  const orderWhere = hasDateFilter ? { orderDate: dateFilter } : {};

  const [
    orders,
    ordersByStatus,
    lateReturns,
  ] = await Promise.all([
    prisma.saleOrder.findMany({
      where: orderWhere,
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
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { orderDate: "desc" },
      take: 100, // Limit to recent 100 orders
    }),
    prisma.saleOrder.groupBy({
      by: ["status"],
      where: orderWhere,
      _count: { id: true },
      _sum: { totalAmount: true },
    }),
    prisma.saleOrder.findMany({
      where: {
        status: "PICKED_UP",
        endDate: { lt: new Date() },
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
      },
    }),
  ]);

  return NextResponse.json({
    success: true,
    reportType: "orders",
    dateRange: hasDateFilter ? { start: dateFilter.gte, end: dateFilter.lte } : "all-time",
    summary: {
      totalOrders: orders.length,
      byStatus: ordersByStatus.map(item => ({
        status: item.status,
        count: item._count.id,
        totalValue: item._sum.totalAmount || 0,
      })),
      lateReturnsCount: lateReturns.length,
    },
    recentOrders: orders.slice(0, 20).map(order => ({
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: `${order.customer.user.firstName} ${order.customer.user.lastName}`,
      vendorName: order.vendor.companyName,
      status: order.status,
      totalAmount: order.totalAmount,
      orderDate: order.orderDate,
      itemCount: order.lines.length,
    })),
    lateReturns: lateReturns.map(order => ({
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: `${order.customer.user.firstName} ${order.customer.user.lastName}`,
      customerEmail: order.customer.user.email,
      expectedReturnDate: order.endDate,
      daysOverdue: Math.floor((Date.now() - order.endDate!.getTime()) / (1000 * 60 * 60 * 24)),
      lateFee: order.lateFee,
    })),
  });
}
