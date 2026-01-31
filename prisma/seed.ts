import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');
  console.log('🗑️  Clearing existing data...');

  // Clear all existing data in correct order (respecting foreign keys)
  await prisma.auditLog.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.invoiceLine.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.reservation.deleteMany({});
  await prisma.saleOrderLine.deleteMany({});
  await prisma.saleOrder.deleteMany({});
  await prisma.variantAttributeValue.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.productAttributeValue.deleteMany({});
  await prisma.productPricing.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.attributeValue.deleteMany({});
  await prisma.attribute.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.rentalPeriodConfig.deleteMany({});
  await prisma.systemSettings.deleteMany({});
  await prisma.customerProfile.deleteMany({});
  await prisma.vendorProfile.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('✅ Cleared all existing data');

  // ============================================
  // 1. Create Admin User (VERIFIED)
  // ============================================
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin123@gmail.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isActive: true,
      emailVerified: true, // VERIFIED - can login immediately
    },
  });
  console.log('✅ Created admin user (VERIFIED): admin123@gmail.com / admin123');

  // ============================================
  // 2. Create Vendor Users with Profiles
  // ============================================
  const vendor1PasswordHash = await bcrypt.hash('vendor123', 10);
  const vendor1 = await prisma.user.create({
    data: {
      firstName: 'TechRent',
      lastName: 'Pro',
      email: 'techrent@example.com',
      passwordHash: vendor1PasswordHash,
      role: 'VENDOR',
      isActive: true,
      emailVerified: true,
      vendorProfile: {
        create: {
          companyName: 'TechRent Pro',
          gstin: '29ABCDE1234F1Z5',
          address: '123 Tech Street, Silicon Valley, CA 94025',
        },
      },
    },
  });

  const vendor2PasswordHash = await bcrypt.hash('vendor123', 10);
  const vendor2 = await prisma.user.create({
    data: {
      firstName: 'Event',
      lastName: 'Masters',
      email: 'eventmasters@example.com',
      passwordHash: vendor2PasswordHash,
      role: 'VENDOR',
      isActive: true,
      emailVerified: true,
      vendorProfile: {
        create: {
          companyName: 'Event Masters Inc',
          gstin: '29FGHIJ5678K2L6',
          address: '456 Event Plaza, Downtown, NY 10001',
        },
      },
    },
  });

  const vendor3PasswordHash = await bcrypt.hash('vendor123', 10);
  const vendor3 = await prisma.user.create({
    data: {
      firstName: 'Tool',
      lastName: 'Hub',
      email: 'toolhub@example.com',
      passwordHash: vendor3PasswordHash,
      role: 'VENDOR',
      isActive: true,
      emailVerified: true,
      vendorProfile: {
        create: {
          companyName: 'Tool Hub Rentals',
          gstin: '29MNOPQ9012R3S7',
          address: '789 Industrial Ave, Workshop City, TX 75001',
        },
      },
    },
  });

  console.log('✅ Created 3 vendor users with profiles');

  // ============================================
  // 3. Create Customer Users with Profiles
  // ============================================
  const customer1PasswordHash = await bcrypt.hash('customer123', 10);
  const customer1 = await prisma.user.create({
    data: {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com',
      passwordHash: customer1PasswordHash,
      role: 'CUSTOMER',
      isActive: true,
      emailVerified: true,
      customerProfile: {
        create: {
          phone: '+1-555-0101',
          defaultAddress: '100 Main Street, Apt 4B, Springfield, IL 62701',
        },
      },
    },
  });

  const customer2PasswordHash = await bcrypt.hash('customer123', 10);
  const customer2 = await prisma.user.create({
    data: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@example.com',
      passwordHash: customer2PasswordHash,
      role: 'CUSTOMER',
      isActive: true,
      emailVerified: true,
      customerProfile: {
        create: {
          phone: '+1-555-0102',
          defaultAddress: '200 Oak Avenue, Suite 12, Portland, OR 97201',
        },
      },
    },
  });

  const customer3PasswordHash = await bcrypt.hash('customer123', 10);
  const customer3 = await prisma.user.create({
    data: {
      firstName: 'Michael',
      lastName: 'Brown',
      email: 'michael.brown@example.com',
      passwordHash: customer3PasswordHash,
      role: 'CUSTOMER',
      isActive: true,
      emailVerified: true,
      customerProfile: {
        create: {
          phone: '+1-555-0103',
          defaultAddress: '300 Pine Road, Building C, Seattle, WA 98101',
        },
      },
    },
  });

  console.log('✅ Created 3 customer users with profiles');

  // ============================================
  // 4. Create Rental Period Configs
  // ============================================
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

  // ============================================
  // 5. Create System Settings
  // ============================================
  await prisma.systemSettings.createMany({
    data: [
      // General Settings
      { key: 'site_name', value: 'RentMarket Platform', description: 'Name of the rental platform' },
      { key: 'site_description', value: 'Your trusted marketplace for renting everything you need', description: 'Description of the rental platform' },
      { key: 'maintenance_mode', value: 'false', description: 'Enable/disable maintenance mode' },
      { key: 'allow_registration', value: 'true', description: 'Allow new user registrations' },
      { key: 'invoice_prefix', value: 'INV', description: 'Invoice number prefix' },
      { key: 'currency', value: 'INR', description: 'Currency code' },
      
      // Company Details
      { key: 'company_name', value: 'RentMarket Platform', description: 'Company name for invoices' },
      { key: 'company_address', value: '123 Platform Street, Tech City, CA 94000', description: 'Company address for invoices' },
      { key: 'company_gstin', value: '29PLATFORM1234F1Z5', description: 'Company GSTIN for invoices' },
      { key: 'company_phone', value: '+1-800-RENTALS', description: 'Company phone number' },
      { key: 'company_email', value: 'support@rentmarket.com', description: 'Company email address' },
      
      // Payment & Fees
      { key: 'platform_fee', value: '5', description: 'Platform fee percentage' },
      { key: 'gst_percentage', value: '18', description: 'GST/Tax percentage applied to invoices' },
      { key: 'payment_gateway', value: 'razorpay', description: 'Payment gateway provider' },
      { key: 'auto_payouts', value: 'true', description: 'Enable automatic vendor payouts' },
      { key: 'minimum_payout', value: '500', description: 'Minimum payout amount' },
      { key: 'security_deposit_percentage', value: '20', description: 'Security deposit as percentage of order amount' },
      { key: 'late_fee_rate', value: '0.1', description: 'Late fee rate per day (10%)' },
      { key: 'late_fee_grace_period_hours', value: '24', description: 'Grace period in hours before late fees apply' },
      
      // Security Settings
      { key: 'two_factor_auth', value: 'false', description: 'Enable two-factor authentication' },
      { key: 'session_timeout', value: '30', description: 'Session timeout in minutes' },
      { key: 'password_min_length', value: '8', description: 'Minimum password length' },
      { key: 'require_strong_password', value: 'true', description: 'Require strong passwords' },
      
      // Notification Settings
      { key: 'email_notifications', value: 'true', description: 'Enable email notifications' },
      { key: 'sms_notifications', value: 'false', description: 'Enable SMS notifications' },
      { key: 'admin_alerts', value: 'true', description: 'Enable admin alerts' },
    ],
  });
  console.log('✅ Created system settings');

  // ============================================
  // 6. Create Attributes
  // ============================================
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
          { value: 'Silver' },
          { value: 'Gold' },
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

  const brandAttr = await prisma.attribute.create({
    data: {
      name: 'Brand',
      displayType: 'RADIO',
      values: {
        create: [
          { value: 'Canon' },
          { value: 'Nikon' },
          { value: 'Sony' },
          { value: 'Panasonic' },
        ],
      },
    },
  });

  console.log('✅ Created attributes (Color, Size, Brand)');

  // Get vendor profiles
  const vendor1Profile = await prisma.vendorProfile.findUnique({ where: { userId: vendor1.id } });
  const vendor2Profile = await prisma.vendorProfile.findUnique({ where: { userId: vendor2.id } });
  const vendor3Profile = await prisma.vendorProfile.findUnique({ where: { userId: vendor3.id } });

  if (!vendor1Profile || !vendor2Profile || !vendor3Profile) {
    throw new Error('Vendor profiles not found');
  }

  // ============================================
  // 7. Create Products for Vendor 1 (TechRent Pro)
  // ============================================
  const camera1 = await prisma.product.create({
    data: {
      vendorId: vendor1Profile.id,
      name: 'Professional DSLR Camera Kit',
      description: 'Canon EOS 5D Mark IV with 24-70mm lens, perfect for professional photography and videography',
      productType: 'GOODS',
      isRentable: true,
      published: true,
      extraOptions: JSON.stringify([
        {
          label: 'Lens Type',
          inputType: 'radio',
          options: [
            { value: 'Standard 24-70mm', priceImpact: 0 },
            { value: 'Wide Angle 16-35mm', priceImpact: 50 },
            { value: 'Telephoto 70-200mm', priceImpact: 75 },
          ],
        },
        {
          label: 'Accessories',
          inputType: 'checkbox',
          options: [
            { value: 'Extra Battery', priceImpact: 10 },
            { value: 'Memory Card 64GB', priceImpact: 15 },
            { value: 'Camera Bag', priceImpact: 20 },
            { value: 'Tripod', priceImpact: 30 },
          ],
        },
      ]),
      pricing: {
        create: [
          { rentalPeriodId: hourlyPeriod.id, price: 50.0 },
          { rentalPeriodId: dailyPeriod.id, price: 250.0 },
          { rentalPeriodId: weeklyPeriod.id, price: 1500.0 },
        ],
      },
      inventory: {
        create: { quantityOnHand: 8 },
      },
      variants: {
        create: [
          { name: 'Body Only', sku: 'CAM-BODY-001', priceModifier: 0 },
          { name: 'With Standard Lens', sku: 'CAM-STD-001', priceModifier: 50 },
          { name: 'Pro Kit', sku: 'CAM-PRO-001', priceModifier: 150 },
        ],
      },
    },
  });

  const projector1 = await prisma.product.create({
    data: {
      vendorId: vendor1Profile.id,
      name: '4K Projector with Screen',
      description: 'High-quality 4K projector with 120-inch portable screen, perfect for presentations and movie nights',
      productType: 'GOODS',
      isRentable: true,
      published: true,
      pricing: {
        create: [
          { rentalPeriodId: hourlyPeriod.id, price: 40.0 },
          { rentalPeriodId: dailyPeriod.id, price: 180.0 },
          { rentalPeriodId: weeklyPeriod.id, price: 1000.0 },
        ],
      },
      inventory: {
        create: { quantityOnHand: 5 },
      },
    },
  });

  const laptop1 = await prisma.product.create({
    data: {
      vendorId: vendor1Profile.id,
      name: 'MacBook Pro 16" M3',
      description: 'Latest MacBook Pro with M3 chip, 32GB RAM, perfect for video editing and development',
      productType: 'GOODS',
      isRentable: true,
      published: true,
      pricing: {
        create: [
          { rentalPeriodId: dailyPeriod.id, price: 150.0 },
          { rentalPeriodId: weeklyPeriod.id, price: 900.0 },
          { rentalPeriodId: monthlyPeriod.id, price: 3000.0 },
        ],
      },
      inventory: {
        create: { quantityOnHand: 10 },
      },
    },
  });

  console.log('✅ Created 3 products for TechRent Pro');

  // ============================================
  // 8. Create Products for Vendor 2 (Event Masters)
  // ============================================
  const tent1 = await prisma.product.create({
    data: {
      vendorId: vendor2Profile.id,
      name: 'Party Tent 20x20',
      description: 'Large outdoor party tent, perfect for weddings and events, includes setup and takedown',
      productType: 'GOODS',
      isRentable: true,
      published: true,
      pricing: {
        create: [
          { rentalPeriodId: dailyPeriod.id, price: 300.0 },
          { rentalPeriodId: weeklyPeriod.id, price: 1800.0 },
        ],
      },
      inventory: {
        create: { quantityOnHand: 4 },
      },
    },
  });

  const soundSystem1 = await prisma.product.create({
    data: {
      vendorId: vendor2Profile.id,
      name: 'Professional Sound System',
      description: 'Complete PA system with speakers, mixer, and wireless microphones for events up to 500 people',
      productType: 'GOODS',
      isRentable: true,
      published: true,
      pricing: {
        create: [
          { rentalPeriodId: hourlyPeriod.id, price: 60.0 },
          { rentalPeriodId: dailyPeriod.id, price: 350.0 },
          { rentalPeriodId: weeklyPeriod.id, price: 2000.0 },
        ],
      },
      inventory: {
        create: { quantityOnHand: 6 },
      },
    },
  });

  const chairs1 = await prisma.product.create({
    data: {
      vendorId: vendor2Profile.id,
      name: 'Folding Chairs (Set of 50)',
      description: 'Comfortable folding chairs for events, weddings, and parties',
      productType: 'GOODS',
      isRentable: true,
      published: true,
      pricing: {
        create: [
          { rentalPeriodId: dailyPeriod.id, price: 100.0 },
          { rentalPeriodId: weeklyPeriod.id, price: 500.0 },
        ],
      },
      inventory: {
        create: { quantityOnHand: 20 },
      },
    },
  });

  const tables1 = await prisma.product.create({
    data: {
      vendorId: vendor2Profile.id,
      name: 'Round Tables (Set of 10)',
      description: '60-inch round tables with tablecloths, perfect for events',
      productType: 'GOODS',
      isRentable: true,
      published: true,
      pricing: {
        create: [
          { rentalPeriodId: dailyPeriod.id, price: 150.0 },
          { rentalPeriodId: weeklyPeriod.id, price: 800.0 },
        ],
      },
      inventory: {
        create: { quantityOnHand: 15 },
      },
    },
  });

  console.log('✅ Created 4 products for Event Masters');

  // ============================================
  // 9. Create Products for Vendor 3 (Tool Hub)
  // ============================================
  const drill1 = await prisma.product.create({
    data: {
      vendorId: vendor3Profile.id,
      name: 'Professional Power Drill Set',
      description: 'Heavy-duty cordless drill with complete bit set and carrying case',
      productType: 'GOODS',
      isRentable: true,
      published: true,
      pricing: {
        create: [
          { rentalPeriodId: hourlyPeriod.id, price: 15.0 },
          { rentalPeriodId: dailyPeriod.id, price: 50.0 },
          { rentalPeriodId: weeklyPeriod.id, price: 250.0 },
        ],
      },
      inventory: {
        create: { quantityOnHand: 12 },
      },
    },
  });

  const ladder1 = await prisma.product.create({
    data: {
      vendorId: vendor3Profile.id,
      name: 'Extension Ladder 24ft',
      description: 'Professional-grade aluminum extension ladder, safe for heights up to 24 feet',
      productType: 'GOODS',
      isRentable: true,
      published: true,
      pricing: {
        create: [
          { rentalPeriodId: dailyPeriod.id, price: 40.0 },
          { rentalPeriodId: weeklyPeriod.id, price: 200.0 },
        ],
      },
      inventory: {
        create: { quantityOnHand: 8 },
      },
    },
  });

  const generator1 = await prisma.product.create({
    data: {
      vendorId: vendor3Profile.id,
      name: 'Portable Generator 5000W',
      description: 'Reliable portable generator for outdoor events and construction sites',
      productType: 'GOODS',
      isRentable: true,
      published: true,
      pricing: {
        create: [
          { rentalPeriodId: dailyPeriod.id, price: 80.0 },
          { rentalPeriodId: weeklyPeriod.id, price: 450.0 },
        ],
      },
      inventory: {
        create: { quantityOnHand: 6 },
      },
    },
  });

  console.log('✅ Created 3 products for Tool Hub');

  // ============================================
  // 10. Create Coupons
  // ============================================
  await prisma.coupon.createMany({
    data: [
      {
        code: 'WELCOME10',
        discountType: 'PERCENTAGE',
        value: 10.0,
        validFrom: new Date('2026-01-01'),
        validTo: new Date('2026-12-31'),
        isActive: true,
        maxUses: 100,
        usedCount: 0,
      },
      {
        code: 'FIRST20',
        discountType: 'PERCENTAGE',
        value: 20.0,
        validFrom: new Date('2026-01-01'),
        validTo: new Date('2026-06-30'),
        isActive: true,
        maxUses: 50,
        usedCount: 0,
      },
      {
        code: 'SAVE50',
        discountType: 'FLAT',
        value: 50.0,
        validFrom: new Date('2026-01-01'),
        validTo: new Date('2026-12-31'),
        isActive: true,
        maxUses: 200,
        usedCount: 0,
      },
    ],
  });
  console.log('✅ Created 3 coupons');

  // Get customer profiles
  const customer1Profile = await prisma.customerProfile.findUnique({ where: { userId: customer1.id } });
  const customer2Profile = await prisma.customerProfile.findUnique({ where: { userId: customer2.id } });
  const customer3Profile = await prisma.customerProfile.findUnique({ where: { userId: customer3.id } });

  if (!customer1Profile || !customer2Profile || !customer3Profile) {
    throw new Error('Customer profiles not found');
  }

  // ============================================
  // 11. Create Sample Orders
  // ============================================
  
  // Order 1: Confirmed order with reservation
  const order1 = await prisma.saleOrder.create({
    data: {
      orderNumber: `SO-${Date.now()}-001`,
      customerId: customer1Profile.id,
      vendorId: vendor1Profile.id,
      status: 'CONFIRMED',
      startDate: new Date('2026-02-15'),
      endDate: new Date('2026-02-20'),
      orderDate: new Date(),
      totalAmount: 1500.0,
      discount: 0,
      lines: {
        create: [
          {
            productId: camera1.id,
            quantity: 2,
            unitPrice: 250.0,
            rentalStart: new Date('2026-02-15'),
            rentalEnd: new Date('2026-02-20'),
          },
        ],
      },
      reservations: {
        create: [
          {
            productId: camera1.id,
            quantity: 2,
            startDate: new Date('2026-02-15'),
            endDate: new Date('2026-02-20'),
          },
        ],
      },
    },
  });

  // Order 2: Quotation (no reservation yet)
  const order2 = await prisma.saleOrder.create({
    data: {
      orderNumber: `SO-${Date.now()}-002`,
      customerId: customer2Profile.id,
      vendorId: vendor2Profile.id,
      status: 'QUOTATION',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-03-03'),
      orderDate: new Date(),
      totalAmount: 900.0,
      discount: 0,
      lines: {
        create: [
          {
            productId: tent1.id,
            quantity: 1,
            unitPrice: 300.0,
            rentalStart: new Date('2026-03-01'),
            rentalEnd: new Date('2026-03-03'),
          },
        ],
      },
    },
  });

  // Order 3: Sent order
  const order3 = await prisma.saleOrder.create({
    data: {
      orderNumber: `SO-${Date.now()}-003`,
      customerId: customer3Profile.id,
      vendorId: vendor3Profile.id,
      status: 'SENT',
      startDate: new Date('2026-02-25'),
      endDate: new Date('2026-02-28'),
      orderDate: new Date(),
      totalAmount: 240.0,
      discount: 0,
      lines: {
        create: [
          {
            productId: drill1.id,
            quantity: 3,
            unitPrice: 50.0,
            rentalStart: new Date('2026-02-25'),
            rentalEnd: new Date('2026-02-28'),
          },
        ],
      },
    },
  });

  console.log('✅ Created 3 sample orders');

  // ============================================
  // 12. Create Invoices and Payments
  // ============================================
  
  // Invoice for Order 1
  const invoice1 = await prisma.invoice.create({
    data: {
      invoiceNumber: `INV-${Date.now()}-001`,
      saleOrderId: order1.id,
      status: 'POSTED',
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      totalAmount: 1770.0, // 1500 + 18% GST
      lines: {
        create: [
          {
            productId: camera1.id,
            description: 'Professional DSLR Camera Kit - 5 days rental',
            quantity: 2,
            unitPrice: 250.0,
            amount: 1250.0,
          },
        ],
      },
      payments: {
        create: [
          {
            method: 'CARD',
            amount: 1770.0,
            status: 'COMPLETED',
            transactionRef: `TXN-${Date.now()}-001`,
          },
        ],
      },
    },
  });

  console.log('✅ Created 1 invoice with payment');

  // ============================================
  // 13. Create Audit Logs
  // ============================================
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: 'LOGIN',
        entity: 'User',
        entityId: admin.id,
        metadata: JSON.stringify({ ip: '127.0.0.1', userAgent: 'Seed Script' }),
      },
      {
        userId: vendor1.id,
        action: 'PRODUCT_CREATED',
        entity: 'Product',
        entityId: camera1.id,
        metadata: JSON.stringify({ productName: 'Professional DSLR Camera Kit' }),
      },
      {
        userId: customer1.id,
        action: 'ORDER_CREATED',
        entity: 'SaleOrder',
        entityId: order1.id,
        metadata: JSON.stringify({ orderNumber: order1.orderNumber, amount: 1500.0 }),
      },
      {
        userId: vendor1.id,
        action: 'ORDER_CONFIRMED',
        entity: 'SaleOrder',
        entityId: order1.id,
        metadata: JSON.stringify({ orderNumber: order1.orderNumber }),
      },
      {
        userId: vendor1.id,
        action: 'INVOICE_POSTED',
        entity: 'Invoice',
        entityId: invoice1.id,
        metadata: JSON.stringify({ invoiceNumber: invoice1.invoiceNumber, amount: 1770.0 }),
      },
    ],
  });
  console.log('✅ Created 5 audit log entries');

  // ============================================
  // Summary
  // ============================================
  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 Users:');
  console.log('   • 1 Admin (VERIFIED)');
  console.log('   • 3 Vendors (VERIFIED)');
  console.log('   • 3 Customers (VERIFIED)');
  console.log('\n📦 Products:');
  console.log('   • 10 Products across 3 vendors');
  console.log('   • All products published and available');
  console.log('\n📋 Orders:');
  console.log('   • 3 Sample orders (QUOTATION, SENT, CONFIRMED)');
  console.log('   • 1 Invoice with payment');
  console.log('\n🎫 Coupons:');
  console.log('   • 3 Active coupons');
  console.log('\n⚙️  System:');
  console.log('   • 25 System settings configured');
  console.log('   • 4 Rental periods (Hourly, Daily, Weekly, Monthly)');
  console.log('   • 3 Attributes (Color, Size, Brand)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n🔑 Login Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👑 ADMIN (VERIFIED - Can login immediately):');
  console.log('   Email: admin123@gmail.com');
  console.log('   Password: admin123');
  console.log('\n🏢 VENDORS (All verified):');
  console.log('   Email: techrent@example.com | Password: vendor123');
  console.log('   Email: eventmasters@example.com | Password: vendor123');
  console.log('   Email: toolhub@example.com | Password: vendor123');
  console.log('\n👥 CUSTOMERS (All verified):');
  console.log('   Email: john.smith@example.com | Password: customer123');
  console.log('   Email: sarah.johnson@example.com | Password: customer123');
  console.log('   Email: michael.brown@example.com | Password: customer123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
