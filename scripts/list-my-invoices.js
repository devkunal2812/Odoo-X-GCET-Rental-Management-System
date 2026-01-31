const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listInvoices() {
  try {
    console.log('📋 All Invoices in System:\n');
    console.log('='.repeat(80));
    
    const invoices = await prisma.invoice.findMany({
      include: {
        saleOrder: {
          include: {
            customer: {
              include: {
                user: true
              }
            },
            vendor: true,
            lines: {
              include: {
                product: true
              }
            }
          }
        },
        lines: {
          include: {
            product: true
          }
        },
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    });

    invoices.forEach((invoice, i) => {
      const order = invoice.saleOrder;
      const customer = order.customer;
      const isPaid = invoice.payments.some(p => p.status === 'COMPLETED');
      
      console.log(`\n${i + 1}. Invoice: ${invoice.invoiceNumber}`);
      console.log('   ' + '-'.repeat(70));
      console.log(`   📅 Date: ${invoice.invoiceDate.toLocaleDateString('en-IN')}`);
      console.log(`   👤 Customer: ${customer.user.firstName} ${customer.user.lastName}`);
      console.log(`   📧 Email: ${customer.user.email}`);
      console.log(`   🏢 Vendor: ${order.vendor.companyName}`);
      console.log(`   📦 Order: ${order.orderNumber}`);
      console.log(`   💰 Total: ₹${invoice.totalAmount}`);
      console.log(`   ✅ Status: ${isPaid ? 'PAID' : 'PENDING'}`);
      
      console.log(`\n   📦 Products on this invoice:`);
      invoice.lines.forEach((line, j) => {
        console.log(`      ${j + 1}. ${line.product.name}`);
        console.log(`         Qty: ${line.quantity} × ₹${line.unitPrice} = ₹${line.amount}`);
      });
      
      console.log('\n   ' + '='.repeat(70));
    });

    console.log(`\n\n📊 Summary:`);
    console.log(`   Total Invoices: ${invoices.length}`);
    console.log(`   Paid: ${invoices.filter(i => i.payments.some(p => p.status === 'COMPLETED')).length}`);
    console.log(`   Pending: ${invoices.filter(i => !i.payments.some(p => p.status === 'COMPLETED')).length}`);
    
    console.log(`\n\n💡 To download YOUR invoice:`);
    console.log(`   1. Find your name/email in the list above`);
    console.log(`   2. Note the invoice number`);
    console.log(`   3. Go to the invoices page in the app`);
    console.log(`   4. Find that invoice number`);
    console.log(`   5. Click download`);
    console.log(`   6. Check browser console for logs`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listInvoices();
