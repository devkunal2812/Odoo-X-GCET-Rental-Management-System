const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n⏰ Checking for expiring orders...\n');
  
  const now = new Date();
  console.log('Current time:', now.toLocaleString('en-IN'));
  
  // Check all orders with end dates
  const allOrders = await prisma.saleOrder.findMany({
    where: {
      endDate: { not: null }
    },
    include: {
      customer: {
        include: { user: true }
      },
      lines: {
        include: { product: true }
      }
    },
    orderBy: { endDate: 'asc' }
  });
  
  console.log(`\nTotal orders with end dates: ${allOrders.length}\n`);
  
  allOrders.forEach(order => {
    const endDate = new Date(order.endDate);
    const diffMs = endDate.getTime() - now.getTime();
    const diffMin = Math.round(diffMs / 60000);
    
    console.log(`Order: ${order.orderNumber}`);
    console.log(`  Status: ${order.status}`);
    console.log(`  Customer: ${order.customer.user.firstName} ${order.customer.user.lastName}`);
    console.log(`  End Date: ${endDate.toLocaleString('en-IN')}`);
    console.log(`  Minutes until expiry: ${diffMin}`);
    console.log(`  Product: ${order.lines[0]?.product.name || 'N/A'}`);
    console.log('');
  });
  
  // Check what the notification system would find
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
  const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);
  
  console.log('\n🔍 Notification System Check:');
  console.log(`Looking for orders with:`);
  console.log(`  - Status: PICKED_UP`);
  console.log(`  - End date between: ${fiveMinutesFromNow.toLocaleString('en-IN')} and ${tenMinutesFromNow.toLocaleString('en-IN')}`);
  
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
  
  console.log(`\nFound ${expiringOrders.length} orders matching criteria\n`);
  
  if (expiringOrders.length === 0) {
    console.log('❌ No orders found!');
    console.log('\n💡 Possible reasons:');
    console.log('   1. Order status is not PICKED_UP');
    console.log('   2. End date is not in the 5-10 minute window');
    console.log('   3. No orders exist with these criteria\n');
  } else {
    expiringOrders.forEach(order => {
      console.log(`✅ Found: ${order.orderNumber}`);
      console.log(`   Customer: ${order.customer.user.email}`);
      console.log(`   Product: ${order.lines[0]?.product.name}`);
      console.log(`   Expires: ${new Date(order.endDate).toLocaleString('en-IN')}\n`);
    });
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);
