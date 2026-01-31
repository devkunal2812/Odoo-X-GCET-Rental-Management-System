import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, requireAuth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { updateProfileSchema } from "@/app/lib/validation";

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

/**
 * PUT /api/users/me
 * 
 * Update user profile with role-based restrictions
 * 
 * Rules:
 * - CUSTOMER: Can update firstName, lastName, phone, address
 * - CUSTOMER: CANNOT update companyName, gstin
 * - VENDOR: Can update firstName, lastName, phone, address, companyName, gstin
 * - ADMIN: Can update firstName, lastName
 */
export const PUT = requireAuth(async (request: NextRequest, { user }: any) => {
  try {
    const body = await request.json();
    
    // Validate input
    const data = updateProfileSchema.parse(body);

    // Role-based validation
    if (user.role === "CUSTOMER") {
      if (data.companyName || data.gstin) {
        return NextResponse.json(
          { error: "Customers cannot update company name or GSTIN" },
          { status: 403 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    
    // Update basic user fields
    if (data.firstName) updateData.firstName = data.firstName;
    if (data.lastName) updateData.lastName = data.lastName;

    // Update role-specific profile
    if (user.role === "VENDOR" && user.vendorProfile) {
      const vendorUpdate: any = {};
      if (data.companyName) vendorUpdate.companyName = data.companyName;
      if (data.gstin) vendorUpdate.gstin = data.gstin;
      if (data.address) vendorUpdate.address = data.address;
      
      if (Object.keys(vendorUpdate).length > 0) {
        updateData.vendorProfile = {
          update: vendorUpdate,
        };
      }
    }

    if (user.role === "CUSTOMER" && user.customerProfile) {
      const customerUpdate: any = {};
      if (data.phone) customerUpdate.phone = data.phone;
      if (data.address) customerUpdate.defaultAddress = data.address;
      
      if (Object.keys(customerUpdate).length > 0) {
        updateData.customerProfile = {
          update: customerUpdate,
        };
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      include: {
        vendorProfile: true,
        customerProfile: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "PROFILE_UPDATED",
        entity: "User",
        entityId: user.id,
        metadata: JSON.stringify({
          updatedFields: Object.keys(data),
        }),
      },
    });

    return NextResponse.json({ 
      success: true, 
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
        vendorProfile: updatedUser.vendorProfile,
        customerProfile: updatedUser.customerProfile,
      },
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: error.message || "Update failed" },
      { status: 400 }
    );
  }
});
