import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Admin User
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@rental.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('✅ Created admin user');

  // Create Vendor User with Profile
  const vendorPasswordHash = await bcrypt.hash('vendor123', 10);
  const vendor = await prisma.user.create({
    data: {
      firstName: 'John',
      lastName: 'Vendor',
      email: 'vendor@rental.com',
      passwordHash: vendorPasswordHash,
      role: 'VENDOR',
      isActive: true,
      vendorProfile: {
        create: {
          companyName: 'Premium Rentals Co.',
          gstin: '29ABCDE1234F1Z5',
          address: '123 Business Street, City, State 12345',
        },
      },
    },
  });
  console.log('✅ Created vendor user with profile');

  // Create Customer User with Profile
  const customerPasswordHash = await bcrypt.hash('customer123', 10);
  const customer = await prisma.user.create({
    data: {
      firstName: 'Jane',
      lastName: 'Customer',
      email: 'customer@rental.com',
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
      isActive: true,
      customerProfile: {
        create: {
          phone: '+1234567890',
          defaultAddress: '456 Customer Lane, City, State 67890',
        },
      },
    },
  });
  console.log('✅ Created customer user with profile');

  // Get vendor profile
  const vendorProfile = await prisma.vendorProfile.findUnique({
    where: { userId: vendor.id },
  });

  if (!vendorProfile) throw new Error('Vendor profile not found');

  // Create Rental Period Configs
  const hourlyPeriod = await prisma.rentalPeriodConfig.create({
    data: { name: 'Hourly', unit: 'HOUR', duration: 1 },
  });
  const dailyPeriod = await prisma.rentalPeriodConfig.create({
    data: { name: 'Daily', unit: 'DAY', duration: 1 },
  });
  const weeklyPeriod = await prisma.rentalPeriodConfig.create({
    data: { name: 'Weekly', unit: 'WEEK', duration: 1 },
  });
  const monthlyPeriod = await prisma.rentalPeriodConfig.create({
    data: { name: 'Monthly', unit: 'DAY', duration: 30 },
  });
  console.log('✅ Created rental period configs');

  // Create Attributes
  const colorAttr = await prisma.attribute.create({
    data: {
      name: 'Color',
      displayType: 'PILLS',
      values: {
        create: [
          { value: 'Red' },
          { value: 'Blue' },
          { value: 'Black' },
          { value: 'White' },
        ],
      },
    },
  });

  const sizeAttr = await prisma.attribute.create({
    data: {
      name: 'Size',
      displayType: 'RADIO',
      values: {
        create: [
          { value: 'Small' },
          { value: 'Medium' },
          { value: 'Large' },
          { value: 'XL' },
        ],
      },
    },
  });
  console.log('✅ Created attributes (Color, Size)');

  // Create Sample Products
  const product1 = await prisma.product.create({
    data: {
      vendorId: vendorProfile.id,
      name: 'Professional Camera',
      description: 'High-quality DSLR camera perfect for events and photography',
      productType: 'GOODS',
      isRentable: true,
      published: true,
      pricing: {
        create: [
          { rentalPeriodId: hourlyPeriod.id, price: 25.0 },
          { rentalPeriodId: dailyPeriod.id, price: 150.0 },
          { rentalPeriodId: weeklyPeriod.id, price: 900.0 },
        ],
      },
      inventory: {
        create: {
          quantityOnHand: 5,
        },
      },
    },
  });

  const product2 = await prisma.product.create({
    data: {
      vendorId: vendorProfile.id,
      name: 'Party Tent',
      description: '20x20 ft party tent for outdoor events',
      productType: 'GOODS',
      isRentable: true,
      published: true,
      pricing: {
        create: [
          { rentalPeriodId: dailyPeriod.id, price: 200.0 },
          { rentalPeriodId: weeklyPeriod.id, price: 1200.0 },
        ],
      },
      inventory: {
        create: {
          quantityOnHand: 3,
        },
      },
    },
  });

  const product3 = await prisma.product.create({
    data: {
      vendorId: vendorProfile.id,
      name: 'Delivery Service',
      description: 'Product delivery and setup service',
      productType: 'SERVICE',
      isRentable: false,
      published: true,
      pricing: {
        create: [
          { rentalPeriodId: dailyPeriod.id, price: 50.0 },
        ],
      },
    },
  });
  console.log('✅ Created sample products');

  // Create a Sample Coupon
  await prisma.coupon.create({
    data: {
      code: 'WELCOME10',
      discountType: 'PERCENTAGE',
      value: 10.0,
      validFrom: new Date('2026-01-01'),
      validTo: new Date('2026-12-31'),
      isActive: true,
    },
  });
  console.log('✅ Created sample coupon');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('Admin: admin@rental.com / admin123');
  console.log('Vendor: vendor@rental.com / vendor123');
  console.log('Customer: customer@rental.com / customer123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
