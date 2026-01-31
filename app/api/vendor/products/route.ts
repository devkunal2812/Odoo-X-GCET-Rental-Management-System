import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { productSchema } from "@/app/lib/validation";

export const POST = requireRole("VENDOR")(async (request: NextRequest, { user }: any) => {
  try {
    const body = await request.json();
    const data = productSchema.parse(body);

    const product = await prisma.product.create({
      data: {
        vendorId: user.vendorProfile.id,
        name: data.name,
        description: data.description,
        productType: data.productType,
        isRentable: data.isRentable,
        pricing: {
          create: data.pricing,
        },
        inventory: {
          create: {
            quantityOnHand: data.quantityOnHand,
          },
        },
      },
      include: {
        pricing: {
          include: {
            rentalPeriod: true,
          },
        },
        inventory: true,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Product creation failed" },
      { status: 400 }
    );
  }
});
