const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugProductVisibility() {
  try {
    console.log('🔍 Debugging product visibility in API...');
    
    // Get the most recent product
    const recentProduct = await prisma.product.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        vendor: {
          select: {
            companyName: true,
            user: {
              select: {
                email: true
              }
            }
          }
        },
        pricing: {
          include: {
            rentalPeriod: true
          }
        },
        inventory: true,
        reservations: {
          where: {
            saleOrder: {
              status: {
                in: ['CONFIRMED', 'SENT', 'PICKED_UP']
              }
            },
            endDate: {
              gte: new Date()
            }
          }
        }
      }
    });
    
    if (!recentProduct) {
      console.log('❌ No products found');
      return;
    }
    
    console.log('📦 Most recent product:');
    console.log(`- ID: ${recentProduct.id}`);
    console.log(`- Name: ${recentProduct.name}`);
    console.log(`- Vendor: ${recentProduct.vendor.companyName} (${recentProduct.vendor.user.email})`);
    console.log(`- Published: ${recentProduct.published}`);
    console.log(`- Created: ${recentProduct.createdAt}`);
    console.log(`- Stock: ${recentProduct.inventory?.quantityOnHand || 0}`);
    console.log(`- Reservations: ${recentProduct.reservations.length}`);
    
    // Check what the API filtering logic would do
    const totalStock = recentProduct.inventory?.quantityOnHand || 0;
    const reservedQuantity = recentProduct.reservations.reduce((total, reservation) => {
      const now = new Date();
      if (reservation.endDate >= now) {
        return total + reservation.quantity;
      }
      return total;
    }, 0);
    const availableQuantity = Math.max(0, totalStock - reservedQuantity);
    const isOutOfStock = availableQuantity === 0;
    
    console.log('\n📊 Calculated availability:');
    console.log(`- Total Stock: ${totalStock}`);
    console.log(`- Reserved: ${reservedQuantity}`);
    console.log(`- Available: ${availableQuantity}`);
    console.log(`- Out of Stock: ${isOutOfStock}`);
    
    // Test the API query directly
    console.log('\n🔍 Testing API query conditions...');
    
    // Test 1: All products
    const allProducts = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        published: true,
        vendorId: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log(`📋 All products (${allProducts.length}):`);
    allProducts.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} - Published: ${p.published} - Vendor: ${p.vendorId}`);
    });
    
    // Test 2: Published products only
    const publishedProducts = await prisma.product.findMany({
      where: { published: true },
      select: {
        id: true,
        name: true,
        published: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log(`\n📋 Published products (${publishedProducts.length}):`);
    publishedProducts.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} - Published: ${p.published}`);
    });
    
    // Test 3: Check if vendor filter is affecting results
    const vendorProducts = await prisma.product.findMany({
      where: { vendorId: recentProduct.vendorId },
      select: {
        id: true,
        name: true,
        published: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log(`\n📋 Products by same vendor (${vendorProducts.length}):`);
    vendorProducts.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} - Published: ${p.published}`);
    });
    
    // Check what the API is actually returning
    console.log('\n🌐 Testing actual API calls...');
    
    try {
      // Test with includeOutOfStock=true and no published filter
      const response1 = await fetch('http://localhost:3000/api/products/available?includeOutOfStock=true&published=false');
      const data1 = await response1.json();
      console.log(`API call 1 (includeOutOfStock=true, published=false): ${data1.success ? data1.products.length : 'failed'} products`);
      
      // Test with no filters
      const response2 = await fetch('http://localhost:3000/api/products/available?includeOutOfStock=true');
      const data2 = await response2.json();
      console.log(`API call 2 (includeOutOfStock=true, no published filter): ${data2.success ? data2.products.length : 'failed'} products`);
      
      if (data2.success) {
        const foundRecent = data2.products.find(p => p.id === recentProduct.id);
        console.log(`Recent product found in API: ${foundRecent ? 'YES' : 'NO'}`);
        
        if (!foundRecent) {
          console.log('🔍 Products in API response:');
          data2.products.slice(0, 3).forEach((p, i) => {
            console.log(`${i + 1}. ${p.name} - Published: ${p.published} - Created: ${p.createdAt}`);
          });
        }
      }
      
    } catch (error) {
      console.log('❌ API call failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error debugging product visibility:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugProductVisibility();