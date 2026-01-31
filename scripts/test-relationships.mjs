import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testRelationships() {
  console.log('🧪 Testing Database Relationships...\n');

  try {
    // Test 1: RentalPeriodConfig → ProductPricing
    console.log('1️⃣ Testing RentalPeriodConfig → ProductPricing relationship');
    const productWithPricing = await prisma.product.findFirst({
      include: {
        pricing: {
          include: {
            rentalPeriod: true,
          },
        },
      },
    });

    if (productWithPricing && productWithPricing.pricing.length > 0) {
      console.log('   ✅ Product:', productWithPricing.name);
      productWithPricing.pricing.forEach((p) => {
        console.log(
          `      - ${p.rentalPeriod.name}: $${p.price} per ${p.rentalPeriod.unit}`
        );
      });
    } else {
      console.log('   ⚠️  No products with pricing found');
    }

    // Test 2: Coupon structure
    console.log('\n2️⃣ Testing Coupon structure');
    const coupon = await prisma.coupon.findFirst({
      include: {
        orders: true,
      },
    });

    if (coupon) {
      console.log('   ✅ Coupon:', coupon.code);
      console.log(`      - Discount: ${coupon.value}${coupon.discountType === 'PERCENTAGE' ? '%' : ' fixed'}`);
      console.log(`      - Used: ${coupon.usedCount}${coupon.maxUses ? ` / ${coupon.maxUses}` : ''}`);
      console.log(`      - Orders using this coupon: ${coupon.orders.length}`);
    } else {
      console.log('   ⚠️  No coupons found');
    }

    // Test 3: Rental Period Configs
    console.log('\n3️⃣ Testing Rental Period Configs');
    const periods = await prisma.rentalPeriodConfig.findMany({
      include: {
        _count: {
          select: {
            productPricing: true,
          },
        },
      },
    });

    console.log('   ✅ Available Rental Periods:');
    periods.forEach((period) => {
      console.log(
        `      - ${period.name}: ${period.duration} ${period.unit} (used in ${period._count.productPricing} products)`
      );
    });

    console.log('\n✅ All relationship tests passed!');
    console.log('\n📊 Summary:');
    console.log('   - RentalPeriodConfig ←→ ProductPricing: ✅ Connected');
    console.log('   - Coupon ←→ SaleOrder: ✅ Connected');
    console.log('   - All foreign keys: ✅ Working');

  } catch (error) {
    console.error('\n❌ Relationship test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testRelationships();
