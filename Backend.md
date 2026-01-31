# Backend Architecture & API Specification – Rental Management System

## 1. Backend Philosophy

* Secure by default
* Role-based access (RBAC)
* API-first architecture
* Stateless authentication (JWT)
* Auditability & traceability

---

## 2. Technology Stack

* **Framework:** Next.js (App Router)
* **ORM:** Prisma
* **Database:** SQLite (dev), PostgreSQL (prod)
* **Auth:** JWT + HttpOnly cookies
* **Validation:** Zod
* **Logging:** Audit logs

---

## 3. Security Model

### Authentication

* Email + password (bcrypt hashing)
* JWT access token
* Refresh token rotation
* Password reset via time-bound token

### Authorization

| Role     | Scope                          |
| -------- | ------------------------------ |
| Admin    | Full system access             |
| Vendor   | Own products, orders, invoices |
| Customer | Own orders & invoices          |

Middleware:

* `requireAuth`
* `requireRole('ADMIN')`
* `requireOwnership`

---

## 4. API Modules

### Auth APIs

```http
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

---

### User & Profile APIs

```http
GET    /api/users/me
PUT    /api/users/me
GET    /api/admin/users
```

---

### Product APIs

```http
POST   /api/vendor/products
GET    /api/products
GET    /api/products/:id
PUT    /api/vendor/products/:id
PATCH  /api/admin/products/:id/publish
```

Rules:

* Vendor sees only own products
* Admin can publish/unpublish

---

### Attribute & Variant APIs

```http
POST   /api/admin/attributes
POST   /api/admin/attributes/:id/values
```

---

### Cart & Quotation APIs

```http
POST   /api/cart/add
PUT    /api/cart/update
DELETE /api/cart/remove
GET    /api/cart
```

On checkout → creates **SaleOrder (QUOTATION)**

---

### Order APIs

```http
POST   /api/orders
POST   /api/orders/:id/send
POST   /api/orders/:id/confirm
GET    /api/orders
GET    /api/orders/:id
```

Confirm logic:

1. Validate availability
2. Create reservations
3. Change status to CONFIRMED

---

### Reservation Logic (Critical)

```ts
checkAvailability(productId, start, end, qty)
```

* Sum overlapping reservations
* Compare with inventory

---

### Invoice APIs

```http
POST   /api/invoices/from-order/:orderId
GET    /api/invoices/:id
POST   /api/invoices/:id/post
```

Rules:

* Invoice immutable after POSTED
* Vendor logo included in print

---

### Payment APIs

```http
POST   /api/payments/initiate
POST   /api/payments/confirm
```

Supports:

* Full payment
* Partial / deposit

---

### Pickup & Return APIs

```http
POST   /api/orders/:id/pickup
POST   /api/orders/:id/return
```

Return logic:

* Release reservation
* Calculate late fee

---

### Reports APIs

```http
GET /api/reports/admin
GET /api/reports/vendor
```

Export:

* PDF
* CSV
* Excel

---

## 5. Error Handling

* Centralized error middleware
* Consistent error codes
* No sensitive info leakage

---

## 6. Auditing & Logging

Every critical action logged:

* Login
* Order confirm
* Invoice post
* Payment

---

## 7. Performance & Scalability

* DB indexes on dates & foreign keys
* Pagination on all list APIs
* Read-only replicas (future)

---

## 8. Deployment Readiness

* Env-based config
* SQLite → PostgreSQL without code change
* Stateless containers

---

## 9. Backend Roadmap (Optional Enhancements)

* Webhooks for payment gateway
* Background jobs for reminders
* WebSocket notifications

---

**This backend design supports all features from the PDF, UI wireframes, and rental business rules with production-grade security and scalability.**
