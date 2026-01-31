const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCompanyEndpoint() {
  try {
    console.log('🧪 Testing company info retrieval...\n');
    
    // Simulate what the endpoint does
    const settingsRecords = await prisma.systemSettings.findMany({
      where: {
        key: {
          in: [
            'company_name',
            'company_address',
            'company_phone',
            'company_email',
            'company_gstin'
          ]
        }
      }
    });

    const settings = {};
    settingsRecords.forEach(s => {
      settings[s.key] = s.value;
    });

    const companyInfo = {
      name: settings.company_name || 'RentMarket Platform',
      address: settings.company_address || '123 Platform Street, Tech City, CA 94000',
      phone: settings.company_phone || '+1-800-RENTALS',
      email: settings.company_email || 'support@rentmarket.com',
      website: 'www.rentmarket.com',
      gstin: settings.company_gstin || '29PLATFORM1234F1Z5'
    };

    console.log('✅ Company Info that will be used in invoices:\n');
    console.log('   Name:', companyInfo.name);
    console.log('   Address:', companyInfo.address);
    console.log('   Phone:', companyInfo.phone);
    console.log('   Email:', companyInfo.email);
    console.log('   Website:', companyInfo.website);
    console.log('   GSTIN:', companyInfo.gstin);
    
    console.log('\n✅ This endpoint is now PUBLIC - no authentication required');
    console.log('   Customers can download invoices with company info');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCompanyEndpoint();
