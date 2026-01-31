import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyDatabase() {
  console.log('🔍 Verifying database setup...\n');

  try {
    // Check all tables
    const checks = [
      { name: 'Users', query: prisma.user.count() },
      { name: 'Vendor Profiles', query: prisma.vendorProfile.count() },
      { name: 'Customer Profiles', query: prisma.customerProfile.count() },
      { name: 'Products', query: prisma.product.count() },
      { name: 'Product Pricing', query: prisma.productPricing.count() },
      { name: 'Inventory', query: prisma.inventory.count() },
      { name: 'Attributes', query: prisma.attribute.count() },
      { name: 'Attribute Values', query: prisma.attributeValue.count() },
      { name: 'Rental Period Configs', query: prisma.rentalPeriodConfig.count() },
      { name: 'Coupons', query: prisma.coupon.count() },
    ];

    console.log('📊 Table Counts:');
    console.log('─'.repeat(40));

    for (const check of checks) {
      const count = await check.query;
      console.log(`${check.name.padEnd(25)} ${count}`);
    }

    console.log('\n✅ Database verification successful!');
    console.log('\n🔑 Test Credentials:');
    console.log('─'.repeat(40));
    console.log('Admin:    admin@rental.com / admin123');
    console.log('Vendor:   vendor@rental.com / vendor123');
    console.log('Customer: customer@rental.com / customer123');

    console.log('\n🚀 Next Steps:');
    console.log('─'.repeat(40));
    console.log('1. npm run dev          - Start dev server');
    console.log('2. npx prisma studio    - Open database GUI');
    console.log('3. Build backend APIs   - See Backend.md');

  } catch (error) {
    console.error('❌ Database verification failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();
