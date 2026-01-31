import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME || 'RentMarket'}" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    });

    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

// Email Templates

export function getVerificationEmailHTML(verificationLink: string, firstName: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">RentMarket</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9;">Multi-vendor Rental Marketplace</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Welcome, ${firstName}!</h2>
              <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                Thank you for signing up with RentMarket. To complete your registration and start renting amazing products, please verify your email address.
              </p>
              <p style="color: #666666; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                Click the button below to verify your email:
              </p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${verificationLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #999999; line-height: 1.6; margin: 30px 0 0 0; font-size: 14px;">
                Or copy and paste this link into your browser:
              </p>
              <p style="color: #667eea; line-height: 1.6; margin: 10px 0 0 0; font-size: 14px; word-break: break-all;">
                ${verificationLink}
              </p>
              
              <p style="color: #999999; line-height: 1.6; margin: 30px 0 0 0; font-size: 14px;">
                This link will expire in 24 hours for security reasons.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #999999; margin: 0 0 10px 0; font-size: 14px;">
                If you didn't create an account with RentMarket, you can safely ignore this email.
              </p>
              <p style="color: #999999; margin: 0; font-size: 12px;">
                © 2024 RentMarket. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function getPasswordResetEmailHTML(resetLink: string, firstName: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">RentMarket</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9;">Password Reset Request</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Hello, ${firstName}</h2>
              <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                We received a request to reset your password for your RentMarket account.
              </p>
              <p style="color: #666666; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                Click the button below to reset your password:
              </p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${resetLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #999999; line-height: 1.6; margin: 30px 0 0 0; font-size: 14px;">
                Or copy and paste this link into your browser:
              </p>
              <p style="color: #667eea; line-height: 1.6; margin: 10px 0 0 0; font-size: 14px; word-break: break-all;">
                ${resetLink}
              </p>
              
              <p style="color: #999999; line-height: 1.6; margin: 30px 0 0 0; font-size: 14px;">
                This link will expire in 1 hour for security reasons.
              </p>
              
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 30px 0 0 0; border-radius: 4px;">
                <p style="color: #856404; margin: 0; font-size: 14px; line-height: 1.6;">
                  <strong>Security Notice:</strong> If you didn't request a password reset, please ignore this email or contact support if you have concerns about your account security.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #999999; margin: 0 0 10px 0; font-size: 14px;">
                Need help? Contact us at support@rentmarket.com
              </p>
              <p style="color: #999999; margin: 0; font-size: 12px;">
                © 2024 RentMarket. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Helper function to send verification email
export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
  
  // Always log the verification link for development
  console.log('\n🔗 ===== VERIFICATION LINK =====');
  console.log('🔗 User:', name);
  console.log('🔗 Email:', email);
  console.log('🔗 Link:', verificationLink);
  console.log('🔗 Token:', token);
  console.log('🔗 =============================\n');
  
  const html = getVerificationEmailHTML(verificationLink, name);
  const text = `Welcome to RentMarket, ${name}! Please verify your email by visiting: ${verificationLink}`;
  
  return await sendEmail({
    to: email,
    subject: 'Verify Your Email - RentMarket',
    html,
    text
  });
}

// Helper function to send welcome email after verification
export async function sendWelcomeEmail(email: string, name: string, role: string) {
  console.log('\n📧 ===== SENDING WELCOME EMAIL =====');
  console.log('📧 User:', name);
  console.log('📧 Email:', email);
  console.log('📧 Role:', role);
  console.log('📧 ==================================\n');
  
  const html = getWelcomeEmailHTML(name, role);
  const text = `Welcome to RentMarket, ${name}! Your ${role.toLowerCase()} account is now active. Start exploring: ${process.env.NEXT_PUBLIC_APP_URL}`;
  
  return await sendEmail({
    to: email,
    subject: `Welcome to RentMarket! 🎉`,
    html,
    text
  });
}

// Welcome email template
export function getWelcomeEmailHTML(firstName: string, role: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to RentMarket</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 Welcome to RentMarket!</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9;">Your ${role.toLowerCase()} account is now active</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Hello, ${firstName}!</h2>
              <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                Congratulations! Your email has been verified and your ${role.toLowerCase()} account is now fully active. You can start using RentMarket right away!
              </p>
              
              <!-- Action Buttons -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="display: inline-block; padding: 16px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; margin: 0 10px 10px 0;">
                      🔐 Login to Your Account
                    </a>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/products" style="display: inline-block; padding: 16px 30px; background: #28a745; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; margin: 0 10px 10px 0;">
                      🛒 Browse Products
                    </a>
                  </td>
                </tr>
              </table>
              
              ${role === 'CUSTOMER' ? `
              <!-- Customer Features -->
              <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #333333; margin: 0 0 15px 0; font-size: 20px;">🛒 As a Customer, you can:</h3>
                <ul style="color: #666666; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>Browse thousands of rental products from verified vendors</li>
                  <li>Book items for flexible rental periods</li>
                  <li>Track your orders and rental history</li>
                  <li>Rate and review products and vendors</li>
                  <li>Get 24/7 customer support</li>
                  <li>Enjoy secure payment processing</li>
                </ul>
              </div>
              ` : role === 'VENDOR' ? `
              <!-- Vendor Features -->
              <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #333333; margin: 0 0 15px 0; font-size: 20px;">🏪 As a Vendor, you can:</h3>
                <ul style="color: #666666; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>List unlimited products for rent in your category</li>
                  <li>Manage orders and inventory efficiently</li>
                  <li>Set flexible pricing and availability</li>
                  <li>Access detailed analytics and reports</li>
                  <li>Grow your rental business with our platform</li>
                  <li>Connect with thousands of potential customers</li>
                </ul>
              </div>
              ` : ''}
              
              <!-- Getting Started Tips -->
              <div style="background-color: #e3f2fd; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #2196f3;">
                <h3 style="color: #1976d2; margin: 0 0 15px 0; font-size: 18px;">🎯 Getting Started Tips:</h3>
                <ol style="color: #666666; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li><strong>Complete your profile:</strong> Add more details to build trust with other users</li>
                  <li><strong>Explore the platform:</strong> Browse products and discover amazing rental options</li>
                  <li><strong>Join our community:</strong> Follow us on social media for updates and tips</li>
                  <li><strong>Get help when needed:</strong> Check our help center or contact support anytime</li>
                </ol>
              </div>
              
              <p style="color: #666666; line-height: 1.6; margin: 20px 0 0 0; font-size: 16px;">
                Need help getting started? Our support team is here to help at 
                <a href="mailto:support@rentmarket.com" style="color: #667eea; text-decoration: none;">support@rentmarket.com</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #999999; margin: 0 0 15px 0; font-size: 14px;">
                Follow us for updates and rental tips:
              </p>
              <p style="color: #999999; margin: 0 0 15px 0; font-size: 14px;">
                <a href="#" style="color: #667eea; text-decoration: none; margin: 0 10px;">Facebook</a> |
                <a href="#" style="color: #667eea; text-decoration: none; margin: 0 10px;">Twitter</a> |
                <a href="#" style="color: #667eea; text-decoration: none; margin: 0 10px;">Instagram</a>
              </p>
              <p style="color: #999999; margin: 0; font-size: 12px;">
                © 2024 RentMarket. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
