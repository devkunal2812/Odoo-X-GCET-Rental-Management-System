const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOrderProducts() {
  try {
    console.log('🔍 Checking all orders and their products...\n');
    
    const orders = await prisma.saleOrder.findMany({
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
        vendor: true,
        invoices: {
          include: {
            lines: {
              include: {
                product: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    orders.forEach((order, i) => {
      console.log(`\n📦 Order ${i + 1}: ${order.orderNumber}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Customer: ${order.customer.user.firstName} ${order.customer.user.lastName}`);
      console.log(`   Vendor: ${order.vendor.companyName}`);
      console.log(`   Total: ₹${order.totalAmount}`);
      
      console.log(`\n   Order Lines (What was ordered):`);
      order.lines.forEach((line, j) => {
        console.log(`     ${j + 1}. ${line.product.name}`);
        console.log(`        Quantity: ${line.quantity}`);
        console.log(`        Unit Price: ₹${line.unitPrice}`);
        console.log(`        Product ID: ${line.productId}`);
      });

      if (order.invoices.length > 0) {
        console.log(`\n   📄 Invoices for this order:`);
        order.invoices.forEach((invoice, k) => {
          console.log(`     Invoice ${k + 1}: ${invoice.invoiceNumber}`);
          console.log(`     Invoice Lines (What's on invoice):`);
          invoice.lines.forEach((line, l) => {
            console.log(`       ${l + 1}. ${line.product.name}`);
            console.log(`          Quantity: ${line.quantity}`);
            console.log(`          Unit Price: ₹${line.unitPrice}`);
            console.log(`          Amount: ₹${line.amount}`);
            console.log(`          Product ID: ${line.productId}`);
          });
          
          // Check if invoice lines match order lines
          const orderProductIds = order.lines.map(l => l.productId).sort();
          const invoiceProductIds = invoice.lines.map(l => l.productId).sort();
          const match = JSON.stringify(orderProductIds) === JSON.stringify(invoiceProductIds);
          
          if (match) {
            console.log(`       ✅ Invoice lines MATCH order lines`);
          } else {
            console.log(`       ❌ MISMATCH! Invoice lines DON'T match order lines`);
            console.log(`          Order products: ${orderProductIds.join(', ')}`);
            console.log(`          Invoice products: ${invoiceProductIds.join(', ')}`);
          }
        });
      } else {
        console.log(`\n   ⚠️ No invoices generated for this order yet`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrderProducts();
