import jsPDF from 'jspdf';

export interface InvoiceData {
  id: string;
  orderId: string;
  product: string;
  vendor: string;
  amount: number;
  tax: number;
  serviceFee: number;
  securityDeposit?: number;
  deliveryFee?: number;
  cleaningFee?: number;
  lateFee?: number;
  damageFee?: number;
  total: number;
  status: string;
  issueDate: string;
  dueDate: string;
  paidDate?: string | null;
  paymentMethod?: string;
  rentalPeriod: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  vendorInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    gstin?: string;
  };
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    gstin: string;
  };
}

export const generateInvoicePDF = (invoiceData: InvoiceData): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Colors
  const primaryColor = '#37353E';
  const secondaryColor = '#715A5A';
  const accentColor = '#D3DAD9';
  
  // Helper function to add text with word wrap
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * fontSize * 0.4);
  };

  // Compact Header Section (reduced from 40 to 25)
  doc.setFillColor(55, 53, 62); // #37353E
  doc.rect(0, 0, pageWidth, 25, 'F');
  
  // Company Logo/Name (smaller)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18); // Reduced from 24
  doc.setFont('helvetica', 'bold');
  doc.text(invoiceData.companyInfo.name, 15, 16); // Adjusted position
  
  // Invoice Title (smaller)
  doc.setFontSize(12); // Reduced from 16
  doc.text('RENTAL INVOICE', pageWidth - 15, 16, { align: 'right' }); // Adjusted position
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Company Information (adjusted positions)
  let yPos = 35; // Reduced from 50
  doc.setFontSize(9); // Reduced from 10
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceData.companyInfo.address, 15, yPos);
  yPos += 4; // Reduced spacing
  doc.text(`Phone: ${invoiceData.companyInfo.phone}`, 15, yPos);
  yPos += 4;
  doc.text(`Email: ${invoiceData.companyInfo.email}`, 15, yPos);
  yPos += 4;
  doc.text(`Website: ${invoiceData.companyInfo.website}`, 15, yPos);
  yPos += 4;
  doc.text(`GSTIN: ${invoiceData.companyInfo.gstin}`, 15, yPos);
  
  // Invoice Details (Right side, adjusted positions)
  yPos = 35; // Reduced from 50
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Invoice Details:', pageWidth - 15, yPos, { align: 'right' });
  yPos += 6; // Reduced from 8
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Invoice #: ${invoiceData.id}`, pageWidth - 15, yPos, { align: 'right' });
  yPos += 4; // Reduced from 5
  doc.text(`Order #: ${invoiceData.orderId}`, pageWidth - 15, yPos, { align: 'right' });
  yPos += 4;
  doc.text(`Issue Date: ${new Date(invoiceData.issueDate).toLocaleDateString()}`, pageWidth - 15, yPos, { align: 'right' });
  yPos += 4;
  doc.text(`Due Date: ${new Date(invoiceData.dueDate).toLocaleDateString()}`, pageWidth - 15, yPos, { align: 'right' });
  yPos += 4;
  if (invoiceData.paidDate) {
    doc.text(`Paid Date: ${new Date(invoiceData.paidDate).toLocaleDateString()}`, pageWidth - 15, yPos, { align: 'right' });
    yPos += 4;
  }
  
  // Status Badge (adjusted position)
  const statusColors = {
    paid: { bg: [22, 163, 74], text: [255, 255, 255] },
    pending: { bg: [217, 119, 6], text: [255, 255, 255] },
    overdue: { bg: [220, 38, 38], text: [255, 255, 255] }
  };
  
  const statusColor = statusColors[invoiceData.status as keyof typeof statusColors] || statusColors.pending;
  doc.setFillColor(...statusColor.bg);
  doc.roundedRect(pageWidth - 40, yPos - 2, 25, 6, 1, 1, 'F'); // Smaller badge
  doc.setTextColor(...statusColor.text);
  doc.setFontSize(7); // Smaller text
  doc.text(invoiceData.status.toUpperCase(), pageWidth - 27.5, yPos + 1, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  
  // Customer and Vendor Information (adjusted positions)
  yPos = 70; // Reduced from 95
  
  // Customer Info (Left) - smaller boxes
  doc.setFillColor(211, 218, 217); // #D3DAD9
  doc.rect(15, yPos, 75, 30, 'F'); // Reduced size
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('BILL TO:', 18, yPos + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(invoiceData.customerInfo.name, 18, yPos + 13);
  doc.text(invoiceData.customerInfo.email, 18, yPos + 17);
  doc.text(invoiceData.customerInfo.phone, 18, yPos + 21);
  addWrappedText(invoiceData.customerInfo.address, 18, yPos + 25, 65, 7);
  
  // Vendor Info (Right) - smaller boxes
  doc.setFillColor(211, 218, 217); // #D3DAD9
  doc.rect(100, yPos, 75, 30, 'F'); // Reduced size
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('VENDOR:', 103, yPos + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(invoiceData.vendorInfo.name, 103, yPos + 13);
  doc.text(invoiceData.vendorInfo.email, 103, yPos + 17);
  doc.text(invoiceData.vendorInfo.phone, 103, yPos + 21);
  if (invoiceData.vendorInfo.gstin) {
    doc.text(`GSTIN: ${invoiceData.vendorInfo.gstin}`, 103, yPos + 25);
  }
  
  // Rental Period (adjusted position and size)
  yPos = 110; // Reduced from 140
  doc.setFillColor(113, 90, 90); // #715A5A
  doc.rect(15, yPos, pageWidth - 30, 10, 'F'); // Reduced height
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('RENTAL PERIOD:', 18, yPos + 6);
  doc.text(invoiceData.rentalPeriod, pageWidth - 18, yPos + 6, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  
  // Product Details (adjusted position)
  yPos = 130; // Reduced from 160
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('RENTAL DETAILS', 15, yPos);
  
  yPos += 8; // Reduced from 10
  // Table Header (smaller)
  doc.setFillColor(55, 53, 62); // #37353E
  doc.rect(15, yPos, pageWidth - 30, 8, 'F'); // Reduced height
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('ITEM', 18, yPos + 5);
  doc.text('AMOUNT (₹)', pageWidth - 18, yPos + 5, { align: 'right' });
  
  // Product Row (smaller)
  yPos += 8;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFillColor(248, 250, 252);
  doc.rect(15, yPos, pageWidth - 30, 7, 'F'); // Reduced height
  doc.setFontSize(8);
  doc.text(invoiceData.product, 18, yPos + 4);
  doc.text(invoiceData.amount.toFixed(2), pageWidth - 18, yPos + 4, { align: 'right' });
  
  // Billing Breakdown (adjusted position)
  yPos += 15; // Reduced from 20
  const billingItems = [
    { label: 'Rental Amount', amount: invoiceData.amount },
    { label: 'Service Fee', amount: invoiceData.serviceFee },
    { label: 'Tax (GST)', amount: invoiceData.tax },
  ];
  
  // Add optional fees if they exist
  if (invoiceData.securityDeposit) {
    billingItems.push({ label: 'Security Deposit', amount: invoiceData.securityDeposit });
  }
  if (invoiceData.deliveryFee) {
    billingItems.push({ label: 'Delivery Fee', amount: invoiceData.deliveryFee });
  }
  if (invoiceData.cleaningFee) {
    billingItems.push({ label: 'Cleaning Fee', amount: invoiceData.cleaningFee });
  }
  if (invoiceData.lateFee) {
    billingItems.push({ label: 'Late Fee', amount: invoiceData.lateFee });
  }
  if (invoiceData.damageFee) {
    billingItems.push({ label: 'Damage Fee', amount: invoiceData.damageFee });
  }
  
  // Billing breakdown table (smaller)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('BILLING BREAKDOWN', 15, yPos);
  yPos += 8;
  
  billingItems.forEach((item, index) => {
    const bgColor = index % 2 === 0 ? [248, 250, 252] : [255, 255, 255];
    doc.setFillColor(...bgColor);
    doc.rect(15, yPos, pageWidth - 30, 6, 'F'); // Reduced height
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(item.label, 18, yPos + 4);
    doc.text(`₹${item.amount.toFixed(2)}`, pageWidth - 18, yPos + 4, { align: 'right' });
    yPos += 6; // Reduced from 8
  });
  
  // Check if we need a new page for total and remaining content
  if (yPos > pageHeight - 80) {
    doc.addPage();
    yPos = 20;
  }
  
  // Total (moved to potentially second page)
  yPos += 8;
  doc.setFillColor(55, 53, 62); // #37353E
  doc.rect(15, yPos, pageWidth - 30, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL AMOUNT', 18, yPos + 8);
  doc.text(`₹${invoiceData.total.toFixed(2)}`, pageWidth - 18, yPos + 8, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  
  // Payment Information
  if (invoiceData.paymentMethod) {
    yPos += 20;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('PAYMENT INFORMATION', 15, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Payment Method: ${invoiceData.paymentMethod}`, 15, yPos);
    if (invoiceData.paidDate) {
      yPos += 5;
      doc.text(`Payment Date: ${new Date(invoiceData.paidDate).toLocaleDateString()}`, 15, yPos);
    }
  }
  
  // Terms and Conditions
  yPos += 20;
  if (yPos > pageHeight - 60) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TERMS & CONDITIONS', 15, yPos);
  yPos += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  
  const terms = [
    '1. Payment is due within 15 days of invoice date.',
    '2. Late payments may incur additional charges.',
    '3. Security deposit will be refunded after item return and inspection.',
    '4. Customer is responsible for any damage to rented items.',
    '5. Items must be returned in the same condition as received.',
    '6. Delivery and pickup charges are non-refundable.',
    '7. All disputes subject to local jurisdiction.'
  ];
  
  terms.forEach(term => {
    yPos = addWrappedText(term, 15, yPos, pageWidth - 30, 8);
    yPos += 2;
  });
  
  // Footer (compact)
  yPos = pageHeight - 25; // Reduced footer space
  doc.setFillColor(211, 218, 217); // #D3DAD9
  doc.rect(0, yPos, pageWidth, 25, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(55, 53, 62); // #37353E
  doc.text('Thank you for choosing our rental service!', pageWidth / 2, yPos + 8, { align: 'center' });
  doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, pageWidth / 2, yPos + 14, { align: 'center' });
  doc.text('For support, contact us at support@rentalerp.com', pageWidth / 2, yPos + 20, { align: 'center' });
  
  // Save the PDF
  doc.save(`Invoice_${invoiceData.id}.pdf`);
};

// Sample invoice data generator for testing
export const generateSampleInvoiceData = (invoiceId: string): InvoiceData => {
  return {
    id: invoiceId,
    orderId: `ORD-${invoiceId.split('-')[1]}`,
    product: 'Professional Camera Kit with Tripod and Lighting',
    vendor: 'TechRent Pro Solutions',
    amount: 1500,
    tax: 270, // 18% GST
    serviceFee: 75,
    securityDeposit: 500,
    deliveryFee: 100,
    cleaningFee: 50,
    total: 2495,
    status: 'paid',
    issueDate: '2024-01-30',
    dueDate: '2024-02-14',
    paidDate: '2024-01-31',
    paymentMethod: 'UPI - Google Pay',
    rentalPeriod: 'Feb 1-4, 2024 (4 days)',
    customerInfo: {
      name: 'Rajesh Kumar Sharma',
      email: 'rajesh.sharma@email.com',
      phone: '+91 98765 43210',
      address: '123, MG Road, Koramangala, Bangalore, Karnataka - 560034'
    },
    vendorInfo: {
      name: 'TechRent Pro Solutions',
      email: 'vendor@techrentpro.com',
      phone: '+91 80 2345 6789',
      address: '456, Electronics City, Bangalore, Karnataka - 560100',
      gstin: '29ABCDE1234F1Z5'
    },
    companyInfo: {
      name: 'RentERP Solutions',
      address: '789, Business Park, Whitefield, Bangalore, Karnataka - 560066',
      phone: '+91 80 1234 5678',
      email: 'support@rentalerp.com',
      website: 'www.rentalerp.com',
      gstin: '29XYZAB1234C1D6'
    }
  };
};