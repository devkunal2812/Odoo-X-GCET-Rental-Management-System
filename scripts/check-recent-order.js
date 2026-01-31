const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkRecentOrder() {
  try {
    console.log('🔍 Checking most recent order details...');
    
    const recentOrder = await prisma.saleOrder.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { include: { user: true } },
        vendor: true,
        lines: { include: { product: true } }
      }
    });
    
    if (recentOrder) {
      console.log('\n📦 Most Recent Order:');
      console.log(`   Order Number: ${recentOrder.orderNumber}`);
      console.log(`   Status: ${recentOrder.status} ${recentOrder.status === 'CONFIRMED' ? '✅ (PAID)' : '⏳ (PENDING)'}`);
      console.log(`   Customer: ${recentOrder.customer?.user?.email}`);
      console.log(`   Vendor: ${recentOrder.vendor?.companyName}`);
      console.log(`   Amount: ₹${recentOrder.totalAmount}`);
      console.log(`   Created: ${recentOrder.createdAt}`);
      console.log(`   Items: ${recentOrder.lines.length}`);
      
      recentOrder.lines.forEach((line, index) => {
        console.log(`     ${index + 1}. ${line.product?.name} - Qty: ${line.quantity} - ₹${line.unitPrice}`);
      });
      
      // Check corresponding invoice
      const invoice = await prisma.invoice.findFirst({
        where: { saleOrderId: recentOrder.id }
      });
      
      if (invoice) {
        console.log('\n📄 Corresponding Invoice:');
        console.log(`   Invoice Number: ${invoice.invoiceNumber}`);
        console.log(`   Status: ${invoice.status} ${invoice.status === 'POSTED' ? '✅ (PAID)' : '⏳ (PENDING)'}`);
        console.log(`   Amount: ₹${invoice.totalAmount}`);
        console.log(`   Issue Date: ${invoice.invoiceDate}`);
      }
      
      console.log('\n🎯 This order should appear in:');
      console.log('   - /orders page as PAID');
      console.log('   - /invoices page as PAID');
      console.log('   - /test-db-orders page for verification');
      
    } else {
      console.log('❌ No orders found in database');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkRecentOrder();