import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { emailVerificationSchema } from "@/app/lib/validation";
import { sendWelcomeEmail } from "@/app/lib/email";

/**
 * POST /api/auth/verify-email
 * 
 * Verify user email with token
 * 
 * Request body:
 * {
 *   "token": "verification-token-here"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = emailVerificationSchema.parse(body);

    // Find user with this token
    const user = await prisma.user.findUnique({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid verification token" },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (user.emailVerificationExpiry && user.emailVerificationExpiry < new Date()) {
      return NextResponse.json(
        { error: "Verification token has expired" },
        { status: 400 }
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email already verified" },
        { status: 400 }
      );
    }

    // Mark email as verified and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    // Send welcome email
    try {
      await sendWelcomeEmail(
        user.email,
        `${user.firstName} ${user.lastName}`,
        user.role
      );
      console.log(`✅ Welcome email sent to ${user.email}`);
    } catch (emailError) {
      console.error('📧 Failed to send welcome email:', emailError);
      // Don't fail the verification if welcome email fails
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "EMAIL_VERIFIED",
        entity: "User",
        entityId: user.id,
        metadata: JSON.stringify({
          verifiedAt: new Date().toISOString(),
          welcomeEmailSent: true,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully! You can now login to your account.",
    });
  } catch (error: any) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: error.message || "Email verification failed" },
      { status: 400 }
    );
  }
}

/**
 * GET /api/auth/verify-email?token=xxx
 * 
 * Alternative: Verify via query parameter (for email links)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      // Redirect to a verification page with error
      return NextResponse.redirect(
        new URL('/verify-email?error=missing-token', request.url)
      );
    }

    // Find user with this token
    const user = await prisma.user.findUnique({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      // Redirect to verification page with error
      return NextResponse.redirect(
        new URL('/verify-email?error=invalid-token', request.url)
      );
    }

    // Check if token is expired
    if (user.emailVerificationExpiry && user.emailVerificationExpiry < new Date()) {
      // Redirect to verification page with error
      return NextResponse.redirect(
        new URL('/verify-email?error=expired-token', request.url)
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      // Redirect to verification page with success message
      return NextResponse.redirect(
        new URL('/verify-email?success=already-verified', request.url)
      );
    }

    // Mark email as verified and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    // Send welcome email
    try {
      await sendWelcomeEmail(
        user.email,
        `${user.firstName} ${user.lastName}`,
        user.role
      );
      console.log(`✅ Welcome email sent to ${user.email}`);
    } catch (emailError) {
      console.error('📧 Failed to send welcome email:', emailError);
      // Don't fail the verification if welcome email fails
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "EMAIL_VERIFIED",
        entity: "User",
        entityId: user.id,
        metadata: JSON.stringify({
          verifiedAt: new Date().toISOString(),
          verifiedVia: 'email-link',
          welcomeEmailSent: true,
        }),
      },
    });

    // Redirect to success page
    return NextResponse.redirect(
      new URL('/verify-email?success=verified', request.url)
    );
  } catch (error: any) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(
      new URL('/verify-email?error=server-error', request.url)
    );
  }
}
