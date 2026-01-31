const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Simulate the API endpoint logic
async function testInvoiceAPI() {
  try {
    console.log('🧪 Testing Invoice API logic...\n');
    
    // Get system settings
    const settingsRecords = await prisma.systemSettings.findMany();
    const settings = {};
    settingsRecords.forEach(s => {
      settings[s.key] = s.value;
    });
    
    const gstPercentage = parseFloat(settings.gst_percentage || '18');
    console.log('📊 GST Percentage:', gstPercentage + '%');
    
    // Get invoices (same as API)
    const invoices = await prisma.invoice.findMany({
      include: {
        saleOrder: {
          include: {
            customer: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
            vendor: {
              select: {
                companyName: true,
              },
            },
            lines: {
              include: {
                product: true,
              },
            },
          },
        },
        lines: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(`\n✅ Found ${invoices.length} invoices\n`);

    // Transform (same as API)
    const transformedInvoices = invoices.map(invoice => {
      const order = invoice.saleOrder;
      
      // Calculate subtotal and tax from totalAmount using GST percentage
      const subtotal = invoice.totalAmount / (1 + gstPercentage / 100);
      const taxAmount = invoice.totalAmount - subtotal;
      const paidAmount = invoice.payments
        .filter(p => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + p.amount, 0);

      return {
        id: invoice.invoiceNumber,
        orderId: order.orderNumber,
        product: invoice.lines[0]?.product?.name || order.lines[0]?.product?.name || "Rental Items",
        vendor: order.vendor?.companyName || "Vendor",
        amount: subtotal,
        tax: taxAmount,
        serviceFee: 0,
        total: invoice.totalAmount,
        status: paidAmount >= invoice.totalAmount ? "paid" : "pending",
        issueDate: invoice.invoiceDate.toISOString().split('T')[0],
        dueDate: invoice.dueDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        paidDate: paidAmount > 0 ? invoice.payments.find(p => p.status === 'COMPLETED')?.createdAt.toISOString().split('T')[0] : null,
        paymentMethod: invoice.payments[0]?.method || "",
        rentalPeriod: order.startDate && order.endDate 
          ? `${order.startDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} - ${order.endDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} (${Math.ceil((order.endDate.getTime() - order.startDate.getTime()) / (1000 * 60 * 60 * 24))} days)`
          : 'N/A',
        paymentId: invoice.payments[0]?.transactionRef || null,
        paymentVerified: paidAmount > 0,
        dbInvoiceId: invoice.id,
        dbOrderId: order.id,
        orderData: {
          id: order.orderNumber,
          startDate: order.startDate,
          endDate: order.endDate,
          deliveryAddress: {
            name: `${order.customer?.user?.firstName || ''} ${order.customer?.user?.lastName || ''}`.trim(),
            email: order.customer?.user?.email || '',
            phone: order.customer?.phone || '',
            street: order.customer?.defaultAddress || '',
            city: "City",
            state: "State",
            zip: "12345",
            country: "India"
          },
          items: invoice.lines.map(line => ({
            id: line.id,
            name: line.product?.name || "Item",
            vendor: order.vendor?.companyName || "Vendor",
            quantity: line.quantity,
            rentalDuration: 1,
            rentalUnit: "days",
            unitPrice: line.unitPrice,
            totalPrice: line.amount
          })),
          paymentVerified: paidAmount > 0,
          paymentId: invoice.payments[0]?.transactionRef || null,
          paymentMethod: invoice.payments[0]?.method || ""
        }
      };
    });

    console.log('📄 Transformed Invoice Data:');
    console.log(JSON.stringify(transformedInvoices[0], null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testInvoiceAPI();
