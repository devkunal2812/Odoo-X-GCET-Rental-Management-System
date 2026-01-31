# Missing APIs - Quick Reference Guide

## 🎯 Overview

All missing APIs have been successfully implemented following the existing project structure and conventions.

---

## 📋 API Endpoints Summary

### 1. User Profile Update
```
PUT /api/users/me
```
**Role**: Any authenticated user  
**Features**: Role-based field restrictions, validation, audit logging

### 2. Product Management
```
GET    /api/vendor/products/[id]
PUT    /api/vendor/products/[id]
DELETE /api/vendor/products/[id]
```
**Role**: VENDOR only  
**Features**: Ownership verification, partial updates, variants & pricing

### 3. Admin Reports
```
GET /api/reports/admin?reportType={type}&startDate={date}&endDate={date}
```
**Role**: ADMIN only  
**Report Types**: summary, revenue, products, vendors, orders

### 4. Admin Invoices
```
GET /api/admin/invoices
GET /api/admin/invoices/[id]
```
**Role**: ADMIN only  
**Features**: PDF-ready structure, tax breakup, complete details

---

## 🚀 Quick Test Commands

### Test User Profile Update
```bash
# Customer update (allowed)
curl -X PUT http://localhost:3000/api/users/me \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=CUSTOMER_TOKEN" \
  -d '{"firstName":"Jane","phone":"+1234567890","address":"123 Main St"}'

# Customer with company name (should fail)
curl -X PUT http://localhost:3000/api/users/me \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=CUSTOMER_TOKEN" \
  -d '{"companyName":"Should Fail"}'

# Vendor update (allowed)
curl -X PUT http://localhost:3000/api/users/me \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=VENDOR_TOKEN" \
  -d '{"companyName":"New Company","gstin":"29ABCDE1234F1Z5"}'
```

### Test Product Update
```bash
# Update product name
curl -X PUT http://localhost:3000/api/vendor/products/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=VENDOR_TOKEN" \
  -d '{"name":"Updated Product Name"}'

# Update pricing
curl -X PUT http://localhost:3000/api/vendor/products/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=VENDOR_TOKEN" \
  -d '{
    "pricing": [
      {"rentalPeriodId":"daily-id","price":300}
    ]
  }'

# Update variants
curl -X PUT http://localhost:3000/api/vendor/products/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=VENDOR_TOKEN" \
  -d '{
    "variants": [
      {"name":"Basic","sku":"BASIC-001","priceModifier":0},
      {"name":"Premium","sku":"PREM-001","priceModifier":100}
    ]
  }'
```

### Test Admin Reports
```bash
# Summary report
curl "http://localhost:3000/api/reports/admin?reportType=summary" \
  -H "Cookie: auth_token=ADMIN_TOKEN"

# Revenue report
curl "http://localhost:3000/api/reports/admin?reportType=revenue" \
  -H "Cookie: auth_token=ADMIN_TOKEN"

# Revenue with date filter
curl "http://localhost:3000/api/reports/admin?reportType=revenue&startDate=2024-01-01T00:00:00Z&endDate=2024-12-31T23:59:59Z" \
  -H "Cookie: auth_token=ADMIN_TOKEN"

# Products report
curl "http://localhost:3000/api/reports/admin?reportType=products" \
  -H "Cookie: auth_token=ADMIN_TOKEN"

# Vendors report
curl "http://localhost:3000/api/reports/admin?reportType=vendors" \
  -H "Cookie: auth_token=ADMIN_TOKEN"

# Orders report
curl "http://localhost:3000/api/reports/admin?reportType=orders" \
  -H "Cookie: auth_token=ADMIN_TOKEN"
```

### Test Admin Invoices
```bash
# List all invoices
curl "http://localhost:3000/api/admin/invoices" \
  -H "Cookie: auth_token=ADMIN_TOKEN"

# Filter by status
curl "http://localhost:3000/api/admin/invoices?status=POSTED" \
  -H "Cookie: auth_token=ADMIN_TOKEN"

# Filter by date range
curl "http://localhost:3000/api/admin/invoices?startDate=2024-01-01T00:00:00Z&endDate=2024-12-31T23:59:59Z" \
  -H "Cookie: auth_token=ADMIN_TOKEN"

# Get single invoice (PDF-ready)
curl "http://localhost:3000/api/admin/invoices/INVOICE_ID" \
  -H "Cookie: auth_token=ADMIN_TOKEN"
```

---

## 📁 Files Created

1. **app/api/vendor/products/[id]/route.ts**
   - GET: Get product details
   - PUT: Update product
   - DELETE: Delete product

2. **app/api/admin/invoices/route.ts**
   - GET: List all invoices with filters

3. **app/api/admin/invoices/[id]/route.ts**
   - GET: Get single invoice (PDF-ready)

4. **NEW_APIS_IMPLEMENTATION.md**
   - Complete API documentation

5. **MISSING_APIS_QUICK_REFERENCE.md**
   - This file

---

## 📝 Files Modified

1. **app/lib/validation.ts**
   - Added `updateProfileSchema`
   - Added `productUpdateSchema`

2. **app/api/users/me/route.ts**
   - Enhanced with role-based validation
   - Added proper error handling
   - Added audit logging

---

## ✅ Implementation Checklist

- [x] User profile update with role-based restrictions
- [x] Product update (PUT /vendor/products/[id])
- [x] Product delete (DELETE /vendor/products/[id])
- [x] Admin reports (all 5 types)
- [x] Admin invoices list (with filters)
- [x] Admin single invoice (PDF-ready)
- [x] Input validation with Zod
- [x] Role-based access control
- [x] Ownership verification
- [x] Audit logging
- [x] Error handling
- [x] Database-driven data
- [x] Tax calculations from settings
- [x] Proper HTTP status codes

---

## 🔒 Security Features

### Role-Based Access
- **CUSTOMER**: Cannot update company fields
- **VENDOR**: Can only update own products
- **ADMIN**: Full access to reports and invoices

### Validation
- Zod schemas for all inputs
- Role-specific field validation
- Ownership verification

### Audit Logging
- Profile updates
- Product updates
- Product deletions

---

## 📊 Data Structure

### User Profile Update
```typescript
{
  firstName?: string;
  lastName?: string;
  phone?: string;        // Customer & Vendor
  address?: string;      // Customer & Vendor
  companyName?: string;  // Vendor only
  gstin?: string;        // Vendor only
}
```

### Product Update
```typescript
{
  name?: string;
  description?: string;
  productType?: "GOODS" | "SERVICE";
  isRentable?: boolean;
  quantityOnHand?: number;
  pricing?: Array<{
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
    inputType: "radio" | "checkbox" | "dropdown";
    options: Array<{
      value: string;
      priceImpact?: number;
    }>;
  }>;
}
```

---

## 🎯 Key Features

### 1. User Profile Update
- ✅ Role-based field restrictions
- ✅ Customer cannot update company fields
- ✅ Vendor can update all fields
- ✅ Validation with Zod
- ✅ Audit logging

### 2. Product Update
- ✅ Ownership verification
- ✅ Partial updates support
- ✅ Pricing management
- ✅ Variants management
- ✅ Extra options support
- ✅ Cannot update other vendor's products
- ✅ Cannot delete with active reservations

### 3. Admin Reports
- ✅ 5 report types
- ✅ Date range filtering
- ✅ Database-driven
- ✅ Tax calculations
- ✅ Vendor payouts
- ✅ Late returns tracking

### 4. Admin Invoices
- ✅ List with filters
- ✅ PDF-ready structure
- ✅ Complete tax breakup
- ✅ Customer & vendor details
- ✅ Product & variant details
- ✅ Rental duration
- ✅ Payment status

---

## 🐛 Error Handling

### Common Errors

**403 Forbidden**
```json
{
  "error": "Customers cannot update company name or GSTIN"
}
```

**404 Not Found**
```json
{
  "error": "Product not found"
}
```

**400 Bad Request**
```json
{
  "error": "At least one field must be provided for update"
}
```

**401 Unauthorized**
```json
{
  "error": "Unauthorized"
}
```

---

## 📚 Documentation

For complete documentation, see:
- **NEW_APIS_IMPLEMENTATION.md** - Detailed API documentation
- **API_UPDATES.md** - Previous API updates
- **API_DOCUMENTATION.md** - Original API reference
- **IMPLEMENTATION_SUMMARY.md** - Complete implementation summary

---

## ✨ Status

**All requested APIs are fully implemented and ready for testing!** 🚀

### Next Steps
1. Start the development server: `npm run dev`
2. Test the endpoints using the commands above
3. Verify role-based access control
4. Check audit logs in database
5. Test PDF-ready invoice structure

---

## 💡 Tips

1. **Testing**: Use different auth tokens for different roles
2. **Validation**: Check error messages for validation failures
3. **Ownership**: Vendors can only access their own products
4. **Reports**: Use date filters for specific time periods
5. **Invoices**: Single invoice endpoint returns PDF-ready structure

---

**Happy Testing!** 🎉
