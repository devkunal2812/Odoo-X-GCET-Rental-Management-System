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
    maximumFractionDigits: 2,
    useGrouping: true
  }).replace(/\s/g, ''); // Remove any spaces
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
  // Gradient header background
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Add subtle gradient effect with lighter overlay
  doc.setFillColor(255, 255, 255);
  doc.setGState(new (doc as any).GState({ opacity: 0.1 }));
  doc.rect(0, 0, pageWidth, 45, 'F');
  doc.setGState(new (doc as any).GState({ opacity: 1 }));

  // Company Logo/Name - Larger and more prominent
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(invoiceData.companyInfo.name, margin, 22);

  // Tagline
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Professional Rental Management', margin, 30);

  // Invoice Title - Modern badge style
  const badgeX = pageWidth - margin - 55;
  const badgeY = 12;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(badgeX, badgeY, 55, 22, 3, 3, 'F');
  
  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', badgeX + 27.5, badgeY + 10, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`#${invoiceData.id}`, badgeX + 27.5, badgeY + 17, { align: 'center' });

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // ============ COMPANY & INVOICE INFO SECTION ============
  let yPos = 55;
  
  // Company info in a clean card
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, yPos, contentWidth, 18, 2, 2, 'F');
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...secondaryColor);
  yPos += 6;
  doc.text(invoiceData.companyInfo.address, margin + 5, yPos);
  yPos += 4;
  doc.text(`Phone: ${invoiceData.companyInfo.phone}  |  Email: ${invoiceData.companyInfo.email}`, margin + 5, yPos);
  yPos += 4;
  doc.text(`Web: ${invoiceData.companyInfo.website}  |  GSTIN: ${invoiceData.companyInfo.gstin}`, margin + 5, yPos);

  // Invoice Details Card (Right side)
  yPos = 55;
  const infoCardX = pageWidth - margin - 70;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.roundedRect(infoCardX, yPos, 70, 18, 2, 2, 'FD');
  
  yPos += 6;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Order:', infoCardX + 5, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceData.orderId, infoCardX + 65, yPos, { align: 'right' });
  
  yPos += 4;
  doc.setFont('helvetica', 'bold');
  doc.text('Issued:', infoCardX + 5, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(invoiceData.issueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), infoCardX + 65, yPos, { align: 'right' });
  
  yPos += 4;
  doc.setFont('helvetica', 'bold');
  doc.text('Due:', infoCardX + 5, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(invoiceData.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), infoCardX + 65, yPos, { align: 'right' });

  if (invoiceData.paidDate) {
    yPos += 4;
    doc.setFont('helvetica', 'bold');
    doc.text('Paid:', infoCardX + 5, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(invoiceData.paidDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), infoCardX + 65, yPos, { align: 'right' });
  }

  // Status Badge - Modern pill design
  yPos = 55;
  const statusColors: Record<string, { bg: [number, number, number], text: [number, number, number] }> = {
    paid: { bg: successColor, text: [255, 255, 255] },
    pending: { bg: warningColor, text: [255, 255, 255] },
    overdue: { bg: dangerColor, text: [255, 255, 255] }
  };

  const statusColor = statusColors[invoiceData.status as keyof typeof statusColors] || statusColors.pending;
  const statusText = invoiceData.status.toUpperCase();
  const statusWidth = doc.getTextWidth(statusText) + 12;
  
  doc.setFillColor(...statusColor.bg);
  doc.roundedRect(infoCardX - statusWidth - 5, yPos, statusWidth, 8, 4, 4, 'F');
  doc.setTextColor(...statusColor.text);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(statusText, infoCardX - statusWidth/2 - 5, yPos + 5.5, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  // ============ BILL TO & VENDOR CARDS - MODERN DESIGN ============
  yPos = 83;
  const cardHeight = 38;
  const cardWidth = (contentWidth - 8) / 2;

  // Bill To Card - with shadow effect
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, yPos, cardWidth, cardHeight, 3, 3, 'FD');
  
  // Card header with accent color
  doc.setFillColor(...accentColor);
  doc.roundedRect(margin, yPos, cardWidth, 10, 3, 3, 'F');
  doc.setFillColor(...accentColor);
  doc.rect(margin, yPos + 7, cardWidth, 3, 'F'); // Cover bottom corners
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text('BILL TO', margin + 5, yPos + 7);
  
  // Customer details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(invoiceData.customerInfo.name, margin + 5, yPos + 16);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...secondaryColor);
  doc.text(`Email: ${invoiceData.customerInfo.email}`, margin + 5, yPos + 21);
  doc.text(`Phone: ${invoiceData.customerInfo.phone}`, margin + 5, yPos + 26);
  
  doc.setFontSize(7);
  const addressLines = doc.splitTextToSize(invoiceData.customerInfo.address, cardWidth - 10);
  doc.text(addressLines.slice(0, 2), margin + 5, yPos + 31);

  // Vendor Card - with shadow effect
  const rightCardX = margin + cardWidth + 8;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(rightCardX, yPos, cardWidth, cardHeight, 3, 3, 'FD');
  
  // Card header
  doc.setFillColor(...accentColor);
  doc.roundedRect(rightCardX, yPos, cardWidth, 10, 3, 3, 'F');
  doc.setFillColor(...accentColor);
  doc.rect(rightCardX, yPos + 7, cardWidth, 3, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text('VENDOR', rightCardX + 5, yPos + 7);
  
  // Vendor details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(invoiceData.vendorInfo.name, rightCardX + 5, yPos + 16);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...secondaryColor);
  doc.text(`Email: ${invoiceData.vendorInfo.email}`, rightCardX + 5, yPos + 21);
  doc.text(`Phone: ${invoiceData.vendorInfo.phone}`, rightCardX + 5, yPos + 26);
  
  if (invoiceData.vendorInfo.gstin) {
    doc.text(`GSTIN: ${invoiceData.vendorInfo.gstin}`, rightCardX + 5, yPos + 31);
  }

  // ============ RENTAL PERIOD - MODERN INFO BAR ============
  yPos = 130;
  doc.setFillColor(...primaryColor);
  doc.roundedRect(margin, yPos, contentWidth, 12, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('RENTAL PERIOD', margin + 5, yPos + 8);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(invoiceData.rentalPeriod, pageWidth - margin - 5, yPos + 8, { align: 'right' });
  doc.setTextColor(0, 0, 0);

  // ============ RENTAL ITEMS TABLE - MODERN DESIGN ============
  yPos = 150;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('RENTAL ITEMS', margin, yPos);

  // Modern table with clean design
  yPos += 8;
  const tableStartY = yPos;
  
  // Table header with gradient effect
  doc.setFillColor(...primaryColor);
  doc.roundedRect(margin, yPos, contentWidth, 10, 2, 2, 'F');
  doc.setFillColor(...primaryColor);
  doc.rect(margin, yPos + 6, contentWidth, 4, 'F'); // Cover bottom corners

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('DESCRIPTION', margin + 5, yPos + 7);
  doc.text('QTY', margin + 110, yPos + 7, { align: 'center' });
  doc.text('UNIT PRICE', margin + 140, yPos + 7, { align: 'center' });
  doc.text('AMOUNT', pageWidth - margin - 5, yPos + 7, { align: 'right' });

  // Product Rows with alternating colors
  yPos += 10;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  const rowHeight = 10;

  if (invoiceData.productLines && invoiceData.productLines.length > 0) {
    invoiceData.productLines.forEach((line, index) => {
      const bgColor = index % 2 === 0 ? white : lightBg;
      doc.setFillColor(...bgColor);
      doc.rect(margin, yPos, contentWidth, rowHeight, 'F');
      
      // Subtle row borders
      if (index > 0) {
        doc.setDrawColor(...borderColor);
        doc.setLineWidth(0.2);
        doc.line(margin + 5, yPos, pageWidth - margin - 5, yPos);
      }

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(line.name.substring(0, 50), margin + 5, yPos + 6.5);
      doc.text(line.quantity.toString(), margin + 110, yPos + 6.5, { align: 'center' });
      doc.text(formatRupee(line.unitPrice), margin + 140, yPos + 6.5, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.text(formatRupee(line.amount), pageWidth - margin - 5, yPos + 6.5, { align: 'right' });
      yPos += rowHeight;
    });
  } else {
    doc.setFillColor(...white);
    doc.rect(margin, yPos, contentWidth, rowHeight, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(invoiceData.product.substring(0, 50), margin + 5, yPos + 6.5);
    doc.text('1', margin + 110, yPos + 6.5, { align: 'center' });
    doc.text(formatRupee(invoiceData.amount), margin + 140, yPos + 6.5, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text(formatRupee(invoiceData.amount), pageWidth - margin - 5, yPos + 6.5, { align: 'right' });
    yPos += rowHeight;
  }
  
  // Table bottom border
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  // ============ BILLING BREAKDOWN - MODERN CARD DESIGN ============
  yPos += 15;
  
  // Two-column layout: left for breakdown, right for total
  const breakdownWidth = contentWidth * 0.55;
  const totalCardWidth = contentWidth * 0.42;
  const totalCardX = pageWidth - margin - totalCardWidth;
  
  // Breakdown section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('BILLING BREAKDOWN', margin, yPos);
  yPos += 8;

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

  // Tax breakdown
  const cgst = invoiceData.tax / 2;
  const sgst = invoiceData.tax / 2;

  // Breakdown card
  const breakdownStartY = yPos;
  const breakdownRowHeight = 8;
  
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, yPos, breakdownWidth, (billingItems.length + 2) * breakdownRowHeight + 4, 2, 2, 'FD');

  yPos += 2;
  billingItems.forEach((item, index) => {
    const bgColor = index % 2 === 0 ? lightBg : white;
    doc.setFillColor(...bgColor);
    doc.rect(margin + 1, yPos, breakdownWidth - 2, breakdownRowHeight, 'F');
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    if (item.isHighlight) {
      doc.setTextColor(...dangerColor);
    } else {
      doc.setTextColor(0, 0, 0);
    }
    doc.text(item.label, margin + 5, yPos + 5.5);
    doc.text(formatRupee(item.amount), margin + breakdownWidth - 5, yPos + 5.5, { align: 'right' });
    yPos += breakdownRowHeight;
  });

  // Tax lines
  doc.setTextColor(0, 0, 0);
  doc.setFillColor(...lightBg);
  doc.rect(margin + 1, yPos, breakdownWidth - 2, breakdownRowHeight, 'F');
  doc.setFontSize(9);
  doc.text('CGST (9%)', margin + 5, yPos + 5.5);
  doc.text(formatRupee(cgst), margin + breakdownWidth - 5, yPos + 5.5, { align: 'right' });
  yPos += breakdownRowHeight;

  doc.setFillColor(...white);
  doc.rect(margin + 1, yPos, breakdownWidth - 2, breakdownRowHeight, 'F');
  doc.text('SGST (9%)', margin + 5, yPos + 5.5);
  doc.text(formatRupee(sgst), margin + breakdownWidth - 5, yPos + 5.5, { align: 'right' });

  // ============ GRAND TOTAL CARD - PROMINENT DESIGN ============
  const totalCardY = breakdownStartY;
  
  // Total card with gradient
  doc.setFillColor(...primaryColor);
  doc.roundedRect(totalCardX, totalCardY, totalCardWidth, 35, 3, 3, 'F');
  
  // Add subtle gradient overlay
  doc.setFillColor(...primaryDark);
  doc.setGState(new (doc as any).GState({ opacity: 0.3 }));
  doc.roundedRect(totalCardX, totalCardY + 17, totalCardWidth, 18, 0, 0, 'F');
  doc.setGState(new (doc as any).GState({ opacity: 1 }));
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('GRAND TOTAL', totalCardX + totalCardWidth/2, totalCardY + 12, { align: 'center' });
  
  doc.setFontSize(18);
  doc.text(formatRupee(invoiceData.total), totalCardX + totalCardWidth/2, totalCardY + 26, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  // Amount in words below total card
  yPos = totalCardY + 40;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(...secondaryColor);
  const amountWords = numberToWords(invoiceData.total);
  const wordsLines = doc.splitTextToSize(`Amount in words: ${amountWords} Only`, totalCardWidth);
  doc.text(wordsLines, totalCardX, yPos);
  
  yPos = Math.max(yPos + wordsLines.length * 4, breakdownStartY + (billingItems.length + 2) * breakdownRowHeight + 10);

  // Payment Information Card
  if (invoiceData.paymentMethod) {
    yPos += 10;
    if (yPos > pageHeight - 70) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFillColor(...accentColor);
    doc.setDrawColor(...borderColor);
    doc.roundedRect(margin, yPos, contentWidth, 18, 2, 2, 'FD');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.text('PAYMENT INFORMATION', margin + 5, yPos + 7);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(`Method: ${invoiceData.paymentMethod}`, margin + 5, yPos + 13);
    
    if (invoiceData.paidDate) {
      doc.text(`Paid on: ${new Date(invoiceData.paidDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, margin + 80, yPos + 13);
    }
  }

  // Terms and Conditions - Modern Card
  yPos += 25;
  if (yPos > pageHeight - 60) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('TERMS & CONDITIONS', margin, yPos);
  yPos += 8;
  
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, yPos, contentWidth, 28, 2, 2, 'F');
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...secondaryColor);

  const terms = [
    '• Payment is due within 15 days of invoice date. Late payments may incur additional charges.',
    '• Security deposit will be refunded within 7 business days after item return and inspection.',
    '• Customer is responsible for any damage to rented items beyond normal wear and tear.',
    '• All disputes are subject to local jurisdiction. For queries, contact support.',
  ];

  yPos += 5;
  terms.forEach(term => {
    doc.text(term, margin + 5, yPos);
    yPos += 5;
  });

  // ============ MODERN FOOTER ============
  yPos = pageHeight - 28;

  // Decorative gradient footer
  doc.setFillColor(...primaryColor);
  doc.rect(0, yPos, pageWidth, 28, 'F');
  
  // Add gradient overlay
  doc.setFillColor(...primaryDark);
  doc.setGState(new (doc as any).GState({ opacity: 0.3 }));
  doc.rect(0, yPos, pageWidth, 28, 'F');
  doc.setGState(new (doc as any).GState({ opacity: 1 }));

  // Thank you message
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('Thank you for your business!', pageWidth / 2, yPos + 10, { align: 'center' });

  // Contact info
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.setGState(new (doc as any).GState({ opacity: 0.9 }));
  doc.text(`Email: ${invoiceData.companyInfo.email}  |  Phone: ${invoiceData.companyInfo.phone}  |  Web: ${invoiceData.companyInfo.website}`, pageWidth / 2, yPos + 16, { align: 'center' });
  
  // Generated timestamp
  doc.setFontSize(7);
  doc.setGState(new (doc as any).GState({ opacity: 0.7 }));
  const timestamp = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  doc.text(`Generated: ${timestamp}`, pageWidth / 2, yPos + 22, { align: 'center' });
  doc.setGState(new (doc as any).GState({ opacity: 1 }));

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
