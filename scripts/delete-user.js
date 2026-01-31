const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteUser() {
  try {
    const email = 'nakuldesai2006@gmail.com';
    
    console.log(`🔍 Looking for user: ${email}...`);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        vendorProfile: true,
        customerProfile: true,
      }
    });

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return;
    }

    console.log(`✅ Found user:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Email Verified: ${user.emailVerified}`);

    // Delete user (cascade will delete related profiles)
    await prisma.user.delete({
      where: { email }
    });

    console.log(`\n✅ User deleted successfully: ${email}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteUser();
