"use client";

import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import RentalDurationModal from "../../components/RentalDurationModal";

export default function TestTimeAvailabilityPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?published=true&limit=5');
        const data = await response.json();
        if (data.success) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testAvailability = async (productId: string, startDate: string, endDate: string, quantity: number) => {
    try {
      const response = await fetch(`/api/products/${productId}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate,
          endDate,
          requestedQuantity: quantity
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        addTestResult(`Availability Check - Status: ${data.status}, Available: ${data.availableQuantity}/${data.totalQuantity}, Message: ${data.message}`);
      } else {
        addTestResult(`Availability Check Failed: ${data.error}`);
      }
    } catch (error) {
      addTestResult(`Availability Check Error: ${error}`);
    }
  };

  const handleRentalConfirm = (rentalData: {
    startDate: string;
    endDate: string;
    quantity: number;
  }) => {
    addTestResult(`Rental Confirmed - Product: ${selectedProduct?.name}, Quantity: ${rentalData.quantity}, Period: ${new Date(rentalData.startDate).toLocaleDateString()} to ${new Date(rentalData.endDate).toLocaleDateString()}`);
    setShowModal(false);
    setSelectedProduct(null);
  };

  const quickTest = async (productId: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 3);
    dayAfter.setHours(18, 0, 0, 0);

    await testAvailability(productId, tomorrow.toISOString(), dayAfter.toISOString(), 1);
  };

  const conflictTest = async (productId: string) => {
    // Test with dates that might conflict with existing bookings
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(9, 0, 0, 0);
    
    const weekAfter = new Date();
    weekAfter.setDate(weekAfter.getDate() + 14);
    weekAfter.setHours(18, 0, 0, 0);

    await testAvailability(productId, nextWeek.toISOString(), weekAfter.toISOString(), 5);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Header currentPage="test" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header currentPage="test" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-8 text-gray-900">Time-Based Availability Test</h1>

          {/* Available Products */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Available Products for Testing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((product) => (
                <div key={product.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-600">Stock: {product.inventory?.quantityOnHand || 0}</p>
                      <p className="text-sm text-gray-600">Price: ₹{product.pricing?.[0]?.price || 0}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowModal(true);
                      }}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      Open Modal
                    </button>
                    <button
                      onClick={() => quickTest(product.id)}
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                    >
                      Quick Test
                    </button>
                    <button
                      onClick={() => conflictTest(product.id)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                    >
                      Conflict Test
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Test Scenarios */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Test Scenarios</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-800 mb-2">✅ Full Availability</h3>
                <p className="text-sm text-green-700">
                  Request quantity ≤ available quantity for the selected time period.
                  Should allow normal checkout flow.
                </p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-800 mb-2">⚠️ Partial Availability</h3>
                <p className="text-sm text-yellow-700">
                  Request quantity > available quantity but some units are available.
                  Should offer to rent available quantity.
                </p>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-medium text-red-800 mb-2">❌ No Availability</h3>
                <p className="text-sm text-red-700">
                  No units available for the selected time period.
                  Should prevent add-to-cart and suggest alternatives.
                </p>
              </div>
            </div>
          </div>

          {/* Test Results */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Test Results</h2>
              <button
                onClick={() => setTestResults([])}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Clear Results
              </button>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-600">No test results yet. Try the buttons above!</p>
              ) : (
                <div className="space-y-1">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-sm font-mono bg-white p-2 rounded">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rental Duration Modal */}
      {selectedProduct && (
        <RentalDurationModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedProduct(null);
          }}
          onConfirm={handleRentalConfirm}
          product={{
            id: selectedProduct.id,
            name: selectedProduct.name,
            maxQuantity: selectedProduct.inventory?.quantityOnHand || 0
          }}
        />
      )}
    </div>
  );
}