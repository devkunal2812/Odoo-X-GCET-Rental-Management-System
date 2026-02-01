/**
 * API Type Definitions
 * 
 * These types match the backend API responses and requests
 * Based on the Prisma schema and API documentation
 */

// ============================================
// User & Authentication Types
// ============================================

export type Role = 'ADMIN' | 'VENDOR' | 'CUSTOMER';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  vendorProfile?: VendorProfile;
  customerProfile?: CustomerProfile;
}

export type ProductCategory = 
  | 'ELECTRONICS'
  | 'FURNITURE' 
  | 'VEHICLES'
  | 'GYM_AND_SPORTS_EQUIPMENTS'
  | 'CONSTRUCTION_TOOLS';

export interface VendorProfile {
  id: string;
  userId: string;
  companyName: string;
  gstin?: string;
  logoUrl?: string;
  address?: string;
  category?: ProductCategory;
}

export interface CustomerProfile {
  id: string;
  userId: string;
  phone?: string;
  defaultAddress?: string;
}

// Auth API Requests
export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'CUSTOMER' | 'VENDOR';
  companyName?: string;
  gstin?: string;
  category?: ProductCategory; // New field for vendor category
  couponCode?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

// Auth API Responses
export interface AuthResponse {
  success: boolean;
  message?: string;
  user: User;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

// ============================================
// Product Types
// ============================================

export type ProductType = 'GOODS' | 'SERVICE';

export interface Product {
  id: string;
  vendorId: string;
  name: string;
  description?: string;
  productType: ProductType;
  category?: ProductCategory; // Add category field
  isRentable: boolean;
  published: boolean;
  extraOptions?: string; // JSON string
  createdAt: string;
  updatedAt: string;
  vendor?: VendorProfile;
  pricing?: ProductPricing[];
  inventory?: Inventory;
  variants?: ProductVariant[];
  // Real-time inventory data (from /api/products/available)
  realTimeInventory?: {
    totalStock: number;
    currentlyRentedQuantity: number;
    reservedQuantity: number;
    availableQuantity: number;
    isOutOfStock: boolean;
    isPartiallyAvailable: boolean;
  };
  // Current rental information
  currentRentals?: Array<{
    orderNumber: string;
    quantity: number;
    customerName: string;
    startDate: string;
    endDate: string;
    status: string;
  }>;
}

export interface ProductPricing {
  id: string;
  productId: string;
  rentalPeriodId: string;
  price: number;
  rentalPeriod?: RentalPeriodConfig;
}

export interface Inventory {
  productId: string;
  quantityOnHand: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  priceModifier: number;
}

export interface RentalPeriodConfig {
  id: string;
  name: string;
  unit: string;
  duration: number;
}

// Product API Requests
export interface CreateProductRequest {
  name: string;
  description?: string;
  productType: ProductType;
  category?: ProductCategory; // Add category field for products
  isRentable: boolean;
  quantityOnHand: number;
  pricing: Array<{
    rentalPeriodId: string;
    price: number;
  }>;
  variants?: Array<{
    name: string;
    sku: string;
    priceModifier: number;
  }>;
  extraOptions?: Array<{
    label: string;
    inputType: 'radio' | 'checkbox' | 'dropdown';
    options: Array<{
      value: string;
      priceImpact?: number;
    }>;
  }>;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

// Product API Responses
export interface ProductListResponse {
  success: boolean;
  products: Product[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ProductResponse {
  success: boolean;
  product: Product;
}

// ============================================
// Order Types
// ============================================

export type SaleOrderStatus = 
  | 'QUOTATION'
  | 'SENT'
  | 'CONFIRMED'
  | 'INVOICED'
  | 'PICKED_UP'
  | 'RETURNED'
  | 'CANCELLED';

export interface SaleOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  vendorId: string;
  couponId?: string;
  status: SaleOrderStatus;
  startDate?: string;
  endDate?: string;
  orderDate: string;
  totalAmount: number;
  discount: number;
  pickupDate?: string;
  actualReturnDate?: string;
  lateFee: number;
  createdAt: string;
  updatedAt: string;
  customer?: CustomerProfile;
  vendor?: VendorProfile;
  coupon?: Coupon;
  lines?: SaleOrderLine[];
  invoices?: Invoice[];
  reservations?: Reservation[];
}

export interface SaleOrderLine {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  rentalStart?: string;
  rentalEnd?: string;
  product?: Product;
  variant?: ProductVariant;
}

export interface Reservation {
  id: string;
  productId: string;
  quantity: number;
  startDate: string;
  endDate: string;
  saleOrderId: string;
}

// Order API Requests
export interface CreateOrderRequest {
  vendorId: string;
  startDate: string;
  endDate: string;
  couponCode?: string;
  lines: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
  }>;
}

// Order API Responses
export interface OrderListResponse {
  success: boolean;
  orders: SaleOrder[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface OrderResponse {
  success: boolean;
  order: SaleOrder;
  message?: string;
}

// ============================================
// Invoice & Payment Types
// ============================================

export type InvoiceStatus = 'DRAFT' | 'POSTED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  saleOrderId: string;
  status: InvoiceStatus;
  invoiceDate: string;
  dueDate?: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  saleOrder?: SaleOrder;
  lines?: InvoiceLine[];
  payments?: Payment[];
}

export interface InvoiceLine {
  id: string;
  invoiceId: string;
  productId: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  product?: Product;
}

export interface Payment {
  id: string;
  invoiceId: string;
  method: string;
  amount: number;
  status: PaymentStatus;
  transactionRef?: string;
  createdAt: string;
}

// Invoice API Responses
export interface InvoiceListResponse {
  success: boolean;
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    status: InvoiceStatus;
    invoiceDate: string;
    dueDate?: string;
    customer: {
      id: string;
      name: string;
      email: string;
      phone?: string;
      address?: string;
    };
    vendor: {
      id: string;
      companyName: string;
      gstin?: string;
      email: string;
      address?: string;
    };
    rentalPeriod: {
      startDate: string;
      endDate: string;
    };
    items: Array<{
      productName: string;
      description?: string;
      quantity: number;
      unitPrice: number;
      amount: number;
    }>;
    taxBreakup: {
      subtotal: string;
      gstPercentage: number;
      gstAmount: string;
      discount: number;
      grandTotal: string;
    };
    paymentStatus: {
      totalAmount: number;
      totalPaid: number;
      balance: number;
      payments: Payment[];
    };
    currency: string;
  }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface InvoiceDetailResponse {
  success: boolean;
  invoice: {
    invoiceNumber: string;
    invoiceDate: string;
    dueDate?: string;
    status: InvoiceStatus;
    currency: string;
    platform: {
      name: string;
      gstin: string;
      address: string;
    };
    vendor: {
      id: string;
      companyName: string;
      gstin: string;
      address: string;
      email: string;
      contactPerson: string;
    };
    customer: {
      id: string;
      name: string;
      email: string;
      phone: string;
      address: string;
    };
    rentalPeriod: {
      startDate: string;
      endDate: string;
      duration: string;
    };
    orderDetails: {
      orderNumber: string;
      orderDate: string;
      orderStatus: SaleOrderStatus;
    };
    items: Array<{
      sno: number;
      productName: string;
      productDescription: string;
      variantName: string;
      variantSku: string;
      variantPriceModifier: number;
      quantity: number;
      unitPrice: number;
      amount: number;
      description: string;
    }>;
    pricingBreakdown: {
      subtotal: number;
      discount: number;
      subtotalAfterDiscount: number;
      taxRate: number;
      taxAmount: number;
      grandTotal: number;
    };
    paymentInfo: {
      totalAmount: number;
      totalPaid: number;
      balance: number;
      paymentStatus: string;
      payments: Payment[];
    };
    notes: string[];
    terms: string[];
  };
}

// ============================================
// Coupon Types
// ============================================

export interface Coupon {
  id: string;
  code: string;
  vendorId: string;
  discountType: string;
  value: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  maxUses?: number;
  usedCount: number;
  createdAt: string;
  updatedAt: string;
  vendor?: VendorProfile;
}

export interface ValidateCouponRequest {
  code: string;
  orderAmount: number;
  vendorId: string;
}

export interface ValidateCouponResponse {
  success: boolean;
  valid: boolean;
  discount?: number;
  message?: string;
  coupon?: Coupon;
}

// ============================================
// Settings Types
// ============================================

export interface SystemSettings {
  [key: string]: {
    value: string;
    description?: string;
    updatedAt: string;
  };
}

export interface SettingsResponse {
  success: boolean;
  settings: SystemSettings;
  rentalPeriods: RentalPeriodConfig[];
}

export interface UpdateSettingsRequest {
  settings: Record<string, string>;
  rentalPeriods?: Array<{
    name: string;
    unit: string;
    duration: number;
  }>;
}

// ============================================
// Report Types
// ============================================

export type AdminReportType = 'summary' | 'revenue' | 'products' | 'vendors' | 'orders';
export type VendorReportType = 'summary' | 'earnings' | 'bookings' | 'products';

export interface AdminSummaryReport {
  success: boolean;
  reportType: 'summary';
  dateRange: string;
  metrics: {
    totalOrders: number;
    totalRevenue: number;
    totalInvoices: number;
    totalPayments: number;
    totalVendors: number;
    totalCustomers: number;
    totalProducts: number;
    activeReservations: number;
    lateReturns: number;
  };
  ordersByStatus: Array<{
    status: SaleOrderStatus;
    count: number;
  }>;
}

export interface AdminRevenueReport {
  success: boolean;
  reportType: 'revenue';
  summary: {
    totalRevenue: number;
    averageInvoiceValue: number;
    invoiceCount: number;
    taxesCollected: number;
    totalDiscounts: number;
  };
  byVendor: Array<{
    vendorId: string;
    vendorName: string;
    totalRevenue: number;
    invoiceCount: number;
  }>;
}

export interface AdminProductsReport {
  success: boolean;
  reportType: 'products';
  products: Array<{
    productId: string;
    productName: string;
    vendorName: string;
    totalRentals: number;
    totalQuantityRented: number;
    currentStock: number;
  }>;
}

export interface AdminVendorsReport {
  success: boolean;
  reportType: 'vendors';
  vendors: Array<{
    vendorId: string;
    vendorName: string;
    email: string;
    gstin?: string;
    totalProducts: number;
    publishedProducts: number;
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
  }>;
}

export interface AdminOrdersReport {
  success: boolean;
  reportType: 'orders';
  summary: {
    totalOrders: number;
    byStatus: Array<{
      status: SaleOrderStatus;
      count: number;
    }>;
    lateReturnsCount: number;
  };
  recentOrders: SaleOrder[];
  lateReturns: Array<{
    orderId: string;
    orderNumber: string;
    customerName: string;
    expectedReturnDate: string;
    daysOverdue: number;
    lateFee: number;
  }>;
}

export type AdminReportResponse = 
  | AdminSummaryReport
  | AdminRevenueReport
  | AdminProductsReport
  | AdminVendorsReport
  | AdminOrdersReport;

// ============================================
// User Management Types
// ============================================

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  companyName?: string; // Vendor only
  gstin?: string; // Vendor only
}

export interface UpdateUserRoleRequest {
  userId: string;
  role: Role;
}

export interface UserListResponse {
  success: boolean;
  users: User[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ============================================
// Generic API Response
// ============================================

export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// ============================================
// Attribute Types
// ============================================

export type DisplayType = 'RADIO' | 'PILLS' | 'CHECKBOX';

export interface Attribute {
  id: string;
  name: string;
  displayType: DisplayType;
  values?: AttributeValue[];
}

export interface AttributeValue {
  id: string;
  attributeId: string;
  value: string;
}

export interface CreateAttributeRequest {
  name: string;
  displayType: DisplayType;
  values: string[];
}

export interface AddAttributeValuesRequest {
  values: string[];
}

export interface AttributeListResponse {
  success: boolean;
  attributes: Attribute[];
}
