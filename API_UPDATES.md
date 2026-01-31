# API Updates - Rental Management System

## Summary of Changes

This document outlines all the new features and fixes implemented in the Rental Management System backend.

---

## 1. ✅ SIGNUP / AUTH FIXES

### Changes Made:
- **Role-based validation**: GSTIN and Company Name are now ONLY required for Vendors
- **Customer signup**: Customers can no longer provide GSTIN or Company Name
- **Validation enforcement**: Zod schema with custom refinement rules

### Updated Endpoints:

#### POST /api/auth/signup
**Request Body (VENDOR):**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "vendor@example.com",
  "password": "password123",
  "companyName": "ABC Company",  // REQUIRED for VENDOR
  "gstin": "29ABCDE1234F1Z5",    // Optional for VENDOR
  "role": "VENDOR"
}
```

**Request Body (CUSTOMER):**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "customer@example.com",
  "password": "password123",
  "role": "CUSTOMER"
  // companyName and gstin NOT ALLOWED
}
```

**Response:**
```json
{
  "success": true,
  "message": "Signup successful. Please verify your email to login.",
  "user": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "vendor@example.com",
    "role": "VENDOR",
    "emailVerified": false
  }
}
```

---

## 2. ✅ EMAIL VERIFICATION (NEW)

### New Endpoints:

#### POST /api/auth/verify-email
Verify user email with token

**Request Body:**
```json
{
  "token": "verification-token-here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully. You can now login."
}
```

#### GET /api/auth/verify-email?token=xxx
Alternative verification via query parameter (for email links)

**Features:**
- ✅ Secure token generation (32-byte random hex)
- ✅ Token expiry (24 hours)
- ✅ Single-use tokens
- ✅ Login blocked until email verified
- ✅ Audit logging

---

## 3. ✅ FORGOT PASSWORD FLOW (NEW)

### New Endpoints:

#### POST /api/auth/forgot-password
Request password reset

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

#### POST /api/auth/reset-password
Reset password with token

**Request Body:**
```json
{
  "token": "reset-token-here",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully. You can now login with your new password."
}
```

**Features:**
- ✅ Secure token generation
- ✅ Token expiry (1 hour)
- ✅ Single-use tokens
- ✅ Password hashing with bcrypt
- ✅ Audit logging
- ✅ Security: Doesn't reveal if email exists

---

## 4. ✅ VENDOR PRODUCT CREATION IMPROVEMENTS

### Enhanced Endpoint:

#### POST /api/vendor/products
Create product with variants and extra options

**Request Body:**
```json
{
  "name": "Professional Camera",
  "description": "High-end DSLR camera",
  "productType": "GOODS",
  "isRentable": true,
  "quantityOnHand": 5,
  "pricing": [
    {
      "rentalPeriodId": "hourly-period-id",
      "price": 50.00
    },
    {
      "rentalPeriodId": "daily-period-id",
      "price": 200.00
    },
    {
      "rentalPeriodId": "weekly-period-id",
      "price": 1000.00
    }
  ],
  "variants": [
    {
      "name": "Camera Body Only",
      "sku": "CAM-BODY-001",
      "priceModifier": 0
    },
    {
      "name": "Camera + Lens",
      "sku": "CAM-LENS-001",
      "priceModifier": 50.00
    },
    {
      "name": "Camera + Tripod",
      "sku": "CAM-TRIPOD-001",
      "priceModifier": 30.00
    }
  ],
  "extraOptions": [
    {
      "label": "Lens Type",
      "inputType": "radio",
      "options": [
        {
          "value": "Prime",
          "priceImpact": 0
        },
        {
          "value": "Zoom",
          "priceImpact": 25.00
        },
        {
          "value": "Wide Angle",
          "priceImpact": 35.00
        }
      ]
    },
    {
      "label": "Memory Card",
      "inputType": "checkbox",
      "options": [
        {
          "value": "32GB",
          "priceImpact": 5.00
        },
        {
          "value": "64GB",
          "priceImpact": 10.00
        }
      ]
    }
  ]
}
```

**Features:**
- ✅ Product variants with individual SKUs
- ✅ Price modifiers per variant
- ✅ Flexible pricing models (hourly/daily/weekly)
- ✅ Extra options with customizable input types
- ✅ Price impact per option
- ✅ Stored as structured JSON
- ✅ Audit logging

---

## 5. ✅ ADMIN SETTINGS ENHANCEMENTS

### Enhanced Endpoints:

#### GET /api/admin/settings
Get all system settings including tax and invoice configuration

**Response:**
```json
{
  "success": true,
  "settings": {
    "gst_percentage": {
      "value": "18",
      "description": "GST/Tax percentage applied to invoices"
    },
    "platform_fee": {
      "value": "5",
      "description": "Platform fee percentage"
    },
    "invoice_prefix": {
      "value": "INV",
      "description": "Invoice number prefix"
    },
    "currency": {
      "value": "INR",
      "description": "Currency code"
    },
    "late_fee_rate": {
      "value": "0.1",
      "description": "Late fee rate per day"
    },
    "company_name": {
      "value": "ABC Rentals",
      "description": "Company name for invoices"
    },
    "company_gstin": {
      "value": "29ABCDE1234F1Z5",
      "description": "Company GSTIN for invoices"
    }
  },
  "rentalPeriods": [...]
}
```

#### PUT /api/admin/settings
Update system settings

**Request Body:**
```json
{
  "settings": {
    "gst_percentage": "18",
    "platform_fee": "5",
    "invoice_prefix": "INV",
    "currency": "INR",
    "company_name": "ABC Rentals",
    "company_gstin": "29ABCDE1234F1Z5"
  }
}
```

#### PUT /api/admin/users
Update user role (NEW)

**Request Body:**
```json
{
  "userId": "user-id",
  "role": "VENDOR"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User role updated from CUSTOMER to VENDOR",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "role": "VENDOR"
  }
}
```

**Features:**
- ✅ Role management (assign/change roles)
- ✅ Tax configuration (GST percentage)
- ✅ Platform fee configuration
- ✅ Invoice prefix customization
- ✅ Currency settings
- ✅ Company details for invoices
- ✅ Automatic profile creation on role change
- ✅ Audit logging

---

## 6. ✅ REPORTS & INVOICES (NEW)

### Admin Reports:

#### GET /api/reports/admin
Generate admin reports and analytics

**Query Parameters:**
- `startDate`: Filter from date (ISO string)
- `endDate`: Filter to date (ISO string)
- `reportType`: Type of report (summary, revenue, products, vendors, orders)

**Report Types:**

##### Summary Report (`reportType=summary`)
```json
{
  "success": true,
  "reportType": "summary",
  "dateRange": "all-time",
  "metrics": {
    "totalOrders": 150,
    "totalRevenue": 50000.00,
    "totalInvoices": 120,
    "totalPayments": 45000.00,
    "totalVendors": 25,
    "totalCustomers": 80,
    "totalProducts": 200,
    "activeReservations": 30,
    "lateReturns": 5
  },
  "ordersByStatus": [
    { "status": "CONFIRMED", "count": 40 },
    { "status": "INVOICED", "count": 60 }
  ]
}
```

##### Revenue Report (`reportType=revenue`)
```json
{
  "success": true,
  "reportType": "revenue",
  "summary": {
    "totalRevenue": 50000.00,
    "averageInvoiceValue": 416.67,
    "invoiceCount": 120,
    "taxesCollected": 7627.12,
    "totalDiscounts": 2000.00
  },
  "byVendor": [
    {
      "vendorId": "vendor-1",
      "vendorName": "ABC Company",
      "totalRevenue": 15000.00,
      "invoiceCount": 35
    }
  ]
}
```

##### Products Report (`reportType=products`)
```json
{
  "success": true,
  "reportType": "products",
  "products": [
    {
      "productId": "product-1",
      "productName": "Professional Camera",
      "vendorName": "ABC Company",
      "totalRentals": 45,
      "totalQuantityRented": 120,
      "currentStock": 5
    }
  ]
}
```

##### Vendors Report (`reportType=vendors`)
```json
{
  "success": true,
  "reportType": "vendors",
  "vendors": [
    {
      "vendorId": "vendor-1",
      "vendorName": "ABC Company",
      "email": "vendor@abc.com",
      "gstin": "29ABCDE1234F1Z5",
      "totalProducts": 15,
      "publishedProducts": 12,
      "totalOrders": 45,
      "totalRevenue": 15000.00,
      "averageOrderValue": 333.33
    }
  ]
}
```

##### Orders Report (`reportType=orders`)
```json
{
  "success": true,
  "reportType": "orders",
  "summary": {
    "totalOrders": 150,
    "byStatus": [...],
    "lateReturnsCount": 5
  },
  "recentOrders": [...],
  "lateReturns": [
    {
      "orderId": "order-1",
      "orderNumber": "SO-001",
      "customerName": "John Doe",
      "expectedReturnDate": "2024-01-15",
      "daysOverdue": 5,
      "lateFee": 50.00
    }
  ]
}
```

### Vendor Reports:

#### GET /api/reports/vendor
Generate vendor reports and analytics

**Query Parameters:**
- `startDate`: Filter from date (ISO string)
- `endDate`: Filter to date (ISO string)
- `reportType`: Type of report (summary, earnings, bookings, products)

**Report Types:**

##### Summary Report (`reportType=summary`)
```json
{
  "success": true,
  "reportType": "summary",
  "metrics": {
    "totalOrders": 45,
    "totalEarnings": 15000.00,
    "totalProducts": 15,
    "publishedProducts": 12,
    "upcomingPickups": 3,
    "upcomingReturns": 5
  }
}
```

##### Earnings Report (`reportType=earnings`)
```json
{
  "success": true,
  "reportType": "earnings",
  "summary": {
    "totalEarnings": 15000.00,
    "totalPaid": 12000.00,
    "pendingPayments": 3000.00,
    "invoiceCount": 35,
    "averageInvoiceValue": 428.57
  },
  "byProduct": [
    {
      "productId": "product-1",
      "productName": "Professional Camera",
      "totalEarnings": 5000.00,
      "rentalCount": 20
    }
  ]
}
```

##### Bookings Report (`reportType=bookings`)
```json
{
  "success": true,
  "reportType": "bookings",
  "upcomingPickups": [...],
  "upcomingReturns": [...],
  "recentOrders": [...]
}
```

##### Products Report (`reportType=products`)
```json
{
  "success": true,
  "reportType": "products",
  "products": [
    {
      "productId": "product-1",
      "productName": "Professional Camera",
      "totalRentals": 20,
      "totalQuantityRented": 50,
      "currentStock": 5,
      "utilizationRate": 27.40,
      "published": true
    }
  ]
}
```

### Enhanced Invoice Generation:

#### POST /api/invoices/from-order/[orderId]
Create invoice with full tax breakup and company details

**Response:**
```json
{
  "success": true,
  "invoice": {
    "id": "invoice-id",
    "invoiceNumber": "INV-1738329600000",
    "totalAmount": 1180.00,
    "taxBreakup": {
      "subtotal": "1000.00",
      "gstPercentage": 18,
      "gstAmount": "180.00",
      "discount": 0,
      "grandTotal": "1180.00"
    },
    "vendorDetails": {
      "companyName": "ABC Company",
      "gstin": "29ABCDE1234F1Z5",
      "address": "123 Main St",
      "email": "vendor@abc.com"
    },
    "customerDetails": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "address": "456 Oak Ave"
    },
    "rentalPeriod": {
      "startDate": "2024-02-01T00:00:00Z",
      "endDate": "2024-02-10T00:00:00Z"
    },
    "currency": "INR",
    "lines": [...]
  }
}
```

**Features:**
- ✅ Automatic tax calculation from settings
- ✅ Detailed tax breakup
- ✅ Vendor and customer details
- ✅ Rental period information
- ✅ Currency configuration
- ✅ PDF-ready structure
- ✅ Audit logging

---

## Database Schema Changes

### User Table:
- Added `emailVerified` (Boolean, default: false)
- Added `emailVerificationToken` (String, unique, nullable)
- Added `emailVerificationExpiry` (DateTime, nullable)
- Added `passwordResetToken` (String, unique, nullable)
- Added `passwordResetExpiry` (DateTime, nullable)

### Product Table:
- Added `extraOptions` (String, default: "[]") - JSON field for extra options

### ProductVariant Table:
- Added `name` (String) - Variant name

---

## Security Enhancements

1. **Email Verification**: Users must verify email before login
2. **Secure Tokens**: 32-byte random hex tokens for verification and reset
3. **Token Expiry**: 24 hours for email verification, 1 hour for password reset
4. **Single-Use Tokens**: Tokens are invalidated after use
5. **Audit Logging**: All critical actions are logged
6. **Role-Based Validation**: Strict validation based on user role
7. **Password Security**: Doesn't reveal if email exists in forgot password

---

## Testing Guide

### 1. Test Signup with Role Validation:
```bash
# Vendor signup (should succeed)
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Vendor",
    "email": "vendor@test.com",
    "password": "password123",
    "companyName": "Test Company",
    "role": "VENDOR"
  }'

# Customer signup (should succeed)
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Customer",
    "email": "customer@test.com",
    "password": "password123",
    "role": "CUSTOMER"
  }'

# Customer with companyName (should fail)
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Customer",
    "email": "customer2@test.com",
    "password": "password123",
    "companyName": "Should Fail",
    "role": "CUSTOMER"
  }'
```

### 2. Test Email Verification:
```bash
# Verify email (use token from signup response)
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token": "your-verification-token"}'
```

### 3. Test Password Reset:
```bash
# Request reset
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "vendor@test.com"}'

# Reset password
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your-reset-token",
    "newPassword": "newpassword123"
  }'
```

### 4. Test Product Creation with Variants:
```bash
# Create product with variants (requires vendor auth)
curl -X POST http://localhost:3000/api/vendor/products \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=your-token" \
  -d '{
    "name": "Professional Camera",
    "description": "High-end DSLR",
    "quantityOnHand": 5,
    "pricing": [
      {"rentalPeriodId": "period-id", "price": 200}
    ],
    "variants": [
      {"name": "Body Only", "sku": "CAM-001", "priceModifier": 0},
      {"name": "With Lens", "sku": "CAM-002", "priceModifier": 50}
    ],
    "extraOptions": [
      {
        "label": "Lens Type",
        "inputType": "radio",
        "options": [
          {"value": "Prime", "priceImpact": 0},
          {"value": "Zoom", "priceImpact": 25}
        ]
      }
    ]
  }'
```

### 5. Test Admin Reports:
```bash
# Get summary report
curl http://localhost:3000/api/reports/admin?reportType=summary \
  -H "Cookie: auth_token=admin-token"

# Get revenue report with date filter
curl "http://localhost:3000/api/reports/admin?reportType=revenue&startDate=2024-01-01T00:00:00Z&endDate=2024-12-31T23:59:59Z" \
  -H "Cookie: auth_token=admin-token"
```

---

## Migration Instructions

1. **Backup Database**: Always backup before migration
2. **Run Migration**: `npx prisma migrate dev`
3. **Generate Client**: `npx prisma generate`
4. **Seed Data**: `npm run db:seed` (if needed)
5. **Test Endpoints**: Use the testing guide above

---

## Notes

- Email sending is currently logged to console (TODO: Integrate email service)
- Verification and reset tokens are returned in response for testing (remove in production)
- All new features include audit logging
- Reports support date filtering for analytics
- Invoice generation includes full tax breakup for compliance

---

## Backward Compatibility

✅ All existing APIs remain functional
✅ No breaking changes to existing endpoints
✅ New fields are optional or have defaults
✅ Existing data is preserved during migration

---

## Future Enhancements

- [ ] Email service integration (SendGrid, AWS SES, etc.)
- [ ] PDF invoice generation
- [ ] CSV/Excel export for reports
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-currency support
- [ ] Automated late fee calculation
