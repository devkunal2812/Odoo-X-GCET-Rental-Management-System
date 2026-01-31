import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { hashPassword, generateToken } from "@/app/lib/auth";
import { signupSchema } from "@/app/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = signupSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Validate coupon if provided
    let coupon = null;
    if (data.couponCode) {
      coupon = await prisma.coupon.findFirst({
        where: {
          code: data.couponCode,
          isActive: true,
          validFrom: { lte: new Date() },
          validTo: { gte: new Date() },
        },
      });
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash,
        role: data.role,
        ...(data.role === "VENDOR"
          ? {
              vendorProfile: {
                create: {
                  companyName: data.companyName,
                  gstin: data.gstin,
                },
              },
            }
          : {
              customerProfile: {
                create: {},
              },
            }),
      },
      include: {
        vendorProfile: true,
        customerProfile: true,
      },
    });

    // Generate JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "SIGNUP",
        entity: "User",
        entityId: user.id,
      },
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error.message || "Signup failed" },
      { status: 400 }
    );
  }
}
