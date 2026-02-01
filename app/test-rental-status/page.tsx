"use client";

import React, { useState, useEffect } from "react";
import Header from "../../components/Header";

export default function TestRentalStatusPage() {
  const [productId, setProductId] = useState("");
  const [rentalStatus, setRentalStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);

  // Fetch some products for testing
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?published=false');
        const data = await response.json();
        if (data.success) {
          setProducts(data.products.slice(0, 5)); // Get first 5 products
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };
    
    fetchProducts();
  }, []);

  const checkRentalStatus = async () => {
    if (!productId.trim()) {
      setError("Please enter a product ID");
      return;
    }

    setLoading(true);
    setError(null);
    setRentalStatus(null);

    try {
      const response = await fetch(`/api/products/${productId}/rental-status`);
      const data = await response.json();

      if (response.ok) {
        setRentalStatus(data);
      } else {
        setError(data.error || "Failed to check rental status");
      }
    } catch (error) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const testWithProduct = (id: string) => {
    setProductId(id);
    setError(null);
    setRentalStatus(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header currentPage="test" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-8 text-gray-900">Rental Status API Test</h1>

          {/* Available Products */}
          {products.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Available Products for Testing</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-600">ID: {product.id}</p>
                        <p className="text-sm text-gray-600">
                          Stock: {product.inventory?.quantityOnHand || 0}
                        </p>
                      </div>
                      <button
                        onClick={() => testWithProduct(product.id)}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                      >
                        Test
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Manual Input */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Manual Product ID Test</h2>
            <div className="flex gap-4">
              <input
                type="text"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="Enter product ID"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={checkRentalStatus}
                disabled={loading}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Checking..." : "Check Status"}
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Results Display */}
          {rentalStatus && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Rental Status Results</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Product ID:</strong> {rentalStatus.productId}
                  </div>
                  <div>
                    <strong>Currently Rented:</strong>{" "}
                    <span className={rentalStatus.isCurrentlyRented ? "text-red-600" : "text-green-600"}>
                      {rentalStatus.isCurrentlyRented ? "Yes" : "No"}
                    </span>
                  </div>
                </div>

                {rentalStatus.isCurrentlyRented && rentalStatus.rentalDetails && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-bold text-red-800 mb-2">Current Rental Details</h3>
                    <div className="space-y-1 text-sm">
                      <div><strong>Order:</strong> {rentalStatus.rentalDetails.orderNumber}</div>
                      <div><strong>Customer:</strong> {rentalStatus.rentalDetails.customerName}</div>
                      <div><strong>Status:</strong> {rentalStatus.rentalDetails.status}</div>
                      <div><strong>Start:</strong> {new Date(rentalStatus.rentalDetails.startDate).toLocaleDateString()}</div>
                      <div><strong>End:</strong> {new Date(rentalStatus.rentalDetails.endDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                )}

                {rentalStatus.upcomingRentals && rentalStatus.upcomingRentals.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-bold text-yellow-800 mb-2">Upcoming Rentals</h3>
                    <div className="space-y-2">
                      {rentalStatus.upcomingRentals.map((rental: any, index: number) => (
                        <div key={index} className="text-sm">
                          <div><strong>Order:</strong> {rental.orderNumber}</div>
                          <div><strong>Customer:</strong> {rental.customerName}</div>
                          <div><strong>Period:</strong> {new Date(rental.startDate).toLocaleDateString()} - {new Date(rental.endDate).toLocaleDateString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-600">
                  <strong>Total Quantity Rented:</strong> {rentalStatus.totalQuantityRented || 0}
                </div>

                {/* Raw JSON for debugging */}
                <details className="mt-4">
                  <summary className="cursor-pointer font-medium text-gray-700">Raw API Response</summary>
                  <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(rentalStatus, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}