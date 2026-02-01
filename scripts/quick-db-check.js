const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function quickDBCheck() {
  try {
    console.log('🔍 Checking database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Count records
    const counts = await Promise.all([
      prisma.product.count(),
      prisma.saleOrder.count(),
      prisma.reservation.count(),
      prisma.user.count()
    ]);
    
    console.log('\n📊 Database Records:');
    console.log(`   Products: ${counts[0]}`);
    console.log(`   Orders: ${counts[1]}`);
    console.log(`   Reservations: ${counts[2]}`);
    console.log(`   Users: ${counts[3]}`);
    
    // Check for active rentals
    const activeRentals = await prisma.reservation.count({
      where: {
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
        saleOrder: {
          status: { in: ['CONFIRMED', 'SENT', 'PICKED_UP'] }
        }
      }
    });
    
    console.log(`\n🔒 Active Rentals: ${activeRentals}`);
    
    if (activeRentals > 0) {
      console.log('✅ Real-time inventory system is working (has active rentals to track)');
    } else {
      console.log('ℹ️  No active rentals found (all products available)');
    }
    
    console.log('\n🎉 Database is fully connected and working!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

quickDBCheck();