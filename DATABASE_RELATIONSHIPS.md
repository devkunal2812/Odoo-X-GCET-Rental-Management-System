# Database Relationships - Rental Management System

## ✅ Fixed: Connected Tables

The database schema has been updated to properly connect all tables with foreign key relationships.

## 🔗 Key Relationships

### 1. RentalPeriodConfig → ProductPricing
**Connection**: `ProductPricing.rentalPeriodId → RentalPeriodConfig.id`

- **Purpose**: Links product pricing to specific rental periods (Hourly, Daily, Weekly, Monthly)
- **Benefit**: Flexible pricing configuration without hardcoded enums
- **Usage**: When creating product pricing, reference the rental period config

```typescript
// Example: Create pricing for a product
await prisma.productPricing.create({
  data: {
    productId: "product-id",
    rentalPeriodId: "hourly-period-id",
    price: 25.0
  }
});
```

### 2. Coupon → SaleOrder
**Connection**: `SaleOrder.couponId → Coupon.id` (optional)

- **Purpose**: Tracks which coupon was applied to an order
- **Benefit**: 
  - Audit trail of coupon usage
  - Prevents coupon overuse with `maxUses` and `usedCount`
  - Calculates discount automatically
- **Usage**: When customer applies a coupon during checkout

```typescript
// Example: Create order with coupon
await prisma.saleOrder.create({
  data: {
    orderNumber: "SO20260131-0001",
    customerId: "customer-id",
    vendorId: "vendor-id",
    couponId: "coupon-id",  // Optional
    discount: 10.0,
    totalAmount: 90.0,
    // ... other fields
  }
});
```

## 📊 Complete Relationship Map

### User Management
```
User (1) ←→ (1) VendorProfile
User (1) ←→ (1) CustomerProfile
User (1) ←→ (N) AuditLog
```

### Product Management
```
VendorProfile (1) ←→ (N) Product
Product (1) ←→ (N) ProductPricing
Product (1) ←→ (1) Inventory
Product (1) ←→ (N) ProductVariant
Product (1) ←→ (N) ProductAttributeValue

RentalPeriodConfig (1) ←→ (N) ProductPricing  ✅ NEW
Attribute (1) ←→ (N) AttributeValue
Attribute (1) ←→ (N) ProductAttributeValue
ProductVariant (1) ←→ (N) VariantAttributeValue
AttributeValue (1) ←→ (N) VariantAttributeValue
```

### Order Management
```
CustomerProfile (1) ←→ (N) SaleOrder
VendorProfile (1) ←→ (N) SaleOrder
Coupon (1) ←→ (N) SaleOrder  ✅ NEW
SaleOrder (1) ←→ (N) SaleOrderLine
SaleOrder (1) ←→ (N) Reservation
Product (1) ←→ (N) SaleOrderLine
ProductVariant (1) ←→ (N) SaleOrderLine
Product (1) ←→ (N) Reservation
```

### Financial Management
```
SaleOrder (1) ←→ (N) Invoice
Invoice (1) ←→ (N) InvoiceLine
Invoice (1) ←→ (N) Payment
Product (1) ←→ (N) InvoiceLine
```

## 🎯 Benefits of Connected Tables

### 1. RentalPeriodConfig Connection
- ✅ **Flexibility**: Add new rental periods without code changes
- ✅ **Consistency**: All products use the same period definitions
- ✅ **Reporting**: Easy to query pricing by period type
- ✅ **Validation**: Ensures only valid periods are used

### 2. Coupon Connection
- ✅ **Tracking**: Know which orders used which coupons
- ✅ **Usage Limits**: Prevent coupon abuse with `maxUses`
- ✅ **Analytics**: Report on coupon effectiveness
- ✅ **Audit Trail**: Complete history of discounts applied

## 📝 Schema Changes Summary

### ProductPricing Table
**Before:**
```prisma
model ProductPricing {
  period    RentalPeriod  // Enum: HOUR, DAY, WEEK
}
```

**After:**
```prisma
model ProductPricing {
  rentalPeriodId  String
  rentalPeriod    RentalPeriodConfig @relation(...)
}
```

### SaleOrder Table
**Before:**
```prisma
model SaleOrder {
  totalAmount Float
}
```

**After:**
```prisma
model SaleOrder {
  couponId    String?  // Optional foreign key
  totalAmount Float
  discount    Float    // Track discount amount
  coupon      Coupon?  @relation(...)
}
```

### Coupon Table
**Before:**
```prisma
model Coupon {
  isActive Boolean
}
```

**After:**
```prisma
model Coupon {
  isActive  Boolean
  maxUses   Int?     // Optional usage limit
  usedCount Int      // Track usage
  orders    SaleOrder[]  // Relation to orders
}
```

## 🔍 Query Examples

### Get Product with Pricing and Rental Periods
```typescript
const product = await prisma.product.findUnique({
  where: { id: productId },
  include: {
    pricing: {
      include: {
        rentalPeriod: true  // Get period details
      }
    }
  }
});

// Result:
// {
//   name: "Camera",
//   pricing: [
//     { price: 25, rentalPeriod: { name: "Hourly", unit: "HOUR" } },
//     { price: 150, rentalPeriod: { name: "Daily", unit: "DAY" } }
//   ]
// }
```

### Get Order with Coupon Details
```typescript
const order = await prisma.saleOrder.findUnique({
  where: { id: orderId },
  include: {
    coupon: true  // Get coupon details
  }
});

// Result:
// {
//   orderNumber: "SO20260131-0001",
//   totalAmount: 90,
//   discount: 10,
//   coupon: {
//     code: "WELCOME10",
//     discountType: "PERCENTAGE",
//     value: 10
//   }
// }
```

### Get Coupon Usage Statistics
```typescript
const coupon = await prisma.coupon.findUnique({
  where: { code: "WELCOME10" },
  include: {
    orders: {
      select: {
        orderNumber: true,
        discount: true,
        orderDate: true
      }
    }
  }
});

// Result:
// {
//   code: "WELCOME10",
//   usedCount: 5,
//   maxUses: 100,
//   orders: [
//     { orderNumber: "SO...", discount: 10, orderDate: "..." },
//     // ... more orders
//   ]
// }
```

## 🚀 Migration Applied

Migration: `20260131082923_connect_rental_period_and_coupon`

Changes:
1. ✅ Removed `RentalPeriod` enum
2. ✅ Added `rentalPeriodId` foreign key to `ProductPricing`
3. ✅ Added `couponId` foreign key to `SaleOrder`
4. ✅ Added `discount` field to `SaleOrder`
5. ✅ Added `maxUses` and `usedCount` to `Coupon`

## ✨ Next Steps

With all tables properly connected, you can now:

1. **Build Product APIs** with flexible pricing periods
2. **Implement Coupon System** with usage tracking
3. **Create Order APIs** with automatic discount calculation
4. **Generate Reports** on coupon effectiveness and pricing strategies

All relationships are enforced at the database level with foreign keys, ensuring data integrity! 🎉
