const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkInventory() {
  try {
    console.log('🔍 Checking product inventory and reservations...');
    
    const products = await prisma.product.findMany({
      include: {
        inventory: true,
        reservations: {
          include: {
            saleOrder: {
              select: {
                orderNumber: true,
                status: true
              }
            }
          }
        }
      },
      take: 5
    });
    
    console.log('📦 Products with inventory:');
    products.forEach(product => {
      const totalStock = product.inventory?.quantityOnHand || 0;
      const activeReservations = product.reservations.filter(r => 
        r.saleOrder.status === 'CONFIRMED' && 
        r.endDate >= new Date()
      );
      const rentedQuantity = activeReservations.reduce((sum, r) => sum + r.quantity, 0);
      const availableQuantity = totalStock - rentedQuantity;
      
      console.log(`${product.name}:`);
      console.log(`  Total Stock: ${totalStock}`);
      console.log(`  Rented: ${rentedQuantity}`);
      console.log(`  Available: ${availableQuantity}`);
      console.log(`  Reservations: ${product.reservations.length}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkInventory();