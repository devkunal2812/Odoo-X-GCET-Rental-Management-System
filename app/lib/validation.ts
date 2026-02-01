// Validation schemas using Zod
import { z } from "zod";

export const signupSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  companyName: z.string().optional(),
  gstin: z.string().optional(),
  category: z.enum(["ELECTRONICS", "FURNITURE", "VEHICLES", "GYM_AND_SPORTS_EQUIPMENTS", "CONSTRUCTION_TOOLS"]).optional(),
  couponCode: z.string().optional(),
  role: z.enum(["ADMIN", "VENDOR", "CUSTOMER"]).default("CUSTOMER"),
}).refine((data) => {
  // For VENDOR: companyName and category are REQUIRED
  if (data.role === "VENDOR") {
    return data.companyName && data.companyName.length > 0 && data.category;
  }
  // For CUSTOMER: companyName, gstin, and category should NOT be provided
  if (data.role === "CUSTOMER") {
    return !data.companyName && !data.gstin && !data.category;
  }
  return true;
}, {
  message: "Invalid fields for role: Vendors require companyName and category, Customers should not provide vendor fields",
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
  category: z.enum(["ELECTRONICS", "FURNITURE", "VEHICLES", "GYM_AND_SPORTS_EQUIPMENTS", "CONSTRUCTION_TOOLS"]).optional(),
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
  validFrom: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  validTo: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  maxUses: z.number().int().positive().optional(),
}).refine((data) => {
  const from = new Date(data.validFrom);
  const to = new Date(data.validTo);
  return to > from;
}, {
  message: "validTo must be after validFrom",
  path: ["validTo"],
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
