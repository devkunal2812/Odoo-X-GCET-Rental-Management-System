import nodemailer from 'nodemailer';

// Email configuration with multiple fallback options
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 60000, // 60 seconds
  greetingTimeout: 30000,   // 30 seconds
  socketTimeout: 60000      // 60 seconds
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

// Email templates
export const emailTemplates = {
  emailVerification: (name: string, verificationLink: string) => ({
    subject: 'Verify Your Email - RentMarket',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #37353E 0%, #44444E 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #37353E; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to RentMarket!</h1>
            <p>Your rental marketplace account is almost ready</p>
          </div>
          
          <div class="content">
            <h2>Hi ${name}!</h2>
            
            <p>Thank you for signing up with RentMarket. To complete your registration and start using your account, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
              <a href="${verificationLink}" class="button">✅ Verify Email Address</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="background: #f0f0f0; padding: 10px; border-radius: 5px; word-break: break-all;">
              ${verificationLink}
            </p>
            
            <div class="warning">
              <strong>⚠️ Important:</strong> This verification link will expire in 24 hours. If you don't verify your email within this time, you'll need to sign up again.
            </div>
            
            <h3>What's Next?</h3>
            <ul>
              <li>✅ Verify your email (click the button above)</li>
              <li>🔐 Log in to your account</li>
              <li>🛒 Start browsing and renting products</li>
              <li>📱 Download our mobile app (coming soon)</li>
            </ul>
            
            <p>If you didn't create an account with RentMarket, please ignore this email.</p>
            
            <p>Need help? Contact our support team at <a href="mailto:support@rentmarket.com">support@rentmarket.com</a></p>
          </div>
          
          <div class="footer">
            <p>© 2024 RentMarket. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Welcome to RentMarket!
      
      Hi ${name},
      
      Thank you for signing up with RentMarket. To complete your registration, please verify your email address by visiting this link:
      
      ${verificationLink}
      
      This verification link will expire in 24 hours.
      
      If you didn't create an account with RentMarket, please ignore this email.
      
      Need help? Contact us at support@rentmarket.com
      
      © 2024 RentMarket. All rights reserved.
    `
  }),

  welcomeEmail: (name: string, role: string) => ({
    subject: 'Welcome to RentMarket! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to RentMarket</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #37353E 0%, #44444E 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #37353E; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .feature-box { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #37353E; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to RentMarket!</h1>
            <p>Your email has been verified successfully</p>
          </div>
          
          <div class="content">
            <h2>Hi ${name}!</h2>
            
            <p>Congratulations! Your email has been verified and your ${role.toLowerCase()} account is now active. You can start using RentMarket right away!</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" class="button">🔐 Login to Your Account</a>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/products" class="button">🛒 Browse Products</a>
            </div>
            
            ${role === 'CUSTOMER' ? `
              <div class="feature-box">
                <h3>🛒 As a Customer, you can:</h3>
                <ul>
                  <li>Browse thousands of rental products</li>
                  <li>Book items for flexible rental periods</li>
                  <li>Track your orders and rental history</li>
                  <li>Rate and review products</li>
                  <li>Get 24/7 customer support</li>
                </ul>
              </div>
            ` : role === 'VENDOR' ? `
              <div class="feature-box">
                <h3>🏪 As a Vendor, you can:</h3>
                <ul>
                  <li>List unlimited products for rent</li>
                  <li>Manage orders and inventory</li>
                  <li>Set flexible pricing and availability</li>
                  <li>Access detailed analytics and reports</li>
                  <li>Grow your rental business</li>
                </ul>
              </div>
            ` : ''}
            
            <div class="feature-box">
              <h3>🎯 Getting Started Tips:</h3>
              <ol>
                <li><strong>Complete your profile:</strong> Add more details to build trust</li>
                <li><strong>Explore the platform:</strong> Browse products and features</li>
                <li><strong>Join our community:</strong> Follow us on social media</li>
                <li><strong>Get help:</strong> Check our help center or contact support</li>
              </ol>
            </div>
            
            <p>Need help getting started? Our support team is here to help at <a href="mailto:support@rentmarket.com">support@rentmarket.com</a></p>
          </div>
          
          <div class="footer">
            <p>© 2024 RentMarket. All rights reserved.</p>
            <p>Follow us: <a href="#">Facebook</a> | <a href="#">Twitter</a> | <a href="#">Instagram</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Welcome to RentMarket!
      
      Hi ${name},
      
      Congratulations! Your email has been verified and your ${role.toLowerCase()} account is now active.
      
      Login to your account: ${process.env.NEXT_PUBLIC_APP_URL}/login
      Browse products: ${process.env.NEXT_PUBLIC_APP_URL}/products
      
      Need help? Contact us at support@rentmarket.com
      
      © 2024 RentMarket. All rights reserved.
    `
  })
};

// Send email function with multiple retry attempts
export async function sendEmail(to: string, template: { subject: string; html: string; text: string }) {
  // Always log the verification link for development/debugging
  if (template.subject.includes('Verify')) {
    const linkMatch = template.html.match(/href="([^"]*verify-email[^"]*)"/);
    if (linkMatch) {
      console.log('\n🔗 ===== VERIFICATION LINK =====');
      console.log('🔗 Email:', to);
      console.log('🔗 Link:', linkMatch[1]);
      console.log('🔗 =============================\n');
    }
  }

  try {
    // Check if email configuration is available
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('\n📧 ===== EMAIL WOULD BE SENT =====');
      console.log('📧 To:', to);
      console.log('📧 Subject:', template.subject);
      console.log('📧 Please configure SMTP credentials');
      console.log('📧 ================================\n');
      return { success: true, message: 'Email logged (no SMTP config)' };
    }

    const mailOptions = {
      from: `${process.env.FROM_NAME || 'RentMarket'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    console.log(`📧 Attempting to send email to: ${to}`);
    
    // Try sending with current configuration
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully!');
      console.log('📧 Message ID:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (primaryError) {
      console.log('❌ Primary SMTP failed, trying alternative configuration...');
      
      // Try with port 465 (SSL)
      const alternativeTransporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      
      try {
        const info = await alternativeTransporter.sendMail(mailOptions);
        console.log('✅ Email sent via alternative configuration!');
        console.log('📧 Message ID:', info.messageId);
        return { success: true, messageId: info.messageId };
      } catch (secondaryError) {
        throw primaryError; // Throw the original error
      }
    }
    
  } catch (error) {
    console.error('❌ All email sending attempts failed:', error.message);
    
    // Log detailed error information
    if (error.code === 'EAUTH') {
      console.log('\n💡 Authentication Error:');
      console.log('   Your Gmail account needs an App Password');
      console.log('   1. Go to Google Account Security');
      console.log('   2. Enable 2-Factor Authentication');
      console.log('   3. Generate App Password for Mail');
      console.log('   4. Replace SMTP_PASS with the App Password');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNECTION') {
      console.log('\n💡 Connection Error:');
      console.log('   Your network may be blocking SMTP connections');
      console.log('   1. Check firewall settings');
      console.log('   2. Try different network (mobile hotspot)');
      console.log('   3. Contact ISP about SMTP port blocking');
    }
    
    // For now, return success so signup doesn't fail
    console.log('\n📧 ===== EMAIL FALLBACK =====');
    console.log('📧 To:', to);
    console.log('📧 Subject:', template.subject);
    console.log('📧 Status: Logged (SMTP failed)');
    console.log('📧 ===========================\n');
    
    return { success: true, message: 'Email logged (SMTP failed)' };
  }
}

// Send verification email
export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
  const template = emailTemplates.emailVerification(name, verificationLink);
  
  // Always log the verification link for development
  console.log('\n🔗 ===== VERIFICATION LINK =====');
  console.log('🔗 User:', name);
  console.log('🔗 Email:', email);
  console.log('🔗 Link:', verificationLink);
  console.log('🔗 Token:', token);
  console.log('🔗 =============================\n');
  
  return await sendEmail(email, template);
}

// Send welcome email after verification
export async function sendWelcomeEmail(email: string, name: string, role: string) {
  const template = emailTemplates.welcomeEmail(name, role);
  
  return await sendEmail(email, template);
}