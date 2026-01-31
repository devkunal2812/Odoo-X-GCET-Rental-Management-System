import { prisma } from './prisma';

/**
 * Check product availability for a given date range
 * Prevents overbooking by checking existing reservations
 */
export async function checkAvailability(
  productId: string,
  startDate: Date,
  endDate: Date,
  requestedQuantity: number
): Promise<{ available: boolean; availableQuantity: number }> {
  // Get product inventory
  const inventory = await prisma.inventory.findUnique({
    where: { productId },
  });

  if (!inventory) {
    return { available: false, availableQuantity: 0 };
  }

  // Get overlapping reservations
  const overlappingReservations = await prisma.reservation.findMany({
    where: {
      productId,
      OR: [
        {
          AND: [
            { startDate: { lte: startDate } },
            { endDate: { gte: startDate } },
          ],
        },
        {
          AND: [
            { startDate: { lte: endDate } },
            { endDate: { gte: endDate } },
          ],
        },
        {
          AND: [
            { startDate: { gte: startDate } },
            { endDate: { lte: endDate } },
          ],
        },
      ],
    },
  });

  // Calculate total reserved quantity
  const totalReserved = overlappingReservations.reduce(
    (sum:any, reservation:any) => sum + reservation.quantity,
    0
  );

  const availableQuantity = inventory.quantityOnHand - totalReserved;
  const available = availableQuantity >= requestedQuantity;

  return { available, availableQuantity };
}

/**
 * Generate unique order number
 */
export async function generateOrderNumber(): Promise<string> {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Count orders today
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));
  
  const count = await prisma.saleOrder.count({
    where: {
      orderDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  const sequence = String(count + 1).padStart(4, '0');
  return `SO${year}${month}${day}-${sequence}`;
}

/**
 * Generate unique invoice number
 */
export async function generateInvoiceNumber(): Promise<string> {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  // Count invoices this month
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  
  const count = await prisma.invoice.count({
    where: {
      invoiceDate: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });

  const sequence = String(count + 1).padStart(5, '0');
  return `INV${year}${month}-${sequence}`;
}

/**
 * Create audit log entry
 */
export async function createAuditLog(
  userId: string | null,
  action: string,
  entity: string,
  entityId: string | null,
  metadata?: Record<string, any>
) {
  return prisma.auditLog.create({
    data: {
      userId,
      action,
      entity,
      entityId,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
}

/**
 * Calculate rental price based on period and duration
 */
export async function calculateRentalPrice(
  productId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  const pricing = await prisma.productPricing.findMany({
    where: { productId },
    include: {
      rentalPeriod: true,
    },
    orderBy: { price: 'asc' },
  });

  if (pricing.length === 0) {
    throw new Error('No pricing found for product');
  }

  // Calculate duration in hours
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);
  const durationDays = durationHours / 24;
  const durationWeeks = durationDays / 7;

  // Find best pricing option
  let bestPrice = Infinity;

  for (const price of pricing) {
    let calculatedPrice = 0;

    switch (price.rentalPeriod.unit) {
      case 'HOUR':
        calculatedPrice = price.price * durationHours;
        break;
      case 'DAY':
        calculatedPrice = price.price * Math.ceil(durationDays);
        break;
      case 'WEEK':
        calculatedPrice = price.price * Math.ceil(durationWeeks);
        break;
    }

    if (calculatedPrice < bestPrice) {
      bestPrice = calculatedPrice;
    }
  }

  return bestPrice;
}

/**
 * Apply coupon discount to order total
 */
export async function applyCoupon(
  couponCode: string,
  orderTotal: number
): Promise<{ valid: boolean; discount: number; message?: string }> {
  const coupon = await prisma.coupon.findUnique({
    where: { code: couponCode },
  });

  if (!coupon) {
    return { valid: false, discount: 0, message: 'Invalid coupon code' };
  }

  if (!coupon.isActive) {
    return { valid: false, discount: 0, message: 'Coupon is not active' };
  }

  const now = new Date();
  if (now < coupon.validFrom || now > coupon.validTo) {
    return { valid: false, discount: 0, message: 'Coupon has expired' };
  }

  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, discount: 0, message: 'Coupon usage limit reached' };
  }

  let discount = 0;
  if (coupon.discountType === 'PERCENTAGE') {
    discount = (orderTotal * coupon.value) / 100;
  } else if (coupon.discountType === 'FIXED') {
    discount = coupon.value;
  }

  // Ensure discount doesn't exceed order total
  discount = Math.min(discount, orderTotal);

  return { valid: true, discount };
}
