"use client";

import { useState, useEffect } from "react";

export default function TestInventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiResponse, setApiResponse] = useState<any>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Test the same API call as products page
        const response = await fetch('/api/products/available?published=true&includeOutOfStock=true');
        const data = await response.json();
        
        console.log('🔍 API Response:', data);
        setApiResponse(data);
        
        if (data.success) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-secondary-900">Inventory Test Page</h1>
        
        {/* API Response Debug */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">API Response Debug</h2>
          <div className="bg-gray-100 p-4 rounded-lg overflow-auto">
            <pre className="text-sm">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const realTimeInventory = product.realTimeInventory;
            const availableStock = realTimeInventory ? realTimeInventory.availableQuantity : (product.inventory?.quantityOnHand || 0);
            const totalStock = realTimeInventory ? realTimeInventory.totalStock : (product.inventory?.quantityOnHand || 0);
            const isAvailable = availableStock > 0;
            const isCurrentlyRented = product.currentRentals && product.currentRentals.length > 0;

            return (
              <div key={product.id} className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-secondary-900">
                  {product.name}
                </h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Stock:</span>
                    <span className="font-medium">{totalStock}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Available:</span>
                    <span className={`font-medium ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                      {availableStock}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Currently Rented:</span>
                    <span className="font-medium text-orange-600">
                      {realTimeInventory?.currentlyRentedQuantity || 0}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`font-medium ${
                      isCurrentlyRented ? 'text-orange-600' : 
                      isAvailable ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isCurrentlyRented ? 'Partially Rented' : 
                       isAvailable ? 'Available' : 'Out of Stock'}
                    </span>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex justify-between font-semibold">
                      <span>Display:</span>
                      <span className={`${
                        !isAvailable ? 'text-red-600' : 
                        availableStock <= 2 ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {availableStock} of {totalStock} units
                      </span>
                    </div>
                  </div>
                </div>

                {/* Real-time Inventory Object Debug */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-xs font-semibold mb-2">realTimeInventory:</h4>
                  <pre className="text-xs text-gray-600">
                    {JSON.stringify(realTimeInventory, null, 2)}
                  </pre>
                </div>

                {/* Current Rentals Debug */}
                {product.currentRentals && product.currentRentals.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <h4 className="text-xs font-semibold mb-2">Current Rentals:</h4>
                    <pre className="text-xs text-gray-600">
                      {JSON.stringify(product.currentRentals, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-secondary-600">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
}