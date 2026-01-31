# Rental Marketplace Project – UI Structure & Flow

This document describes the **complete UI structure, pages, and functional flow** of the Rental Marketplace system based on all shared wireframes (Admin, Vendor, and Customer).

---

## 1. System Overview

The platform is a **multi-vendor rental system** where:

* Each vendor owns products under specific categories
* A single customer order can contain products from multiple vendors
* Backend **automatically splits** orders and invoices per vendor
* Rental is handled via **Quotation → Sale Order (Rental Order)** flow

There is **no separate Rental Order entity** technically. A confirmed Sale Order used for renting is referred to as a *Rental Order*.

---

## 2. User Roles

### Admin

* Full visibility of all vendors, orders, rentals, invoices, customers
* Can manage settings, attributes, rental periods, users
* Can view global reports

### Vendor (Shop Owner)

* Can view only their own:

  * Products
  * Rental Orders
  * Sale Orders
  * Invoices
  * Reports
* Vendor branding (logo) appears on invoices & printouts

### Customer (End User)

* Browses products
* Configures rental options
* Places rental orders
* Completes checkout & payment

---

## 3. Backend (Admin & Vendor) UI Structure

### Main Navigation

* Orders
* Products
* Reports
* Settings
* Invoices
* Customers

---

## 4. Orders Module

### Orders Views

#### Kanban View

Rental orders categorized by status:

* Quotation
* Quotation Sent
* Sale Order
* Confirmed
* Invoiced
* Cancelled

Each card displays:

* Customer name
* Product(s)
* Rental duration
* Total amount
* Status badge

#### List View

Columns:

* Order Reference
* Order Date
* Customer Name
* Product
* Total
* Rental Status

Filters:

* By status
* By invoiced/paid
* By return due / overdue

---

## 5. Rental Order (Sale Order) Page

### Header Actions

* New
* Send (Quotation)
* Confirm
* Print
* Create Invoice

### Status Flow

Quotation → Quotation Sent → Sale Order

### Order Details

* Order Reference
* Customer
* Invoice Address
* Delivery Address
* Rental Period (Start & End Date)
* Order Date

### Order Lines

* Product
* Quantity
* Unit
* Unit Price
* Taxes
* Amount
* Rental Duration per line

### Extra Components

* Add Product
* Add Note
* Downpayment / Deposit as service product
* Terms & Conditions link

---

## 6. Invoice Page

### Invoice States

* Draft
* Posted

### Invoice Details

* Invoice Number
* Customer
* Invoice Address
* Delivery Address
* Invoice Date
* Due Date
* Rental Period

### Invoice Lines

* Product
* Quantity
* Unit
* Unit Price
* Taxes
* Amount

### Footer

* Untaxed Amount
* Taxes
* Discounts
* Shipping
* Total

Vendor logo must appear on printed invoices.

---

## 7. Products Module

### Product Views

#### Kanban View

* Product image
* Product name
* Price
* Vendor name
* Published / Unpublished state

#### List View

Columns:

* Product Name
* Vendor Name
* Quantity
* Unit
* Sales Price

---

## 8. Product Creation Page

### General Information

* Product Name
* Product Type (Goods / Service)
* Quantity on Hand
* Sales Price (per unit)
* Cost Price
* Category
* Vendor Name (auto-filled)
* Publish toggle (Admin only)

### Attributes & Variants

* Attribute Name (e.g., Color, Size)
* Display Type (Radio / Pills / Checkbox)
* Attribute Values

If product has variants, **Add to Cart opens configuration modal**.

---

## 9. Settings Module

### Settings Menu

* Rental Period
* Attributes
* Users

### Rental Period

* Name (Hourly, Daily, Weekly)
* Duration
* Unit

### Attributes

* Attribute Name
* Display Type
* Values

### User Settings

* Profile info
* Company Logo upload
* GSTIN
* Address
* Role (Admin / Vendor / Customer)
* Change Password

Settings are **admin-only visible**.

---

## 10. Reports Module

* Graph-based analytics
* Filters by date, vendor, product
* Export options:

  * PDF
  * Excel
  * CSV

Admin and Vendor reports differ in data scope.

---

## 11. Frontend (Customer) UI Structure

### Customer Navigation

* Products
* Terms & Conditions
* About Us
* Contact Us
* Wishlist
* Cart
* Profile

---

## 12. Product Listing Page

Features:

* Grid view
* Filters:

  * Brand
  * Color
  * Rental Duration
  * Price Range

Each product card:

* Image
* Price (per hour/day/week)
* Add to Cart

---

## 13. Product Detail Page

* Product Image
* Product Name
* Rental Pricing
* Rental Period selector
* Variant selector (if applicable)
* Add to Cart

---

## 14. Cart Page

* Product summary
* Quantity selector
* Rental duration
* Apply coupon
* Continue shopping

---

## 15. Checkout Flow

### Address Step

* Delivery Method:

  * Standard Delivery
  * Pickup from Store
* Delivery Address
* Billing Address toggle

### Payment Step

* Card details
* Save payment option

### Order Confirmation

* Order number
* Payment success message
* Print invoice option

Backend automatically:

* Creates Sale Order(s)
* Generates Invoice(s)
* Splits by vendor

---

## 16. Key Business Rules

* Orders split per vendor
* Separate Sale Orders & Invoices per vendor
* Admin sees all rental orders
* Vendor sees only own orders
* Rental handled via Sale Orders
* Vendor logo included on print

---

## 17. Conclusion

This UI structure supports a **scalable multi-vendor rental ecosystem** with clear separation between Admin, Vendor, and Customer workflows, while maintaining a smooth rental lifecycle from browsing to invoicing.
