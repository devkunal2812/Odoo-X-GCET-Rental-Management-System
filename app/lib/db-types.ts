import { Prisma } from '@prisma/client';

// User with relations
export type UserWithProfile = Prisma.UserGetPayload<{
  include: {
    vendorProfile: true;
    customerProfile: true;
  };
}>;

// Product with all relations
export type ProductWithDetails = Prisma.ProductGetPayload<{
  include: {
    vendor: true;
    pricing: true;
    inventory: true;
    variants: {
      include: {
        variantAttributeValues: {
          include: {
            attributeValue: {
              include: {
                attribute: true;
              };
            };
          };
        };
      };
    };
  };
}>;

// Sale Order with full details
export type SaleOrderWithDetails = Prisma.SaleOrderGetPayload<{
  include: {
    customer: {
      include: {
        user: true;
      };
    };
    vendor: {
      include: {
        user: true;
      };
    };
    lines: {
      include: {
        product: true;
        variant: true;
      };
    };
    invoices: true;
    reservations: true;
  };
}>;

// Invoice with details
export type InvoiceWithDetails = Prisma.InvoiceGetPayload<{
  include: {
    saleOrder: {
      include: {
        customer: {
          include: {
            user: true;
          };
        };
        vendor: true;
      };
    };
    lines: {
      include: {
        product: true;
      };
    };
    payments: true;
  };
}>;

// Common select options for API responses
export const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

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
} satisfies Prisma.ProductSelect;

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
} satisfies Prisma.SaleOrderSelect;
