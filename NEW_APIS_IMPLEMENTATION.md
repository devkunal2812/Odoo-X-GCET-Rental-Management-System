# New APIs Implementation - Rental Management System

## Summary

This document details the newly implemented and enhanced APIs for the Rental Management System.

---

## 1. USER PROFILE UPDATE ✅

### Endpoint
```
PUT /api/users/me
```

### Authentication
- Required: Yes
- Role: Any authenticated user

### Description
Update user profile with role-based restrictions.

### Request Body
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "address": "123 Main St",
  "companyName": "ABC Company",  // VENDOR only
  "gstin": "29ABCDE1234F1Z5"     // VENDOR only
}
```

### Role-Based Rules

#### CUSTOMER
**Can Update:**
- `firstName`
- `lastName`
- `phone`
- `address`

**Cannot Update:**
- `companyName` ❌
- `gstin` ❌

#### VENDOR
**Can Update:**
- `firstName`
- `lastName`
- `phone`
- `address`
- `companyName` ✅
- `gstin` ✅

#### ADMIN
**Can Update:**
- `firstName`
- `lastName`

### Response
```json
{
  "success": true,
  "user": {
    "id": "user-id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com",
    "role": "CUSTOMER",
    "vendorProfile": null,
    "customerProfile": {
      "phone": "+1234567890",
      "defaultAddress": "123 Main St"
    }
  }
}
```

### Error Responses

**403 Forbidden** - Customer trying to update company fields:
```json
{
  "error": "Customers cannot update company name or GSTIN"
}
```

**400 Bad Request** - Validation error:
```json
{
  "error": "At least one field must be provided for update"
}
```

### Example Usage
```bash
# Customer update
curl -X PUT http://localhost:3000/api/users/me \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=YOUR_TOKEN" \
  -d '{
    "firstName": "Jane",
    "phone": "+1234567890",
    "address": "456 Oak Ave"
  }'

# Vendor update
curl -X PUT http://localhost:3000/api/users/me \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=VENDOR_TOKEN" \
  -d '{
    "companyName": "New Company Name",
    "gstin": "29ABCDE1234F1Z5",
    "address": "789 Business Blvd"
  }'
```

---

## 2. PRODUCT UPDATE ✅

### Endpoint
```
PUT /api/vendor/products/[id]
```

### Authentication
- Required: Yes
- Role: VENDOR only

### Description
Update product details. Vendor can only update their own products.

### Request Body (All fields optional for partial update)
```json
{
  "name": "Updated Camera",
  "description": "Updated description",
  "productType": "GOODS",
  "isRentable": true,
  "quantityOnHand": 10,
  "pricing": [
    {
      "rentalPeriodId": "hourly-id",
      "price": 60.00
    },
    {
      "rentalPeriodId": "daily-id",
      "price": 250.00
    }
  ],
  "variants": [
    {
      "name": "Camera Body Only",
      "sku": "CAM-BODY-002",
      "priceModifier": 0
    },
    {
      "name": "Camera + Premium Lens",
      "sku": "CAM-LENS-002",
      "priceModifier": 75.00
    }
  ],
  "extraOptions": [
    {
      "label": "Lens Type",
      "inputType": "radio",
      "options": [
        {"value": "Prime", "priceImpact": 0},
        {"value": "Zoom", "priceImpact": 30}
      ]
    }
  ]
}
```

### Rules
- ✅ Only product owner can update
- ✅ Supports partial updates (send only fields to update)
- ✅ Pricing update replaces all pricing entries
- ✅ Variants update replaces all variants
- ✅ Cannot update another vendor's product

### Response
```json
{
  "success": true,
  "message": "Product updated successfully",
  "product": {
    "id": "product-id",
    "name": "Updated Camera",
    "description": "Updated description",
    "pricing": [...],
    "variants": [...],
    "extraOptions": [...],
    "inventory": {
      "quantityOnHand": 10
    }
  }
}
```

### Error Responses

**404 Not Found**:
```json
{
  "error": "Product not found"
}
```

**403 Forbidden**:
```json
{
  "error": "You can only update your own products"
}
```

### Additional Endpoints

#### GET /api/vendor/products/[id]
Get product details (vendor's own product)

#### DELETE /api/vendor/products/[id]
Delete product (cannot delete if active reservations exist)

### Example Usage
```bash
# Update product name and pricing
curl -X PUT http://localhost:3000/api/vendor/products/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=VENDOR_TOKEN" \
  -d '{
    "name": "Professional Camera Kit",
    "pricing": [
      {"rentalPeriodId": "daily-id", "price": 300}
    ]
  }'

# Update variants only
curl -X PUT http://localhost:3000/api/vendor/products/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=VENDOR_TOKEN" \
  -d '{
    "variants": [
      {"name": "Basic Kit", "sku": "CAM-BASIC", "priceModifier": 0},
      {"name": "Pro Kit", "sku": "CAM-PRO", "priceModifier": 100}
    ]
  }'
```

---

## 3. ADMIN REPORTS ✅

### Endpoint
```
GET /api/reports/admin
```

### Authentication
- Required: Yes
- Role: ADMIN only

### Description
Generate comprehensive admin reports with date range filtering.

### Query Parameters
- `reportType`: Type of report (summary, revenue, products, vendors, orders)
- `startDate`: Filter from date (ISO string)
- `endDate`: Filter to date (ISO string)

### Report Types

#### 1. Summary Report (`reportType=summary`)
Overview of all metrics

**Response:**
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
    {"status": "CONFIRMED", "count": 40},
    {"status": "INVOICED", "count": 60}
  ]
}
```

#### 2. Revenue Report (`reportType=revenue`)
Detailed revenue analytics with tax breakup

**Response:**
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

#### 3. Products Report (`reportType=products`)
Most rented products

**Response:**
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

#### 4. Vendors Report (`reportType=vendors`)
Vendor performance rankings

**Response:**
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

#### 5. Orders Report (`reportType=orders`)
Order trends and late returns

**Response:**
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

### Example Usage
```bash
# Summary report
curl "http://localhost:3000/api/reports/admin?reportType=summary" \
  -H "Cookie: auth_token=ADMIN_TOKEN"

# Revenue report with date filter
curl "http://localhost:3000/api/reports/admin?reportType=revenue&startDate=2024-01-01T00:00:00Z&endDate=2024-12-31T23:59:59Z" \
  -H "Cookie: auth_token=ADMIN_TOKEN"

# Vendor performance report
curl "http://localhost:3000/api/reports/admin?reportType=vendors" \
  -H "Cookie: auth_token=ADMIN_TOKEN"
```

---

## 4. ADMIN INVOICES ✅

### Endpoint 1: List All Invoices
```
GET /api/admin/invoices
```

### Authentication
- Required: Yes
- Role: ADMIN only

### Description
Get all invoices with full details including customer, vendor, products, and tax breakup.

### Query Parameters
- `status`: Filter by status (DRAFT, POSTED)
- `vendorId`: Filter by vendor
- `customerId`: Filter by customer
- `startDate`: Filter from date (ISO string)
- `endDate`: Filter to date (ISO string)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

### Response
```json
{
  "success": true,
  "invoices": [
    {
      "id": "invoice-id",
      "invoiceNumber": "INV-1738329600000",
      "status": "POSTED",
      "invoiceDate": "2024-01-31T00:00:00Z",
      "dueDate": "2024-02-28T00:00:00Z",
      
      "customer": {
        "id": "customer-id",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "address": "123 Main St"
      },
      
      "vendor": {
        "id": "vendor-id",
        "companyName": "ABC Company",
        "gstin": "29ABCDE1234F1Z5",
        "email": "vendor@abc.com",
        "address": "789 Business Blvd"
      },
      
      "rentalPeriod": {
        "startDate": "2024-02-01T00:00:00Z",
        "endDate": "2024-02-10T00:00:00Z"
      },
      
      "items": [
        {
          "productName": "Professional Camera",
          "description": "High-end DSLR",
          "quantity": 1,
          "unitPrice": 200.00,
          "amount": 200.00
        }
      ],
      
      "taxBreakup": {
        "subtotal": "169.49",
        "gstPercentage": 18,
        "gstAmount": "30.51",
        "discount": 0,
        "grandTotal": "200.00"
      },
      
      "paymentStatus": {
        "totalAmount": 200.00,
        "totalPaid": 200.00,
        "balance": 0,
        "payments": [...]
      },
      
      "currency": "INR"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 120,
    "pages": 6
  }
}
```

### Endpoint 2: Get Single Invoice (PDF-Ready)
```
GET /api/admin/invoices/[id]
```

### Authentication
- Required: Yes
- Role: ADMIN only

### Description
Get single invoice with complete details in PDF-ready format.

### Response
```json
{
  "success": true,
  "invoice": {
    "invoiceNumber": "INV-1738329600000",
    "invoiceDate": "2024-01-31T00:00:00Z",
    "dueDate": "2024-02-28T00:00:00Z",
    "status": "POSTED",
    "currency": "INR",
    
    "platform": {
      "name": "Rental Management System",
      "gstin": "29PLATFORM1234F1Z5",
      "address": "Platform Address"
    },
    
    "vendor": {
      "id": "vendor-id",
      "companyName": "ABC Company",
      "gstin": "29ABCDE1234F1Z5",
      "address": "789 Business Blvd",
      "email": "vendor@abc.com",
      "contactPerson": "John Vendor"
    },
    
    "customer": {
      "id": "customer-id",
      "name": "Jane Customer",
      "email": "jane@example.com",
      "phone": "+1234567890",
      "address": "123 Main St"
    },
    
    "rentalPeriod": {
      "startDate": "2024-02-01T00:00:00Z",
      "endDate": "2024-02-10T00:00:00Z",
      "duration": "9 days"
    },
    
    "orderDetails": {
      "orderNumber": "SO-20240131-0001",
      "orderDate": "2024-01-31T00:00:00Z",
      "orderStatus": "INVOICED"
    },
    
    "items": [
      {
        "sno": 1,
        "productName": "Professional Camera",
        "productDescription": "High-end DSLR camera",
        "variantName": "Camera + Lens",
        "variantSku": "CAM-LENS-001",
        "variantPriceModifier": 50.00,
        "quantity": 1,
        "unitPrice": 250.00,
        "amount": 250.00,
        "description": "Professional Camera"
      }
    ],
    
    "pricingBreakdown": {
      "subtotal": 250.00,
      "discount": 0,
      "subtotalAfterDiscount": 250.00,
      "taxRate": 18,
      "taxAmount": 45.00,
      "grandTotal": 295.00
    },
    
    "paymentInfo": {
      "totalAmount": 295.00,
      "totalPaid": 295.00,
      "balance": 0,
      "paymentStatus": "PAID",
      "payments": [
        {
          "id": "payment-id",
          "amount": 295.00,
          "method": "CARD",
          "status": "COMPLETED",
          "transactionRef": "TXN-123456",
          "date": "2024-01-31T12:00:00Z"
        }
      ]
    },
    
    "notes": [
      "This is a computer-generated invoice.",
      "Payment is due within 30 days of invoice date.",
      "Late returns may incur additional charges."
    ],
    
    "terms": [
      "All rentals are subject to availability.",
      "Customer is responsible for any damage to rented items.",
      "Security deposit may be required for high-value items.",
      "Cancellation policy applies as per rental agreement."
    ]
  }
}
```

### Example Usage
```bash
# List all invoices
curl "http://localhost:3000/api/admin/invoices" \
  -H "Cookie: auth_token=ADMIN_TOKEN"

# Filter by status and date
curl "http://localhost:3000/api/admin/invoices?status=POSTED&startDate=2024-01-01T00:00:00Z&endDate=2024-12-31T23:59:59Z" \
  -H "Cookie: auth_token=ADMIN_TOKEN"

# Get single invoice (PDF-ready)
curl "http://localhost:3000/api/admin/invoices/INVOICE_ID" \
  -H "Cookie: auth_token=ADMIN_TOKEN"
```

---

## Features Summary

### ✅ Implemented Features

1. **User Profile Update**
   - Role-based field restrictions
   - Validation for customer/vendor fields
   - Audit logging

2. **Product Update**
   - Ownership verification
   - Partial updates support
   - Variants and pricing management
   - Extra options support

3. **Admin Reports**
   - Summary report
   - Revenue report with tax breakup
   - Products report
   - Vendors report
   - Orders report with late returns
   - Date range filtering

4. **Admin Invoices**
   - List all invoices with filters
   - Single invoice with PDF-ready structure
   - Complete tax breakup
   - Customer and vendor details
   - Product and variant details
   - Rental duration
   - Payment status

### 🔒 Security Features

- ✅ Role-based access control
- ✅ Ownership verification
- ✅ Input validation with Zod
- ✅ Audit logging
- ✅ Proper error handling
- ✅ HTTP status codes

### 📊 Data Sources

All reports and invoices are **database-driven**:
- Orders table
- Invoices table
- Payments table
- Products table
- System settings table

### 🎯 Best Practices

- ✅ Clean architecture
- ✅ Modular code structure
- ✅ Proper validation
- ✅ Error handling
- ✅ Audit trails
- ✅ RESTful conventions
- ✅ Backward compatibility

---

## Testing

### Test User Profile Update
```bash
# Test customer update (should succeed)
curl -X PUT http://localhost:3000/api/users/me \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=CUSTOMER_TOKEN" \
  -d '{"firstName":"Jane","phone":"+1234567890"}'

# Test customer with company name (should fail)
curl -X PUT http://localhost:3000/api/users/me \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=CUSTOMER_TOKEN" \
  -d '{"companyName":"Should Fail"}'
```

### Test Product Update
```bash
# Update product
curl -X PUT http://localhost:3000/api/vendor/products/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=VENDOR_TOKEN" \
  -d '{"name":"Updated Product Name"}'
```

### Test Admin Reports
```bash
# Get summary report
curl "http://localhost:3000/api/reports/admin?reportType=summary" \
  -H "Cookie: auth_token=ADMIN_TOKEN"
```

### Test Admin Invoices
```bash
# List invoices
curl "http://localhost:3000/api/admin/invoices" \
  -H "Cookie: auth_token=ADMIN_TOKEN"

# Get single invoice
curl "http://localhost:3000/api/admin/invoices/INVOICE_ID" \
  -H "Cookie: auth_token=ADMIN_TOKEN"
```

---

## Files Created/Modified

### Created Files
1. `app/api/vendor/products/[id]/route.ts` - Product update/delete
2. `app/api/admin/invoices/route.ts` - List invoices
3. `app/api/admin/invoices/[id]/route.ts` - Single invoice (PDF-ready)
4. `NEW_APIS_IMPLEMENTATION.md` - This documentation

### Modified Files
1. `app/lib/validation.ts` - Added validation schemas
2. `app/api/users/me/route.ts` - Enhanced with role-based validation
3. `app/api/reports/admin/route.ts` - Already implemented (verified)

---

## Notes

- ✅ All APIs follow existing project structure
- ✅ No unrelated code modified
- ✅ Proper authentication and authorization
- ✅ Database-driven reports and invoices
- ✅ PDF-ready invoice structure
- ✅ Comprehensive error handling
- ✅ Audit logging for all operations

**Status**: All requested APIs are fully implemented and ready for testing! 🚀
