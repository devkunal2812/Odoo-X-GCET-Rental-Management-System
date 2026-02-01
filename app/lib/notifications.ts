import { sendEmail } from './email';
import { prisma } from './prisma';

// Email template for rental expiry notification
export function getRentalExpiryEmailHTML(
  customerName: string,
  productName: string,
  expiryTime: Date,
  orderNumber: string
) {
  const formattedTime = expiryTime.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rental Period Ending Soon</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">⏰ Rental Period Ending Soon</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9;">Your rental is about to expire</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Hello, ${customerName}!</h2>
              <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                This is a friendly reminder that your rental period for <strong>${productName}</strong> is ending soon.
              </p>
              
              <!-- Alert Box -->
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 25px 0; border-radius: 4px;">
                <p style="color: #856404; margin: 0 0 10px 0; font-size: 18px; font-weight: bold;">
                  ⏰ Rental Ends At:
                </p>
                <p style="color: #856404; margin: 0; font-size: 20px; font-weight: bold;">
                  ${formattedTime}
                </p>
              </div>
              
              <!-- Order Details -->
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #333333; margin: 0 0 15px 0; font-size: 18px;">📦 Order Details</h3>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #666666; font-size: 14px; border-bottom: 1px solid #e9ecef;">Order Number:</td>
                    <td style="color: #333333; font-weight: bold; font-size: 14px; text-align: right; border-bottom: 1px solid #e9ecef;">${orderNumber}</td>
                  </tr>
                  <tr>
                    <td style="color: #666666; font-size: 14px; border-bottom: 1px solid #e9ecef;">Product:</td>
                    <td style="color: #333333; font-weight: bold; font-size: 14px; text-align: right; border-bottom: 1px solid #e9ecef;">${productName}</td>
                  </tr>
                  <tr>
                    <td style="color: #666666; font-size: 14px;">Expiry Time:</td>
                    <td style="color: #ff6b6b; font-weight: bold; font-size: 14px; text-align: right;">${formattedTime}</td>
                  </tr>
                </table>
              </div>
              
              <!-- Important Notice -->
              <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 20px; margin: 25px 0; border-radius: 4px;">
                <p style="color: #721c24; margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">
                  ⚠️ Important Notice:
                </p>
                <ul style="color: #721c24; margin: 0; padding-left: 20px; line-height: 1.8;">
                  <li>Please return the item before the rental period ends</li>
                  <li>Late returns may incur additional charges</li>
                  <li>Ensure the item is in good condition</li>
                  <li>Contact the vendor if you need an extension</li>
                </ul>
              </div>
              
              <!-- Action Buttons -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders" style="display: inline-block; padding: 16px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; margin: 0 10px 10px 0;">
                      📋 View My Orders
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #999999; line-height: 1.6; margin: 30px 0 0 0; font-size: 14px; text-align: center;">
                Need help? Contact us at support@rentmarket.com
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #999999; margin: 0 0 10px 0; font-size: 14px;">
                This is an automated reminder for your rental order.
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

// Send rental expiry notification
export async function sendRentalExpiryNotification(
  email: string,
  customerName: string,
  productName: string,
  expiryTime: Date,
  orderNumber: string
) {
  console.log('\n⏰ ===== SENDING RENTAL EXPIRY NOTIFICATION =====');
  console.log('⏰ Customer:', customerName);
  console.log('⏰ Email:', email);
  console.log('⏰ Product:', productName);
  console.log('⏰ Expiry Time:', expiryTime);
  console.log('⏰ Order:', orderNumber);
  console.log('⏰ =============================================\n');

  const html = getRentalExpiryEmailHTML(customerName, productName, expiryTime, orderNumber);
  const text = `Hello ${customerName}, your rental period for ${productName} (Order: ${orderNumber}) is ending at ${expiryTime.toLocaleString('en-IN')}. Please return the item on time to avoid late fees.`;

  return await sendEmail({
    to: email,
    subject: `⏰ Rental Ending Soon: ${productName}`,
    html,
    text
  });
}

// Check for rentals expiring in the next 5 minutes and send notifications
export async function checkAndNotifyExpiringRentals() {
  try {
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

    console.log('\n🔍 Checking for expiring rentals...');
    console.log('🔍 Current time:', now.toLocaleString('en-IN'));
    console.log('🔍 Looking for rentals expiring between:', fiveMinutesFromNow.toLocaleString('en-IN'), 'and', tenMinutesFromNow.toLocaleString('en-IN'));

    // Find orders that are PICKED_UP and have endDate between 5-10 minutes from now
    const expiringOrders = await prisma.saleOrder.findMany({
      where: {
        status: 'PICKED_UP',
        endDate: {
          gte: fiveMinutesFromNow,
          lte: tenMinutesFromNow
        }
      },
      include: {
        customer: {
          include: {
            user: true
          }
        },
        lines: {
          include: {
            product: true
          }
        }
      }
    });

    console.log(`📊 Found ${expiringOrders.length} orders expiring soon`);

    const notifications = [];

    for (const order of expiringOrders) {
      const customer = order.customer.user;
      const customerName = `${customer.firstName} ${customer.lastName}`;
      
      // Send notification for each product in the order
      for (const line of order.lines) {
        try {
          await sendRentalExpiryNotification(
            customer.email,
            customerName,
            line.product.name,
            order.endDate!,
            order.orderNumber
          );

          notifications.push({
            orderId: order.id,
            orderNumber: order.orderNumber,
            customerId: customer.id,
            customerEmail: customer.email,
            productName: line.product.name,
            expiryTime: order.endDate,
            status: 'sent',
            sentAt: new Date()
          });

          console.log(`✅ Notification sent for order ${order.orderNumber} - ${line.product.name}`);
        } catch (error) {
          console.error(`❌ Failed to send notification for order ${order.orderNumber}:`, error);
          
          notifications.push({
            orderId: order.id,
            orderNumber: order.orderNumber,
            customerId: customer.id,
            customerEmail: customer.email,
            productName: line.product.name,
            expiryTime: order.endDate,
            status: 'failed',
            sentAt: new Date(),
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    }

    console.log(`\n📧 Notification Summary: ${notifications.filter(n => n.status === 'sent').length} sent, ${notifications.filter(n => n.status === 'failed').length} failed\n`);

    return {
      success: true,
      checked: expiringOrders.length,
      notifications
    };
  } catch (error) {
    console.error('❌ Error checking expiring rentals:', error);
    throw error;
  }
}
