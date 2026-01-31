import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { generateSecureToken, getTokenExpiry } from "@/app/lib/auth";
import { sendVerificationEmail } from "@/app/lib/email";

/**
 * POST /api/auth/resend-verification
 * 
 * Resend email verification for unverified users
 * 
 * Request body:
 * {
 *   "email": "user@example.com"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        success: true,
        message: "If an account with this email exists and is unverified, a verification email has been sent.",
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email is already verified. You can login to your account." },
        { status: 400 }
      );
    }

    // Generate new verification token
    const emailVerificationToken = generateSecureToken();
    const emailVerificationExpiry = getTokenExpiry(24); // 24 hours

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken,
        emailVerificationExpiry,
      },
    });

    // Send verification email
    try {
      await sendVerificationEmail(
        user.email,
        `${user.firstName} ${user.lastName}`,
        emailVerificationToken
      );
      console.log(`✅ Verification email resent to ${user.email}`);
    } catch (emailError) {
      console.error('📧 Failed to resend verification email:', emailError);
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again later." },
        { status: 500 }
      );
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "VERIFICATION_RESENT",
        entity: "User",
        entityId: user.id,
        metadata: JSON.stringify({
          resentAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Verification email has been sent. Please check your inbox and spam folder.",
    });
  } catch (error: any) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to resend verification email" },
      { status: 500 }
    );
  }
}