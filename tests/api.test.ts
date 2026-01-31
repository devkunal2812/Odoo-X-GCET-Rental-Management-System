/**
 * Comprehensive API Test Suite
 * Tests every single API endpoint in the Rental Management System
 * 
 * Run with: npm test
 * Or manually test with: node tests/api-manual-test.mjs
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// Test data storage
let testData = {
  adminToken: '',
  vendorToken: '',
  customerToken: '',
  adminUser: null as any,
  vendorUser: null as any,
  customerUser: null as any,
  productId: '',
  orderId: '',
  invoiceId: '',
  paymentId: '',
  attributeId: '',
  rentalPeriodId: '',
};

// Helper function to make API calls
async function apiCall(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  token?: string
) {
  const headers: any = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Cookie'] = `auth_token=${token}`;
  }

  const options: any = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json();

  return {
    status: response.status,
    data,
    headers: response.headers,
  };
}

describe('Rental Management System - Complete API Test Suite', () => {
  
  // ============================================
  // 1. AUTHENTICATION TESTS
  // ============================================
  
  describe('Authentication APIs', () => {
    
    it('POST /api/auth/signup - Admin signup', async () => {
      const response = await apiCall('/api/auth/signup', 'POST', {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@test.com',
        password: 'admin123456',
        companyName: 'Admin Corp',
        role: 'ADMIN',
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.user.role).toBe('ADMIN');
      
      // Extract token from Set-Cookie header
      const setCookie = response.headers.get('set-cookie');
      if (setCookie) {
        const match = setCookie.match(/auth_token=([^;]+)/);
        if (match) testData.adminToken = match[1];
      }
      testData.adminUser = response.data.user;
    });

    it('POST /api/auth/signup - Vendor signup', async () => {
      const response = await apiCall('/api/auth/signup', 'POST', {
        firstName: 'Vendor',
        lastName: 'User',
        email: 'vendor@test.com',
        password: 'vendor123456',
        companyName: 'Vendor Corp',
        gstin: '29ABCDE1234F1Z5',
        role: 'VENDOR',
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.user.role).toBe('VENDOR');
      
      const setCookie = response.headers.get('set-cookie');
      if (setCookie) {
        const match = setCookie.match(/auth_token=([^;]+)/);
        if (match) testData.vendorToken = match[1];
      }
      testData.vendorUser = response.data.user;
    });

    it('POST /api/auth/signup - Customer signup', async () => {
      const response = await apiCall('/api/auth/signup', 'POST', {
        firstName: 'Customer',
        lastName: 'User',
        email: 'customer@test.com',
        password: 'customer123456',
        companyName: 'Customer Corp',
        role: 'CUSTOMER',
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.user.role).toBe('CUSTOMER');
      
      const setCookie = response.headers.get('set-cookie');
      if (setCookie) {
        const match = setCookie.match(/auth_token=([^;]+)/);
        if (match) testData.customerToken = match[1];
      }
      testData.customerUser = response.data.user;
    });

    it('POST /api/auth/signup - Duplicate email should fail', async () => {
      const response = await apiCall('/api/auth/signup', 'POST', {
        firstName: 'Duplicate',
        lastName: 'User',
        email: 'admin@test.com',
        password: 'password123',
        companyName: 'Test Corp',
        role: 'CUSTOMER',
      });

      expect(response.status).toBe(400);
      expect(response.data.error).toContain('already registered');
    });

    it('POST /api/auth/login - Valid credentials', async () => {
      const response = await apiCall('/api/auth/login', 'POST', {
        email: 'admin@test.com',
        password: 'admin123456',
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.user.email).toBe('admin@test.com');
    });

    it('POST /api/auth/login - Invalid credentials', async () => {
      const response = await apiCall('/api/auth/login', 'POST', {
        email: 'admin@test.com',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.data.error).toContain('Invalid credentials');
    });

    it('POST /api/auth/logout - Logout user', async () => {
      const response = await apiCall('/api/auth/logout', 'POST', {}, testData.adminToken);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });
  });

  // ============================================
  // 2. USER PROFILE TESTS
  // ============================================
  
  describe('User Profile APIs', () => {
    
    it('GET /api/users/me - Get current user profile', async () => {
      const response = await apiCall('/api/users/me', 'GET', undefined, testData.adminToken);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.user.email).toBe('admin@test.com');
    });

    it('GET /api/users/me - Unauthorized without token', async () => {
      const response = await apiCall('/api/users/me', 'GET');

      expect(response.status).toBe(401);
      expect(response.data.error).toContain('Unauthorized');
    });

    it('PUT /api/users/me - Update user profile', async () => {
      const response = await apiCall('/api/users/me', 'PUT', {
        firstName: 'Updated Admin',
        lastName: 'Updated User',
      }, testData.adminToken);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.user.firstName).toBe('Updated Admin');
    });

    it('GET /api/admin/users - List all users (Admin only)', async () => {
      const response = await apiCall('/api/admin/users', 'GET', undefined, testData.adminToken);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.users)).toBe(true);
      expect(response.data.users.length).toBeGreaterThan(0);
    });

    it('GET /api/admin/users - Forbidden for non-admin', async () => {
      const response = await apiCall('/api/admin/users', 'GET', undefined, testData.customerToken);

      expect(response.status).toBe(403);
      expect(response.data.error).toContain('Forbidden');
    });

    it('GET /api/admin/users?role=VENDOR - Filter by role', async () => {
      const response = await apiCall('/api/admin/users?role=VENDOR', 'GET', undefined, testData.adminToken);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.users.every((u: any) => u.role === 'VENDOR')).toBe(true);
    });
  });

  // ============================================
  // 3. ADMIN SETTINGS TESTS
  // ============================================
  
  describe('Admin Settings APIs', () => {
    
    it('GET /api/admin/settings - Get all settings', async () => {
      const response = await apiCall('/api/admin/settings', 'GET', undefined, testData.adminToken);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.settings).toBeDefined();
    });

    it('PUT /api/admin/settings - Update settings', async () => {
      const response = await apiCall('/api/admin/settings', 'PUT', {
        settings: {
          gst_percentage: '18',
          late_fee_rate: '0.1',
          company_name: 'Test Rentals Inc',
          company_gstin: '29ABCDE1234F1Z5',
        },
        rentalPeriods: [
          { name: 'Hourly', unit: 'hour', duration: 1 },
          { name: 'Daily', unit: 'day', duration: 1 },
          { name: 'Weekly', unit: 'week', duration: 1 },
        ],
      }, testData.adminToken);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.updatedSettings.length).toBeGreaterThan(0);
      
      // Store rental period ID for later tests
      if (response.data.updatedRentalPeriods.length > 0) {
        testData.rentalPeriodId = response.data.updatedRentalPeriods[0].id;
      }
    });

    it('GET /api/admin/settings - Verify updated settings', async () => {
      const response = await apiCall('/api/admin/settings', 'GET', undefined, testData.adminToken);

      expect(response.status).toBe(200);
      expect(response.data.settings.gst_percentage?.value).toBe('18');
      expect(response.data.settings.late_fee_rate?.value).toBe('0.1');
    });

    it('PUT /api/admin/settings - Forbidden for non-admin', async () => {
      const response = await apiCall('/api/admin/settings', 'PUT', {
        settings: { gst_percentage: '20' },
      }, testData.vendorToken);

      expect(response.status).toBe(403);
    });
  });

  // ============================================
  // 4. PRODUCT ATTRIBUTE TESTS
  // ============================================
  
  describe('Product Attribute APIs', () => {
    
    it('POST /api/admin/attributes - Create attribute', async () => {
      const response = await apiCall('/api/admin/attributes', 'POST', {
        name: 'Color',
        displayType: 'PILLS',
        values: ['Red', 'Blue', 'Green'],
      }, testData.adminToken);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.attribute.name).toBe('Color');
      expect(response.data.attribute.values.length).toBe(3);
      
      testData.attributeId = response.data.attribute.id;
    });

    it('POST /api/admin/attributes - Duplicate attribute should fail', async () => {
      const response = await apiCall('/api/admin/attributes', 'POST', {
        name: 'Color',
        displayType: 'RADIO',
      }, testData.adminToken);

      expect(response.status).toBe(400);
      expect(response.data.error).toContain('already exists');
    });

    it('GET /api/admin/attributes - List all attributes', async () => {
      const response = await apiCall('/api/admin/attributes', 'GET', undefined, testData.adminToken);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.attributes)).toBe(true);
      expect(response.data.attributes.length).toBeGreaterThan(0);
    });

    it('POST /api/admin/attributes/[id]/values - Add attribute values', async () => {
      const response = await apiCall(`/api/admin/attributes/${testData.attributeId}/values`, 'POST', {
        values: ['Yellow', 'Purple'],
      }, testData.adminToken);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.values.length).toBe(2);
    });

    it('GET /api/admin/attributes/[id]/values - Get attribute values', async () => {
      const response = await apiCall(`/api/admin/attributes/${testData.attributeId}/values`, 'GET', undefined, testData.adminToken);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.attribute.values.length).toBe(5); // 3 + 2 added
    });

    it('POST /api/admin/attributes - Forbidden for non-admin', async () => {
      const response = await apiCall('/api/admin/attributes', 'POST', {
        name: 'Size',
        displayType: 'RADIO',
      }, testData.vendorToken);

      expect(response.status).toBe(403);
    });
  });

  // ============================================
  // 5. PRODUCT MANAGEMENT TESTS
  // ============================================
  
  describe('Product Management APIs', () => {
    
    it('POST /api/vendor/products - Create product', async () => {
      const response = await apiCall('/api/vendor/products', 'POST', {
        name: 'Excavator XL-2000',
        description: 'Heavy duty excavator for construction',
        productType: 'GOODS',
        isRentable: true,
        quantityOnHand: 5,
        pricing: [
          {
            rentalPeriodId: testData.rentalPeriodId,
            price: 500.00,
          },
        ],
      }, testData.vendorToken);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.product.name).toBe('Excavator XL-2000');
      expect(response.data.product.published).toBe(false);
      
      testData.productId = response.data.product.id;
    });

    it('POST /api/vendor/products - Forbidden for customer', async () => {
      const response = await apiCall('/api/vendor/products', 'POST', {
        name: 'Test Product',
        quantityOnHand: 1,
        pricing: [],
      }, testData.customerToken);

      expect(response.status).toBe(403);
    });

    it('GET /api/products - List all products (unpublished hidden)', async () => {
      const response = await apiCall('/api/products', 'GET');

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.products)).toBe(true);
      // Should not include unpublished products
    });

    it('GET /api/products/[id] - Get product details', async () => {
      const response = await apiCall(`/api/products/${testData.productId}`, 'GET');

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.product.id).toBe(testData.productId);
    });

    it('PUT /api/vendor/products/[id] - Update product', async () => {
      const response = await apiCall(`/api/vendor/products/${testData.productId}`, 'PUT', {
        name: 'Excavator XL-2000 Updated',
        description: 'Updated description',
        quantityOnHand: 10,
      }, testData.vendorToken);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.product.name).toBe('Excavator XL-2000 Updated');
      expect(response.data.product.inventory.quantityOnHand).toBe(10);
    });

    it('PUT /api/vendor/products/[id] - Forbidden for other vendor', async () => {
      // Create another vendor first
      const signupResponse = await apiCall('/api/auth/signup', 'POST', {
        firstName: 'Other',
        lastName: 'Vendor',
        email: 'othervendor@test.com',
        password: 'password123',
        companyName: 'Other Vendor Corp',
        role: 'VENDOR',
      });

      const setCookie = signupResponse.headers.get('set-cookie');
      let otherVendorToken = '';
      if (setCookie) {
        const match = setCookie.match(/auth_token=([^;]+)/);
        if (match) otherVendorToken = match[1];
      }

      const response = await apiCall(`/api/vendor/products/${testData.productId}`, 'PUT', {
        name: 'Hacked Product',
      }, otherVendorToken);

      expect(response.status).toBe(403);
    });

    it('PATCH /api/admin/products/[id]/publish - Publish product', async () => {
      const response = await apiCall(`/api/admin/products/${testData.productId}/publish`, 'PATCH', {
        published: true,
      }, testData.adminToken);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.product.published).toBe(true);
    });

    it('GET /api/products - Published product now visible', async () => {
      const response = await apiCall('/api/products', 'GET');

      expect(response.status).toBe(200);
      const product = response.data.products.find((p: any) => p.id === testData.productId);
      expect(product).toBeDefined();
      expect(product.published).toBe(true);
    });
  });

  // ============================================
  // 6. COUPON TESTS
  // ============================================
  
  describe('Coupon APIs', () => {
    let couponCode = '';

    it('POST /api/admin/coupons - Create coupon', async () => {
      couponCode = `SAVE20-${Date.now()}`;
      const response = await apiCall('/api/admin/coupons', 'POST', {
        code: couponCode,
        discountType: 'PERCENTAGE',
        value: 20,
        validFrom: new Date().toISOString(),
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        maxUses: 100,
      }, testData.adminToken);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.coupon.code).toBe(couponCode);
    });

    it('GET /api/admin/coupons - List all coupons', async () => {
      const response = await apiCall('/api/admin/coupons', 'GET', undefined, testData.adminToken);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.coupons)).toBe(true);
    });

    it('POST /api/coupons/validate - Validate coupon', async () => {
      const response = await apiCall('/api/coupons/validate', 'POST', {
        code: couponCode,
        orderAmount: 1000,
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.discount).toBe(200); // 20% of 1000
      expect(response.data.finalAmount).toBe(800);
    });

    it('POST /api/coupons/validate - Invalid coupon', async () => {
      const response = await apiCall('/api/coupons/validate', 'POST', {
        code: 'INVALID_CODE',
        orderAmount: 1000,
      });

      expect(response.status).toBe(404);
      expect(response.data.error).toContain('Invalid or expired');
    });
  });

  // ============================================
  // 7. ORDER MANAGEMENT TESTS
  // ============================================
  
  describe('Order Management APIs', () => {
    
    it('POST /api/orders - Create order (QUOTATION)', async () => {
      const startDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

      const response = await apiCall('/api/orders', 'POST', {
        vendorId: testData.vendorUser.vendorProfile?.id || 'vendor-id',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        lines: [
          {
            productId: testData.productId,
            quantity: 2,
          },
        ],
      }, testData.customerToken);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.order.status).toBe('QUOTATION');
      
      testData.orderId = response.data.order.id;
    });

    it('GET /api/orders - List orders', async () => {
      const response = await apiCall('/api/orders', 'GET', undefined, testData.customerToken);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.orders)).toBe(true);
    });

    it('GET /api/orders/[id] - Get order details', async () => {
      const response = await apiCall(`/api/orders/${testData.orderId}`, 'GET', undefined, testData.customerToken);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.order.id).toBe(testData.orderId);
    });

    it('POST /api/orders/[id]/send - Send order', async () => {
      const response = await apiCall(`/api/orders/${testData.orderId}/send`, 'POST', {}, testData.vendorToken);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.order.status).toBe('SENT');
    });

    it('POST /api/orders/[id]/confirm - Confirm order', async () => {
      const response = await apiCall(`/api/orders/${testData.orderId}/confirm`, 'POST', {}, testData.vendorToken);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.order.status).toBe('CONFIRMED');
    });

    it('POST /api/orders/[id]/pickup - Pickup order', async () => {
      const response = await apiCall(`/api/orders/${testData.orderId}/pickup`, 'POST', {}, testData.vendorToken);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.order.status).toBe('PICKED_UP');
      expect(response.data.order.pickupDate).toBeDefined();
    });

    it('POST /api/orders/[id]/return - Return order (on time)', async () => {
      const response = await apiCall(`/api/orders/${testData.orderId}/return`, 'POST', {
        returnDate: new Date().toISOString(),
      }, testData.vendorToken);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.order.status).toBe('RETURNED');
      expect(response.data.lateFee).toBe(0); // On time, no late fee
    });
  });

  // ============================================
  // 8. INVOICE TESTS
  // ============================================
  
  describe('Invoice APIs', () => {
    let newOrderId = '';

    beforeAll(async () => {
      // Create a new order for invoice testing
      const startDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

      const orderResponse = await apiCall('/api/orders', 'POST', {
        vendorId: testData.vendorUser.vendorProfile?.id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        lines: [{ productId: testData.productId, quantity: 1 }],
      }, testData.customerToken);

      newOrderId = orderResponse.data.order.id;

      // Send and confirm the order
      await apiCall(`/api/orders/${newOrderId}/send`, 'POST', {}, testData.vendorToken);
      await apiCall(`/api/orders/${newOrderId}/confirm`, 'POST', {}, testData.vendorToken);
    });

    it('POST /api/invoices/from-order/[orderId] - Create invoice', async () => {
      const response = await apiCall(`/api/invoices/from-order/${newOrderId}`, 'POST', {}, testData.vendorToken);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.invoice.status).toBe('DRAFT');
      
      testData.invoiceId = response.data.invoice.id;
    });

    it('POST /api/invoices/[id]/post - Post invoice', async () => {
      const response = await apiCall(`/api/invoices/${testData.invoiceId}/post`, 'POST', {}, testData.vendorToken);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.invoice.status).toBe('POSTED');
    });
  });

  // ============================================
  // 9. PAYMENT TESTS
  // ============================================
  
  describe('Payment APIs', () => {
    
    it('POST /api/payments/initiate - Initiate payment', async () => {
      const response = await apiCall('/api/payments/initiate', 'POST', {
        invoiceId: testData.invoiceId,
        amount: 500,
        method: 'CARD',
      }, testData.customerToken);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.payment.status).toBe('PENDING');
      
      testData.paymentId = response.data.payment.id;
    });

    it('POST /api/payments/confirm - Confirm payment', async () => {
      const response = await apiCall('/api/payments/confirm', 'POST', {
        paymentId: testData.paymentId,
        transactionRef: 'TXN-TEST-123456',
      }, testData.customerToken);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.payment.status).toBe('COMPLETED');
    });
  });

  // ============================================
  // 10. REPORTS & NOTIFICATIONS (STUB) TESTS
  // ============================================
  
  describe('Future Feature APIs (Stubs)', () => {
    
    it('GET /api/reports/admin - Admin reports (501)', async () => {
      const response = await apiCall('/api/reports/admin', 'GET', undefined, testData.adminToken);

      expect(response.status).toBe(501);
      expect(response.data.error).toContain('not yet implemented');
      expect(response.data.plannedMetrics).toBeDefined();
    });

    it('GET /api/reports/vendor - Vendor reports (501)', async () => {
      const response = await apiCall('/api/reports/vendor', 'GET', undefined, testData.vendorToken);

      expect(response.status).toBe(501);
      expect(response.data.error).toContain('not yet implemented');
    });

    it('GET /api/notifications - Notifications (501)', async () => {
      const response = await apiCall('/api/notifications', 'GET');

      expect(response.status).toBe(501);
      expect(response.data.error).toContain('not yet implemented');
      expect(response.data.plannedFeatures).toBeDefined();
    });

    it('POST /api/notifications/send - Send notification (501)', async () => {
      const response = await apiCall('/api/notifications/send', 'POST', {
        message: 'Test notification',
      });

      expect(response.status).toBe(501);
    });
  });

  // ============================================
  // 11. DATABASE TEST
  // ============================================
  
  describe('Database Connection', () => {
    
    it('GET /api/test - Database connection test', async () => {
      const response = await apiCall('/api/test', 'GET');

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.stats).toBeDefined();
    });
  });
});
