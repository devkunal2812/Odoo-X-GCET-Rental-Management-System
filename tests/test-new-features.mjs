/**
 * Test script for new features
 * Run with: node tests/test-new-features.mjs
 */

const BASE_URL = "http://localhost:3000/api";

// Helper function to make requests
async function request(method, path, body = null, token = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (token) {
    options.headers["Cookie"] = `auth_token=${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${path}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 500, error: error.message };
  }
}

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: [],
};

function logTest(name, passed, message) {
  results.tests.push({ name, passed, message });
  if (passed) {
    results.passed++;
    console.log(`✅ ${name}`);
  } else {
    results.failed++;
    console.log(`❌ ${name}: ${message}`);
  }
}

// Run tests
async function runTests() {
  console.log("🚀 Testing New Features...\n");

  // Test 1: Vendor Signup (should succeed)
  console.log("1️⃣ Testing Vendor Signup...");
  const vendorSignup = await request("POST", "/auth/signup", {
    firstName: "Test",
    lastName: "Vendor",
    email: `vendor${Date.now()}@test.com`,
    password: "password123",
    companyName: "Test Company",
    role: "VENDOR",
  });
  logTest(
    "Vendor Signup",
    vendorSignup.status === 200 && vendorSignup.data.success,
    vendorSignup.data.error || "Success"
  );

  // Test 2: Customer Signup (should succeed)
  console.log("\n2️⃣ Testing Customer Signup...");
  const customerSignup = await request("POST", "/auth/signup", {
    firstName: "Test",
    lastName: "Customer",
    email: `customer${Date.now()}@test.com`,
    password: "password123",
    role: "CUSTOMER",
  });
  logTest(
    "Customer Signup",
    customerSignup.status === 200 && customerSignup.data.success,
    customerSignup.data.error || "Success"
  );

  // Test 3: Customer with Company Name (should fail)
  console.log("\n3️⃣ Testing Customer Signup with Company Name (should fail)...");
  const invalidCustomer = await request("POST", "/auth/signup", {
    firstName: "Test",
    lastName: "Customer",
    email: `invalid${Date.now()}@test.com`,
    password: "password123",
    companyName: "Should Fail",
    role: "CUSTOMER",
  });
  logTest(
    "Customer Signup Validation",
    invalidCustomer.status === 400,
    "Should reject customer with company name"
  );

  // Test 4: Email Verification
  console.log("\n4️⃣ Testing Email Verification...");
  if (vendorSignup.data.verificationToken) {
    const verification = await request("POST", "/auth/verify-email", {
      token: vendorSignup.data.verificationToken,
    });
    logTest(
      "Email Verification",
      verification.status === 200 && verification.data.success,
      verification.data.error || "Success"
    );
  } else {
    logTest("Email Verification", false, "No verification token received");
  }

  // Test 5: Login without verification (should fail)
  console.log("\n5️⃣ Testing Login without Email Verification (should fail)...");
  const unverifiedLogin = await request("POST", "/auth/login", {
    email: customerSignup.data.user.email,
    password: "password123",
  });
  logTest(
    "Login Verification Check",
    unverifiedLogin.status === 403,
    "Should block unverified users"
  );

  // Test 6: Forgot Password
  console.log("\n6️⃣ Testing Forgot Password...");
  const forgotPassword = await request("POST", "/auth/forgot-password", {
    email: vendorSignup.data.user.email,
  });
  logTest(
    "Forgot Password",
    forgotPassword.status === 200 && forgotPassword.data.success,
    forgotPassword.data.error || "Success"
  );

  // Test 7: Reset Password
  console.log("\n7️⃣ Testing Reset Password...");
  if (forgotPassword.data.resetToken) {
    const resetPassword = await request("POST", "/auth/reset-password", {
      token: forgotPassword.data.resetToken,
      newPassword: "newpassword123",
    });
    logTest(
      "Reset Password",
      resetPassword.status === 200 && resetPassword.data.success,
      resetPassword.data.error || "Success"
    );
  } else {
    logTest("Reset Password", false, "No reset token received");
  }

  // Print summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 Test Summary");
  console.log("=".repeat(50));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📝 Total: ${results.tests.length}`);
  console.log("=".repeat(50));

  if (results.failed === 0) {
    console.log("\n🎉 All tests passed!");
  } else {
    console.log("\n⚠️  Some tests failed. Check the output above.");
  }
}

// Run the tests
runTests().catch(console.error);
