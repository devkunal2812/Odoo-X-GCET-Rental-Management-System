const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Count records
    const userCount = await prisma.user.count();
    const orderCount = await prisma.saleOrder.count();
    const invoiceCount = await prisma.invoice.count();
    
    console.log('📊 Database Records:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Orders: ${orderCount}`);
    console.log(`   Invoices: ${invoiceCount}`);
    
    if (orderCount > 0) {
      console.log('\n📦 Recent Orders:');
      const recentOrders = await prisma.saleOrder.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { include: { user: true } },
          vendor: true
        }
      });
      
      recentOrders.forEach(order => {
        console.log(`   ${order.orderNumber} - ${order.status} - ₹${order.totalAmount} - ${order.customer?.user?.email}`);
      });
    }
    
    if (invoiceCount > 0) {
      console.log('\n📄 Recent Invoices:');
      const recentInvoices = await prisma.invoice.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' }
      });
      
      recentInvoices.forEach(invoice => {
        console.log(`   ${invoice.invoiceNumber} - ${invoice.status} - ₹${invoice.totalAmount}`);
      });
    }
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Complete a test purchase to create orders');
    console.log('2. Visit /test-db-orders to see database records');
    console.log('3. Check /orders and /invoices pages');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();