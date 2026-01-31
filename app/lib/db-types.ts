import type { 
  User, 
  VendorProfile, 
  CustomerProfile, 
  Product, 
  SaleOrder, 
  Invoice,
  ProductPricing,
  Inventory,
  ProductVariant,
  SaleOrderLine,
  Reservation,
  InvoiceLine,
  Payment
} from '@prisma/client';

// User with relations
export type UserWithProfile = User & {
  vendorProfile: VendorProfile | null;
  customerProfile: CustomerProfile | null;
};

// Product with all relations  
export type ProductWithDetails = Product & {
  vendor: VendorProfile;
  pricing: ProductPricing[];
  inventory: Inventory | null;
  variants: ProductVariant[];
};

// Sale Order with full details
export type SaleOrderWithDetails = SaleOrder & {
  customer: CustomerProfile & {
    user: User;
  };
  vendor: VendorProfile;
  lines: (SaleOrderLine & {
    product: Product;
    variant: ProductVariant | null;
  })[];
  invoices: Invoice[];
  reservations: Reservation[];
};

// Invoice with details
export type InvoiceWithDetails = Invoice & {
  saleOrder: SaleOrder & {
    customer: CustomerProfile & {
      user: User;
    };
    vendor: VendorProfile;
  };
  lines: (InvoiceLine & {
    product: Product;
  })[];
  payments: Payment[];
};

// Common select options for API responses
export const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
};

export const productSelect = {
  id: true,
  name: true,
  description: true,
  productType: true,
  isRentable: true,
  published: true,
  vendor: {
    select: {
      id: true,
      companyName: true,
    },
  },
  pricing: true,
  inventory: true,
};

export const orderSelect = {
  id: true,
  orderNumber: true,
  status: true,
  startDate: true,
  endDate: true,
  orderDate: true,
  totalAmount: true,
  customer: {
    select: {
      user: {
        select: userSelect,
      },
    },
  },
  vendor: {
    select: {
      companyName: true,
    },
  },
  lines: {
    select: {
      id: true,
      quantity: true,
      unitPrice: true,
      rentalStart: true,
      rentalEnd: true,
      product: {
        select: {
          name: true,
        },
      },
    },
  },
};
