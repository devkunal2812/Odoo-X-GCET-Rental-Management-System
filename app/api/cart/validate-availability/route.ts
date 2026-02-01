import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

interface CartItem {
  productId: string;
  quantity: number;
  rentalStartDate?: string;
  rentalEndDate?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartItems }: { cartItems: CartItem[] } = body;

    if (!cartItems || !Array.isArray(cartItems)) {
      return NextResponse.json(
        { error: "Invalid cart items" },
        { status: 400 }
      );
    }

    const validationResults = [];

    for (const item of cartItems) {
      const { productId, quantity, rentalStartDate, rentalEndDate } = item;

      // Get product with inventory
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          inventory: true,
        },
      });

      if (!product) {
        validationResults.push({
          productId,
          valid: false,
          error: "Product not found",
          requestedQuantity: quantity,
          availableQuantity: 0
        });
        continue;
      }

      const totalQuantity = product.inventory?.quantityOnHand || 0;

      if (totalQuantity === 0) {
        validationResults.push({
          productId,
          valid: false,
          error: "Product is out of stock",
          requestedQuantity: quantity,
          availableQuantity: 0
        });
        continue;
      }

      // If no rental dates provided, use basic stock check
      if (!rentalStartDate || !rentalEndDate) {
        const available = totalQuantity >= quantity;
        validationResults.push({
          productId,
          valid: available,
          error: available ? null : `Only ${totalQuantity} units available`,
          requestedQuantity: quantity,
          availableQuantity: totalQuantity
        });
        continue;
      }

      // Time-based availability check
      const start = new Date(rentalStartDate);
      const end = new Date(rentalEndDate);

      // Find overlapping reservations
      const overlappingReservations = await prisma.reservation.findMany({
        where: {
          productId: productId,
          AND: [
            { startDate: { lt: end } },
            { endDate: { gt: start } }
          ],
          saleOrder: {
            status: {
              in: ['CONFIRMED', 'SENT', 'PICKED_UP']
            }
          }
        }
      });

      const bookedQuantity = overlappingReservations.reduce((total, reservation) => {
        return total + reservation.quantity;
      }, 0);

      const availableQuantity = totalQuantity - bookedQuantity;
      const isValid = availableQuantity >= quantity;

      validationResults.push({
        productId,
        valid: isValid,
        error: isValid ? null : `Only ${availableQuantity} units available for selected dates`,
        requestedQuantity: quantity,
        availableQuantity,
        totalQuantity,
        bookedQuantity,
        rentalPeriod: {
          startDate: rentalStartDate,
          endDate: rentalEndDate
        }
      });
    }

    const allValid = validationResults.every(result => result.valid);
    const invalidItems = validationResults.filter(result => !result.valid);

    return NextResponse.json({
      success: true,
      valid: allValid,
      results: validationResults,
      invalidItems,
      message: allValid 
        ? "All items are available" 
        : `${invalidItems.length} item${invalidItems.length > 1 ? 's are' : ' is'} not available`
    });

  } catch (error: any) {
    console.error('Error validating cart availability:', error);
    return NextResponse.json(
      { error: error.message || "Failed to validate availability" },
      { status: 500 }
    );
  }
}