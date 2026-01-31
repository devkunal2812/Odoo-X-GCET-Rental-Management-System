// Validation schemas using Zod
import { z } from "zod";

export const signupSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  companyName: z.string().optional(),
  gstin: z.string().optional(),
  couponCode: z.string().optional(),
  role: z.enum(["ADMIN", "VENDOR", "CUSTOMER"]).default("CUSTOMER"),
}).refine((data) => {
  // For VENDOR: companyName and gstin are REQUIRED
  if (data.role === "VENDOR") {
    return data.companyName && data.companyName.length > 0;
  }
  // For CUSTOMER: companyName and gstin should NOT be provided
  if (data.role === "CUSTOMER") {
    return !data.companyName && !data.gstin;
  }
  return true;
}, {
  message: "Invalid fields for role: Vendors require companyName, Customers should not provide companyName or gstin",
  path: ["role"],
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
  variants: z.array(z.object({
    name: z.string().min(1),
    sku: z.string().min(1),
    priceModifier: z.number().default(0),
  })).optional(),
  extraOptions: z.array(z.object({
    label: z.string().min(1),
    inputType: z.enum(["radio", "checkbox", "dropdown"]),
    options: z.array(z.object({
      value: z.string(),
      priceImpact: z.number().optional(),
    })),
  })).optional(),
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

export const emailVerificationSchema = z.object({
  token: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
});

export const updateUserRoleSchema = z.object({
  userId: z.string(),
  role: z.enum(["ADMIN", "VENDOR", "CUSTOMER"]),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  companyName: z.string().optional(),
  gstin: z.string().optional(),
}).refine((data) => {
  // Ensure at least one field is provided
  return Object.values(data).some(val => val !== undefined);
}, {
  message: "At least one field must be provided for update",
});

export const productUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  productType: z.enum(["GOODS", "SERVICE"]).optional(),
  isRentable: z.boolean().optional(),
  quantityOnHand: z.number().int().min(0).optional(),
  pricing: z.array(z.object({
    rentalPeriodId: z.string(),
    price: z.number().positive(),
  })).optional(),
  variants: z.array(z.object({
    id: z.string().optional(), // For updating existing variants
    name: z.string().min(1),
    sku: z.string().min(1),
    priceModifier: z.number().default(0),
  })).optional(),
  extraOptions: z.array(z.object({
    label: z.string().min(1),
    inputType: z.enum(["radio", "checkbox", "dropdown"]),
    options: z.array(z.object({
      value: z.string(),
      priceImpact: z.number().optional(),
    })),
  })).optional(),
});
