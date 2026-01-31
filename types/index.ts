export interface Product {
  id: string
  name: string
  description: string
  price: number
  priceUnit: 'hour' | 'day' | 'week'
  images: string[]
  category: string
  vendor: Vendor
  attributes: ProductAttribute[]
  variants: ProductVariant[]
  quantityOnHand: number
  published: boolean
}

export interface ProductAttribute {
  id: string
  name: string
  displayType: 'radio' | 'pills' | 'checkbox'
  values: string[]
}

export interface ProductVariant {
  id: string
  attributes: Record<string, string>
  price: number
  quantityOnHand: number
}

export interface Vendor {
  id: string
  name: string
  logo?: string
  address: string
  gstin?: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  addresses: Address[]
}

export interface Address {
  id: string
  type: 'billing' | 'delivery'
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface CartItem {
  productId: string
  product: Product
  quantity: number
  rentalDuration: number
  rentalUnit: 'hour' | 'day' | 'week'
  selectedVariant?: ProductVariant
  selectedAttributes: Record<string, string>
}

export interface Order {
  id: string
  reference: string
  customerId: string
  customer: Customer
  items: OrderItem[]
  status: 'quotation' | 'quotation_sent' | 'sale_order' | 'confirmed' | 'invoiced' | 'cancelled'
  totalAmount: number
  rentalPeriod: {
    startDate: string
    endDate: string
  }
  deliveryAddress: Address
  billingAddress: Address
  orderDate: string
  vendorId: string
  vendor: Vendor
}

export interface OrderItem {
  id: string
  productId: string
  product: Product
  quantity: number
  unitPrice: number
  totalAmount: number
  rentalDuration: number
  rentalUnit: 'hour' | 'day' | 'week'
  selectedVariant?: ProductVariant
}

export interface Invoice {
  id: string
  invoiceNumber: string
  orderId: string
  customerId: string
  vendorId: string
  status: 'draft' | 'posted'
  invoiceDate: string
  dueDate: string
  items: InvoiceItem[]
  subtotal: number
  taxes: number
  discounts: number
  shipping: number
  total: number
}

export interface InvoiceItem {
  id: string
  productId: string
  product: Product
  quantity: number
  unitPrice: number
  taxes: number
  amount: number
}

export interface RentalPeriod {
  id: string
  name: string
  duration: number
  unit: 'hour' | 'day' | 'week'
}

export type UserRole = 'admin' | 'vendor' | 'customer'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  vendorId?: string
  avatar?: string
}