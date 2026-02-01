import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { productSchema } from "@/app/lib/validation";

export const POST = requireRole("VENDOR")(async (request: NextRequest, { user }: any) => {
  try {
    const body = await request.json();
    const data = productSchema.parse(body);

    // Prepare extra options as JSON string
    const extraOptions = data.extraOptions ? JSON.stringify(data.extraOptions) : "[]";

    const product = await prisma.product.create({
      data: {
        vendorId: user.vendorProfile.id,
        name: data.name,
        description: data.description,
        productType: data.productType,
        category: data.category, // Add category field
        isRentable: data.isRentable,
        extraOptions,
        pricing: {
          create: data.pricing,
        },
        inventory: {
          create: {
            quantityOnHand: data.quantityOnHand,
          },
        },
        // Create variants if provided
        ...(data.variants && data.variants.length > 0 ? {
          variants: {
            create: data.variants.map(variant => ({
              name: variant.name,
              sku: variant.sku,
              priceModifier: variant.priceModifier,
            })),
          },
        } : {}),
      },
      include: {
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
        action: "PRODUCT_CREATED",
        entity: "Product",
        entityId: product.id,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("Product creation error:", error);
    return NextResponse.json(
      { error: error.message || "Product creation failed" },
      { status: 400 }
    );
  }
});
