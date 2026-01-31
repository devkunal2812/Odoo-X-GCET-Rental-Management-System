const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSettings() {
  try {
    const settings = await prisma.systemSettings.findMany();
    console.log('📊 System Settings:\n');
    settings.forEach(setting => {
      console.log(`  ${setting.key}: ${setting.value}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSettings();
