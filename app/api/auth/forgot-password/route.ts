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

    // TODO: Send password reset email
    // For now, we'll just log the token
    console.log(`Password reset token for ${user.email}: ${passwordResetToken}`);
    console.log(`Reset link: http://localhost:3000/api/auth/reset-password?token=${passwordResetToken}`);

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
