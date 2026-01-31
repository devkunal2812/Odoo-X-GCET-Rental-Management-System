/**
 * Test Settings Workflow
 * 
 * This script tests the admin settings API endpoints
 */

const BASE_URL = 'http://localhost:3000';

// Test credentials
const ADMIN_EMAIL = 'admin123@gmail.com';
const ADMIN_PASSWORD = 'admin123';

let authToken = '';

/**
 * Helper function to make API requests
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers['Cookie'] = authToken;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    const data = await response.json();
    
    // Store auth token from Set-Cookie header
    if (response.headers.get('set-cookie')) {
      authToken = response.headers.get('set-cookie');
    }

    return {
      status: response.status,
      ok: response.ok,
      data,
    };
  } catch (error) {
    console.error(`Request failed: ${error.message}`);
    return {
      status: 0,
      ok: false,
      error: error.message,
    };
  }
}

/**
 * Test 1: Admin Login
 */
async function testAdminLogin() {
  console.log('\n📝 Test 1: Admin Login');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const response = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  });

  if (response.ok && response.data.success) {
    console.log('✅ Admin login successful');
    console.log(`   User: ${response.data.user.email}`);
    console.log(`   Role: ${response.data.user.role}`);
    return true;
  } else {
    console.log('❌ Admin login failed');
    console.log(`   Error: ${response.data.error || 'Unknown error'}`);
    return false;
  }
}

/**
 * Test 2: Get Settings
 */
async function testGetSettings() {
  console.log('\n📝 Test 2: Get Settings');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const response = await apiRequest('/api/admin/settings', {
    method: 'GET',
  });

  if (response.ok && response.data.success) {
    console.log('✅ Settings retrieved successfully');
    console.log(`   Total settings: ${Object.keys(response.data.settings).length}`);
    console.log(`   Rental periods: ${response.data.rentalPeriods.length}`);
    
    // Show sample settings
    console.log('\n   Sample settings:');
    const sampleKeys = ['site_name', 'company_name', 'platform_fee', 'gst_percentage'];
    sampleKeys.forEach(key => {
      if (response.data.settings[key]) {
        console.log(`   - ${key}: ${response.data.settings[key].value}`);
      }
    });
    
    // Show rental periods
    console.log('\n   Rental periods:');
    response.data.rentalPeriods.forEach(period => {
      console.log(`   - ${period.name}: ${period.duration} ${period.unit}(s)`);
    });
    
    return response.data;
  } else {
    console.log('❌ Failed to get settings');
    console.log(`   Error: ${response.data.error || 'Unknown error'}`);
    return null;
  }
}

/**
 * Test 3: Update Settings
 */
async function testUpdateSettings(currentSettings) {
  console.log('\n📝 Test 3: Update Settings');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const updatedSettings = {
    site_name: 'Test Rental Platform',
    platform_fee: '7.5',
    gst_percentage: '18',
    company_name: 'Test Company Ltd',
  };

  const response = await apiRequest('/api/admin/settings', {
    method: 'PUT',
    body: JSON.stringify({
      settings: updatedSettings,
      rentalPeriods: currentSettings.rentalPeriods,
    }),
  });

  if (response.ok && response.data.success) {
    console.log('✅ Settings updated successfully');
    console.log(`   Updated settings: ${response.data.updatedSettings.length}`);
    console.log(`   Message: ${response.data.message}`);
    return true;
  } else {
    console.log('❌ Failed to update settings');
    console.log(`   Error: ${response.data.error || 'Unknown error'}`);
    return false;
  }
}

/**
 * Test 4: Verify Settings Update
 */
async function testVerifyUpdate() {
  console.log('\n📝 Test 4: Verify Settings Update');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const response = await apiRequest('/api/admin/settings', {
    method: 'GET',
  });

  if (response.ok && response.data.success) {
    const siteName = response.data.settings.site_name?.value;
    const platformFee = response.data.settings.platform_fee?.value;
    const companyName = response.data.settings.company_name?.value;
    
    console.log('✅ Settings retrieved after update');
    console.log(`   Site Name: ${siteName}`);
    console.log(`   Platform Fee: ${platformFee}%`);
    console.log(`   Company Name: ${companyName}`);
    
    // Verify the updates
    if (siteName === 'Test Rental Platform' && platformFee === '7.5') {
      console.log('\n✅ Settings update verified successfully!');
      return true;
    } else {
      console.log('\n⚠️  Settings may not have been updated correctly');
      return false;
    }
  } else {
    console.log('❌ Failed to verify settings');
    return false;
  }
}

/**
 * Test 5: Add Rental Period
 */
async function testAddRentalPeriod(currentSettings) {
  console.log('\n📝 Test 5: Add Rental Period');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const newRentalPeriods = [
    ...currentSettings.rentalPeriods,
    {
      name: 'Bi-Weekly',
      unit: 'week',
      duration: 2,
    },
  ];

  const response = await apiRequest('/api/admin/settings', {
    method: 'PUT',
    body: JSON.stringify({
      settings: {},
      rentalPeriods: newRentalPeriods,
    }),
  });

  if (response.ok && response.data.success) {
    console.log('✅ Rental period added successfully');
    console.log(`   Updated rental periods: ${response.data.updatedRentalPeriods.length}`);
    return true;
  } else {
    console.log('❌ Failed to add rental period');
    console.log(`   Error: ${response.data.error || 'Unknown error'}`);
    return false;
  }
}

/**
 * Test 6: Restore Original Settings
 */
async function testRestoreSettings() {
  console.log('\n📝 Test 6: Restore Original Settings');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const originalSettings = {
    site_name: 'RentMarket Platform',
    platform_fee: '5',
    company_name: 'RentMarket Platform',
  };

  const response = await apiRequest('/api/admin/settings', {
    method: 'PUT',
    body: JSON.stringify({
      settings: originalSettings,
    }),
  });

  if (response.ok && response.data.success) {
    console.log('✅ Original settings restored');
    return true;
  } else {
    console.log('❌ Failed to restore settings');
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('\n🧪 Starting Settings Workflow Tests');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Admin: ${ADMIN_EMAIL}`);
  
  let passedTests = 0;
  let totalTests = 6;

  // Test 1: Login
  if (await testAdminLogin()) passedTests++;
  else {
    console.log('\n❌ Cannot proceed without admin login');
    return;
  }

  // Test 2: Get Settings
  const currentSettings = await testGetSettings();
  if (currentSettings) passedTests++;
  else {
    console.log('\n❌ Cannot proceed without getting settings');
    return;
  }

  // Test 3: Update Settings
  if (await testUpdateSettings(currentSettings)) passedTests++;

  // Test 4: Verify Update
  if (await testVerifyUpdate()) passedTests++;

  // Test 5: Add Rental Period
  if (await testAddRentalPeriod(currentSettings)) passedTests++;

  // Test 6: Restore Settings
  if (await testRestoreSettings()) passedTests++;

  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Test Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n✅ All tests passed! Settings workflow is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Test execution failed:', error);
  process.exit(1);
});
