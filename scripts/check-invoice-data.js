const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkInvoiceData() {
  try {
    console.log('🔍 Checking invoice data in database...\n');
    
    const invoice = await prisma.invoice.findFirst({
      include: {
        saleOrder: {
          include: {
            lines: {
              include: {
                product: true
              }
            },
            customer: {
              include: {
                user: true
              }
            },
            vendor: true
          }
        },
        lines: {
          include: {
            product: true
          }
        },
        payments: true
      }
    });

    if (!invoice) {
      console.log('❌ No invoices found in database');
      return;
    }

    console.log('✅ Found invoice:', invoice.invoiceNumber);
    console.log('\n📊 Invoice Details:');
    console.log('  Total Amount:', invoice.totalAmount);
    console.log('  Status:', invoice.status);
    console.log('  Invoice Date:', invoice.invoiceDate);
    console.log('  Due Date:', invoice.dueDate);
    
    console.log('\n📦 Invoice Lines:');
    invoice.lines.forEach((line, i) => {
      console.log(`  ${i + 1}. ${line.product.name}`);
      console.log(`     Quantity: ${line.quantity}`);
      console.log(`     Unit Price: ₹${line.unitPrice}`);
      console.log(`     Amount: ₹${line.amount}`);
    });

    console.log('\n🛒 Order Details:');
    console.log('  Order Number:', invoice.saleOrder.orderNumber);
    console.log('  Order Status:', invoice.saleOrder.status);
    console.log('  Start Date:', invoice.saleOrder.startDate);
    console.log('  End Date:', invoice.saleOrder.endDate);
    console.log('  Total Amount:', invoice.saleOrder.totalAmount);

    console.log('\n👤 Customer:');
    console.log('  Name:', `${invoice.saleOrder.customer.user.firstName} ${invoice.saleOrder.customer.user.lastName}`);
    console.log('  Email:', invoice.saleOrder.customer.user.email);
    console.log('  Phone:', invoice.saleOrder.customer.phone);

    console.log('\n🏢 Vendor:');
    console.log('  Company:', invoice.saleOrder.vendor.companyName);

    console.log('\n💳 Payments:');
    if (invoice.payments.length === 0) {
      console.log('  No payments recorded');
    } else {
      invoice.payments.forEach((payment, i) => {
        console.log(`  ${i + 1}. ${payment.method} - ₹${payment.amount} (${payment.status})`);
      });
    }

    console.log('\n✅ Data looks correct!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkInvoiceData();
