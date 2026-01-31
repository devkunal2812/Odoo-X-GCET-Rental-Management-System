# API Documentation - Rental Management System

## Base URL
```
http://localhost:3000/api
```

## Authentication
All authenticated endpoints require a JWT token stored in an HttpOnly cookie named `auth_token`.

---

## 1. Authentication APIs

### POST /api/auth/signup
Register a new user (Customer or Vendor)

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "companyName": "ABC Company",
  "gstin": "29ABCDE1234F1Z5",
  "role": "CUSTOMER",
  "couponCode": "WELCOME10"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "CUSTOMER"
  }
}
```

### POST /api/auth/login
Login existing user

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### POST /api/auth/logout
Logout current user

---

## 2. User Profile APIs

### GET /api/users/me
Get current user profile (Authenticated)

### PUT /api/users/me
Update current user profile (Authenticated)

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "address": "123 Main St"
}
```

### GET /api/admin/users
Get all users (Admin only)

**Query Parameters:**
- `role`: Filter by role (ADMIN, VENDOR, CUSTOMER)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

---

## 3. Product Management APIs

### POST /api/vendor/products
Create a new product (Vendor only)

**Request Body:**
```json
{
  "name": "Excavator",
  "description": "Heavy duty excavator",
  "productType": "GOODS",
  "isRentable": true,
  "quantityOnHand": 5,
  "pricing": [
    {
      "rentalPeriodId": "uuid",
      "price": 500.00
    }
  ]
}
```

### GET /api/products
Get all products (Public)

**Query Parameters:**
- `published`: Filter by published status (default: true)
- `vendorId`: Filter by vendor
- `page`: Page number
- `limit`: Items per page

### GET /api/products/[id]
Get product details (Public)

### PUT /api/vendor/products/[id]
Update product (Vendor only - own products)

### PATCH /api/admin/products/[id]/publish
Publish/unpublish product (Admin only)

**Request Body:**
```json
{
  "published": true
}
```

---

## 4. Order Management APIs

### POST /api/orders
Create a new order (Customer only)

**Request Body:**
```json
{
  "vendorId": "uuid",
  "startDate": "2024-02-01T00:00:00Z",
  "endDate": "2024-02-10T00:00:00Z",
  "couponCode": "SAVE10",
  "lines": [
    {
      "productId": "uuid",
      "quantity": 2
    }
  ]
}
```

### GET /api/orders
Get all orders (Authenticated)
- Customers see their orders
- Vendors see orders for their products
- Admins see all orders

**Query Parameters:**
- `status`: Filter by status (QUOTATION, SENT, CONFIRMED, INVOICED, CANCELLED)

### GET /api/orders/[id]
Get order details (Authenticated)

### POST /api/orders/[id]/send
Send order to customer (Vendor only)

### POST /api/orders/[id]/confirm
Confirm order and create reservations (Vendor only)

---

## 5. Invoice APIs

### POST /api/invoices/from-order/[orderId]
Create invoice from confirmed order (Vendor only)

### POST /api/invoices/[id]/post
Post invoice (make it immutable) (Vendor only)

---

## 6. Payment APIs

### POST /api/payments/initiate
Initiate payment (Customer only)

**Request Body:**
```json
{
  "invoiceId": "uuid",
  "amount": 1000.00,
  "method": "CARD"
}
```

### POST /api/payments/confirm
Confirm payment completion (Customer/Admin)

**Request Body:**
```json
{
  "paymentId": "uuid",
  "transactionRef": "TXN-123456"
}
```

---

## 7. Coupon APIs

### POST /api/admin/coupons
Create coupon (Admin only)

**Request Body:**
```json
{
  "code": "SAVE20",
  "discountType": "PERCENTAGE",
  "value": 20,
  "validFrom": "2024-01-01T00:00:00Z",
  "validTo": "2024-12-31T23:59:59Z",
  "maxUses": 100
}
```

### GET /api/admin/coupons
Get all coupons (Admin only)

### POST /api/coupons/validate
Validate coupon code (Public)

**Request Body:**
```json
{
  "code": "SAVE20",
  "orderAmount": 1000.00
}
```

---

## 8. Reservation & Availability

The system automatically checks availability when confirming orders:
- Prevents overbooking by tracking reservations
- Calculates available quantity based on overlapping date ranges
- Reservations are created when orders are confirmed

**IMPORTANT: Quotation vs Order Semantics**

Orders follow this lifecycle with specific reservation behavior:

1. **QUOTATION** - Initial quote/estimate
   - NO inventory reservation
   - Can be edited freely
   - Represents pricing estimate only

2. **SENT** - Quote sent to customer
   - Still NO inventory reservation
   - Awaiting confirmation

3. **CONFIRMED** - Order confirmed (via `/api/orders/[id]/confirm`)
   - Reservations CREATED here
   - Inventory locked for rental period
   - Prevents overbooking

4. **INVOICED** - Invoice generated
   - Reservations remain active

5. **PICKED_UP** - Customer picked up items
   - Reservations remain active
   - Physical handover completed

6. **RETURNED** - Items returned
   - Reservations DELETED
   - Inventory released back to pool

---

## 9. Pickup & Return Flow

### POST /api/orders/[id]/pickup
Mark order as picked up (Vendor/Admin only)

**Requirements:**
- Order must be CONFIRMED
- Updates status to PICKED_UP
- Records pickup date
- Creates audit log

**Response:**
```json
{
  "success": true,
  "message": "Order marked as picked up successfully",
  "order": { ... }
}
```

### POST /api/orders/[id]/return
Process return of rented items (Vendor/Admin only)

**Requirements:**
- Order must be PICKED_UP
- Calculates late fee if overdue
- Releases reservations
- Updates status to RETURNED

**Request Body:**
```json
{
  "returnDate": "2024-02-15T10:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order returned successfully",
  "order": { ... },
  "lateFee": 150.00,
  "lateFeeInvoice": { ... }
}
```

**Late Fee Logic:**
- Compares actual return date with planned endDate
- Calculates extra days
- Applies configured late fee rate
- Creates separate invoice if original invoice is posted

---

## 10. Admin Settings APIs

### GET /api/admin/settings
Get all system settings (Admin only)

**Response:**
```json
{
  "success": true,
  "settings": {
    "gst_percentage": {
      "value": "18",
      "description": "GST/Tax percentage",
      "updatedAt": "2024-01-31T..."
    },
    "late_fee_rate": {
      "value": "0.1",
      "description": "Late fee rate per day"
    }
  },
  "rentalPeriods": [
    {
      "id": "uuid",
      "name": "Daily",
      "unit": "day",
      "duration": 1
    }
  ]
}
```

### PUT /api/admin/settings
Update system settings (Admin only)

**Request Body:**
```json
{
  "settings": {
    "gst_percentage": "18",
    "late_fee_rate": "0.1",
    "company_name": "ABC Rentals",
    "company_gstin": "29ABCDE1234F1Z5",
    "security_deposit_percentage": "20"
  },
  "rentalPeriods": [
    {
      "name": "Hourly",
      "unit": "hour",
      "duration": 1
    }
  ]
}
```

**Available Settings:**
- `gst_percentage` - GST/Tax percentage
- `late_fee_rate` - Late fee rate per day (decimal)
- `late_fee_grace_period_hours` - Grace period before late fees
- `company_name` - Company name for invoices
- `company_address` - Company address
- `company_gstin` - Company GSTIN
- `security_deposit_percentage` - Deposit percentage

---

## 11. Product Attributes & Variants

### POST /api/admin/attributes
Create product attribute (Admin only)

**Request Body:**
```json
{
  "name": "Color",
  "displayType": "PILLS",
  "values": ["Red", "Blue", "Green"]
}
```

**Display Types:**
- `RADIO` - Radio buttons
- `PILLS` - Pill-style buttons
- `CHECKBOX` - Checkboxes

### GET /api/admin/attributes
Get all attributes with values (Admin only)

### POST /api/admin/attributes/[id]/values
Add values to existing attribute (Admin only)

**Request Body:**
```json
{
  "values": ["Yellow", "Purple"]
}
```

### GET /api/admin/attributes/[id]/values
Get all values for specific attribute (Admin only)

---

## 12. Reports & Notifications (Future)

### GET /api/reports/admin
Admin reports and dashboards

**Status:** 501 Not Implemented

**Planned Features:**
- Total revenue analytics
- Most rented products
- Vendor performance rankings
- Order trends
- Late return statistics
- Inventory utilization

### GET /api/reports/vendor
Vendor reports and dashboards

**Status:** 501 Not Implemented

**Planned Features:**
- Revenue by product
- Rental frequency
- Average rental duration
- Upcoming pickups/returns

### GET /api/notifications
Notifications API

**Status:** 501 Not Implemented

**Planned Features:**
- Return reminders
- Overdue alerts
- Payment confirmations
- Order status updates
- Low inventory alerts

---

## Status Codes

- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error
- `501` - Not Implemented (future feature)

---

## Error Response Format

```json
{
  "error": "Error message description"
}
```

---

## Success Response Format

```json
{
  "success": true,
  "data": { ... }
}
```

---

## Role-Based Access Control

| Role     | Capabilities                                    |
|----------|-------------------------------------------------|
| ADMIN    | Full system access, manage users, settings      |
| VENDOR   | Manage own products, orders, invoices           |
| CUSTOMER | Browse products, create orders, make payments   |

---

## Database Schema Alignment

✅ All APIs are fully aligned with the Prisma schema
✅ Supports all models: User, Product, Order, Invoice, Payment, Coupon, Reservation
✅ Implements proper relationships and cascading deletes
✅ Includes audit logging for critical operations

---

## Next Steps

1. Test all endpoints using the test route: `GET /api/test`
2. Seed the database with sample data
3. Implement frontend UI
4. Add email notifications
5. Integrate payment gateway
6. Add reporting dashboards
