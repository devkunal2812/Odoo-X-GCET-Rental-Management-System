# Backend Architecture & API Specification

## Rental Management System

---

## 1. Overview

This backend powers a **full-cycle Rental Management System** supporting Customers, Vendors, and Admins. It models real-world rental workflows similar to ERP systems, covering quotation, reservation, order confirmation, invoicing, payment, pickup, return, and reporting.

**Core Goals:**

* End-to-end rental lifecycle
* Prevent overbooking via reservation logic
* Flexible rental pricing (hour/day/week/custom)
* Secure, role-based access
* Production-grade auditability

---

## 2. Technology Stack

* **Framework:** Next.js (App Router)
* **ORM:** Prisma
* **Database:** SQLite (development), PostgreSQL (production)
* **Authentication:** JWT + HttpOnly Cookies
* **Validation:** Zod
* **Authorization:** RBAC Middleware
* **Logging:** Audit Logs

---

## 3. User Roles & Access Control

| Role     | Capabilities                          |
| -------- | ------------------------------------- |
| Admin    | Full system access, settings, reports |
| Vendor   | Manage own products, orders, invoices |
| Customer | Browse, order, pay, view history      |

### Middleware

* `requireAuth`
* `requireRole(ADMIN | VENDOR | CUSTOMER)`
* `requireOwnership`

---

## 4. Authentication & User Management

### APIs

```http
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### Signup Rules

* Required: Name, Email, Company Name, GSTIN, Password
* Optional: Coupon Code
* Passwords stored using bcrypt
* JWT issued on login

---

## 5. User Profile APIs

```http
GET /api/users/me
PUT /api/users/me
GET /api/admin/users
```

Allows profile updates, GST changes, and password change.

---

## 6. Product Management

### Product APIs

```http
POST /api/vendor/products
GET /api/products
GET /api/products/:id
PUT /api/vendor/products/:id
PATCH /api/admin/products/:id/publish
```

### Product Rules

* Products must be marked **Rentable**
* Pricing supports Hourly / Daily / Weekly / Custom
* Inventory tracked by quantity
* Admin controls publish/unpublish

---

## 7. Attributes & Variants

```http
POST /api/admin/attributes
POST /api/admin/attributes/:id/values
```

* Attributes like Brand, Color, Size
* Variants may affect pricing
* Configurable only by Admin

---

## 8. Cart & Quotation System

```http
POST /api/cart/add
PUT /api/cart/update
DELETE /api/cart/remove
GET /api/cart
```

### Quotation Logic

* Created when items added to cart
* Editable until confirmation
* No stock reserved at this stage

---

## 9. Order Management

```http
POST /api/orders
POST /api/orders/:id/send
POST /api/orders/:id/confirm
GET /api/orders
GET /api/orders/:id
```

### Order Lifecycle

```
DRAFT → SENT → CONFIRMED
```

Confirmation:

1. Validate availability
2. Create reservation records
3. Lock rental dates

---

## 10. Reservation & Availability Logic

```ts
checkAvailability(productId, startDate, endDate, quantity)
```

* Overlapping reservations are summed
* Compared against total inventory
* Prevents double booking

---

## 11. Pickup & Return Flow

```http
POST /api/orders/:id/pickup
POST /api/orders/:id/return
```

### Pickup

* Stock moves to `WITH_CUSTOMER`
* Pickup document generated

### Return

* Stock restored
* Late fee calculated automatically

---

## 12. Invoicing

```http
POST /api/invoices/from-order/:orderId
GET /api/invoices/:id
POST /api/invoices/:id/post
```

### Invoice Rules

* Draft → Posted
* Supports partial / full payment
* GST applied automatically
* Immutable after posting

---

## 13. Payments

```http
POST /api/payments/initiate
POST /api/payments/confirm
```

* Online payment gateway integration
* Supports deposits and full payment
* Payment updates invoice status

---

## 14. Coupons & Promotions

```http
POST /api/admin/coupons
GET /api/admin/coupons
PATCH /api/admin/coupons/:id
POST /api/coupons/validate
```

### Coupon Rules

* Percentage or flat discount
* Signup or order based
* Expiry, usage limits enforced

---

## 15. Settings & Configuration

```http
GET /api/admin/settings
PUT /api/admin/settings
```

Includes:

* Rental durations
* GST percentage
* Company details
* Late fee rules
* Deposit configuration

---

## 16. Notifications (Optional)

Triggers:

* Return reminders
* Overdue alerts
* Payment confirmations

Supports Email & In-App notifications.

---

## 17. Reports & Dashboards

```http
GET /api/reports/admin
GET /api/reports/vendor
```

### Metrics

* Total revenue
* Most rented products
* Vendor performance
* Order trends

Exports: PDF, CSV, Excel

---

## 18. Error Handling & Auditing

* Centralized error handler
* Consistent error codes
* Audit logs for:

  * Login
  * Order confirmation
  * Invoice posting
  * Payments

---

## 19. Deployment Readiness

* Environment-based config
* Stateless services
* Database portability
* Production-ready architecture

---

## 20. Compliance Status

✅ Fully aligned with problem statement
✅ Covers all required modules
✅ ERP-grade rental workflow

---

**This backend specification represents a complete, scalable, and real-world rental system backend.**
