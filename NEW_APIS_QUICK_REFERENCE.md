# New APIs Quick Reference

## Pickup & Return

### Pickup Order
```bash
POST /api/orders/{orderId}/pickup
Authorization: VENDOR or ADMIN
```

**Requirements:**
- Order status must be CONFIRMED

**Response:**
```json
{
  "success": true,
  "message": "Order marked as picked up successfully",
  "order": { ... }
}
```

---

### Return Order
```bash
POST /api/orders/{orderId}/return
Authorization: VENDOR or ADMIN
Content-Type: application/json

{
  "returnDate": "2024-02-15T10:00:00Z"  // Optional
}
```

**Requirements:**
- Order status must be PICKED_UP

**Response:**
```json
{
  "success": true,
  "message": "Order returned successfully",
  "order": { ... },
  "lateFee": 150.00,
  "lateFeeInvoice": { ... }  // If late fee applied
}
```

---

## Admin Settings

### Get Settings
```bash
GET /api/admin/settings
Authorization: ADMIN
```

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
  "rentalPeriods": [...]
}
```

---

### Update Settings
```bash
PUT /api/admin/settings
Authorization: ADMIN
Content-Type: application/json

{
  "settings": {
    "gst_percentage": "18",
    "late_fee_rate": "0.1",
    "company_name": "ABC Rentals"
  },
  "rentalPeriods": [
    {
      "name": "Daily",
      "unit": "day",
      "duration": 1
    }
  ]
}
```

**Available Settings Keys:**
- `gst_percentage`
- `late_fee_rate`
- `late_fee_grace_period_hours`
- `company_name`
- `company_address`
- `company_gstin`
- `company_phone`
- `company_email`
- `security_deposit_percentage`

---

## Product Attributes

### Create Attribute
```bash
POST /api/admin/attributes
Authorization: ADMIN
Content-Type: application/json

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

---

### List Attributes
```bash
GET /api/admin/attributes
Authorization: ADMIN
```

---

### Add Attribute Values
```bash
POST /api/admin/attributes/{attributeId}/values
Authorization: ADMIN
Content-Type: application/json

{
  "values": ["Yellow", "Purple"]
}
```

---

### Get Attribute Values
```bash
GET /api/admin/attributes/{attributeId}/values
Authorization: ADMIN
```

---

## Future Features (Stub APIs)

### Admin Reports
```bash
GET /api/reports/admin
Authorization: ADMIN
```

**Returns:** HTTP 501 with planned features list

---

### Vendor Reports
```bash
GET /api/reports/vendor
Authorization: VENDOR
```

**Returns:** HTTP 501 with planned features list

---

### Notifications
```bash
GET /api/notifications
```

**Returns:** HTTP 501 with planned features list

---

## Testing Examples

### Test Pickup Flow
```bash
# 1. Create and confirm an order first
POST /api/orders
POST /api/orders/{id}/send
POST /api/orders/{id}/confirm

# 2. Pickup the order
POST /api/orders/{id}/pickup
```

---

### Test Return with Late Fee
```bash
# 1. Complete pickup flow first
# 2. Return after due date
POST /api/orders/{id}/return
{
  "returnDate": "2024-03-01T10:00:00Z"  // Past endDate
}

# Check response for lateFee and lateFeeInvoice
```

---

### Test Settings Management
```bash
# 1. Get current settings
GET /api/admin/settings

# 2. Update settings
PUT /api/admin/settings
{
  "settings": {
    "late_fee_rate": "0.15",
    "gst_percentage": "18"
  }
}

# 3. Verify changes
GET /api/admin/settings
```

---

### Test Attributes
```bash
# 1. Create attribute
POST /api/admin/attributes
{
  "name": "Size",
  "displayType": "RADIO",
  "values": ["Small", "Medium", "Large"]
}

# 2. Add more values
POST /api/admin/attributes/{id}/values
{
  "values": ["Extra Large"]
}

# 3. List all attributes
GET /api/admin/attributes
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Order must be CONFIRMED. Current status: QUOTATION"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Unauthorized - not your order"
}
```

### 404 Not Found
```json
{
  "error": "Order not found"
}
```

### 501 Not Implemented
```json
{
  "error": "Admin reports API not yet implemented",
  "message": "This feature is planned for future release",
  "plannedMetrics": [...]
}
```

---

## Authorization Summary

| Endpoint | ADMIN | VENDOR | CUSTOMER |
|----------|-------|--------|----------|
| Pickup | ✅ All | ✅ Own | ❌ |
| Return | ✅ All | ✅ Own | ❌ |
| Settings (GET) | ✅ | ❌ | ❌ |
| Settings (PUT) | ✅ | ❌ | ❌ |
| Attributes | ✅ | ❌ | ❌ |
| Reports | ✅ | ✅ Own | ❌ |

---

## Database Schema Changes

### SaleOrder Table
```sql
ALTER TABLE sale_orders ADD COLUMN pickupDate DATETIME;
ALTER TABLE sale_orders ADD COLUMN actualReturnDate DATETIME;
ALTER TABLE sale_orders ADD COLUMN lateFee REAL DEFAULT 0;
```

### SaleOrderStatus Enum
```
QUOTATION
SENT
CONFIRMED
INVOICED
PICKED_UP    ← New
RETURNED     ← New
CANCELLED
```

### SystemSettings Table (New)
```sql
CREATE TABLE system_settings (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updatedAt DATETIME NOT NULL
);
```

---

## Migration Applied

```bash
npx prisma migrate dev --name add_pickup_return_and_settings
```

Migration file: `20260131091534_add_pickup_return_and_settings`

---

## Notes

1. **Late Fee Calculation:**
   - Automatically calculated on return
   - Based on configured rate in settings
   - Creates separate invoice if original is posted

2. **Reservation Release:**
   - Automatic on return
   - Frees up inventory for new orders
   - Cannot be undone

3. **Audit Logging:**
   - All actions are logged
   - Includes metadata for tracking
   - Cannot be deleted

4. **Settings Caching:**
   - Settings are stored in database
   - Can be cached for performance
   - Updated via PUT endpoint

5. **Attribute Reusability:**
   - Attributes are global
   - Can be used across multiple products
   - Values can be added incrementally
