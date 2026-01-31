const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixGST() {
  try {
    console.log('🔧 Fixing GST percentage...\n');
    
    const current = await prisma.systemSettings.findUnique({
      where: { key: 'gst_percentage' }
    });
    
    console.log('Current GST:', current.value + '%');
    
    await prisma.systemSettings.update({
      where: { key: 'gst_percentage' },
      data: { value: '18' }
    });
    
    const updated = await prisma.systemSettings.findUnique({
      where: { key: 'gst_percentage' }
    });
    
    console.log('Updated GST:', updated.value + '%');
    console.log('\n✅ GST percentage fixed to 18% (standard Indian GST rate)');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixGST();
