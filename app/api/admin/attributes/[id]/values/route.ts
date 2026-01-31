import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { z } from "zod";

const attributeValueSchema = z.object({
  values: z.array(z.string().min(1)),
});

/**
 * POST /api/admin/attributes/[id]/values
 * 
 * Add new values to an existing attribute
 * 
 * This allows extending attribute options without recreating the attribute.
 * For example, adding new colors to the Color attribute.
 * 
 * Request body:
 * {
 *   "values": ["Yellow", "Purple"]
 * }
 */
export const POST = requireRole("ADMIN")(
  async (request: NextRequest, { params }: any) => {
    try {
      const { id } = await params;
      const body = await request.json();
      const data = attributeValueSchema.parse(body);

      // Check if attribute exists
      const attribute = await prisma.attribute.findUnique({
        where: { id },
        include: { values: true },
      });

      if (!attribute) {
        return NextResponse.json(
          { error: "Attribute not found" },
          { status: 404 }
        );
      }

      // Check for duplicate values
      const existingValues = attribute.values.map((v) => v.value.toLowerCase());
      const duplicates = data.values.filter((v) =>
        existingValues.includes(v.toLowerCase())
      );

      if (duplicates.length > 0) {
        return NextResponse.json(
          { error: `Values already exist: ${duplicates.join(", ")}` },
          { status: 400 }
        );
      }

      // Add new values
      const newValues = await Promise.all(
        data.values.map((value) =>
          prisma.attributeValue.create({
            data: {
              attributeId: id,
              value,
            },
          })
        )
      );

      return NextResponse.json({
        success: true,
        message: `Added ${newValues.length} new values to ${attribute.name}`,
        values: newValues,
      });
    } catch (error: any) {
      console.error("Attribute value creation error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to add attribute values" },
        { status: 400 }
      );
    }
  }
);

/**
 * GET /api/admin/attributes/[id]/values
 * 
 * Get all values for a specific attribute
 */
export const GET = requireRole("ADMIN")(
  async (request: NextRequest, { params }: any) => {
    try {
      const { id } = await params;

      const attribute = await prisma.attribute.findUnique({
        where: { id },
        include: {
          values: {
            orderBy: { value: "asc" },
          },
        },
      });

      if (!attribute) {
        return NextResponse.json(
          { error: "Attribute not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        attribute,
      });
    } catch (error: any) {
      console.error("Attribute values fetch error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to fetch attribute values" },
        { status: 500 }
      );
    }
  }
);
