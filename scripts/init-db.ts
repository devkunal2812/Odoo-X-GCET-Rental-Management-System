import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');

    // Check if database is accessible
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Check if we have any users
    const userCount = await prisma.user.count();
    console.log(`📊 Current users in database: ${userCount}`);

    // Check if we have any orders
    const orderCount = await prisma.saleOrder.count();
    console.log(`📊 Current orders in database: ${orderCount}`);

    console.log('✅ Database initialization complete');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('does not exist')) {
        console.log('💡 Run: npx prisma migrate dev');
      } else if (error.message.includes('connection')) {
        console.log('💡 Check your DATABASE_URL in .env file');
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

export { initializeDatabase };