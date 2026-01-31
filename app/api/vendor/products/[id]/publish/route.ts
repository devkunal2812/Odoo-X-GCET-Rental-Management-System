import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

/**
 * PATCH /api/vendor/products/:id/publish
 * 
 * Toggle product published status (vendor can publish their own products)
 */
export const PATCH = requireRole("VENDOR")(
  async (request: NextRequest, { params, user }: any) => {
    try {
      const { id } = await params;
      const body = await request.json();
      const { published } = body;

      // Verify product exists and belongs to vendor
      const existingProduct = await prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      // Verify ownership
      if (existingProduct.vendorId !== user.vendorProfile.id) {
        return NextResponse.json(
          { error: "You can only publish your own products" },
          { status: 403 }
        );
      }

      // Update product
      const product = await prisma.product.update({
        where: { id },
        data: { published },
        include: {
          vendor: {
            select: {
              companyName: true,
            },
          },
          pricing: {
            include: {
              rentalPeriod: true,
            },
          },
          inventory: true,
          variants: true,
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: published ? "PRODUCT_PUBLISHED" : "PRODUCT_UNPUBLISHED",
          entity: "Product",
          entityId: product.id,
        },
      });

      return NextResponse.json({
        success: true,
        product,
        message: `Product ${published ? "published" : "unpublished"} successfully`,
      });
    } catch (error: any) {
      console.error("Product publish error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to update product status" },
        { status: 400 }
      );
    }
  }
);
