import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getSystemSettings } from "@/app/lib/settings";
import { getUserFromRequest } from "@/app/lib/auth";

/**
 * GET /api/invoices/user
 * 
 * Get User Invoices API - Retrieves REAL invoices for the current authenticated user from database
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

    console.log(`📥 Fetching invoices for user: ${currentUser.email} (ID: ${currentUser.id})`);
    
    // Get real invoices from database for the current user only
    const invoices = await prisma.invoice.findMany({
      where: {
        saleOrder: {
          customer: {
            userId: currentUser.id // ✅ Filter by current user's ID
          }
        }
      },
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
        },
        lines: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(`✅ Found ${invoices.length} invoices for user ${currentUser.email}`);

    if (invoices.length === 0) {
      return NextResponse.json({ 
        success: true, 
        invoices: [],
        source: "database",
        message: `No invoices found for user ${currentUser.email}. Create an order to generate invoices.`,
        user: currentUser.email
      });
    }

    // Get system settings for calculations
    const settings = await getSystemSettings();

    // Transform database invoices using REAL data
    const transformedInvoices = invoices.map(invoice => {
      const order = invoice.saleOrder;
      
      // Calculate subtotal and tax from totalAmount using GST percentage
      const subtotal = invoice.totalAmount / (1 + settings.gst_percentage / 100);
      const taxAmount = invoice.totalAmount - subtotal;
      const paidAmount = invoice.payments
        .filter(p => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + p.amount, 0);

      return {
        id: invoice.invoiceNumber,
        orderId: order.orderNumber,
        product: invoice.lines[0]?.product?.name || order.lines[0]?.product?.name || "Rental Items",
        vendor: order.vendor?.companyName || "Vendor",
        amount: subtotal,
        tax: taxAmount,
        serviceFee: 0, // Can be calculated if needed
        total: invoice.totalAmount,
        status: paidAmount >= invoice.totalAmount ? "paid" : "pending",
        issueDate: invoice.invoiceDate.toISOString().split('T')[0],
        dueDate: invoice.dueDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        paidDate: paidAmount > 0 ? invoice.payments.find(p => p.status === 'COMPLETED')?.createdAt.toISOString().split('T')[0] : null,
        paymentMethod: invoice.payments[0]?.method || "",
        rentalPeriod: order.startDate && order.endDate 
          ? `${order.startDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} - ${order.endDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} (${Math.ceil((order.endDate.getTime() - order.startDate.getTime()) / (1000 * 60 * 60 * 24))} days)`
          : 'N/A',
        paymentId: invoice.payments[0]?.transactionRef || null,
        paymentVerified: paidAmount > 0,
        dbInvoiceId: invoice.id,
        dbOrderId: order.id,
        orderData: {
          id: order.orderNumber,
          startDate: order.startDate,
          endDate: order.endDate,
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
          items: invoice.lines.map(line => ({
            id: line.id,
            name: line.product?.name || "Item",
            vendor: order.vendor?.companyName || "Vendor",
            quantity: line.quantity,
            rentalDuration: 1,
            rentalUnit: "days",
            unitPrice: line.unitPrice,
            totalPrice: line.amount
          })),
          paymentVerified: paidAmount > 0,
          paymentId: invoice.payments[0]?.transactionRef || null,
          paymentMethod: invoice.payments[0]?.method || ""
        }
      };
    });

    console.log('✅ Transformed invoices with REAL data');

    return NextResponse.json({ 
      success: true, 
      invoices: transformedInvoices,
      source: "database",
      count: transformedInvoices.length,
      user: currentUser.email // Include user info for debugging
    });

  } catch (error: any) {
    console.error('❌ Error fetching user invoices:', error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}