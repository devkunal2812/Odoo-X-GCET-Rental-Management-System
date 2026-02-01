"use client";

import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import { 
  getCartItems, 
  addToCartWithStockCheck, 
  getProductQuantityInCart,
  canAddToCart,
  getMaxAddableQuantity,
  updateCartItemQuantityWithStockCheck,
  clearCart
} from "../../lib/cart";

export default function TestStockPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<string[]>([]);

  // Mock product data for testing
  const mockProduct = {
    id: "test-product-1",
    name: "Test Product",
    vendor: "Test Vendor",
    vendorId: "vendor-1",
    stock: 5 // Only 5 items in stock
  };

  useEffect(() => {
    const loadCartItems = () => {
      const items = getCartItems();
      setCartItems(items);
    };

    loadCartItems();
    
    const handleCartUpdate = () => loadCartItems();
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testAddToCart = (quantity: number) => {
    const cartItem = {
      productId: mockProduct.id,
      product: mockProduct,
      quantity: quantity,
      rentalDuration: 1,
      rentalUnit: 'day' as const,
      unitPrice: 100,
      selectedAttributes: {}
    };

    const result = addToCartWithStockCheck(cartItem, mockProduct.stock);
    addTestResult(`Add ${quantity} items: ${result.success ? 'SUCCESS' : 'FAILED'} - ${result.message}`);
  };

  const testUpdateQuantity = (newQuantity: number) => {
    const item = cartItems.find(item => item.productId === mockProduct.id);
    if (!item) {
      addTestResult(`Update quantity to ${newQuantity}: FAILED - Item not in cart`);
      return;
    }

    const result = updateCartItemQuantityWithStockCheck(item.id, newQuantity, mockProduct.stock);
    addTestResult(`Update quantity to ${newQuantity}: ${result.success ? 'SUCCESS' : 'FAILED'} - ${result.message}`);
  };

  const clearTestCart = () => {
    clearCart();
    setTestResults([]);
    addTestResult("Cart cleared");
  };

  const currentQuantityInCart = getProductQuantityInCart(mockProduct.id);
  const maxAddable = getMaxAddableQuantity(mockProduct.id, mockProduct.stock);
  const canAdd1 = canAddToCart(mockProduct.id, 1, mockProduct.stock);
  const canAdd3 = canAddToCart(mockProduct.id, 3, mockProduct.stock);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header currentPage="test" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-8 text-gray-900">Stock Management Test</h1>

          {/* Product Info */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 text-blue-900">Test Product Information</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Product:</strong> {mockProduct.name}</div>
              <div><strong>Total Stock:</strong> {mockProduct.stock} units</div>
              <div><strong>In Cart:</strong> {currentQuantityInCart} units</div>
              <div><strong>Max Addable:</strong> {maxAddable} units</div>
              <div><strong>Can Add 1:</strong> {canAdd1 ? 'Yes' : 'No'}</div>
              <div><strong>Can Add 3:</strong> {canAdd3 ? 'Yes' : 'No'}</div>
            </div>
          </div>

          {/* Current Cart */}
          <div className="bg-green-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 text-green-900">Current Cart</h2>
            {cartItems.length === 0 ? (
              <p className="text-green-700">Cart is empty</p>
            ) : (
              <div className="space-y-2">
                {cartItems.map((item, index) => (
                  <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded">
                    <span>{item.product.name} - Quantity: {item.quantity}</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => testUpdateQuantity(item.quantity + 1)}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => testUpdateQuantity(item.quantity - 1)}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                      >
                        -1
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Test Controls */}
          <div className="bg-yellow-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 text-yellow-900">Test Controls</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => testAddToCart(1)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add 1 Item
              </button>
              <button
                onClick={() => testAddToCart(3)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add 3 Items
              </button>
              <button
                onClick={() => testAddToCart(10)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add 10 Items (Should Fail)
              </button>
              <button
                onClick={clearTestCart}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Test Results */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Test Results</h2>
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
    </div>
  );
}