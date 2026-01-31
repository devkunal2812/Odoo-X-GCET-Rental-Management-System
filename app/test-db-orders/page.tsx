"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "../../components/Header";

export default function TestDbOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testDatabaseConnection = async () => {
      try {
        console.log('🧪 Testing database connection...');
        
        // Test orders API
        const ordersResponse = await fetch('/api/orders/user');
        const ordersResult = await ordersResponse.json();
        
        console.log('📊 Orders API Response:', ordersResult);
        
        if (ordersResult.success) {
          setOrders(ordersResult.orders);
          console.log(`✅ Found ${ordersResult.orders.length} orders from ${ordersResult.source}`);
        }
        
        // Test invoices API
        const invoicesResponse = await fetch('/api/invoices/user');
        const invoicesResult = await invoicesResponse.json();
        
        console.log('📊 Invoices API Response:', invoicesResult);
        
        if (invoicesResult.success) {
          setInvoices(invoicesResult.invoices);
          console.log(`✅ Found ${invoicesResult.invoices.length} invoices from ${invoicesResult.source}`);
        }
        
        setLoading(false);
        
      } catch (err: any) {
        console.error('❌ Database test failed:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    testDatabaseConnection();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#D3DAD9]">
        <Header />
        <div className="pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#37353E] mx-auto mb-4"></div>
              <h1 className="text-2xl font-semibold text-[#37353E] mb-2">Testing Database Connection...</h1>
              <p className="text-[#715A5A]">Please wait while we check your stored orders and invoices.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D3DAD9]">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#37353E] mb-4">Database Test Results</h1>
            <p className="text-[#715A5A]">
              This page tests if your orders and invoices are properly stored in the database after successful Razorpay payments.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-red-800 font-semibold mb-2">❌ Database Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Orders Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-semibold text-[#37353E] mb-4">
              📦 Orders in Database ({orders.length})
            </h2>
            
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order, index) => (
                  <div key={order.id} className="border border-[#D3DAD9] rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-[#37353E]">{order.id}</h3>
                        <p className="text-[#715A5A]">{order.product.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#37353E]">₹{order.amount}</p>
                        <span className={`inline-block px-2 py-1 rounded text-sm ${
                          order.paymentStatus === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.paymentStatus === 'paid' ? '✅ PAID' : '⏳ PENDING'}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-[#715A5A] space-y-1">
                      <p><strong>Status:</strong> {order.status}</p>
                      <p><strong>Order Date:</strong> {order.orderDate}</p>
                      <p><strong>Vendor:</strong> {order.vendor.name}</p>
                      <p><strong>Payment Verified:</strong> {order.paymentVerified ? '✅ Yes' : '❌ No'}</p>
                      {order.paymentId && <p><strong>Payment ID:</strong> {order.paymentId}</p>}
                      <p><strong>Notes:</strong> {order.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[#715A5A] mb-4">No orders found in database.</p>
                <p className="text-sm text-[#715A5A]">
                  Complete a successful Razorpay payment to see orders here.
                </p>
              </div>
            )}
          </div>

          {/* Invoices Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-semibold text-[#37353E] mb-4">
              📄 Invoices in Database ({invoices.length})
            </h2>
            
            {invoices.length > 0 ? (
              <div className="space-y-4">
                {invoices.map((invoice, index) => (
                  <div key={invoice.id} className="border border-[#D3DAD9] rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-[#37353E]">{invoice.id}</h3>
                        <p className="text-[#715A5A]">{invoice.product}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#37353E]">₹{invoice.total.toFixed(2)}</p>
                        <span className={`inline-block px-2 py-1 rounded text-sm ${
                          invoice.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invoice.status === 'paid' ? '✅ PAID' : '⏳ PENDING'}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-[#715A5A] space-y-1">
                      <p><strong>Order ID:</strong> {invoice.orderId}</p>
                      <p><strong>Issue Date:</strong> {invoice.issueDate}</p>
                      <p><strong>Due Date:</strong> {invoice.dueDate}</p>
                      <p><strong>Vendor:</strong> {invoice.vendor}</p>
                      <p><strong>Amount:</strong> ₹{invoice.amount} + Tax: ₹{invoice.tax.toFixed(2)} + Fee: ₹{invoice.serviceFee.toFixed(2)}</p>
                      <p><strong>Payment Verified:</strong> {invoice.paymentVerified ? '✅ Yes' : '❌ No'}</p>
                      {invoice.paymentMethod && <p><strong>Payment Method:</strong> {invoice.paymentMethod}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[#715A5A] mb-4">No invoices found in database.</p>
                <p className="text-sm text-[#715A5A]">
                  Complete a successful Razorpay payment to see invoices here.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/products"
              className="px-6 py-3 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors"
            >
              🛒 Shop Products
            </Link>
            <Link
              href="/checkout"
              className="px-6 py-3 bg-[#715A5A] text-white rounded-lg hover:opacity-90 transition-colors"
            >
              💳 Test Checkout
            </Link>
            <Link
              href="/orders"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              📦 View My Orders
            </Link>
            <Link
              href="/invoices"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              📄 View Invoices
            </Link>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-blue-800 font-semibold mb-3">🧪 How to Test Complete Flow</h3>
            <ol className="text-blue-700 space-y-2 list-decimal list-inside">
              <li>Add items to cart from the Products page</li>
              <li>Go to Checkout and fill in delivery information</li>
              <li>Click "Pay with Razorpay" and complete test payment</li>
              <li>Use test card: <code className="bg-blue-100 px-1 rounded">4111 1111 1111 1111</code>, CVV: <code className="bg-blue-100 px-1 rounded">123</code></li>
              <li>After successful payment, refresh this page to see database records</li>
              <li>Check "My Orders" and "Invoices" pages to see the data</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}