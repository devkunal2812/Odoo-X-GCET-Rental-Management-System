# Quick Test Guide - 2 Minute Setup

## Run All Tests in 3 Steps

### Step 1: Start Server
```bash
npm run dev
```

### Step 2: Open New Terminal

### Step 3: Run Tests
```bash
npm run test:api
```

That's it! ✨

---

## What You'll See

```
🚀 Starting API Test Suite...

============================================================
AUTHENTICATION TESTS
============================================================
✅ PASS: POST /api/auth/signup - Admin signup
✅ PASS: POST /api/auth/signup - Vendor signup
✅ PASS: POST /api/auth/signup - Customer signup
...

============================================================
TEST SUMMARY
============================================================
Total Tests: 39
✅ Passed: 39
❌ Failed: 0
Success Rate: 100.00%
============================================================
```

---

## Test Coverage

✅ **39 Tests** covering:
- Authentication (5 tests)
- User Management (4 tests)
- Admin Settings (3 tests)
- Product Attributes (4 tests)
- Product Management (5 tests)
- Coupons (3 tests)
- Order Lifecycle (7 tests)
- Invoices (2 tests)
- Payments (2 tests)
- Future Features (3 tests)
- Database (1 test)

---

## Alternative: Use Test Runner

**Windows:**
```bash
run-tests.bat
```

**Linux/Mac:**
```bash
chmod +x run-tests.sh
./run-tests.sh
```

---

## Test a Specific Endpoint Manually

### Example: Test Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "password123",
    "companyName": "Test Corp",
    "role": "CUSTOMER"
  }'
```

### Example: Test Database
```bash
curl http://localhost:3000/api/test
```

---

## Troubleshooting

### Tests Failing?

1. **Check server is running:**
```bash
curl http://localhost:3000/api/test
```

2. **Reset database:**
```bash
npm run db:reset
npm run db:migrate
```

3. **Check .env file:**
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
```

---

## Full Documentation

For detailed testing guide, see:
- `TESTING.md` - Complete testing documentation
- `TESTING_SUMMARY.md` - Test suite overview
- `API_DOCUMENTATION.md` - API reference

---

## Quick Commands

```bash
# Start dev server
npm run dev

# Run all API tests
npm run test:api

# Reset database
npm run db:reset

# Run migrations
npm run db:migrate

# Open Prisma Studio
npm run db:studio
```

---

**That's all you need! Happy testing! 🎉**
