import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { updateUserRoleSchema } from "@/app/lib/validation";

export const GET = requireRole("ADMIN")(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          vendorProfile: {
            select: {
              companyName: true,
              gstin: true,
            },
          },
          customerProfile: {
            select: {
              phone: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/admin/users
 * 
 * Update user role (Admin only)
 * 
 * Request body:
 * {
 *   "userId": "user-id",
 *   "role": "VENDOR" | "CUSTOMER" | "ADMIN"
 * }
 */
export const PUT = requireRole("ADMIN")(
  async (request: NextRequest, { user }: any) => {
    try {
      const body = await request.json();
      const { userId, role } = updateUserRoleSchema.parse(body);

      // Get current user data
      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          vendorProfile: true,
          customerProfile: true,
        },
      });

      if (!targetUser) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      // Prevent changing own role
      if (userId === user.id) {
        return NextResponse.json(
          { error: "Cannot change your own role" },
          { status: 400 }
        );
      }

      const oldRole = targetUser.role;

      // Update user role
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role },
        include: {
          vendorProfile: true,
          customerProfile: true,
        },
      });

      // Handle profile creation/deletion based on role change
      if (role === "VENDOR" && !targetUser.vendorProfile) {
        // Create vendor profile if changing to VENDOR
        await prisma.vendorProfile.create({
          data: {
            userId: userId,
            companyName: `${targetUser.firstName} ${targetUser.lastName}'s Company`,
          },
        });
      } else if (role === "CUSTOMER" && !targetUser.customerProfile) {
        // Create customer profile if changing to CUSTOMER
        await prisma.customerProfile.create({
          data: {
            userId: userId,
          },
        });
      }

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "USER_ROLE_CHANGED",
          entity: "User",
          entityId: userId,
          metadata: JSON.stringify({
            oldRole,
            newRole: role,
            changedBy: user.email,
          }),
        },
      });

      return NextResponse.json({
        success: true,
        message: `User role updated from ${oldRole} to ${role}`,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          role: updatedUser.role,
        },
      });
    } catch (error: any) {
      console.error("Role update error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to update user role" },
        { status: 400 }
      );
    }
  }
);
