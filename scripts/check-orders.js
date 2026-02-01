/**
 * Check Orders Script
 * Checks if there are any orders in the database
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n📊 Checking Orders in Database...\n');

  try {
    // Count total orders
    const totalOrders = await prisma.saleOrder.count();
    console.log(`Total Orders: ${totalOrders}`);

    if (totalOrders === 0) {
      console.log('\n⚠️  No orders found in database!');
      console.log('\n💡 To create test orders, you need:');
      console.log('   1. At least one customer (user with CUSTOMER role)');
      console.log('   2. At least one vendor with products');
      console.log('   3. Run the test script to create orders\n');
      
      // Check if we have customers and vendors
      const customers = await prisma.customerProfile.count();
      const vendors = await prisma.vendorProfile.count();
      const products = await prisma.product.count();
      
      console.log(`Customers: ${customers}`);
      console.log(`Vendors: ${vendors}`);
      console.log(`Products: ${products}\n`);
      
      if (customers === 0 || vendors === 0 || products === 0) {
        console.log('❌ Missing required data. Please run: npm run seed\n');
      }
      
      return;
    }

    // Get orders by status
    const statuses = ['QUOTATION', 'SENT', 'CONFIRMED', 'INVOICED', 'PICKED_UP', 'RETURNED', 'CANCELLED'];
    
    console.log('\n📈 Orders by Status:');
    for (const status of statuses) {
      const count = await prisma.saleOrder.count({
        where: { status }
      });
      if (count > 0) {
        console.log(`   ${status}: ${count}`);
      }
    }

    // Get recent orders
    const recentOrders = await prisma.saleOrder.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          include: { user: true }
        },
        vendor: true,
        lines: {
          include: { product: true }
        }
      }
    });

    console.log('\n📋 Recent Orders:');
    recentOrders.forEach((order, index) => {
      console.log(`\n   ${index + 1}. ${order.orderNumber}`);
      console.log(`      Customer: ${order.customer.user.firstName} ${order.customer.user.lastName}`);
      console.log(`      Vendor: ${order.vendor.companyName}`);
      console.log(`      Status: ${order.status}`);
      console.log(`      Amount: ₹${order.totalAmount}`);
      console.log(`      Products: ${order.lines.length}`);
      console.log(`      Created: ${order.createdAt.toLocaleDateString('en-IN')}`);
    });

    console.log('\n✅ Database check complete!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
