import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

/**
 * GET /api/invoices/user
 * 
 * Get User Invoices API - Retrieves invoices for the current user
 * Loads invoices from database and transforms them for frontend
 */
export async function GET(request: NextRequest) {
  try {
    // In production, you would get the user ID from authentication
    // For now, we'll return all invoices from database
    
    try {
      const invoices = await prisma.invoice.findMany({
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

      // Transform database invoices to match frontend format
      const transformedInvoices = invoices.map(invoice => {
        const order = invoice.saleOrder;
        const subtotal = invoice.totalAmount;
        const tax = subtotal * 0.18; // 18% GST
        const serviceFee = subtotal * 0.05; // 5% service fee
        const total = subtotal + tax + serviceFee;

        return {
          id: invoice.invoiceNumber,
          orderId: order.orderNumber,
          product: order.lines[0]?.product?.name || "Rental Items",
          vendor: order.vendor?.companyName || "Vendor",
          amount: subtotal,
          tax: tax,
          serviceFee: serviceFee,
          total: total,
          status: invoice.status.toLowerCase() === "posted" ? "paid" : "pending",
          issueDate: invoice.invoiceDate.toISOString().split('T')[0],
          dueDate: invoice.dueDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
          paidDate: invoice.status === "POSTED" ? invoice.invoiceDate.toISOString().split('T')[0] : null,
          paymentMethod: invoice.status === "POSTED" ? "Razorpay (Test Mode)" : "",
          rentalPeriod: order.startDate && order.endDate 
            ? `${order.startDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} - ${order.endDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} (${Math.ceil((order.endDate.getTime() - order.startDate.getTime()) / (1000 * 60 * 60 * 24))} days)`
            : 'N/A',
          paymentId: `pay_${invoice.invoiceNumber.toLowerCase()}`,
          razorpayOrderId: `order_${invoice.invoiceNumber.toLowerCase()}`,
          paymentVerified: invoice.status === "POSTED",
          dbInvoiceId: invoice.id,
          dbOrderId: order.id,
          orderData: {
            id: order.orderNumber,
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
            paymentVerified: invoice.status === "POSTED",
            paymentId: `pay_${invoice.invoiceNumber.toLowerCase()}`,
            paymentMethod: "Razorpay (Test Mode)"
          }
        };
      });

      return NextResponse.json({ 
        success: true, 
        invoices: transformedInvoices,
        source: "database",
        count: transformedInvoices.length
      });

    } catch (dbError) {
      console.log('Database not available or no invoices found, returning empty array');
      
      return NextResponse.json({ 
        success: true, 
        invoices: [],
        source: "database_empty",
        message: "No invoices found in database. Invoices are currently stored in localStorage."
      });
    }

  } catch (error: any) {
    console.error('Error fetching user invoices:', error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}