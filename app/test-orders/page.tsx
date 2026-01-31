"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";

export default function TestOrdersPage() {
  const [testResult, setTestResult] = useState<string>("");
  const [dbStatus, setDbStatus] = useState<string>("");

  const testDatabaseConnection = async () => {
    try {
      setDbStatus("Testing database connection...");
      
      // Test orders
      const ordersResponse = await fetch('/api/orders/user');
      const ordersResult = await ordersResponse.json();
      
      // Test invoices
      const invoicesResponse = await fetch('/api/invoices/user');
      const invoicesResult = await invoicesResponse.json();
      
      if (ordersResult.success && invoicesResult.success) {
        setDbStatus(`✅ Database connected! 
        
Orders: ${ordersResult.orders.length} found (source: ${ordersResult.source})
Invoices: ${invoicesResult.invoices.length} found (source: ${invoicesResult.source})

Both orders and invoices are being stored in the database!`);
      } else {
        setDbStatus(`⚠️ Database response: 
Orders: ${ordersResult.message || 'Unknown error'}
Invoices: ${invoicesResult.message || 'Unknown error'}`);
      }
    } catch (error) {
      setDbStatus(`❌ Database connection failed: ${error}`);
    }
  };

  const createTestOrder = () => {
    try {
      // Simulate successful Razorpay test payment
      const testPaymentId = `pay_test_${Date.now()}`;
      const testOrderId = `order_test_${Date.now()}`;
      
      // Create a test order (simulating what happens after successful payment)
      const testOrder = {
        id: `ORD-TEST-${Date.now()}`,
        product: {
          name: "Test Camera Kit",
          image: "/api/placeholder/100/100",
          description: "Test rental item for order system"
        },
        vendor: {
          name: "Test Vendor",
          phone: "+1 (555) 123-4567",
          email: "test@vendor.com"
        },
        amount: 299,
        status: "confirmed",
        orderDate: new Date().toISOString().split('T')[0],
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        duration: 3,
        unit: "days",
        pickupLocation: "Test Store - 123 Test St",
        pickupTime: "10:00 AM",
        returnLocation: "Test Store - 123 Test St",
        returnTime: "5:00 PM",
        paymentStatus: "paid", // ✅ PAID after successful test payment
        paymentId: testPaymentId,
        razorpayOrderId: testOrderId,
        paymentMethod: "Razorpay (Test Mode)",
        paymentVerified: true, // ✅ VERIFIED
        paymentTimestamp: new Date().toISOString(),
        deliveryMethod: "Standard Delivery",
        deliveryAddress: {
          name: "Test Customer",
          street: "123 Test Street",
          city: "Test City",
          state: "Test State",
          zip: "12345",
          country: "India",
          phone: "+91 98765 43210",
          email: "test@customer.com"
        },
        items: [
          {
            id: "item_1",
            name: "Test Camera Kit",
            vendor: "Test Vendor",
            quantity: 1,
            rentalDuration: 3,
            rentalUnit: "days",
            unitPrice: 299,
            totalPrice: 299
          }
        ],
        notes: `✅ Test order created after simulated successful Razorpay payment. Payment ID: ${testPaymentId}`
      };

      // Save to localStorage
      const existingOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
      existingOrders.unshift(testOrder);
      localStorage.setItem('userOrders', JSON.stringify(existingOrders));

      setTestResult(`✅ Test order created successfully! 
      
Order ID: ${testOrder.id}
Payment Status: ${testOrder.paymentStatus} ✅
Payment Verified: ${testOrder.paymentVerified ? 'Yes' : 'No'} ✅
Payment ID: ${testOrder.paymentId}
Razorpay Order ID: ${testOrder.razorpayOrderId}

This simulates what happens after a successful Razorpay test payment.`);
    } catch (error) {
      setTestResult(`❌ Error creating test order: ${error}`);
    }
  };

  const clearAllOrders = () => {
    try {
      localStorage.removeItem('userOrders');
      setTestResult("🗑️ All orders cleared from localStorage");
    } catch (error) {
      setTestResult(`❌ Error clearing orders: ${error}`);
    }
  };

  const viewStoredOrders = () => {
    try {
      const orders = JSON.parse(localStorage.getItem('userOrders') || '[]');
      setTestResult(`📋 Found ${orders.length} orders in storage:\n${JSON.stringify(orders, null, 2)}`);
    } catch (error) {
      setTestResult(`❌ Error reading orders: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <h1 className="text-3xl font-bold mb-8 text-secondary-900">Order System Test</h1>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-secondary-900">Razorpay Test Payment Flow</h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-800 mb-2">🗄️ Database Storage Now Enabled!</h3>
            <div className="text-sm text-blue-700 space-y-2">
              <p><strong>✅ Orders are now saved to the database using Prisma</strong></p>
              <p><strong>✅ Invoices are automatically created in the database</strong></p>
              <p>• Customer profiles created automatically from delivery info</p>
              <p>• Vendor profiles created for each vendor</p>
              <p>• Products created dynamically for order items</p>
              <p>• Invoice records with invoice lines stored in database</p>
              <p>• Full order and invoice history in PostgreSQL/SQLite database</p>
              <p>• Fallback to localStorage if database fails</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-800 mb-2">How Test Payments Work:</h3>
            <div className="text-sm text-blue-700 space-y-2">
              <p>1. <strong>Add items to cart</strong> from the products page</p>
              <p>2. <strong>Go to checkout</strong> and fill delivery information</p>
              <p>3. <strong>Click "Pay with Razorpay"</strong> - this opens Razorpay test interface</p>
              <p>4. <strong>Use test payment methods:</strong></p>
              <ul className="ml-4 space-y-1">
                <li>• Test Card: 4111 1111 1111 1111, CVV: 123, Expiry: Any future date</li>
                <li>• Test UPI: success@razorpay (for successful payment)</li>
                <li>• Test Netbanking: Select any bank and use "success" as password</li>
              </ul>
              <p>5. <strong>After successful payment:</strong> Order is automatically created with paymentStatus: "paid"</p>
              <p>6. <strong>View your order</strong> in the Orders page with payment verification details</p>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">✅ What Happens After Successful Test Payment:</h3>
            <div className="text-sm text-green-700 space-y-1">
              <p>• Order status: "confirmed"</p>
              <p>• Payment status: "paid" ✅</p>
              <p>• Payment verified: true ✅</p>
              <p>• Real Razorpay payment ID and order ID stored</p>
              <p>• Order appears in "My Orders" with payment verification badge</p>
              <p>• Invoice can be generated with real payment details</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-secondary-900">Test Order Management</h2>
          
          <div className="space-y-4">
            <button
              onClick={testDatabaseConnection}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Test Database Connection
            </button>

            <button
              onClick={createTestOrder}
              className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Create Test Order
            </button>

            <button
              onClick={viewStoredOrders}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Stored Orders
            </button>

            <button
              onClick={clearAllOrders}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear All Orders
            </button>

            <Link
              href="/invoices"
              className="block w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-center"
            >
              View Invoices Page
            </Link>

            <Link
              href="/orders"
              className="block w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center"
            >
              View Orders Page
            </Link>
          </div>

          {dbStatus && (
            <div className="mt-6 p-4 bg-secondary-50 rounded-lg">
              <h3 className="font-semibold mb-2 text-secondary-900">Database Status:</h3>
              <pre className="text-sm text-secondary-700 whitespace-pre-wrap">{dbStatus}</pre>
            </div>
          )}

          {testResult && (
            <div className="mt-6 p-4 bg-secondary-50 rounded-lg">
              <h3 className="font-semibold mb-2 text-secondary-900">Test Result:</h3>
              <pre className="text-sm text-secondary-700 whitespace-pre-wrap">{testResult}</pre>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-secondary-900">Order System Features</h2>
          
          <div className="space-y-3 text-secondary-700">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              Order creation after successful payment
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              Database storage using Prisma + PostgreSQL/SQLite
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              Invoice database storage with invoice lines
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              Automatic customer/vendor profile creation
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              Real-time order display from database
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              Invoice generation with real order data
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              Order statistics and status tracking
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              Real invoice generation from orders
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              Invoice display with payment verification
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              Integration with Razorpay payment system
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              localStorage fallback if database fails
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}