import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

/**
 * GET /api/admin/invoices/[id]
 * 
 * Get single invoice with full details (Admin only)
 * 
 * Returns PDF-ready invoice structure with:
 * - Invoice number
 * - Customer details
 * - Vendor details
 * - Product & variant details
 * - Rental duration
 * - Pricing breakdown
 * - Tax calculation
 * - Grand total
 */
export const GET = requireRole("ADMIN")(
  async (request: NextRequest, { params }: any) => {
    try {
      const { id } = await params;

      // Get system settings
      const [gstSetting, currencySetting, companyNameSetting, companyGstinSetting, companyAddressSetting] = await Promise.all([
        prisma.systemSettings.findUnique({ where: { key: "gst_percentage" } }),
        prisma.systemSettings.findUnique({ where: { key: "currency" } }),
        prisma.systemSettings.findUnique({ where: { key: "company_name" } }),
        prisma.systemSettings.findUnique({ where: { key: "company_gstin" } }),
        prisma.systemSettings.findUnique({ where: { key: "company_address" } }),
      ]);

      const gstPercentage = gstSetting ? parseFloat(gstSetting.value) : 18;
      const currency = currencySetting?.value || "INR";

      // Fetch invoice with all related data
      const invoice = await prisma.invoice.findUnique({
        where: { id },
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
              lines: {
                include: {
                  product: {
                    select: {
                      name: true,
                      description: true,
                    },
                  },
                  variant: {
                    select: {
                      name: true,
                      sku: true,
                      priceModifier: true,
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
                  description: true,
                },
              },
            },
          },
          payments: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      if (!invoice) {
        return NextResponse.json(
          { error: "Invoice not found" },
          { status: 404 }
        );
      }

      // Calculate tax breakup
      const subtotal = invoice.totalAmount / (1 + gstPercentage / 100);
      const taxAmount = invoice.totalAmount - subtotal;
      
      // Calculate payment status
      const totalPaid = (invoice.payments || [])
        .filter((p) => p.status === "COMPLETED")
        .reduce((sum, p) => sum + p.amount, 0);
      const balance = invoice.totalAmount - totalPaid;

      // Calculate rental duration
      const startDate = invoice.saleOrder.startDate;
      const endDate = invoice.saleOrder.endDate;
      let rentalDuration = "";
      
      if (startDate && endDate) {
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        rentalDuration = `${days} day${days !== 1 ? 's' : ''}`;
      }

      // Format invoice for PDF generation
      const pdfReadyInvoice = {
        // Invoice header
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        status: invoice.status,
        currency,
        
        // Company/Platform details
        platform: {
          name: companyNameSetting?.value || "Rental Management System",
          gstin: companyGstinSetting?.value || "",
          address: companyAddressSetting?.value || "",
        },
        
        // Vendor details (Seller)
        vendor: {
          id: invoice.saleOrder.vendor.id,
          companyName: invoice.saleOrder.vendor.companyName,
          gstin: invoice.saleOrder.vendor.gstin || "N/A",
          address: invoice.saleOrder.vendor.address || "N/A",
          email: invoice.saleOrder.vendor.user.email,
          contactPerson: `${invoice.saleOrder.vendor.user.firstName} ${invoice.saleOrder.vendor.user.lastName}`,
        },
        
        // Customer details (Buyer)
        customer: {
          id: invoice.saleOrder.customer.id,
          name: `${invoice.saleOrder.customer.user.firstName} ${invoice.saleOrder.customer.user.lastName}`,
          email: invoice.saleOrder.customer.user.email,
          phone: invoice.saleOrder.customer.phone || "N/A",
          address: invoice.saleOrder.customer.defaultAddress || "N/A",
        },
        
        // Rental period
        rentalPeriod: {
          startDate: startDate,
          endDate: endDate,
          duration: rentalDuration,
        },
        
        // Order details
        orderDetails: {
          orderNumber: invoice.saleOrder.orderNumber,
          orderDate: invoice.saleOrder.orderDate,
          orderStatus: invoice.saleOrder.status,
        },
        
        // Line items with product and variant details
        items: invoice.lines.map((line, index) => {
          // Find corresponding order line for variant info
          const orderLine = invoice.saleOrder.lines.find(ol => ol.productId === line.productId);
          
          return {
            sno: index + 1,
            productName: line.product.name,
            productDescription: line.product.description || "",
            variantName: orderLine?.variant?.name || "Standard",
            variantSku: orderLine?.variant?.sku || "",
            variantPriceModifier: orderLine?.variant?.priceModifier || 0,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            amount: line.amount,
            description: line.description,
          };
        }),
        
        // Pricing breakdown
        pricingBreakdown: {
          subtotal: parseFloat(subtotal.toFixed(2)),
          discount: invoice.saleOrder.discount,
          subtotalAfterDiscount: parseFloat((subtotal - invoice.saleOrder.discount).toFixed(2)),
          taxRate: gstPercentage,
          taxAmount: parseFloat(taxAmount.toFixed(2)),
          grandTotal: parseFloat(invoice.totalAmount.toFixed(2)),
        },
        
        // Payment information
        paymentInfo: {
          totalAmount: invoice.totalAmount,
          totalPaid,
          balance,
          paymentStatus: balance === 0 ? "PAID" : totalPaid > 0 ? "PARTIALLY_PAID" : "UNPAID",
          payments: invoice.payments.map(payment => ({
            id: payment.id,
            amount: payment.amount,
            method: payment.method,
            status: payment.status,
            transactionRef: payment.transactionRef,
            date: payment.createdAt,
          })),
        },
        
        // Additional info
        notes: [
          "This is a computer-generated invoice.",
          "Payment is due within 30 days of invoice date.",
          "Late returns may incur additional charges.",
        ],
        
        // Terms and conditions
        terms: [
          "All rentals are subject to availability.",
          "Customer is responsible for any damage to rented items.",
          "Security deposit may be required for high-value items.",
          "Cancellation policy applies as per rental agreement.",
        ],
      };

      return NextResponse.json({
        success: true,
        invoice: pdfReadyInvoice,
      });
    } catch (error: any) {
      console.error("Invoice fetch error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to fetch invoice" },
        { status: 500 }
      );
    }
  }
);
