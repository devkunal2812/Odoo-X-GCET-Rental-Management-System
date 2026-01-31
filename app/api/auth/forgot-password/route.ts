import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { generateSecureToken, getTokenExpiry } from "@/app/lib/auth";
import { forgotPasswordSchema } from "@/app/lib/validation";

/**
 * POST /api/auth/forgot-password
 * 
 * Request password reset
 * 
 * Request body:
 * {
 *   "email": "user@example.com"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent.",
      });
    }

    // Generate reset token
    const passwordResetToken = generateSecureToken();
    const passwordResetExpiry = getTokenExpiry(1); // 1 hour expiry for password reset

    // Save token to user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken,
        passwordResetExpiry,
      },
    });

    // Send password reset email
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${passwordResetToken}`;
    
    try {
      const { sendEmail, getPasswordResetEmailHTML } = await import('@/app/lib/email');
      await sendEmail({
        to: user.email,
        subject: 'Reset Your Password - RentMarket',
        html: getPasswordResetEmailHTML(resetLink, user.firstName),
      });
      console.log(`✅ Password reset email sent to ${user.email}`);
    } catch (emailError: any) {
      console.error(`❌ Failed to send password reset email to ${user.email}:`, emailError.message);
      // Don't fail the request if email fails
    }
    
    // Also log to console for development
    console.log(`\n🔐 Password Reset Requested for ${user.email}`);
    console.log(`🔗 Reset link: ${resetLink}`);
    console.log(`⏰ Token expires in 1 hour\n`);

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "PASSWORD_RESET_REQUESTED",
        entity: "User",
        entityId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent.",
      resetToken: passwordResetToken, // Remove in production
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: error.message || "Password reset request failed" },
      { status: 400 }
    );
  }
}
