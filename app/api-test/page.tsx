"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";

export default function ApiTestPage() {
  const [ordersResult, setOrdersResult] = useState<any>(null);
  const [invoicesResult, setInvoicesResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testOrdersAPI = async () => {
    setLoading(true);
    try {
      console.log('🔗 Testing Orders API...');
      const response = await fetch('/api/orders/user');
      const result = await response.json();
      
      console.log('📦 Orders API Result:', result);
      setOrdersResult(result);
    } catch (error) {
      console.error('❌ Orders API Error:', error);
      setOrdersResult({ error: error.message });
    }
    setLoading(false);
  };

  const testInvoicesAPI = async () => {
    setLoading(true);
    try {
      console.log('🔗 Testing Invoices API...');
      const response = await fetch('/api/invoices/user');
      const result = await response.json();
      
      console.log('📄 Invoices API Result:', result);
      setInvoicesResult(result);
    } catch (error) {
      console.error('❌ Invoices API Error:', error);
      setInvoicesResult({ error: error.message });
    }
    setLoading(false);
  };

  const testBothAPIs = async () => {
    await testOrdersAPI();
    await testInvoicesAPI();
  };

  return (
    <div className="min-h-screen bg-[#D3DAD9]">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#37353E] mb-4">API Testing</h1>
            <p className="text-[#715A5A]">
              Test the Orders and Invoices APIs to verify they're working correctly.
            </p>
          </div>

          {/* Test Buttons */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-[#37353E] mb-4">API Tests</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={testOrdersAPI}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Orders API'}
              </button>
              <button
                onClick={testInvoicesAPI}
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Invoices API'}
              </button>
              <button
                onClick={testBothAPIs}
                disabled={loading}
                className="px-6 py-3 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Both APIs'}
              </button>
            </div>
          </div>

          {/* Orders API Result */}
          {ordersResult && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold text-[#37353E] mb-4">📦 Orders API Result</h2>
              <div className="bg-gray-100 rounded-lg p-4 overflow-auto">
                <pre className="text-sm text-gray-800">
                  {JSON.stringify(ordersResult, null, 2)}
                </pre>
              </div>
              {ordersResult.success && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800">
                    ✅ Success: Found {ordersResult.orders?.length || 0} orders from {ordersResult.source}
                  </p>
                </div>
              )}
              {ordersResult.error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800">❌ Error: {ordersResult.error}</p>
                </div>
              )}
            </div>
          )}

          {/* Invoices API Result */}
          {invoicesResult && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold text-[#37353E] mb-4">📄 Invoices API Result</h2>
              <div className="bg-gray-100 rounded-lg p-4 overflow-auto">
                <pre className="text-sm text-gray-800">
                  {JSON.stringify(invoicesResult, null, 2)}
                </pre>
              </div>
              {invoicesResult.success && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800">
                    ✅ Success: Found {invoicesResult.invoices?.length || 0} invoices from {invoicesResult.source}
                  </p>
                </div>
              )}
              {invoicesResult.error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800">❌ Error: {invoicesResult.error}</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/orders"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              📦 My Orders
            </Link>
            <Link
              href="/invoices"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              📄 My Invoices
            </Link>
            <Link
              href="/test-db-orders"
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              🧪 Database Test
            </Link>
            <Link
              href="/products"
              className="px-6 py-3 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors"
            >
              🛒 Products
            </Link>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-blue-800 font-semibold mb-3">🧪 How to Use This Test</h3>
            <ol className="text-blue-700 space-y-2 list-decimal list-inside">
              <li>Click "Test Both APIs" to check if orders and invoices are loading correctly</li>
              <li>Check the JSON responses to see the actual data structure</li>
              <li>If APIs return data, go to My Orders and My Invoices to see the frontend display</li>
              <li>If no data is returned, make a test purchase first</li>
              <li>Compare API results with frontend display to identify issues</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}