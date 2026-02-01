const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testProductCreation() {
  try {
    console.log('🔍 Testing product creation and database storage...');
    
    // First, check current products count
    const initialCount = await prisma.product.count();
    console.log(`📊 Initial products count: ${initialCount}`);
    
    // Get a vendor to test with
    const vendor = await prisma.vendorProfile.findFirst({
      include: {
        user: true
      }
    });
    
    if (!vendor) {
      console.log('❌ No vendor found in database');
      return;
    }
    
    console.log(`👤 Testing with vendor: ${vendor.companyName} (${vendor.user.email})`);
    
    // Get rental periods
    const rentalPeriods = await prisma.rentalPeriodConfig.findMany();
    console.log(`📅 Available rental periods: ${rentalPeriods.length}`);
    
    if (rentalPeriods.length === 0) {
      console.log('❌ No rental periods found');
      return;
    }
    
    // Create a test product directly in database
    const testProduct = await prisma.product.create({
      data: {
        vendorId: vendor.id,
        name: `Test Product ${Date.now()}`,
        description: 'Test product created via script',
        productType: 'GOODS',
        category: 'ELECTRONICS',
        isRentable: true,
        extraOptions: '[]',
        pricing: {
          create: {
            rentalPeriodId: rentalPeriods[0].id,
            price: 100
          }
        },
        inventory: {
          create: {
            quantityOnHand: 5
          }
        }
      },
      include: {
        pricing: {
          include: {
            rentalPeriod: true
          }
        },
        inventory: true,
        vendor: true
      }
    });
    
    console.log('✅ Product created successfully in database:');
    console.log(JSON.stringify(testProduct, null, 2));
    
    // Check final count
    const finalCount = await prisma.product.count();
    console.log(`📊 Final products count: ${finalCount}`);
    console.log(`📈 Products added: ${finalCount - initialCount}`);
    
    // List recent products
    const recentProducts = await prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        vendor: {
          select: {
            companyName: true
          }
        },
        pricing: {
          include: {
            rentalPeriod: true
          }
        },
        inventory: true
      }
    });
    
    console.log('\n📋 Recent products in database:');
    recentProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} by ${product.vendor.companyName}`);
      console.log(`   - Stock: ${product.inventory?.quantityOnHand || 0}`);
      console.log(`   - Published: ${product.published}`);
      console.log(`   - Created: ${product.createdAt}`);
    });
    
  } catch (error) {
    console.error('❌ Error testing product creation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProductCreation();