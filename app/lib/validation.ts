// Validation schemas using Zod
import { z } from "zod";

export const signupSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  companyName: z.string().min(1),
  gstin: z.string().optional(),
  couponCode: z.string().optional(),
  role: z.enum(["ADMIN", "VENDOR", "CUSTOMER"]).default("CUSTOMER"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  productType: z.enum(["GOODS", "SERVICE"]).default("GOODS"),
  isRentable: z.boolean().default(true),
  quantityOnHand: z.number().int().min(0).default(0),
  pricing: z.array(z.object({
    rentalPeriodId: z.string(),
    price: z.number().positive(),
  })),
});

export const orderSchema = z.object({
  vendorId: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  couponCode: z.string().optional(),
  lines: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    quantity: z.number().int().positive(),
  })),
});

export const couponSchema = z.object({
  code: z.string().min(1),
  discountType: z.enum(["PERCENTAGE", "FLAT"]),
  value: z.number().positive(),
  validFrom: z.string().datetime(),
  validTo: z.string().datetime(),
  maxUses: z.number().int().positive().optional(),
});
