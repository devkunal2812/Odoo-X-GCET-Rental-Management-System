"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";

export default function ClearStoragePage() {
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    // Clear all localStorage data related to orders and cart
    try {
      localStorage.removeItem('userOrders');
      localStorage.removeItem('cart');
      localStorage.removeItem('cartItems');
      
      // Clear any other rental-related data
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('order') || key.includes('invoice') || key.includes('rental'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      console.log('✅ Cleared localStorage data');
      setCleared(true);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#D3DAD9]">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              {cleared ? (
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-[#37353E] mb-4">
              {cleared ? "Storage Cleared!" : "Clearing Storage..."}
            </h1>
            
            <p className="text-[#715A5A] mb-6">
              {cleared 
                ? "All localStorage data has been cleared. Your browser storage is now clean."
                : "Please wait while we clear your browser storage..."
              }
            </p>

            {cleared && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="text-green-800 font-semibold mb-2">✅ Cleanup Complete</h3>
                <div className="text-green-700 text-sm space-y-1">
                  <p>• Database: All orders and invoices deleted</p>
                  <p>• localStorage: All order and cart data cleared</p>
                  <p>• Ready for fresh testing</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/products"
                  className="px-6 py-3 bg-[#37353E] text-white rounded-lg hover:bg-[#44444E] transition-colors"
                >
                  🛒 Start Shopping
                </Link>
                <Link
                  href="/test-db-orders"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🧪 Test Database
                </Link>
                <Link
                  href="/orders"
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  📦 My Orders (Empty)
                </Link>
                <Link
                  href="/invoices"
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  📄 Invoices (Empty)
                </Link>
              </div>
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
              <h3 className="text-blue-800 font-semibold mb-3">🧪 Fresh Testing Steps</h3>
              <ol className="text-blue-700 space-y-2 list-decimal list-inside">
                <li>Go to Products page and add items to cart</li>
                <li>Proceed to Checkout and fill delivery information</li>
                <li>Complete Razorpay test payment (Card: 4111 1111 1111 1111, CVV: 123)</li>
                <li>Verify order appears in My Orders as PAID</li>
                <li>Verify invoice appears in Invoices as PAID</li>
                <li>Check Test Database page to see database records</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}