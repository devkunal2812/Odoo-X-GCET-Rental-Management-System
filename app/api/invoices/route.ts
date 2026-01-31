import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

/**
 * GET /api/invoices
 * 
 * Get all invoices for the authenticated user
 * - VENDOR: Gets invoices for their orders
 * - ADMIN: Gets all invoices
 */
export const GET = requireRole("VENDOR", "ADMIN")(
    async (request: NextRequest, { user }: any) => {
        try {
            const { searchParams } = new URL(request.url);
            const status = searchParams.get("status");
            const limit = parseInt(searchParams.get("limit") || "50");

            // Build where clause based on role
            const where: any = {};

            if (user.role === "VENDOR") {
                // Get invoices for orders belonging to this vendor
                where.saleOrder = {
                    vendorId: user.vendorProfile.id
                };
            }

            if (status) {
                where.status = status;
            }

            const invoices = await prisma.invoice.findMany({
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
                orderBy: { invoiceDate: "desc" },
                take: limit,
            });

            // Get system settings for tax
            const gstSetting = await prisma.systemSettings.findUnique({
                where: { key: "gst_percentage" },
            });
            const gstPercentage = gstSetting ? parseFloat(gstSetting.value) : 18;

            // Transform invoices to include computed fields
            const transformedInvoices = invoices.map((invoice) => {
                const subtotal = invoice.totalAmount / (1 + gstPercentage / 100);
                const taxAmount = invoice.totalAmount - subtotal;
                const paidAmount = invoice.payments
                    .filter((p) => p.status === "COMPLETED")
                    .reduce((sum, p) => sum + p.amount, 0);

                return {
                    ...invoice,
                    subtotal: subtotal.toFixed(2),
                    taxAmount: taxAmount.toFixed(2),
                    paidAmount,
                    balanceDue: invoice.totalAmount - paidAmount,
                };
            });

            return NextResponse.json({
                success: true,
                invoices: transformedInvoices,
            });
        } catch (error: any) {
            console.error("Error fetching invoices:", error);
            return NextResponse.json(
                { error: error.message || "Failed to fetch invoices" },
                { status: 500 }
            );
        }
    }
);
