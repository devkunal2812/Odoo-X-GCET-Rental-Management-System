# Quick Start Guide - New Features

## 🚀 Getting Started

### 1. Database Migration
```bash
# Apply the new schema changes
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### 2. Start the Server
```bash
npm run dev
```

Server will start at: `http://localhost:3000`

---

## 📝 Quick Testing

### Test 1: Vendor Signup (with company name)
```bash
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
```

**Expected**: Success with verification token

### Test 2: Customer Signup (without company name)
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Customer",
    "email": "customer@test.com",
    "password": "password123",
    "role": "CUSTOMER"
  }'
```

**Expected**: Success with verification token

### Test 3: Email Verification
```bash
# Use token from signup response
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token": "YOUR_VERIFICATION_TOKEN"}'
```

**Expected**: Email verified successfully

### Test 4: Login (after verification)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendor@test.com",
    "password": "password123"
  }'
```

**Expected**: Success with auth cookie

### Test 5: Forgot Password
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "vendor@test.com"}'
```

**Expected**: Reset token in response

### Test 6: Reset Password
```bash
# Use token from forgot password response
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_RESET_TOKEN",
    "newPassword": "newpassword123"
  }'
```

**Expected**: Password reset successfully

---

## 🎯 Key Features

### 1. Role-Based Signup
- **VENDOR**: Must provide `companyName`
- **CUSTOMER**: Cannot provide `companyName` or `gstin`
- **ADMIN**: No profile requirements

### 2. Email Verification
- Token expires in 24 hours
- Single-use tokens
- Login blocked until verified

### 3. Password Reset
- Token expires in 1 hour
- Single-use tokens
- Secure token generation

### 4. Product Variants
```json
{
  "variants": [
    {
      "name": "Camera Body Only",
      "sku": "CAM-001",
      "priceModifier": 0
    },
    {
      "name": "Camera + Lens",
      "sku": "CAM-002",
      "priceModifier": 50.00
    }
  ]
}
```

### 5. Extra Options
```json
{
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
}
```

### 6. Admin Reports
```bash
# Summary report
curl "http://localhost:3000/api/reports/admin?reportType=summary" \
  -H "Cookie: auth_token=ADMIN_TOKEN"

# Revenue report
curl "http://localhost:3000/api/reports/admin?reportType=revenue" \
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

### 7. Vendor Reports
```bash
# Summary report
curl "http://localhost:3000/api/reports/vendor?reportType=summary" \
  -H "Cookie: auth_token=VENDOR_TOKEN"

# Earnings report
curl "http://localhost:3000/api/reports/vendor?reportType=earnings" \
  -H "Cookie: auth_token=VENDOR_TOKEN"

# Bookings report
curl "http://localhost:3000/api/reports/vendor?reportType=bookings" \
  -H "Cookie: auth_token=VENDOR_TOKEN"

# Products report
curl "http://localhost:3000/api/reports/vendor?reportType=products" \
  -H "Cookie: auth_token=VENDOR_TOKEN"
```

### 8. Role Management
```bash
# Update user role (Admin only)
curl -X PUT http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=ADMIN_TOKEN" \
  -d '{
    "userId": "USER_ID",
    "role": "VENDOR"
  }'
```

### 9. Settings Configuration
```bash
# Update system settings (Admin only)
curl -X PUT http://localhost:3000/api/admin/settings \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=ADMIN_TOKEN" \
  -d '{
    "settings": {
      "gst_percentage": "18",
      "platform_fee": "5",
      "invoice_prefix": "INV",
      "currency": "INR",
      "company_name": "ABC Rentals",
      "company_gstin": "29ABCDE1234F1Z5"
    }
  }'
```

---

## 📊 Report Types

### Admin Reports
1. **summary** - Overview of all metrics
2. **revenue** - Revenue analytics with tax breakup
3. **products** - Most rented products
4. **vendors** - Vendor performance rankings
5. **orders** - Order trends and late returns

### Vendor Reports
1. **summary** - Vendor overview
2. **earnings** - Revenue by product
3. **bookings** - Upcoming pickups and returns
4. **products** - Product performance and utilization

---

## 🔒 Security Notes

1. **Email Verification**: Required before login
2. **Token Expiry**: 
   - Email verification: 24 hours
   - Password reset: 1 hour
3. **Single-Use Tokens**: Tokens are invalidated after use
4. **Audit Logging**: All critical actions are logged
5. **Role Validation**: Strict validation based on user role

---

## 📚 Documentation

- **Full API Docs**: `API_UPDATES.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`
- **Database Schema**: `DATABASE_COMPLETE.md`
- **Original API Docs**: `API_DOCUMENTATION.md`

---

## 🐛 Troubleshooting

### Issue: "Email already registered"
**Solution**: Use a different email or check if user already exists

### Issue: "Please verify your email before logging in"
**Solution**: Check console logs for verification token and verify email

### Issue: "Invalid verification token"
**Solution**: Token may have expired (24 hours) or already been used

### Issue: "Reset token has expired"
**Solution**: Request a new password reset (tokens expire in 1 hour)

### Issue: "Cannot change your own role"
**Solution**: Admin cannot change their own role for security

---

## ✅ Checklist

Before going to production:

- [ ] Remove debug tokens from responses
- [ ] Integrate email service (SendGrid, AWS SES, etc.)
- [ ] Set proper JWT_SECRET in environment
- [ ] Configure CORS for production domain
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Set up SSL/HTTPS
- [ ] Review security headers
- [ ] Test all endpoints thoroughly
- [ ] Backup database before migration

---

## 🎉 You're Ready!

All features are implemented and ready to use. Start testing with the examples above!

For detailed documentation, see:
- `API_UPDATES.md` - Complete API documentation
- `IMPLEMENTATION_SUMMARY.md` - Implementation details
- `API_DOCUMENTATION.md` - Original API reference
