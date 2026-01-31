import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { z } from "zod";

const attributeSchema = z.object({
  name: z.string().min(1),
  displayType: z.enum(["RADIO", "PILLS", "CHECKBOX"]).default("RADIO"),
  values: z.array(z.string()).optional(),
});

/**
 * POST /api/admin/attributes
 * 
 * Create a new product attribute (e.g., Color, Brand, Size)
 * 
 * Attributes are global and can be reused across products.
 * Each attribute can have multiple values (e.g., Color: Red, Blue, Green)
 * 
 * Request body:
 * {
 *   "name": "Color",
 *   "displayType": "PILLS",
 *   "values": ["Red", "Blue", "Green"]
 * }
 */
export const POST = requireRole("ADMIN")(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const data = attributeSchema.parse(body);

    // Check if attribute already exists
    const existing = await prisma.attribute.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Attribute '${data.name}' already exists` },
        { status: 400 }
      );
    }

    // Create attribute with values
    const attribute = await prisma.attribute.create({
      data: {
        name: data.name,
        displayType: data.displayType,
        values: data.values
          ? {
              create: data.values.map((value) => ({ value })),
            }
          : undefined,
      },
      include: {
        values: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Attribute created successfully",
      attribute,
    });
  } catch (error: any) {
    console.error("Attribute creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create attribute" },
      { status: 400 }
    );
  }
});

/**
 * GET /api/admin/attributes
 * 
 * Get all attributes with their values
 */
export const GET = requireRole("ADMIN")(async (request: NextRequest) => {
  try {
    const attributes = await prisma.attribute.findMany({
      include: {
        values: {
          orderBy: { value: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      attributes,
    });
  } catch (error: any) {
    console.error("Attributes fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch attributes" },
      { status: 500 }
    );
  }
});
