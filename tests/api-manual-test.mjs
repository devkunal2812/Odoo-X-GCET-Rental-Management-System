/**
 * Manual API Test Script
 * Run with: node tests/api-manual-test.mjs
 * 
 * Tests all API endpoints sequentially
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// Test data storage
const testData = {
  adminToken: '',
  vendorToken: '',
  customerToken: '',
  adminUser: null,
  vendorUser: null,
  customerUser: null,
  productId: '',
  orderId: '',
  invoiceId: '',
  paymentId: '',
  attributeId: '',
  rentalPeriodId: '',
  vendorProfileId: '',
};

// Test results
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: [],
};

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', body = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Cookie'] = `auth_token=${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();

    // Extract token from Set-Cookie header
    let extractedToken = null;
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      const match = setCookie.match(/auth_token=([^;]+)/);
      if (match) extractedToken = match[1];
    }

    return {
      status: response.status,
      data,
      token: extractedToken,
    };
  } catch (error) {
    return {
      status: 0,
      data: { error: error.message },
      token: null,
    };
  }
}

// Test runner
async function test(name, fn) {
  results.total++;
  try {
    await fn();
    results.passed++;
    results.tests.push({ name, status: 'PASS' });
    console.log(`✅ PASS: ${name}`);
  } catch (error) {
    results.failed++;
    results.tests.push({ name, status: 'FAIL', error: error.message });
    console.log(`❌ FAIL: ${name}`);
    console.log(`   Error: ${error.message}`);
  }
}

// Assertion helpers
function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    },
    toContain(substring) {
      if (!String(actual).includes(substring)) {
        throw new Error(`Expected "${actual}" to contain "${substring}"`);
      }
    },
    toBeDefined() {
      if (actual === undefined) {
        throw new Error('Expected value to be defined');
      }
    },
    toBeGreaterThan(value) {
      if (actual <= value) {
        throw new Error(`Expected ${actual} to be greater than ${value}`);
      }
    },
  };
}

// Run all tests
async function runTests() {
  console.log('\n🚀 Starting API Test Suite...\n');
  console.log('='.repeat(60));
  console.log('AUTHENTICATION TESTS');
  console.log('='.repeat(60));

  // 1. Authentication Tests
  await test('POST /api/auth/signup - Admin signup', async () => {
    const response = await apiCall('/api/auth/signup', 'POST', {
      firstName: 'Admin',
      lastName: 'User',
      email: `admin${Date.now()}@test.com`,
      password: 'admin123456',
      companyName: 'Admin Corp',
      role: 'ADMIN',
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    testData.adminToken = response.token;
    testData.adminUser = response.data.user;
  });

  await test('POST /api/auth/signup - Vendor signup', async () => {
    const response = await apiCall('/api/auth/signup', 'POST', {
      firstName: 'Vendor',
      lastName: 'User',
      email: `vendor${Date.now()}@test.com`,
      password: 'vendor123456',
      companyName: 'Vendor Corp',
      gstin: '29ABCDE1234F1Z5',
      role: 'VENDOR',
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    testData.vendorToken = response.token;
    testData.vendorUser = response.data.user;
  });

  await test('POST /api/auth/signup - Customer signup', async () => {
    const response = await apiCall('/api/auth/signup', 'POST', {
      firstName: 'Customer',
      lastName: 'User',
      email: `customer${Date.now()}@test.com`,
      password: 'customer123456',
      companyName: 'Customer Corp',
      role: 'CUSTOMER',
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    testData.customerToken = response.token;
    testData.customerUser = response.data.user;
  });

  await test('POST /api/auth/login - Valid credentials', async () => {
    const response = await apiCall('/api/auth/login', 'POST', {
      email: testData.adminUser.email,
      password: 'admin123456',
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
  });

  await test('POST /api/auth/logout - Logout user', async () => {
    const response = await apiCall('/api/auth/logout', 'POST', {}, testData.adminToken);
    expect(response.status).toBe(200);
  });

  console.log('\n' + '='.repeat(60));
  console.log('USER PROFILE TESTS');
  console.log('='.repeat(60));

  // 2. User Profile Tests
  await test('GET /api/users/me - Get current user', async () => {
    const response = await apiCall('/api/users/me', 'GET', null, testData.adminToken);
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
  });

  await test('PUT /api/users/me - Update profile', async () => {
    const response = await apiCall('/api/users/me', 'PUT', {
      firstName: 'Updated Admin',
    }, testData.adminToken);
    expect(response.status).toBe(200);
  });

  await test('GET /api/admin/users - List all users', async () => {
    const response = await apiCall('/api/admin/users', 'GET', null, testData.adminToken);
    expect(response.status).toBe(200);
    expect(response.data.users).toBeDefined();
  });

  console.log('\n' + '='.repeat(60));
  console.log('ADMIN SETTINGS TESTS');
  console.log('='.repeat(60));

  // 3. Admin Settings Tests
  await test('GET /api/admin/settings - Get settings', async () => {
    const response = await apiCall('/api/admin/settings', 'GET', null, testData.adminToken);
    expect(response.status).toBe(200);
  });

  await test('PUT /api/admin/settings - Update settings', async () => {
    const response = await apiCall('/api/admin/settings', 'PUT', {
      settings: {
        gst_percentage: '18',
        late_fee_rate: '0.1',
        company_name: 'Test Rentals Inc',
      },
      rentalPeriods: [
        { name: 'Daily', unit: 'day', duration: 1 },
      ],
    }, testData.adminToken);

    expect(response.status).toBe(200);
    if (response.data.updatedRentalPeriods?.length > 0) {
      testData.rentalPeriodId = response.data.updatedRentalPeriods[0].id;
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log('PRODUCT ATTRIBUTE TESTS');
  console.log('='.repeat(60));

  // 4. Product Attribute Tests
  await test('POST /api/admin/attributes - Create attribute', async () => {
    const response = await apiCall('/api/admin/attributes', 'POST', {
      name: `Color-${Date.now()}`,
      displayType: 'PILLS',
      values: ['Red', 'Blue', 'Green'],
    }, testData.adminToken);

    expect(response.status).toBe(200);
    testData.attributeId = response.data.attribute.id;
  });

  await test('GET /api/admin/attributes - List attributes', async () => {
    const response = await apiCall('/api/admin/attributes', 'GET', null, testData.adminToken);
    expect(response.status).toBe(200);
  });

  await test('POST /api/admin/attributes/[id]/values - Add values', async () => {
    const response = await apiCall(`/api/admin/attributes/${testData.attributeId}/values`, 'POST', {
      values: ['Yellow'],
    }, testData.adminToken);
    expect(response.status).toBe(200);
  });

  console.log('\n' + '='.repeat(60));
  console.log('PRODUCT MANAGEMENT TESTS');
  console.log('='.repeat(60));

  // Get vendor profile ID
  const vendorProfileResponse = await apiCall('/api/users/me', 'GET', null, testData.vendorToken);
  testData.vendorProfileId = vendorProfileResponse.data.user.vendorProfile?.id;

  // 5. Product Management Tests
  await test('POST /api/vendor/products - Create product', async () => {
    const response = await apiCall('/api/vendor/products', 'POST', {
      name: 'Excavator XL-2000',
      description: 'Heavy duty excavator',
      productType: 'GOODS',
      isRentable: true,
      quantityOnHand: 5,
      pricing: testData.rentalPeriodId ? [{
        rentalPeriodId: testData.rentalPeriodId,
        price: 500.00,
      }] : [],
    }, testData.vendorToken);

    expect(response.status).toBe(200);
    testData.productId = response.data.product.id;
  });

  await test('GET /api/products - List products', async () => {
    const response = await apiCall('/api/products', 'GET');
    expect(response.status).toBe(200);
  });

  await test('GET /api/products/[id] - Get product details', async () => {
    const response = await apiCall(`/api/products/${testData.productId}`, 'GET');
    expect(response.status).toBe(200);
  });

  await test('PUT /api/vendor/products/[id] - Update product', async () => {
    const response = await apiCall(`/api/vendor/products/${testData.productId}`, 'PUT', {
      name: 'Excavator XL-2000 Updated',
      quantityOnHand: 10,
    }, testData.vendorToken);
    expect(response.status).toBe(200);
  });

  await test('PATCH /api/admin/products/[id]/publish - Publish product', async () => {
    const response = await apiCall(`/api/admin/products/${testData.productId}/publish`, 'PATCH', {
      published: true,
    }, testData.adminToken);
    expect(response.status).toBe(200);
  });

  console.log('\n' + '='.repeat(60));
  console.log('COUPON TESTS');
  console.log('='.repeat(60));

  // 6. Coupon Tests
  const couponCode = `SAVE20-${Date.now()}`;
  
  await test('POST /api/admin/coupons - Create coupon', async () => {
    const response = await apiCall('/api/admin/coupons', 'POST', {
      code: couponCode,
      discountType: 'PERCENTAGE',
      value: 20,
      validFrom: new Date().toISOString(),
      validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      maxUses: 100,
    }, testData.adminToken);
    expect(response.status).toBe(200);
  });

  await test('GET /api/admin/coupons - List coupons', async () => {
    const response = await apiCall('/api/admin/coupons', 'GET', null, testData.adminToken);
    expect(response.status).toBe(200);
  });

  await test('POST /api/coupons/validate - Validate coupon', async () => {
    const response = await apiCall('/api/coupons/validate', 'POST', {
      code: couponCode,
      orderAmount: 1000,
    });
    expect(response.status).toBe(200);
  });

  console.log('\n' + '='.repeat(60));
  console.log('ORDER MANAGEMENT TESTS');
  console.log('='.repeat(60));

  // 7. Order Management Tests
  await test('POST /api/orders - Create order', async () => {
    const startDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const response = await apiCall('/api/orders', 'POST', {
      vendorId: testData.vendorProfileId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      lines: [{
        productId: testData.productId,
        quantity: 2,
      }],
    }, testData.customerToken);

    expect(response.status).toBe(200);
    testData.orderId = response.data.order.id;
  });

  await test('GET /api/orders - List orders', async () => {
    const response = await apiCall('/api/orders', 'GET', null, testData.customerToken);
    expect(response.status).toBe(200);
  });

  await test('GET /api/orders/[id] - Get order details', async () => {
    const response = await apiCall(`/api/orders/${testData.orderId}`, 'GET', null, testData.customerToken);
    expect(response.status).toBe(200);
  });

  await test('POST /api/orders/[id]/send - Send order', async () => {
    const response = await apiCall(`/api/orders/${testData.orderId}/send`, 'POST', {}, testData.vendorToken);
    expect(response.status).toBe(200);
  });

  await test('POST /api/orders/[id]/confirm - Confirm order', async () => {
    const response = await apiCall(`/api/orders/${testData.orderId}/confirm`, 'POST', {}, testData.vendorToken);
    expect(response.status).toBe(200);
  });

  await test('POST /api/orders/[id]/pickup - Pickup order', async () => {
    const response = await apiCall(`/api/orders/${testData.orderId}/pickup`, 'POST', {}, testData.vendorToken);
    expect(response.status).toBe(200);
  });

  await test('POST /api/orders/[id]/return - Return order', async () => {
    const response = await apiCall(`/api/orders/${testData.orderId}/return`, 'POST', {
      returnDate: new Date().toISOString(),
    }, testData.vendorToken);
    expect(response.status).toBe(200);
  });

  console.log('\n' + '='.repeat(60));
  console.log('INVOICE & PAYMENT TESTS');
  console.log('='.repeat(60));

  // Create new order for invoice testing
  const startDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  const newOrderResponse = await apiCall('/api/orders', 'POST', {
    vendorId: testData.vendorProfileId,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    lines: [{ productId: testData.productId, quantity: 1 }],
  }, testData.customerToken);

  const newOrderId = newOrderResponse.data.order.id;
  await apiCall(`/api/orders/${newOrderId}/send`, 'POST', {}, testData.vendorToken);
  await apiCall(`/api/orders/${newOrderId}/confirm`, 'POST', {}, testData.vendorToken);

  // 8. Invoice Tests
  await test('POST /api/invoices/from-order/[orderId] - Create invoice', async () => {
    const response = await apiCall(`/api/invoices/from-order/${newOrderId}`, 'POST', {}, testData.vendorToken);
    expect(response.status).toBe(200);
    testData.invoiceId = response.data.invoice.id;
  });

  await test('POST /api/invoices/[id]/post - Post invoice', async () => {
    const response = await apiCall(`/api/invoices/${testData.invoiceId}/post`, 'POST', {}, testData.vendorToken);
    expect(response.status).toBe(200);
  });

  // 9. Payment Tests
  await test('POST /api/payments/initiate - Initiate payment', async () => {
    const response = await apiCall('/api/payments/initiate', 'POST', {
      invoiceId: testData.invoiceId,
      amount: 500,
      method: 'CARD',
    }, testData.customerToken);
    expect(response.status).toBe(200);
    testData.paymentId = response.data.payment.id;
  });

  await test('POST /api/payments/confirm - Confirm payment', async () => {
    const response = await apiCall('/api/payments/confirm', 'POST', {
      paymentId: testData.paymentId,
      transactionRef: 'TXN-TEST-123',
    }, testData.customerToken);
    expect(response.status).toBe(200);
  });

  console.log('\n' + '='.repeat(60));
  console.log('FUTURE FEATURE TESTS (STUBS)');
  console.log('='.repeat(60));

  // 10. Future Feature Tests
  await test('GET /api/reports/admin - Admin reports (501)', async () => {
    const response = await apiCall('/api/reports/admin', 'GET', null, testData.adminToken);
    expect(response.status).toBe(501);
  });

  await test('GET /api/reports/vendor - Vendor reports (501)', async () => {
    const response = await apiCall('/api/reports/vendor', 'GET', null, testData.vendorToken);
    expect(response.status).toBe(501);
  });

  await test('GET /api/notifications - Notifications (501)', async () => {
    const response = await apiCall('/api/notifications', 'GET');
    expect(response.status).toBe(501);
  });

  console.log('\n' + '='.repeat(60));
  console.log('DATABASE TEST');
  console.log('='.repeat(60));

  // 11. Database Test
  await test('GET /api/test - Database connection', async () => {
    const response = await apiCall('/api/test', 'GET');
    expect(response.status).toBe(200);
  });

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(2)}%`);
  console.log('='.repeat(60));

  if (results.failed > 0) {
    console.log('\nFailed Tests:');
    results.tests
      .filter(t => t.status === 'FAIL')
      .forEach(t => console.log(`  - ${t.name}: ${t.error}`));
  }

  console.log('\n✨ Test suite completed!\n');
}

// Run the tests
runTests().catch(console.error);
