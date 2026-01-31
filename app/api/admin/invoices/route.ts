import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

/**
 * GET /api/admin/invoices
 * 
 * Get all invoices with full details (Admin only)
 * 
 * Query parameters:
 * - status: Filter by status (DRAFT, POSTED)
 * - vendorId: Filter by vendor
 * - customerId: Filter by customer
 * - startDate: Filter from date
 * - endDate: Filter to date
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 */
export const GET = requireRole("ADMIN")(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const vendorId = searchParams.get("vendorId");
    const customerId = searchParams.get("customerId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.invoiceDate = {};
      if (startDate) where.invoiceDate.gte = new Date(startDate);
      if (endDate) where.invoiceDate.lte = new Date(endDate);
    }

    if (vendorId || customerId) {
      where.saleOrder = {};
      if (vendorId) where.saleOrder.vendorId = vendorId;
      if (customerId) where.saleOrder.customerId = customerId;
    }

    // Get system settings for tax calculation
    const gstSetting = await prisma.systemSettings.findUnique({
      where: { key: "gst_percentage" },
    });
    const gstPercentage = gstSetting ? parseFloat(gstSetting.value) : 18;

    const currencySetting = await prisma.systemSettings.findUnique({
      where: { key: "currency" },
    });
    const currency = currencySetting?.value || "INR";

    // Fetch invoices with all related data
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          saleOrder: {
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
          lines: {
            include: {
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
          payments: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { invoiceDate: "desc" },
      }),
      prisma.invoice.count({ where }),
    ]);

    // Format invoices with tax breakup
    const formattedInvoices = invoices.map(invoice => {
      const subtotal = invoice.totalAmount / (1 + gstPercentage / 100);
      const taxAmount = invoice.totalAmount - subtotal;
      const totalPaid = invoice.payments
        .filter(p => p.status === "COMPLETED")
        .reduce((sum, p) => sum + p.amount, 0);

      return {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        
        // Customer details
        customer: {
          id: invoice.saleOrder.customer.id,
          name: `${invoice.saleOrder.customer.user.firstName} ${invoice.saleOrder.customer.user.lastName}`,
          email: invoice.saleOrder.customer.user.email,
          phone: invoice.saleOrder.customer.phone,
          address: invoice.saleOrder.customer.defaultAddress,
        },
        
        // Vendor details
        vendor: {
          id: invoice.saleOrder.vendor.id,
          companyName: invoice.saleOrder.vendor.companyName,
          gstin: invoice.saleOrder.vendor.gstin,
          email: invoice.saleOrder.vendor.user.email,
          address: invoice.saleOrder.vendor.address,
        },
        
        // Rental period
        rentalPeriod: {
          startDate: invoice.saleOrder.startDate,
          endDate: invoice.saleOrder.endDate,
        },
        
        // Line items
        items: invoice.lines.map(line => ({
          productName: line.product.name,
          description: line.description,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          amount: line.amount,
        })),
        
        // Tax breakup
        taxBreakup: {
          subtotal: subtotal.toFixed(2),
          gstPercentage,
          gstAmount: taxAmount.toFixed(2),
          discount: invoice.saleOrder.discount,
          grandTotal: invoice.totalAmount.toFixed(2),
        },
        
        // Payment info
        paymentStatus: {
          totalAmount: invoice.totalAmount,
          totalPaid,
          balance: invoice.totalAmount - totalPaid,
          payments: invoice.payments.map(p => ({
            id: p.id,
            amount: p.amount,
            method: p.method,
            status: p.status,
            transactionRef: p.transactionRef,
            createdAt: p.createdAt,
          })),
        },
        
        currency,
      };
    });

    return NextResponse.json({
      success: true,
      invoices: formattedInvoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Admin invoices fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch invoices" },
      { status: 500 }
    );
  }
});
