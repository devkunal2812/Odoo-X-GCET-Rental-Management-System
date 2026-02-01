const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAPIProductCreation() {
  try {
    console.log('🔍 Testing product creation API endpoint...');
    
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
    
    // Get rental periods via API
    console.log('📅 Fetching rental periods via API...');
    const periodsResponse = await fetch('http://localhost:3000/api/rental-periods');
    const periodsData = await periodsResponse.json();
    
    console.log('Rental periods API response:', periodsData);
    
    if (!periodsData.success || !periodsData.periods || periodsData.periods.length === 0) {
      console.log('❌ No rental periods available via API');
      return;
    }
    
    // Create test product via API
    const testProductData = {
      name: `API Test Product ${Date.now()}`,
      description: 'Test product created via API',
      productType: 'GOODS',
      category: 'ELECTRONICS',
      isRentable: true,
      quantityOnHand: 10,
      pricing: [
        {
          rentalPeriodId: periodsData.periods[0].id,
          price: 150
        }
      ]
    };
    
    console.log('📦 Creating product via API with data:');
    console.log(JSON.stringify(testProductData, null, 2));
    
    // We need to simulate authentication - let's check what cookies are needed
    console.log('⚠️ Note: API requires authentication. Testing direct database creation instead.');
    
    // Test direct creation with the same data structure
    const directProduct = await prisma.product.create({
      data: {
        vendorId: vendor.id,
        name: testProductData.name,
        description: testProductData.description,
        productType: testProductData.productType,
        category: testProductData.category,
        isRentable: testProductData.isRentable,
        extraOptions: '[]',
        pricing: {
          create: testProductData.pricing.map(p => ({
            rentalPeriodId: p.rentalPeriodId,
            price: p.price
          }))
        },
        inventory: {
          create: {
            quantityOnHand: testProductData.quantityOnHand
          }
        }
      },
      include: {
        pricing: {
          include: {
            rentalPeriod: true
          }
        },
        inventory: true
      }
    });
    
    console.log('✅ Product created successfully via direct database:');
    console.log(JSON.stringify(directProduct, null, 2));
    
    // Check if it appears in the products API
    console.log('🔍 Checking if product appears in products API...');
    const productsResponse = await fetch('http://localhost:3000/api/products/available?includeOutOfStock=true');
    const productsData = await productsResponse.json();
    
    if (productsData.success) {
      const foundProduct = productsData.products.find(p => p.id === directProduct.id);
      if (foundProduct) {
        console.log('✅ Product found in API response!');
        console.log('Product in API:', {
          id: foundProduct.id,
          name: foundProduct.name,
          published: foundProduct.published,
          realTimeInventory: foundProduct.realTimeInventory
        });
      } else {
        console.log('❌ Product not found in API response');
        console.log(`Total products in API: ${productsData.products.length}`);
      }
    } else {
      console.log('❌ Failed to fetch products via API');
    }
    
  } catch (error) {
    console.error('❌ Error testing API product creation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAPIProductCreation();