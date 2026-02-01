/**
 * Test Script for Rental Expiry Notifications
 * 
 * This script helps test the notification system by:
 * 1. Creating test orders that expire soon
 * 2. Triggering notification checks
 * 3. Verifying email delivery
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestOrder(minutesUntilExpiry = 7) {
  try {
    console.log('\n📝 Creating test order...');
    
    // Find a customer
    const customer = await prisma.customerProfile.findFirst({
      include: { user: true }
    });
    
    if (!customer) {
      console.error('❌ No customer found. Please create a customer first.');
      return null;
    }
    
    // Find a vendor
    const vendor = await prisma.vendorProfile.findFirst();
    
    if (!vendor) {
      console.error('❌ No vendor found. Please create a vendor first.');
      return null;
    }
    
    // Find a product
    const product = await prisma.product.findFirst({
      where: { vendorId: vendor.id }
    });
    
    if (!product) {
      console.error('❌ No product found. Please create a product first.');
      return null;
    }
    
    // Calculate expiry time
    const now = new Date();
    const expiryTime = new Date(now.getTime() + minutesUntilExpiry * 60 * 1000);
    
    // Generate order number
    const orderNumber = `TEST-${Date.now()}`;
    
    // Create order
    const order = await prisma.saleOrder.create({
      data: {
        orderNumber,
        customerId: customer.id,
        vendorId: vendor.id,
        status: 'PICKED_UP',
        startDate: now,
        endDate: expiryTime,
        orderDate: now,
        totalAmount: 1000,
        lines: {
          create: {
            productId: product.id,
            quantity: 1,
            unitPrice: 1000,
            rentalStart: now,
            rentalEnd: expiryTime
          }
        }
      },
      include: {
        customer: {
          include: { user: true }
        },
        lines: {
          include: { product: true }
        }
      }
    });
    
    console.log('✅ Test order created successfully!');
    console.log('\n📦 Order Details:');
    console.log('   Order Number:', order.orderNumber);
    console.log('   Customer:', `${order.customer.user.firstName} ${order.customer.user.lastName}`);
    console.log('   Email:', order.customer.user.email);
    console.log('   Product:', order.lines[0].product.name);
    console.log('   Status:', order.status);
    console.log('   Start Time:', order.startDate.toLocaleString('en-IN'));
    console.log('   End Time:', order.endDate.toLocaleString('en-IN'));
    console.log('   Minutes Until Expiry:', minutesUntilExpiry);
    
    return order;
  } catch (error) {
    console.error('❌ Error creating test order:', error);
    return null;
  }
}

async function listExpiringOrders() {
  try {
    console.log('\n🔍 Checking for expiring orders...');
    
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);
    
    console.log('   Current Time:', now.toLocaleString('en-IN'));
    console.log('   Checking window:', fiveMinutesFromNow.toLocaleString('en-IN'), 'to', tenMinutesFromNow.toLocaleString('en-IN'));
    
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
          include: { user: true }
        },
        lines: {
          include: { product: true }
        }
      }
    });
    
    console.log(`\n📊 Found ${expiringOrders.length} orders expiring soon:`);
    
    if (expiringOrders.length === 0) {
      console.log('   No orders found in the 5-10 minute window.');
      console.log('   💡 Tip: Create a test order with 7 minutes until expiry.');
    } else {
      expiringOrders.forEach((order, index) => {
        console.log(`\n   ${index + 1}. Order ${order.orderNumber}`);
        console.log(`      Customer: ${order.customer.user.firstName} ${order.customer.user.lastName}`);
        console.log(`      Email: ${order.customer.user.email}`);
        console.log(`      Product: ${order.lines[0].product.name}`);
        console.log(`      Expires: ${order.endDate.toLocaleString('en-IN')}`);
        
        const minutesUntilExpiry = Math.round((order.endDate.getTime() - now.getTime()) / 60000);
        console.log(`      Minutes until expiry: ${minutesUntilExpiry}`);
      });
    }
    
    return expiringOrders;
  } catch (error) {
    console.error('❌ Error listing expiring orders:', error);
    return [];
  }
}

async function triggerNotificationCheck() {
  try {
    console.log('\n🔔 Triggering notification check via API...');
    
    const response = await fetch('http://localhost:3000/api/notifications/check-expiring');
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Notification check completed!');
      console.log(`   Checked: ${data.data.checked} orders`);
      console.log(`   Sent: ${data.data.notifications.filter(n => n.status === 'sent').length} notifications`);
      console.log(`   Failed: ${data.data.notifications.filter(n => n.status === 'failed').length} notifications`);
      
      if (data.data.notifications.length > 0) {
        console.log('\n📧 Notification Details:');
        data.data.notifications.forEach((notif, index) => {
          console.log(`\n   ${index + 1}. ${notif.status === 'sent' ? '✅' : '❌'} ${notif.orderNumber}`);
          console.log(`      To: ${notif.customerEmail}`);
          console.log(`      Product: ${notif.productName}`);
          console.log(`      Status: ${notif.status}`);
          if (notif.error) {
            console.log(`      Error: ${notif.error}`);
          }
        });
      }
    } else {
      console.error('❌ Notification check failed:', data.error);
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error triggering notification check:', error);
    console.log('   💡 Make sure the dev server is running on http://localhost:3000');
    return null;
  }
}

async function cleanupTestOrders() {
  try {
    console.log('\n🧹 Cleaning up test orders...');
    
    const result = await prisma.saleOrder.deleteMany({
      where: {
        orderNumber: {
          startsWith: 'TEST-'
        }
      }
    });
    
    console.log(`✅ Deleted ${result.count} test orders`);
  } catch (error) {
    console.error('❌ Error cleaning up test orders:', error);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  console.log('\n🧪 Rental Expiry Notification Test Script');
  console.log('==========================================\n');
  
  switch (command) {
    case 'create':
      const minutes = parseInt(args[1]) || 7;
      await createTestOrder(minutes);
      break;
      
    case 'list':
      await listExpiringOrders();
      break;
      
    case 'check':
      await triggerNotificationCheck();
      break;
      
    case 'cleanup':
      await cleanupTestOrders();
      break;
      
    case 'full-test':
      console.log('🚀 Running full test...\n');
      
      // Step 1: Cleanup old test orders
      await cleanupTestOrders();
      
      // Step 2: Create test order expiring in 7 minutes
      const order = await createTestOrder(7);
      
      if (order) {
        // Step 3: List expiring orders
        await listExpiringOrders();
        
        // Step 4: Trigger notification check
        await triggerNotificationCheck();
        
        console.log('\n✅ Full test completed!');
        console.log('\n📧 Check your email inbox for the notification.');
        console.log('   Email sent to:', order.customer.user.email);
      }
      break;
      
    default:
      console.log('Usage:');
      console.log('  node scripts/test-rental-notifications.js <command> [options]\n');
      console.log('Commands:');
      console.log('  create [minutes]  - Create a test order expiring in X minutes (default: 7)');
      console.log('  list              - List all orders expiring in 5-10 minutes');
      console.log('  check             - Trigger notification check via API');
      console.log('  cleanup           - Delete all test orders');
      console.log('  full-test         - Run complete test (cleanup, create, list, check)\n');
      console.log('Examples:');
      console.log('  node scripts/test-rental-notifications.js create 7');
      console.log('  node scripts/test-rental-notifications.js list');
      console.log('  node scripts/test-rental-notifications.js check');
      console.log('  node scripts/test-rental-notifications.js full-test');
      console.log('  node scripts/test-rental-notifications.js cleanup\n');
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);
