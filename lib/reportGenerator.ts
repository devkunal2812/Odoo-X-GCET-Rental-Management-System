import jsPDF from 'jspdf';
import type { 
  AdminSummaryReport, 
  AdminRevenueReport, 
  AdminProductsReport, 
  AdminVendorsReport, 
  AdminOrdersReport 
} from '@/types/api';

const primaryColor: [number, number, number] = [55, 53, 62]; // #37353E
const accentColor: [number, number, number] = [68, 68, 78]; // #44444E
const lightGray: [number, number, number] = [211, 218, 217]; // #D3DAD9

// Format currency in Indian Rupee style
const formatRupee = (amount: number): string => {
  return 'Rs. ' + amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Format date
const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

// Draw a simple table manually
const drawTable = (
  doc: jsPDF,
  startY: number,
  headers: string[],
  rows: string[][],
  columnWidths: number[]
): number => {
  const startX = 15;
  const rowHeight = 8;
  const padding = 2;
  
  // Draw header
  doc.setFillColor(...primaryColor);
  doc.rect(startX, startY, columnWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  
  let xPos = startX + padding;
  headers.forEach((header, i) => {
    doc.text(header, xPos, startY + 5.5);
    xPos += columnWidths[i];
  });
  
  // Draw rows
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  let yPos = startY + rowHeight;
  rows.forEach((row, rowIndex) => {
    // Alternate row colors
    if (rowIndex % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(startX, yPos, columnWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
    }
    
    xPos = startX + padding;
    row.forEach((cell, i) => {
      // Truncate long text
      const maxWidth = columnWidths[i] - padding * 2;
      const text = doc.splitTextToSize(cell, maxWidth)[0] || cell;
      doc.text(text, xPos, yPos + 5.5);
      xPos += columnWidths[i];
    });
    
    yPos += rowHeight;
  });
  
  // Draw border
  doc.setDrawColor(...lightGray);
  doc.setLineWidth(0.5);
  doc.rect(startX, startY, columnWidths.reduce((a, b) => a + b, 0), yPos - startY);
  
  return yPos;
};

// Add header to PDF
const addHeader = (doc: jsPDF, title: string, subtitle: string) => {
  const pageWidth = doc.internal.pageSize.width;
  
  // Header background
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 15, 15);
  
  // Subtitle
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitle, 15, 25);
  
  // Date
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, pageWidth - 15, 15, { align: 'right' });
  
  doc.setTextColor(0, 0, 0);
};

// Add footer to PDF
const addFooter = (doc: jsPDF) => {
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const pageNumber = (doc as any).internal.getCurrentPageInfo().pageNumber;
  
  doc.setFontSize(8);
  doc.setTextColor(113, 90, 90);
  doc.text(
    `RentERP Solutions | Page ${pageNumber}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );
};

// Generate Summary Report PDF
export const generateSummaryReportPDF = async (data: AdminSummaryReport): Promise<void> => {
  try {
    const doc = new jsPDF();
    
    console.log('Starting PDF generation...');
    
    addHeader(doc, 'Summary Report', 'Complete System Overview');
    
    let yPos = 45;
    
    // Key Metrics Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Key Metrics', 15, yPos);
    yPos += 10;
    
    const metricsData = [
      ['Total Orders', data.metrics.totalOrders.toString()],
      ['Total Revenue', formatRupee(data.metrics.totalRevenue)],
      ['Total Invoices', data.metrics.totalInvoices.toString()],
      ['Total Payments', data.metrics.totalPayments.toString()],
      ['Total Vendors', data.metrics.totalVendors.toString()],
      ['Total Customers', data.metrics.totalCustomers.toString()],
      ['Total Products', data.metrics.totalProducts.toString()],
      ['Active Reservations', data.metrics.activeReservations.toString()],
      ['Late Returns', data.metrics.lateReturns.toString()]
    ];
    
    yPos = drawTable(doc, yPos, ['Metric', 'Value'], metricsData, [120, 60]);
    yPos += 15;
    
    // Orders by Status Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Orders by Status', 15, yPos);
    yPos += 10;
    
    const statusData = data.ordersByStatus.map(item => [
      item.status,
      item.count.toString()
    ]);
    
    yPos = drawTable(doc, yPos, ['Status', 'Count'], statusData, [120, 60]);
    
    addFooter(doc);
    doc.save(`Summary_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    console.log('Summary report PDF generated successfully');
  } catch (error) {
    console.error('Error generating summary report PDF:', error);
    throw error;
  }
};

// Generate Revenue Report PDF
export const generateRevenueReportPDF = async (data: AdminRevenueReport): Promise<void> => {
  try {
    const doc = new jsPDF();
    
    addHeader(doc, 'Revenue Report', 'Detailed Revenue Analysis');
    
    let yPos = 45;
    
    // Summary Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Revenue Summary', 15, yPos);
    yPos += 10;
    
    const summaryData = [
      ['Total Revenue', formatRupee(data.summary.totalRevenue)],
      ['Average Invoice Value', formatRupee(data.summary.averageInvoiceValue)],
      ['Invoice Count', data.summary.invoiceCount.toString()],
      ['Taxes Collected', formatRupee(data.summary.taxesCollected)],
      ['Total Discounts', formatRupee(data.summary.totalDiscounts)]
    ];
    
    yPos = drawTable(doc, yPos, ['Metric', 'Value'], summaryData, [120, 60]);
    yPos += 15;
    
    // Revenue by Vendor Section
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Revenue by Vendor', 15, yPos);
    yPos += 10;
    
    const vendorData = data.byVendor.map(vendor => [
      vendor.vendorName,
      formatRupee(vendor.totalRevenue),
      vendor.invoiceCount.toString()
    ]);
    
    yPos = drawTable(doc, yPos, ['Vendor Name', 'Total Revenue', 'Invoices'], vendorData, [80, 60, 40]);
    
    addFooter(doc);
    doc.save(`Revenue_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    console.log('Revenue report PDF generated successfully');
  } catch (error) {
    console.error('Error generating revenue report PDF:', error);
    throw error;
  }
};

// Generate Products Report PDF
export const generateProductsReportPDF = async (data: AdminProductsReport): Promise<void> => {
  try {
    const doc = new jsPDF();
    
    addHeader(doc, 'Products Report', 'Product Performance & Inventory');
    
    let yPos = 45;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Product Performance', 15, yPos);
    yPos += 10;
    
    const productData = data.products.map(product => [
      product.productName.substring(0, 30),
      product.vendorName.substring(0, 20),
      product.totalRentals.toString(),
      product.totalQuantityRented.toString(),
      product.currentStock.toString()
    ]);
    
    yPos = drawTable(doc, yPos, ['Product', 'Vendor', 'Rentals', 'Qty', 'Stock'], productData, [60, 45, 25, 25, 25]);
    
    addFooter(doc);
    doc.save(`Products_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    console.log('Products report PDF generated successfully');
  } catch (error) {
    console.error('Error generating products report PDF:', error);
    throw error;
  }
};

// Generate Vendors Report PDF
export const generateVendorsReportPDF = async (data: AdminVendorsReport): Promise<void> => {
  try {
    const doc = new jsPDF();
    
    addHeader(doc, 'Vendors Report', 'Vendor Performance & Analytics');
    
    let yPos = 45;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Vendor Performance', 15, yPos);
    yPos += 10;
    
    const vendorData = data.vendors.map(vendor => [
      vendor.vendorName.substring(0, 25),
      vendor.email.substring(0, 25),
      vendor.totalProducts.toString(),
      vendor.publishedProducts.toString(),
      vendor.totalOrders.toString(),
      formatRupee(vendor.totalRevenue).substring(0, 15)
    ]);
    
    yPos = drawTable(doc, yPos, ['Vendor', 'Email', 'Prod', 'Pub', 'Orders', 'Revenue'], vendorData, [40, 40, 20, 20, 25, 35]);
    
    addFooter(doc);
    doc.save(`Vendors_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    console.log('Vendors report PDF generated successfully');
  } catch (error) {
    console.error('Error generating vendors report PDF:', error);
    throw error;
  }
};

// Generate Orders Report PDF
export const generateOrdersReportPDF = async (data: AdminOrdersReport): Promise<void> => {
  try {
    const doc = new jsPDF();
    
    addHeader(doc, 'Orders Report', 'Order Trends & Fulfillment');
    
    let yPos = 45;
    
    // Summary Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Order Summary', 15, yPos);
    yPos += 10;
    
    const summaryData = [
      ['Total Orders', data.summary.totalOrders.toString()],
      ['Late Returns', data.summary.lateReturnsCount.toString()]
    ];
    
    yPos = drawTable(doc, yPos, ['Metric', 'Value'], summaryData, [120, 60]);
    yPos += 15;
    
    // Orders by Status
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Orders by Status', 15, yPos);
    yPos += 10;
    
    const statusData = data.summary.byStatus.map(item => [
      item.status,
      item.count.toString()
    ]);
    
    yPos = drawTable(doc, yPos, ['Status', 'Count'], statusData, [120, 60]);
    yPos += 15;
    
    // Late Returns Section
    if (data.lateReturns.length > 0) {
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(239, 68, 68);
      doc.text('Late Returns', 15, yPos);
      yPos += 10;
      
      const lateReturnsData = data.lateReturns.map(item => [
        item.orderNumber,
        item.customerName.substring(0, 20),
        formatDate(item.expectedReturnDate),
        item.daysOverdue.toString(),
        formatRupee(item.lateFee).substring(0, 15)
      ]);
      
      yPos = drawTable(doc, yPos, ['Order #', 'Customer', 'Expected', 'Days', 'Fee'], lateReturnsData, [30, 40, 30, 20, 30]);
    }
    
    addFooter(doc);
    doc.save(`Orders_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    console.log('Orders report PDF generated successfully');
  } catch (error) {
    console.error('Error generating orders report PDF:', error);
    throw error;
  }
};

// Main function to generate report based on type
export const generateReportPDF = async (reportType: string, data: any): Promise<void> => {
  switch (reportType) {
    case 'summary':
      await generateSummaryReportPDF(data as AdminSummaryReport);
      break;
    case 'revenue':
      await generateRevenueReportPDF(data as AdminRevenueReport);
      break;
    case 'products':
      await generateProductsReportPDF(data as AdminProductsReport);
      break;
    case 'vendors':
      await generateVendorsReportPDF(data as AdminVendorsReport);
      break;
    case 'orders':
      await generateOrdersReportPDF(data as AdminOrdersReport);
      break;
    default:
      console.error('Unknown report type:', reportType);
  }
};
