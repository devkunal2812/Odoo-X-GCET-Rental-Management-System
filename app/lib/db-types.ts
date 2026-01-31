// Database type definitions
// Simplified to avoid circular references

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
