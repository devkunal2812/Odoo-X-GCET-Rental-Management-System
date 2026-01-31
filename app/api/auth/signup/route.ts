import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { hashPassword, generateToken, generateSecureToken, getTokenExpiry } from "@/app/lib/auth";
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

    // Generate email verification token
    const emailVerificationToken = generateSecureToken();
    const emailVerificationExpiry = getTokenExpiry(24); // 24 hours

    // Create user with profile based on role
    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash,
        role: data.role,
        emailVerificationToken,
        emailVerificationExpiry,
        ...(data.role === "VENDOR"
          ? {
              vendorProfile: {
                create: {
                  companyName: data.companyName!,
                  gstin: data.gstin,
                },
              },
            }
          : data.role === "CUSTOMER"
          ? {
              customerProfile: {
                create: {},
              },
            }
          : {}), // ADMIN has no profile
      },
      include: {
        vendorProfile: true,
        customerProfile: true,
      },
    });

    // TODO: Send verification email
    // For now, we'll just log the token
    console.log(`Email verification token for ${user.email}: ${emailVerificationToken}`);
    console.log(`Verification link: http://localhost:3000/api/auth/verify-email?token=${emailVerificationToken}`);

    // Generate JWT (but user can't login until email is verified)
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
      message: "Signup successful. Please verify your email to login.",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      verificationToken: emailVerificationToken, // Remove in production
    });

    // Don't set auth cookie until email is verified
    // response.cookies.set("auth_token", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "lax",
    //   maxAge: 60 * 60 * 24 * 7, // 7 days
    // });

    return response;
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error.message || "Signup failed" },
      { status: 400 }
    );
  }
}
