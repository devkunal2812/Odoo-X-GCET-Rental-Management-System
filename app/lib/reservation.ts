// Reservation and availability logic
import { prisma } from "./prisma";

export async function checkAvailability(
  productId: string,
  startDate: Date,
  endDate: Date,
  requestedQuantity: number
): Promise<boolean> {
  // Get product inventory
  const inventory = await prisma.inventory.findUnique({
    where: { productId },
  });

  if (!inventory) return false;

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

  // Sum reserved quantities
  const reservedQuantity = overlappingReservations.reduce(
    (sum: number, res: any) => sum + res.quantity,
    0
  );

  // Check if available
  const availableQuantity = inventory.quantityOnHand - reservedQuantity;
  return availableQuantity >= requestedQuantity;
}

export async function getAvailableQuantity(
  productId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  const inventory = await prisma.inventory.findUnique({
    where: { productId },
  });

  if (!inventory) return 0;

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

  const reservedQuantity = overlappingReservations.reduce(
    (sum: number, res: any) => sum + res.quantity,
    0
  );

  return Math.max(0, inventory.quantityOnHand - reservedQuantity);
}
