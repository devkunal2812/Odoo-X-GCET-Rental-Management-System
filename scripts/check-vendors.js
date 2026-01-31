const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const vendors = await prisma.vendorProfile.findMany();
  console.log('Vendors:', JSON.stringify(vendors, null, 2));
  
  const coupons = await prisma.coupon.findMany();
  console.log('\nCoupons:', JSON.stringify(coupons, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
