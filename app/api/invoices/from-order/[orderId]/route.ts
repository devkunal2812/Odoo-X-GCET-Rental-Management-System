import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { 
  getSystemSettings, 
  calculateGST, 
  calculatePlatformFee,
  getCompanyInfo 
} from "@/app/lib/settings";

export const POST = requireRole("VENDOR")(
  async (request: NextRequest, { params, user }: any) => {
    try {
      const { orderId } = await params;
      const order = await prisma.saleOrder.findUnique({
        where: { id: orderId },
        include: {
          lines: {
            include: {
              product: true,
            },
          },
          customer: {
            include: {
              user: true,
            },
          },
          vendor: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!order) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      if (order.vendorId !== user.vendorProfile.id) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        );
      }

      if (order.status !== "CONFIRMED") {
        return NextResponse.json(
          { error: "Order must be confirmed" },
          { status: 400 }
        );
      }

      // Get system settings
      const settings = await getSystemSettings();
      const companyInfo = await getCompanyInfo();

      // Calculate subtotal (before tax)
      const subtotal = order.totalAmount / (1 + settings.gst_percentage / 100);
      const taxAmount = order.totalAmount - subtotal;
      const platformFee = await calculatePlatformFee(subtotal);

      // Generate invoice number with prefix
      const invoiceNumber = `${settings.invoice_prefix}-${Date.now()}`;

      // Create invoice with detailed breakdown
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          saleOrderId: order.id,
          totalAmount: order.totalAmount,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          lines: {
            create: order.lines.map((line) => ({
              productId: line.productId,
              description: line.product.name,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              amount: line.unitPrice * line.quantity,
            })),
          },
        },
        include: {
          lines: {
            include: {
              product: true,
            },
          },
          saleOrder: {
            include: {
              customer: {
                include: {
                  user: true,
                },
              },
              vendor: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      // Update order status
      await prisma.saleOrder.update({
        where: { id: order.id },
        data: { status: "INVOICED" },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "INVOICE_CREATED",
          entity: "Invoice",
          entityId: invoice.id,
          metadata: JSON.stringify({
            orderId: order.id,
            orderNumber: order.orderNumber,
            totalAmount: invoice.totalAmount,
          }),
        },
      });

      // Return invoice with full details for PDF generation
      return NextResponse.json({
        success: true,
        invoice: {
          ...invoice,
          // Tax breakdown
          taxBreakup: {
            subtotal: subtotal.toFixed(2),
            gstPercentage: settings.gst_percentage,
            gstAmount: taxAmount.toFixed(2),
            platformFee: platformFee.toFixed(2),
            discount: order.discount,
            grandTotal: order.totalAmount.toFixed(2),
          },
          // Company details (from admin settings)
          companyInfo: {
            name: companyInfo.name,
            address: companyInfo.address,
            phone: companyInfo.phone,
            email: companyInfo.email,
            website: companyInfo.website,
            gstin: companyInfo.gstin,
          },
          // Vendor details
          vendorDetails: {
            companyName: order.vendor.companyName,
            gstin: order.vendor.gstin,
            address: order.vendor.address,
            email: order.vendor.user.email,
          },
          // Customer details
          customerDetails: {
            name: `${order.customer.user.firstName} ${order.customer.user.lastName}`,
            email: order.customer.user.email,
            phone: order.customer.phone,
            address: order.customer.defaultAddress,
          },
          // Rental details
          rentalPeriod: {
            startDate: order.startDate,
            endDate: order.endDate,
          },
          currency: settings.currency,
        },
      });
    } catch (error: any) {
      console.error("Invoice creation error:", error);
      return NextResponse.json(
        { error: error.message || "Invoice creation failed" },
        { status: 400 }
      );
    }
  }
);
