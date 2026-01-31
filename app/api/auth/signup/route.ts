import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { hashPassword, generateToken, generateSecureToken, getTokenExpiry } from "@/app/lib/auth";
import { signupSchema } from "@/app/lib/validation";
import { sendVerificationEmail } from "@/app/lib/email";

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

    // Send verification email
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${emailVerificationToken}`;
    
    try {
      const { sendEmail, getVerificationEmailHTML } = await import('@/app/lib/email');
      await sendEmail({
        to: user.email,
        subject: 'Verify Your Email - RentMarket',
        html: getVerificationEmailHTML(verificationLink, user.firstName),
      });
      console.log(`✅ Verification email sent to ${user.email}`);
    } catch (emailError: any) {
      console.error(`❌ Failed to send verification email to ${user.email}:`, emailError.message);
      // Don't fail the signup if email fails - user can request resend
    }
    
    // Also log to console for development
    console.log(`\n📧 Email Verification Required for ${user.email}`);
    console.log(`🔗 Verification link: ${verificationLink}`);
    console.log(`⏰ Token expires in 24 hours\n`);

    // Generate JWT (but user can't login until email is verified)
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    // Send verification email
    try {
      await sendVerificationEmail(
        user.email,
        `${user.firstName} ${user.lastName}`,
        emailVerificationToken
      );
      console.log(`✅ Verification email sent to ${user.email}`);
    } catch (emailError) {
      console.error('📧 Failed to send verification email:', emailError);
      // Don't fail the signup if email fails - user can request resend
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "SIGNUP",
        entity: "User",
        entityId: user.id,
        metadata: JSON.stringify({
          role: user.role,
          emailSent: true,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully! Please check your email for verification instructions.",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error.message || "Signup failed" },
      { status: 400 }
    );
  }
}
