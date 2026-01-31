import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export const PATCH = requireRole("ADMIN")(
  async (request: NextRequest, { params }: any) => {
    try {
      const { id } = await params;
      const body = await request.json();
      const { published } = body;

      const product = await prisma.product.update({
        where: { id },
        data: { published },
        include: {
          vendor: {
            select: {
              companyName: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        product,
        message: `Product ${published ? "published" : "unpublished"} successfully`,
      });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || "Failed to update product status" },
        { status: 400 }
      );
    }
  }
);
