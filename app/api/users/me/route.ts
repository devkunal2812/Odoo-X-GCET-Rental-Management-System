import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, requireAuth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export const GET = requireAuth(async (request: NextRequest, { user }: any) => {
  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      vendorProfile: user.vendorProfile,
      customerProfile: user.customerProfile,
    },
  });
});

export const PUT = requireAuth(async (request: NextRequest, { user }: any) => {
  try {
    const body = await request.json();
    const { firstName, lastName, phone, address, companyName, gstin } = body;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(user.role === "VENDOR" && user.vendorProfile && {
          vendorProfile: {
            update: {
              ...(companyName && { companyName }),
              ...(gstin && { gstin }),
              ...(address && { address }),
            },
          },
        }),
        ...(user.role === "CUSTOMER" && user.customerProfile && {
          customerProfile: {
            update: {
              ...(phone && { phone }),
              ...(address && { defaultAddress: address }),
            },
          },
        }),
      },
      include: {
        vendorProfile: true,
        customerProfile: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Update failed" },
      { status: 400 }
    );
  }
});
