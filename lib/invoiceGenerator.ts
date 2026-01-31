import jsPDF from 'jspdf';

export interface InvoiceData {
  id: string;
  orderId: string;
  product: string;
  productLines?: { name: string; quantity: number; unitPrice: number; amount: number }[];
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
    logoUrl?: string;
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

// Format currency in Indian Rupee style (1,00,000)
const formatRupee = (amount: number): string => {
  return '₹' + amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Add watermark logo to PDF
const addWatermark = async (doc: jsPDF, logoUrl: string, pageWidth: number, pageHeight: number): Promise<void> => {
  try {
    // Fetch the logo image
    const response = await fetch(logoUrl);
    if (!response.ok) return;

    const blob = await response.blob();
    const reader = new FileReader();

    return new Promise((resolve) => {
      reader.onload = () => {
        const base64 = reader.result as string;

        // Add watermark in center with low opacity
        const watermarkSize = 80;
        const x = (pageWidth - watermarkSize) / 2;
        const y = (pageHeight - watermarkSize) / 2;

        // Save current state
        doc.saveGraphicsState();

        // Set transparency for watermark effect
        doc.setGState(new (doc as any).GState({ opacity: 0.08 }));

        try {
          doc.addImage(base64, 'PNG', x, y, watermarkSize, watermarkSize);
        } catch (e) {
          console.log('Could not add watermark');
        }

        // Restore state
        doc.restoreGraphicsState();
        resolve();
      };
      reader.onerror = () => resolve();
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.log('Watermark not added');
  }
};

export const generateInvoicePDF = async (invoiceData: InvoiceData): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  // Colors
  const primaryColor: [number, number, number] = [55, 53, 62];      // #37353E
  const secondaryColor: [number, number, number] = [113, 90, 90];   // #715A5A
  const accentColor: [number, number, number] = [211, 218, 217];    // #D3DAD9
  const lightBg: [number, number, number] = [248, 250, 252];
  const white: [number, number, number] = [255, 255, 255];
  const borderColor: [number, number, number] = [200, 200, 200];

  // Helper function to add text with word wrap
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * fontSize * 0.4);
  };

  // Helper to draw a line
  const drawLine = (x1: number, y1: number, x2: number, y2: number, color: [number, number, number] = borderColor, width: number = 0.3) => {
    doc.setDrawColor(...color);
    doc.setLineWidth(width);
    doc.line(x1, y1, x2, y2);
  };

  // Add watermark if vendor has logo
  if (invoiceData.vendorInfo.logoUrl) {
    await addWatermark(doc, invoiceData.vendorInfo.logoUrl, pageWidth, pageHeight);
  }

  // ============ HEADER SECTION ============
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 32, 'F');

  // Company Logo/Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(invoiceData.companyInfo.name, margin, 20);

  // Invoice Title and Number
  doc.setFontSize(12);
  doc.text('TAX INVOICE', pageWidth - margin, 14, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`#${invoiceData.id}`, pageWidth - margin, 22, { align: 'right' });

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // ============ COMPANY INFORMATION ============
  let yPos = 42;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(invoiceData.companyInfo.address, margin, yPos);
  yPos += 4;
  doc.text(`Phone: ${invoiceData.companyInfo.phone} | Email: ${invoiceData.companyInfo.email}`, margin, yPos);
  yPos += 4;
  doc.text(`Website: ${invoiceData.companyInfo.website} | GSTIN: ${invoiceData.companyInfo.gstin}`, margin, yPos);

  // Invoice Details (Right side)
  yPos = 42;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Invoice Details', pageWidth - margin, yPos, { align: 'right' });
  yPos += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Order: ${invoiceData.orderId}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 4;
  doc.text(`Issued: ${new Date(invoiceData.issueDate).toLocaleDateString('en-IN')}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 4;
  doc.text(`Due: ${new Date(invoiceData.dueDate).toLocaleDateString('en-IN')}`, pageWidth - margin, yPos, { align: 'right' });

  if (invoiceData.paidDate) {
    yPos += 4;
    doc.text(`Paid: ${new Date(invoiceData.paidDate).toLocaleDateString('en-IN')}`, pageWidth - margin, yPos, { align: 'right' });
  }

  // Status Badge
  yPos += 6;
  const statusColors: Record<string, { bg: [number, number, number], text: [number, number, number] }> = {
    paid: { bg: [22, 163, 74], text: [255, 255, 255] },
    pending: { bg: [234, 179, 8], text: [255, 255, 255] },
    overdue: { bg: [220, 38, 38], text: [255, 255, 255] }
  };

  const statusColor = statusColors[invoiceData.status as keyof typeof statusColors] || statusColors.pending;
  doc.setFillColor(...statusColor.bg);
  doc.roundedRect(pageWidth - 40, yPos - 3, 25, 7, 2, 2, 'F');
  doc.setTextColor(...statusColor.text);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(invoiceData.status.toUpperCase(), pageWidth - 27.5, yPos + 1, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  // ============ BILL TO & VENDOR BOXES ============
  yPos = 75;
  const boxHeight = 35;
  const boxWidth = (contentWidth - 10) / 2;

  // Bill To (Left) - with border
  doc.setFillColor(...lightBg);
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, yPos, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...secondaryColor);
  doc.text('BILL TO', margin + 5, yPos + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text(invoiceData.customerInfo.name, margin + 5, yPos + 14);
  doc.setTextColor(80, 80, 80);
  doc.text(invoiceData.customerInfo.email, margin + 5, yPos + 19);
  doc.text(invoiceData.customerInfo.phone, margin + 5, yPos + 24);
  addWrappedText(invoiceData.customerInfo.address, margin + 5, yPos + 29, boxWidth - 10, 7);

  // Vendor (Right) - with border
  const rightBoxX = margin + boxWidth + 10;
  doc.setFillColor(...lightBg);
  doc.roundedRect(rightBoxX, yPos, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...secondaryColor);
  doc.text('VENDOR', rightBoxX + 5, yPos + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text(invoiceData.vendorInfo.name, rightBoxX + 5, yPos + 14);
  doc.setTextColor(80, 80, 80);
  doc.text(invoiceData.vendorInfo.email, rightBoxX + 5, yPos + 19);
  doc.text(invoiceData.vendorInfo.phone, rightBoxX + 5, yPos + 24);
  if (invoiceData.vendorInfo.gstin) {
    doc.text(`GSTIN: ${invoiceData.vendorInfo.gstin}`, rightBoxX + 5, yPos + 29);
  }

  // ============ RENTAL PERIOD BAR ============
  yPos = 118;
  doc.setFillColor(...secondaryColor);
  doc.roundedRect(margin, yPos, contentWidth, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('RENTAL PERIOD', margin + 5, yPos + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceData.rentalPeriod, pageWidth - margin - 5, yPos + 7, { align: 'right' });
  doc.setTextColor(0, 0, 0);

  // ============ RENTAL ITEMS TABLE ============
  yPos = 138;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('RENTAL ITEMS', margin, yPos);

  // Table Header with rounded corners
  yPos += 6;
  const tableStartY = yPos;
  doc.setFillColor(...primaryColor);
  doc.roundedRect(margin, yPos, contentWidth, 9, 2, 2, 'F');
  // Cover bottom corners to make only top rounded
  doc.setFillColor(...primaryColor);
  doc.rect(margin, yPos + 5, contentWidth, 4, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('ITEM DESCRIPTION', margin + 5, yPos + 6);
  doc.text('QTY', margin + 105, yPos + 6);
  doc.text('UNIT PRICE', margin + 125, yPos + 6);
  doc.text('AMOUNT', pageWidth - margin - 5, yPos + 6, { align: 'right' });

  // Product Rows with borders
  yPos += 9;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  const rowHeight = 8;

  if (invoiceData.productLines && invoiceData.productLines.length > 0) {
    invoiceData.productLines.forEach((line, index) => {
      const bgColor = index % 2 === 0 ? lightBg : white;
      doc.setFillColor(...bgColor);
      doc.rect(margin, yPos, contentWidth, rowHeight, 'F');
      // Draw borders
      drawLine(margin, yPos, margin, yPos + rowHeight); // left
      drawLine(pageWidth - margin, yPos, pageWidth - margin, yPos + rowHeight); // right
      drawLine(margin, yPos + rowHeight, pageWidth - margin, yPos + rowHeight); // bottom

      doc.setFontSize(8);
      doc.text(line.name.substring(0, 45), margin + 5, yPos + 5.5);
      doc.text(line.quantity.toString(), margin + 107, yPos + 5.5);
      doc.text(formatRupee(line.unitPrice), margin + 127, yPos + 5.5);
      doc.text(formatRupee(line.amount), pageWidth - margin - 5, yPos + 5.5, { align: 'right' });
      yPos += rowHeight;
    });
  } else {
    doc.setFillColor(...lightBg);
    doc.rect(margin, yPos, contentWidth, rowHeight, 'F');
    drawLine(margin, yPos, margin, yPos + rowHeight);
    drawLine(pageWidth - margin, yPos, pageWidth - margin, yPos + rowHeight);
    drawLine(margin, yPos + rowHeight, pageWidth - margin, yPos + rowHeight);

    doc.setFontSize(8);
    doc.text(invoiceData.product.substring(0, 45), margin + 5, yPos + 5.5);
    doc.text('1', margin + 107, yPos + 5.5);
    doc.text(formatRupee(invoiceData.amount), margin + 127, yPos + 5.5);
    doc.text(formatRupee(invoiceData.amount), pageWidth - margin - 5, yPos + 5.5, { align: 'right' });
    yPos += rowHeight;
  }

  // ============ BILLING BREAKDOWN SECTION ============
  yPos += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('BILLING BREAKDOWN', margin, yPos);
  yPos += 6;

  const billingItems: { label: string; amount: number; isHighlight?: boolean }[] = [
    { label: 'Subtotal (Rental Amount)', amount: invoiceData.amount },
  ];

  if (invoiceData.serviceFee > 0) {
    billingItems.push({ label: 'Service Fee', amount: invoiceData.serviceFee });
  }
  if (invoiceData.securityDeposit) {
    billingItems.push({ label: 'Security Deposit (Refundable)', amount: invoiceData.securityDeposit });
  }
  if (invoiceData.deliveryFee) {
    billingItems.push({ label: 'Delivery Charges', amount: invoiceData.deliveryFee });
  }
  if (invoiceData.cleaningFee) {
    billingItems.push({ label: 'Cleaning Fee', amount: invoiceData.cleaningFee });
  }
  if (invoiceData.lateFee) {
    billingItems.push({ label: 'Late Return Fee', amount: invoiceData.lateFee, isHighlight: true });
  }
  if (invoiceData.damageFee) {
    billingItems.push({ label: 'Damage Charges', amount: invoiceData.damageFee, isHighlight: true });
  }

  // Add tax breakdown
  const cgst = invoiceData.tax / 2;
  const sgst = invoiceData.tax / 2;

  // Create a bordered breakdown box
  const breakdownStartY = yPos;
  const breakdownRowHeight = 7;
  const totalBreakdownRows = billingItems.length + 2; // +2 for CGST and SGST
  const breakdownHeight = totalBreakdownRows * breakdownRowHeight + 2;

  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, yPos, contentWidth, breakdownHeight, 2, 2, 'S');

  yPos += 1;
  billingItems.forEach((item, index) => {
    const bgColor = index % 2 === 0 ? lightBg : white;
    doc.setFillColor(...bgColor);
    doc.rect(margin + 0.5, yPos, contentWidth - 1, breakdownRowHeight, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(item.isHighlight ? 220 : 0, item.isHighlight ? 38 : 0, item.isHighlight ? 38 : 0);
    doc.text(item.label, margin + 5, yPos + 5);
    doc.text(formatRupee(item.amount), pageWidth - margin - 5, yPos + 5, { align: 'right' });
    yPos += breakdownRowHeight;
  });

  // Tax lines with subtle separator
  doc.setTextColor(0, 0, 0);
  drawLine(margin + 5, yPos, pageWidth - margin - 5, yPos, [180, 180, 180], 0.2);

  doc.setFillColor(...lightBg);
  doc.rect(margin + 0.5, yPos, contentWidth - 1, breakdownRowHeight, 'F');
  doc.setFontSize(8);
  doc.text('CGST (9%)', margin + 5, yPos + 5);
  doc.text(formatRupee(cgst), pageWidth - margin - 5, yPos + 5, { align: 'right' });
  yPos += breakdownRowHeight;

  doc.setFillColor(...white);
  doc.rect(margin + 0.5, yPos, contentWidth - 1, breakdownRowHeight, 'F');
  doc.text('SGST (9%)', margin + 5, yPos + 5);
  doc.text(formatRupee(sgst), pageWidth - margin - 5, yPos + 5, { align: 'right' });
  yPos += breakdownRowHeight + 2;

  // Check if we need a new page
  if (yPos > pageHeight - 80) {
    doc.addPage();
    yPos = 20;
  }

  // ============ GRAND TOTAL - MORE PROMINENT ============
  yPos += 4;
  doc.setFillColor(...primaryColor);
  doc.roundedRect(margin, yPos, contentWidth, 14, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('GRAND TOTAL', margin + 8, yPos + 9.5);
  doc.setFontSize(14);
  doc.text(formatRupee(invoiceData.total), pageWidth - margin - 8, yPos + 9.5, { align: 'right' });
  doc.setTextColor(0, 0, 0);

  // Amount in words
  yPos += 16;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text(`Amount in words: ${numberToWords(invoiceData.total)} Only`, 15, yPos);

  // Payment Information
  if (invoiceData.paymentMethod) {
    yPos += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('PAYMENT INFORMATION', 15, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Payment Method: ${invoiceData.paymentMethod}`, 15, yPos);
    if (invoiceData.paidDate) {
      doc.text(`Payment Date: ${new Date(invoiceData.paidDate).toLocaleDateString('en-IN')}`, 100, yPos);
    }
  }

  // Terms and Conditions
  yPos += 15;
  if (yPos > pageHeight - 55) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TERMS & CONDITIONS', 15, yPos);
  yPos += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);

  const terms = [
    '1. Payment is due within 15 days of invoice date.',
    '2. Late payments may incur additional charges as per applicable rates.',
    '3. Security deposit will be refunded within 7 days after item return and inspection.',
    '4. Customer is responsible for any damage to rented items beyond normal wear.',
    '5. All disputes subject to local jurisdiction.',
  ];

  terms.forEach(term => {
    doc.text(term, 15, yPos);
    yPos += 4;
  });

  // ============ PROFESSIONAL FOOTER ============
  yPos = pageHeight - 25;

  // Decorative line separator
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 5;
  doc.setFillColor(...accentColor);
  doc.rect(0, yPos, pageWidth, 20, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text('Thank you for your business!', pageWidth / 2, yPos + 6, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} at ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`, pageWidth / 2, yPos + 11, { align: 'center' });
  doc.text(`Support: ${invoiceData.companyInfo.email} | ${invoiceData.companyInfo.phone}`, pageWidth / 2, yPos + 15, { align: 'center' });

  // Save the PDF
  doc.save(`Invoice_${invoiceData.id}.pdf`);
};

// Convert number to words (INR)
const numberToWords = (num: number): string => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Zero Rupees';

  const intPart = Math.floor(num);
  const decPart = Math.round((num - intPart) * 100);

  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertLessThanThousand(n % 100) : '');
  };

  const convertNumber = (n: number): string => {
    if (n === 0) return '';
    if (n < 1000) return convertLessThanThousand(n);
    if (n < 100000) return convertLessThanThousand(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convertLessThanThousand(n % 1000) : '');
    if (n < 10000000) return convertLessThanThousand(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convertNumber(n % 100000) : '');
    return convertLessThanThousand(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convertNumber(n % 10000000) : '');
  };

  let result = 'Rupees ' + convertNumber(intPart);
  if (decPart > 0) {
    result += ' and ' + convertLessThanThousand(decPart) + ' Paise';
  }

  return result;
};

// Build InvoiceData from real API invoice/order data
export interface InvoiceAPIData {
  invoiceNumber: string;
  orderId?: string;
  orderNumber?: string;
  status: string;
  invoiceDate: string;
  dueDate?: string;
  totalAmount: number;
  subtotal: number | string;
  taxAmount: number | string;
  serviceFee?: number;
  securityDeposit?: number;
  lateFee?: number;
  paidDate?: string | null;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  customer?: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  vendor?: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    gstin?: string;
    logoUrl?: string;
  };
  lines?: { name: string; quantity: number; unitPrice: number; amount: number }[];
}

export const buildInvoiceData = (data: InvoiceAPIData): InvoiceData => {
  const subtotal = typeof data.subtotal === 'string' ? parseFloat(data.subtotal) : data.subtotal;
  const taxAmount = typeof data.taxAmount === 'string' ? parseFloat(data.taxAmount) : data.taxAmount;

  // Format rental period
  const formatPeriod = (start?: string, end?: string): string => {
    if (!start || !end) return 'N/A';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return `${startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} (${days} days)`;
  };

  return {
    id: data.invoiceNumber,
    orderId: data.orderNumber || data.orderId || '',
    product: data.lines?.[0]?.name || 'Rental Items',
    productLines: data.lines,
    vendor: data.vendor?.name || 'Vendor',
    amount: subtotal || 0,
    tax: taxAmount || 0,
    serviceFee: data.serviceFee || 0,
    securityDeposit: data.securityDeposit,
    lateFee: data.lateFee,
    total: data.totalAmount || 0,
    status: data.status?.toLowerCase() === 'posted' ? 'pending' : data.status?.toLowerCase() || 'pending',
    issueDate: data.invoiceDate,
    dueDate: data.dueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    paidDate: data.paidDate,
    paymentMethod: data.paymentMethod,
    rentalPeriod: formatPeriod(data.startDate, data.endDate),
    customerInfo: {
      name: data.customer?.name || 'Customer',
      email: data.customer?.email || '',
      phone: data.customer?.phone || '+91 XXXXX XXXXX',
      address: data.customer?.address || 'Address not provided'
    },
    vendorInfo: {
      name: data.vendor?.name || 'Vendor',
      email: data.vendor?.email || '',
      phone: data.vendor?.phone || '',
      address: data.vendor?.address || '',
      gstin: data.vendor?.gstin,
      logoUrl: data.vendor?.logoUrl
    },
    companyInfo: {
      name: 'RentERP Solutions',
      address: 'Whitefield, Bangalore, Karnataka - 560066',
      phone: '+91 80 1234 5678',
      email: 'support@rentalerp.com',
      website: 'www.rentalerp.com',
      gstin: '29XYZAB1234C1D6'
    }
  };
};
