const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugReservations() {
  try {
    console.log('🔍 Debugging reservations and inventory...');
    
    // Get all reservations with their orders
    const reservations = await prisma.reservation.findMany({
      include: {
        product: {
          select: {
            name: true,
            inventory: true
          }
        },
        saleOrder: {
          select: {
            orderNumber: true,
            status: true,
            createdAt: true
          }
        }
      }
    });
    
    console.log(`📋 Found ${reservations.length} total reservations`);
    
    reservations.forEach(reservation => {
      const now = new Date();
      const isActive = reservation.startDate <= now && reservation.endDate >= now;
      const isFuture = reservation.startDate > now;
      const isPast = reservation.endDate < now;
      
      console.log(`\n📦 Product: ${reservation.product.name}`);
      console.log(`   Order: ${reservation.saleOrder.orderNumber} (${reservation.saleOrder.status})`);
      console.log(`   Quantity: ${reservation.quantity}`);
      console.log(`   Period: ${reservation.startDate.toISOString().split('T')[0]} to ${reservation.endDate.toISOString().split('T')[0]}`);
      console.log(`   Status: ${isActive ? 'ACTIVE' : isFuture ? 'FUTURE' : 'PAST'}`);
      console.log(`   Total Stock: ${reservation.product.inventory?.quantityOnHand || 0}`);
    });
    
    // Check what the API filter would return
    console.log('\n🔍 Testing API filter conditions...');
    
    const apiFilteredReservations = await prisma.reservation.findMany({
      where: {
        saleOrder: {
          status: {
            in: ['CONFIRMED', 'SENT', 'PICKED_UP']
          }
        },
        endDate: {
          gte: new Date()
        }
      },
      include: {
        product: {
          select: {
            name: true
          }
        },
        saleOrder: {
          select: {
            orderNumber: true,
            status: true
          }
        }
      }
    });
    
    console.log(`📋 API filter returns ${apiFilteredReservations.length} reservations:`);
    apiFilteredReservations.forEach(reservation => {
      console.log(`   ${reservation.product.name}: ${reservation.quantity} units (${reservation.saleOrder.status})`);
    });
    
    // Check order statuses
    console.log('\n📊 Order statuses in database:');
    const orderStatuses = await prisma.saleOrder.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });
    
    orderStatuses.forEach(status => {
      console.log(`   ${status.status}: ${status._count.status} orders`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugReservations();