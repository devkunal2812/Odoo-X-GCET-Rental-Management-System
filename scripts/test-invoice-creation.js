const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testInvoiceCreation() {
  try {
    console.log('🧪 Testing invoice creation process...');
    
    // Check current database status
    const orderCount = await prisma.saleOrder.count();
    const invoiceCount = await prisma.invoice.count();
    
    console.log('📊 Current Database Status:');
    console.log(`   Orders: ${orderCount}`);
    console.log(`   Invoices: ${invoiceCount}`);
    
    if (orderCount === 0) {
      console.log('\n✅ Database is clean - ready for testing');
      console.log('🛒 Make a purchase to test invoice creation');
      return;
    }
    
    // Check if orders have corresponding invoices
    const orders = await prisma.saleOrder.findMany({
      include: {
        invoices: true,
        customer: { include: { user: true } },
        vendor: true,
        lines: { include: { product: true } }
      }
    });
    
    console.log('\n📋 Order Analysis:');
    orders.forEach((order, index) => {
      console.log(`\n   Order ${index + 1}:`);
      console.log(`     Number: ${order.orderNumber}`);
      console.log(`     Status: ${order.status}`);
      console.log(`     Amount: ₹${order.totalAmount}`);
      console.log(`     Customer: ${order.customer?.user?.email || 'Unknown'}`);
      console.log(`     Vendor: ${order.vendor?.companyName || 'Unknown'}`);
      console.log(`     Invoices: ${order.invoices.length}`);
      
      if (order.invoices.length > 0) {
        order.invoices.forEach((invoice, invIndex) => {
          console.log(`       Invoice ${invIndex + 1}: ${invoice.invoiceNumber} - ${invoice.status}`);
        });
      } else {
        console.log(`       ❌ No invoices found for this order`);
      }
    });
    
    // Check invoices
    const invoices = await prisma.invoice.findMany({
      include: {
        saleOrder: {
          include: {
            customer: { include: { user: true } },
            vendor: true
          }
        },
        lines: { include: { product: true } }
      }
    });
    
    console.log('\n📄 Invoice Analysis:');
    if (invoices.length === 0) {
      console.log('   ❌ No invoices found in database');
    } else {
      invoices.forEach((invoice, index) => {
        console.log(`\n   Invoice ${index + 1}:`);
        console.log(`     Number: ${invoice.invoiceNumber}`);
        console.log(`     Status: ${invoice.status}`);
        console.log(`     Amount: ₹${invoice.totalAmount}`);
        console.log(`     Order: ${invoice.saleOrder?.orderNumber || 'Unknown'}`);
        console.log(`     Customer: ${invoice.saleOrder?.customer?.user?.email || 'Unknown'}`);
        console.log(`     Lines: ${invoice.lines.length}`);
      });
    }
    
    // Test API endpoints
    console.log('\n🔗 Testing API Endpoints:');
    
    try {
      const ordersResponse = await fetch('http://localhost:3000/api/orders/user');
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        console.log(`   ✅ Orders API: ${ordersData.orders?.length || 0} orders returned`);
      } else {
        console.log(`   ❌ Orders API failed: ${ordersResponse.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Orders API error: Server not running or endpoint unavailable`);
    }
    
    try {
      const invoicesResponse = await fetch('http://localhost:3000/api/invoices/user');
      if (invoicesResponse.ok) {
        const invoicesData = await invoicesResponse.json();
        console.log(`   ✅ Invoices API: ${invoicesData.invoices?.length || 0} invoices returned`);
      } else {
        console.log(`   ❌ Invoices API failed: ${invoicesResponse.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Invoices API error: Server not running or endpoint unavailable`);
    }
    
    console.log('\n🎯 Recommendations:');
    if (orderCount > 0 && invoiceCount === 0) {
      console.log('   ❌ Orders exist but no invoices - invoice creation may be broken');
      console.log('   🔧 Check order creation API to ensure invoices are created');
    } else if (orderCount === invoiceCount && orderCount > 0) {
      console.log('   ✅ Orders and invoices match - system working correctly');
    } else if (orderCount === 0 && invoiceCount === 0) {
      console.log('   ✅ Clean database - ready for fresh testing');
    }
    
  } catch (error) {
    console.error('❌ Error testing invoice creation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testInvoiceCreation();