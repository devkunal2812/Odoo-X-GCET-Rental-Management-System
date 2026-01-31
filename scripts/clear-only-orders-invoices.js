const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearOnlyOrdersAndInvoices() {
  try {
    console.log('🗑️ Clearing only orders and invoices (keeping products and users)...');
    
    // Check current status
    const orderCount = await prisma.saleOrder.count();
    const invoiceCount = await prisma.invoice.count();
    const productCount = await prisma.product.count();
    const userCount = await prisma.user.count();
    
    console.log('📊 Current Database Status:');
    console.log(`   Orders: ${orderCount}`);
    console.log(`   Invoices: ${invoiceCount}`);
    console.log(`   Products: ${productCount}`);
    console.log(`   Users: ${userCount}`);
    
    if (orderCount === 0 && invoiceCount === 0) {
      console.log('✅ No orders or invoices to delete - database is clean for testing');
      return;
    }
    
    console.log('\n🗑️ Deleting only orders and invoices...');
    
    // Delete in correct order due to foreign key constraints
    
    // 1. Delete invoice lines first
    const deletedInvoiceLines = await prisma.invoiceLine.deleteMany({});
    console.log(`   ✅ Deleted ${deletedInvoiceLines.count} invoice lines`);
    
    // 2. Delete payments
    const deletedPayments = await prisma.payment.deleteMany({});
    console.log(`   ✅ Deleted ${deletedPayments.count} payments`);
    
    // 3. Delete invoices
    const deletedInvoices = await prisma.invoice.deleteMany({});
    console.log(`   ✅ Deleted ${deletedInvoices.count} invoices`);
    
    // 4. Delete reservations
    const deletedReservations = await prisma.reservation.deleteMany({});
    console.log(`   ✅ Deleted ${deletedReservations.count} reservations`);
    
    // 5. Delete order lines
    const deletedOrderLines = await prisma.saleOrderLine.deleteMany({});
    console.log(`   ✅ Deleted ${deletedOrderLines.count} order lines`);
    
    // 6. Delete orders
    const deletedOrders = await prisma.saleOrder.deleteMany({});
    console.log(`   ✅ Deleted ${deletedOrders.count} orders`);
    
    console.log('\n🎉 Orders and invoices cleared successfully!');
    console.log('\n📊 Final Database Status:');
    
    const finalOrderCount = await prisma.saleOrder.count();
    const finalInvoiceCount = await prisma.invoice.count();
    const finalProductCount = await prisma.product.count();
    const finalUserCount = await prisma.user.count();
    
    console.log(`   Orders: ${finalOrderCount}`);
    console.log(`   Invoices: ${finalInvoiceCount}`);
    console.log(`   Products: ${finalProductCount} (kept for shopping)`);
    console.log(`   Users: ${finalUserCount} (kept for system)`);
    
    console.log('\n🚀 Ready for fresh payment testing!');
    console.log('   ✅ Products available for purchase');
    console.log('   ✅ Users and vendors ready');
    console.log('   ✅ Clean slate for orders and invoices');
    console.log('\n🛒 Next Steps:');
    console.log('   1. Go to /products and add items to cart');
    console.log('   2. Complete checkout with Razorpay test payment');
    console.log('   3. Check /orders and /invoices for your new data');
    
  } catch (error) {
    console.error('❌ Error clearing orders and invoices:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearOnlyOrdersAndInvoices();