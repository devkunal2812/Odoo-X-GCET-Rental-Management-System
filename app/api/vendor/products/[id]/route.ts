import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export const PUT = requireRole("VENDOR")(
  async (request: NextRequest, { params, user }: any) => {
    try {
      const { id } = await params;
      const body = await request.json();
      const { name, description, pricing, quantityOnHand } = body;

      const product = await prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      if (product.vendorId !== user.vendorProfile.id) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        );
      }

      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(quantityOnHand !== undefined && {
            inventory: {
              update: {
                quantityOnHand,
              },
            },
          }),
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

      return NextResponse.json({ success: true, product: updatedProduct });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || "Product update failed" },
        { status: 400 }
      );
    }
  }
);
