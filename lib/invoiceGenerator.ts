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
  const formatted = amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true
  });
  return 'Rs. ' + formatted;
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

  // Modern Color Palette
  const primaryColor: [number, number, number] = [37, 99, 235];     // Blue-600
  const primaryDark: [number, number, number] = [29, 78, 216];      // Blue-700
  const secondaryColor: [number, number, number] = [71, 85, 105];   // Slate-600
  const accentColor: [number, number, number] = [236, 254, 255];    // Cyan-50
  const lightBg: [number, number, number] = [248, 250, 252];        // Slate-50
  const white: [number, number, number] = [255, 255, 255];
  const borderColor: [number, number, number] = [226, 232, 240];    // Slate-200
  const successColor: [number, number, number] = [34, 197, 94];     // Green-500
  const warningColor: [number, number, number] = [234, 179, 8];     // Yellow-500
  const dangerColor: [number, number, number] = [239, 68, 68];      // Red-500

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

  // ============ MODERN HEADER SECTION ============
  // Header background
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Company Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(invoiceData.companyInfo.name, margin, 18);

  // Tagline
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Professional Rental Management', margin, 26);

  // Invoice Badge
  const badgeX = pageWidth - margin - 50;
  const badgeY = 10;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(badgeX, badgeY, 50, 20, 2, 2, 'F');
  
  doc.setTextColor(...primaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', badgeX + 25, badgeY + 8, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`#${invoiceData.id}`, badgeX + 25, badgeY + 15, { align: 'center' });

  doc.setTextColor(0, 0, 0);

  // ============ COMPANY & INVOICE INFO SECTION ============
  let yPos = 50;
  
  // Company info section
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...secondaryColor);
  doc.text(invoiceData.companyInfo.address, margin, yPos);
  yPos += 4;
  doc.text(`Phone: ${invoiceData.companyInfo.phone} | Email: ${invoiceData.companyInfo.email}`, margin, yPos);
  yPos += 4;
  doc.text(`Website: ${invoiceData.companyInfo.website} | GSTIN: ${invoiceData.companyInfo.gstin}`, margin, yPos);

  // Invoice Details (Right aligned)
  yPos = 50;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  
  const labelX = pageWidth - margin - 60;
  const valueX = pageWidth - margin;
  
  doc.text('Order Number:', labelX, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceData.orderId, valueX, yPos, { align: 'right' });
  
  yPos += 4;
  doc.setFont('helvetica', 'bold');
  doc.text('Issue Date:', labelX, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(invoiceData.issueDate).toLocaleDateString('en-IN'), valueX, yPos, { align: 'right' });
  
  yPos += 4;
  doc.setFont('helvetica', 'bold');
  doc.text('Due Date:', labelX, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(invoiceData.dueDate).toLocaleDateString('en-IN'), valueX, yPos, { align: 'right' });

  if (invoiceData.paidDate) {
    yPos += 4;
    doc.setFont('helvetica', 'bold');
    doc.text('Paid Date:', labelX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(invoiceData.paidDate).toLocaleDateString('en-IN'), valueX, yPos, { align: 'right' });
  }

  // Status Badge
  yPos = 50;
  const statusColors: Record<string, { bg: [number, number, number], text: [number, number, number] }> = {
    paid: { bg: successColor, text: [255, 255, 255] },
    pending: { bg: warningColor, text: [255, 255, 255] },
    overdue: { bg: dangerColor, text: [255, 255, 255] }
  };

  const statusColor = statusColors[invoiceData.status as keyof typeof statusColors] || statusColors.pending;
  const statusText = invoiceData.status.toUpperCase();
  const statusWidth = 30;
  
  doc.setFillColor(...statusColor.bg);
  doc.roundedRect(labelX - statusWidth - 5, yPos - 3, statusWidth, 7, 3, 3, 'F');
  doc.setTextColor(...statusColor.text);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text(statusText, labelX - statusWidth/2 - 5, yPos + 1, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  // ============ BILL TO & VENDOR SECTION ============
  yPos = 72;
  drawLine(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;
  
  const cardWidth = (contentWidth - 10) / 2;

  // Bill To Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text('BILL TO', margin, yPos);
  
  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(invoiceData.customerInfo.name, margin, yPos);
  
  yPos += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...secondaryColor);
  doc.text(`Email: ${invoiceData.customerInfo.email}`, margin, yPos);
  
  yPos += 4;
  doc.text(`Phone: ${invoiceData.customerInfo.phone}`, margin, yPos);
  
  yPos += 4;
  const addressLines = doc.splitTextToSize(invoiceData.customerInfo.address, cardWidth - 5);
  doc.text(addressLines, margin, yPos);

  // Vendor Section (Right side)
  yPos = 80;
  const rightX = margin + cardWidth + 10;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text('VENDOR', rightX, yPos);
  
  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(invoiceData.vendorInfo.name, rightX, yPos);
  
  yPos += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...secondaryColor);
  doc.text(`Email: ${invoiceData.vendorInfo.email}`, rightX, yPos);
  
  yPos += 4;
  doc.text(`Phone: ${invoiceData.vendorInfo.phone}`, rightX, yPos);
  
  if (invoiceData.vendorInfo.gstin) {
    yPos += 4;
    doc.text(`GSTIN: ${invoiceData.vendorInfo.gstin}`, rightX, yPos);
  }

  // ============ RENTAL PERIOD ============
  yPos = 115;
  drawLine(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text('RENTAL PERIOD:', margin, yPos);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(invoiceData.rentalPeriod, margin + 35, yPos);

  // ============ RENTAL ITEMS TABLE ============
  yPos += 8;
  drawLine(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('RENTAL ITEMS', margin, yPos);

  yPos += 8;
  
  // Table header
  doc.setFillColor(...primaryColor);
  doc.rect(margin, yPos, contentWidth, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('DESCRIPTION', margin + 3, yPos + 5.5);
  doc.text('QTY', margin + 105, yPos + 5.5, { align: 'center' });
  doc.text('UNIT PRICE', margin + 135, yPos + 5.5, { align: 'right' });
  doc.text('AMOUNT', pageWidth - margin - 3, yPos + 5.5, { align: 'right' });

  // Product Rows
  yPos += 8;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  const rowHeight = 8;

  if (invoiceData.productLines && invoiceData.productLines.length > 0) {
    invoiceData.productLines.forEach((line, index) => {
      const bgColor = index % 2 === 0 ? white : lightBg;
      doc.setFillColor(...bgColor);
      doc.rect(margin, yPos, contentWidth, rowHeight, 'F');

      doc.setFontSize(9);
      doc.text(line.name.substring(0, 45), margin + 3, yPos + 5.5);
      doc.text(line.quantity.toString(), margin + 105, yPos + 5.5, { align: 'center' });
      doc.text(formatRupee(line.unitPrice), margin + 135, yPos + 5.5, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      doc.text(formatRupee(line.amount), pageWidth - margin - 3, yPos + 5.5, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      yPos += rowHeight;
    });
  } else {
    doc.setFillColor(...white);
    doc.rect(margin, yPos, contentWidth, rowHeight, 'F');

    doc.setFontSize(9);
    doc.text(invoiceData.product.substring(0, 45), margin + 3, yPos + 5.5);
    doc.text('1', margin + 105, yPos + 5.5, { align: 'center' });
    doc.text(formatRupee(invoiceData.amount), margin + 135, yPos + 5.5, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(formatRupee(invoiceData.amount), pageWidth - margin - 3, yPos + 5.5, { align: 'right' });
    yPos += rowHeight;
  }
  
  drawLine(margin, yPos, pageWidth - margin, yPos);

  // ============ BILLING BREAKDOWN ============
  yPos += 10;
  
  const summaryX = pageWidth - margin - 70;
  const labelWidth = 45;
  const valueWidth = 25;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);

  const billingItems: { label: string; amount: number; isHighlight?: boolean }[] = [
    { label: 'Subtotal', amount: invoiceData.amount },
  ];

  if (invoiceData.serviceFee > 0) {
    billingItems.push({ label: 'Service Fee', amount: invoiceData.serviceFee });
  }
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
    billingItems.push({ label: 'Late Fee', amount: invoiceData.lateFee, isHighlight: true });
  }
  if (invoiceData.damageFee) {
    billingItems.push({ label: 'Damage Fee', amount: invoiceData.damageFee, isHighlight: true });
  }

  // Tax breakdown
  const cgst = invoiceData.tax / 2;
  const sgst = invoiceData.tax / 2;

  billingItems.forEach((item) => {
    if (item.isHighlight) {
      doc.setTextColor(...dangerColor);
    } else {
      doc.setTextColor(0, 0, 0);
    }
    doc.setFont('helvetica', 'normal');
    doc.text(item.label, summaryX, yPos);
    doc.text(formatRupee(item.amount), summaryX + labelWidth + valueWidth, yPos, { align: 'right' });
    yPos += 5;
  });

  // Tax lines
  doc.setTextColor(0, 0, 0);
  doc.text('CGST (9%)', summaryX, yPos);
  doc.text(formatRupee(cgst), summaryX + labelWidth + valueWidth, yPos, { align: 'right' });
  yPos += 5;

  doc.text('SGST (9%)', summaryX, yPos);
  doc.text(formatRupee(sgst), summaryX + labelWidth + valueWidth, yPos, { align: 'right' });
  yPos += 5;

  // Total line
  drawLine(summaryX, yPos, summaryX + labelWidth + valueWidth, yPos, primaryColor, 1);
  yPos += 6;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('GRAND TOTAL', summaryX, yPos);
  doc.text(formatRupee(invoiceData.total), summaryX + labelWidth + valueWidth, yPos, { align: 'right' });
  
  yPos += 6;
  drawLine(summaryX, yPos, summaryX + labelWidth + valueWidth, yPos, primaryColor, 1);

  // Amount in words
  yPos += 6;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(...secondaryColor);
  const amountWords = numberToWords(invoiceData.total);
  const wordsLines = doc.splitTextToSize(`Amount in words: ${amountWords} Only`, 70);
  doc.text(wordsLines, summaryX, yPos);

  // Payment Information
  if (invoiceData.paymentMethod) {
    yPos += 10;
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...primaryColor);
    doc.text('PAYMENT INFORMATION', margin, yPos);
    
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text(`Payment Method: ${invoiceData.paymentMethod}`, margin, yPos);
    
    if (invoiceData.paidDate) {
      yPos += 4;
      doc.text(`Paid on: ${new Date(invoiceData.paidDate).toLocaleDateString('en-IN')}`, margin, yPos);
    }
  }

  // Terms and Conditions
  yPos += 10;
  if (yPos > pageHeight - 50) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text('TERMS & CONDITIONS', margin, yPos);
  yPos += 6;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...secondaryColor);

  const terms = [
    '1. Payment is due within 15 days of invoice date.',
    '2. Security deposit will be refunded within 7 business days after item return.',
    '3. Customer is responsible for any damage beyond normal wear and tear.',
    '4. All disputes are subject to local jurisdiction.',
  ];

  terms.forEach(term => {
    doc.text(term, margin, yPos);
    yPos += 4;
  });

  // ============ FOOTER ============
  yPos = pageHeight - 25;

  drawLine(margin, yPos, pageWidth - margin, yPos);
  yPos += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('Thank you for your business!', pageWidth / 2, yPos, { align: 'center' });

  yPos += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...secondaryColor);
  doc.text(`${invoiceData.companyInfo.email} | ${invoiceData.companyInfo.phone} | ${invoiceData.companyInfo.website}`, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 4;
  const timestamp = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  doc.text(`Generated: ${timestamp}`, pageWidth / 2, yPos, { align: 'center' });

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

// Generate sample invoice data for testing/demo
export const generateSampleInvoiceData = (invoiceId: string): InvoiceData => {
  const now = new Date();
  const dueDate = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
  
  return {
    id: invoiceId,
    orderId: `ORD-${invoiceId.split('-')[1] || '001'}`,
    product: 'Professional Camera Kit',
    productLines: [
      { name: 'Professional DSLR Camera Kit', quantity: 1, unitPrice: 250, amount: 250 },
      { name: 'Extra Battery Pack', quantity: 2, unitPrice: 10, amount: 20 },
    ],
    vendor: 'TechRent Pro',
    amount: 270,
    tax: 48.6,
    serviceFee: 25,
    securityDeposit: 500,
    total: 843.6,
    status: 'pending',
    issueDate: now.toISOString(),
    dueDate: dueDate.toISOString(),
    paidDate: null,
    paymentMethod: 'Credit Card',
    rentalPeriod: `${now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} (5 days)`,
    customerInfo: {
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+91 98765 43210',
      address: '123, MG Road, Bangalore, Karnataka - 560001'
    },
    vendorInfo: {
      name: 'TechRent Pro',
      email: 'contact@techrentpro.com',
      phone: '+91 80 1234 5678',
      address: '456, Whitefield, Bangalore, Karnataka - 560066',
      gstin: '29ABCDE1234F1Z5'
    },
    companyInfo: {
      name: 'RentMarket Platform',
      address: '789, Koramangala, Bangalore, Karnataka - 560095',
      phone: '+91 80 9876 5432',
      email: 'support@rentmarket.com',
      website: 'www.rentmarket.com',
      gstin: '29XYZAB1234C1D6'
    }
  };
};
