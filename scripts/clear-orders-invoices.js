const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearOrdersAndInvoices() {
  try {
    console.log('🗑️ Clearing all orders and invoices from database...');
    
    // First, let's see what we have
    const orderCount = await prisma.saleOrder.count();
    const invoiceCount = await prisma.invoice.count();
    const userCount = await prisma.user.count();
    
    console.log('📊 Current Database Status:');
    console.log(`   Orders: ${orderCount}`);
    console.log(`   Invoices: ${invoiceCount}`);
    console.log(`   Users: ${userCount}`);
    
    if (orderCount === 0 && invoiceCount === 0) {
      console.log('✅ Database is already clean - no orders or invoices to delete');
      return;
    }
    
    console.log('\n🗑️ Starting deletion process...');
    
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
    
    // 7. Delete products (created dynamically from cart items)
    const deletedProducts = await prisma.product.deleteMany({});
    console.log(`   ✅ Deleted ${deletedProducts.count} products`);
    
    // 8. Delete customer profiles
    const deletedCustomerProfiles = await prisma.customerProfile.deleteMany({});
    console.log(`   ✅ Deleted ${deletedCustomerProfiles.count} customer profiles`);
    
    // 9. Delete vendor profiles  
    const deletedVendorProfiles = await prisma.vendorProfile.deleteMany({});
    console.log(`   ✅ Deleted ${deletedVendorProfiles.count} vendor profiles`);
    
    // 10. Delete users (except admin if any)
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        role: {
          in: ['CUSTOMER', 'VENDOR']
        }
      }
    });
    console.log(`   ✅ Deleted ${deletedUsers.count} users (kept admin users)`);
    
    console.log('\n🎉 Database cleanup completed successfully!');
    console.log('\n📊 Final Database Status:');
    
    const finalOrderCount = await prisma.saleOrder.count();
    const finalInvoiceCount = await prisma.invoice.count();
    const finalUserCount = await prisma.user.count();
    
    console.log(`   Orders: ${finalOrderCount}`);
    console.log(`   Invoices: ${finalInvoiceCount}`);
    console.log(`   Users: ${finalUserCount}`);
    
    console.log('\n🚀 Ready for fresh testing!');
    console.log('   1. Go to /products and add items to cart');
    console.log('   2. Complete checkout with Razorpay test payment');
    console.log('   3. Check /orders and /invoices for your new data');
    console.log('   4. Visit /test-db-orders to verify database records');
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearOrdersAndInvoices();