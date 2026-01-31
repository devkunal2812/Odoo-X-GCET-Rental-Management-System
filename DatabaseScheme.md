# Database Schema – Rental Management System

## 1. Design Goals

* Fully normalized (3NF+)
* Prevent overbooking via reservation logic
* Support multi-vendor rental marketplace
* Clear separation of business documents (Quotation, Sale Order, Invoice)
* Easy reporting & analytics
* Works with SQLite (dev) and PostgreSQL (prod)

---

## 2. Core Principles

* **Sale Order is the central document** (Quotation → Confirmed → Invoiced)
* Rental is time-based, enforced via **Reservation table**
* Vendor owns products; Admin has global visibility
* Invoices are immutable financial documents

---

## 3. User & Access Models

### User

```sql
User(
  id PK,
  first_name,
  last_name,
  email UNIQUE,
  password_hash,
  role ENUM('ADMIN','VENDOR','CUSTOMER'),
  is_active,
  created_at
)
```

### VendorProfile

```sql
VendorProfile(
  id PK,
  user_id FK → User.id,
  company_name,
  gstin,
  logo_url,
  address
)
```

### CustomerProfile

```sql
CustomerProfile(
  id PK,
  user_id FK → User.id,
  phone,
  default_address
)
```

---

## 4. Product & Inventory Models

### Product

```sql
Product(
  id PK,
  vendor_id FK → VendorProfile.id,
  name,
  description,
  product_type ENUM('GOODS','SERVICE'),
  is_rentable,
  published,
  created_at
)
```

### ProductPricing

```sql
ProductPricing(
  id PK,
  product_id FK → Product.id,
  period ENUM('HOUR','DAY','WEEK'),
  price
)
```

### Inventory

```sql
Inventory(
  product_id PK FK → Product.id,
  quantity_on_hand
)
```

---

## 5. Attributes & Variants

### Attribute

```sql
Attribute(
  id PK,
  name,
  display_type
)
```

### AttributeValue

```sql
AttributeValue(
  id PK,
  attribute_id FK → Attribute.id,
  value
)
```

### ProductVariant

```sql
ProductVariant(
  id PK,
  product_id FK → Product.id,
  sku,
  price_modifier
)
```

---

## 6. Rental & Order Models

### SaleOrder

```sql
SaleOrder(
  id PK,
  order_number UNIQUE,
  customer_id FK → CustomerProfile.id,
  vendor_id FK → VendorProfile.id,
  status ENUM('QUOTATION','SENT','CONFIRMED','INVOICED','CANCELLED'),
  start_date,
  end_date,
  order_date,
  total_amount
)
```

### SaleOrderLine

```sql
SaleOrderLine(
  id PK,
  order_id FK → SaleOrder.id,
  product_id FK → Product.id,
  variant_id FK → ProductVariant.id,
  quantity,
  unit_price,
  rental_start,
  rental_end
)
```

---

## 7. Reservation (Overbooking Prevention)

### Reservation

```sql
Reservation(
  id PK,
  product_id FK → Product.id,
  quantity,
  start_date,
  end_date,
  sale_order_id FK → SaleOrder.id
)
```

**Rule:**

> SUM(reserved.quantity) + requested ≤ inventory.quantity

---

## 8. Invoicing & Payments

### Invoice

```sql
Invoice(
  id PK,
  invoice_number UNIQUE,
  sale_order_id FK → SaleOrder.id,
  status ENUM('DRAFT','POSTED'),
  invoice_date,
  due_date,
  total_amount
)
```

### InvoiceLine

```sql
InvoiceLine(
  id PK,
  invoice_id FK → Invoice.id,
  product_id FK → Product.id,
  description,
  quantity,
  unit_price,
  amount
)
```

### Payment

```sql
Payment(
  id PK,
  invoice_id FK → Invoice.id,
  method,
  amount,
  status,
  transaction_ref,
  created_at
)
```

---

## 9. Configuration & Settings

### RentalPeriod

```sql
RentalPeriod(
  id PK,
  name,
  unit,
  duration
)
```

### Coupon

```sql
Coupon(
  id PK,
  code UNIQUE,
  discount_type,
  value,
  valid_from,
  valid_to
)
```

---

## 10. Reporting Tables (Read-Optimized)

### AuditLog

```sql
AuditLog(
  id PK,
  user_id,
  action,
  entity,
  entity_id,
  timestamp
)
```

---

## 11. Indexing Strategy

* SaleOrder(status, order_date)
* Reservation(product_id, start_date, end_date)
* Invoice(invoice_date, status)
* Product(vendor_id, published)

---

## 12. Migration Strategy

* SQLite for development
* PostgreSQL for production
* Prisma migrations only

---

**This schema is optimized for ERP-grade rental workflows, reporting, and scale.**
