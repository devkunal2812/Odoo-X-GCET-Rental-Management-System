import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { productUpdateSchema } from "@/app/lib/validation";

/**
 * GET /api/vendor/products/[id]
 * 
 * Get product details (vendor's own product)
 */
export const GET = requireRole("VENDOR")(
  async (request: NextRequest, { params, user }: any) => {
    try {
      const { id } = await params;

      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          pricing: {
            include: {
              rentalPeriod: true,
            },
          },
          inventory: true,
          variants: true,
          vendor: {
            select: {
              id: true,
              companyName: true,
            },
          },
        },
      });

      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      // Verify ownership
      if (product.vendorId !== user.vendorProfile.id) {
        return NextResponse.json(
          { error: "You can only view your own products" },
          { status: 403 }
        );
      }

      // Parse extraOptions from JSON string
      const productWithOptions = {
        ...product,
        extraOptions: product.extraOptions ? JSON.parse(product.extraOptions) : [],
      };

      return NextResponse.json({ success: true, product: productWithOptions });
    } catch (error: any) {
      console.error("Product fetch error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to fetch product" },
        { status: 500 }
      );
    }
  }
);

/**
 * PUT /api/vendor/products/[id]
 * 
 * Update product (vendor can only update their own products)
 * 
 * Rules:
 * - Only product owner can update
 * - Supports partial updates
 * - Can update: name, description, pricing, variants, extraOptions
 */
export const PUT = requireRole("VENDOR")(
  async (request: NextRequest, { params, user }: any) => {
    try {
      const { id } = await params;
      const body = await request.json();

      // Validate input
      const data = productUpdateSchema.parse(body);

      // Check if product exists and belongs to vendor
      const existingProduct = await prisma.product.findUnique({
        where: { id },
        include: {
          pricing: true,
          variants: true,
          inventory: true,
        },
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
          { error: "You can only update your own products" },
          { status: 403 }
        );
      }

      // Prepare update data
      const updateData: any = {};

      // Update basic fields
      if (data.name) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.productType) updateData.productType = data.productType;
      if (data.isRentable !== undefined) updateData.isRentable = data.isRentable;

      // Update extra options
      if (data.extraOptions) {
        updateData.extraOptions = JSON.stringify(data.extraOptions);
      }

      // Update pricing (replace all)
      if (data.pricing && data.pricing.length > 0) {
        // Delete existing pricing
        await prisma.productPricing.deleteMany({
          where: { productId: id },
        });
        
        updateData.pricing = {
          create: data.pricing,
        };
      }

      // Update variants (replace all)
      if (data.variants && data.variants.length > 0) {
        // Delete existing variants
        await prisma.productVariant.deleteMany({
          where: { productId: id },
        });
        
        updateData.variants = {
          create: data.variants.map(variant => ({
            name: variant.name,
            sku: variant.sku,
            priceModifier: variant.priceModifier || 0,
          })),
        };
      }

      // Update inventory quantity if provided
      if (data.quantityOnHand !== undefined) {
        if (existingProduct.inventory) {
          await prisma.inventory.update({
            where: { productId: id },
            data: { quantityOnHand: data.quantityOnHand },
          });
        } else {
          await prisma.inventory.create({
            data: {
              productId: id,
              quantityOnHand: data.quantityOnHand,
            },
          });
        }
      }

      // Update product
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: updateData,
        include: {
          pricing: {
            include: {
              rentalPeriod: true,
            },
          },
          inventory: true,
          variants: true,
          vendor: {
            select: {
              companyName: true,
            },
          },
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "PRODUCT_UPDATED",
          entity: "Product",
          entityId: id,
          metadata: JSON.stringify({
            updatedFields: Object.keys(data),
          }),
        },
      });

      // Parse extraOptions for response
      const productWithOptions = {
        ...updatedProduct,
        extraOptions: updatedProduct.extraOptions 
          ? JSON.parse(updatedProduct.extraOptions) 
          : [],
      };

      return NextResponse.json({ 
        success: true, 
        message: "Product updated successfully",
        product: productWithOptions,
      });
    } catch (error: any) {
      console.error("Product update error:", error);
      return NextResponse.json(
        { error: error.message || "Product update failed" },
        { status: 400 }
      );
    }
  }
);

/**
 * DELETE /api/vendor/products/[id]
 * 
 * Delete product (vendor can only delete their own products)
 */
export const DELETE = requireRole("VENDOR")(
  async (request: NextRequest, { params, user }: any) => {
    try {
      const { id } = await params;

      // Check if product exists and belongs to vendor
      const product = await prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      // Verify ownership
      if (product.vendorId !== user.vendorProfile.id) {
        return NextResponse.json(
          { error: "You can only delete your own products" },
          { status: 403 }
        );
      }

      // Check if product has active reservations
      const activeReservations = await prisma.reservation.count({
        where: {
          productId: id,
          endDate: { gte: new Date() },
        },
      });

      if (activeReservations > 0) {
        return NextResponse.json(
          { error: "Cannot delete product with active reservations" },
          { status: 400 }
        );
      }

      // Delete product (cascade will handle related records)
      await prisma.product.delete({
        where: { id },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "PRODUCT_DELETED",
          entity: "Product",
          entityId: id,
        },
      });

      return NextResponse.json({ 
        success: true, 
        message: "Product deleted successfully",
      });
    } catch (error: any) {
      console.error("Product deletion error:", error);
      return NextResponse.json(
        { error: error.message || "Product deletion failed" },
        { status: 400 }
      );
    }
  }
);
