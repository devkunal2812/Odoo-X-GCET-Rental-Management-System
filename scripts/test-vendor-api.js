const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testVendorAPI() {
  try {
    console.log('🔍 Testing vendor-specific API call...');
    
    // Get a vendor
    const vendor = await prisma.vendorProfile.findFirst({
      include: {
        user: true
      }
    });
    
    if (!vendor) {
      console.log('❌ No vendor found');
      return;
    }
    
    console.log(`👤 Testing with vendor: ${vendor.companyName} (ID: ${vendor.id})`);
    
    // Test API call with vendorId
    const response = await fetch(`http://localhost:3000/api/products/available?vendorId=${vendor.id}&includeOutOfStock=true`);
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ API call successful! Found ${data.products.length} products`);
      
      console.log('\n📋 Products returned by API:');
      data.products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   - Published: ${product.published}`);
        console.log(`   - Created: ${product.createdAt}`);
        console.log(`   - Stock: ${product.realTimeInventory?.totalStock || 'N/A'}`);
        console.log(`   - Available: ${product.realTimeInventory?.availableQuantity || 'N/A'}`);
      });
      
      // Check if recent products are included
      const recentProducts = await prisma.product.findMany({
        where: { vendorId: vendor.id },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          name: true,
          published: true,
          createdAt: true
        }
      });
      
      console.log('\n🔍 Recent products in database:');
      recentProducts.forEach((product, index) => {
        const foundInAPI = data.products.find(p => p.id === product.id);
        console.log(`${index + 1}. ${product.name} - Published: ${product.published} - In API: ${foundInAPI ? 'YES' : 'NO'}`);
      });
      
    } else {
      console.log('❌ API call failed:', data);
    }
    
  } catch (error) {
    console.error('❌ Error testing vendor API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testVendorAPI();