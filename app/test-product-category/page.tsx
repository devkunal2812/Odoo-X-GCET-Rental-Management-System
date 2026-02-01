"use client";

import React, { useState, useEffect } from "react";
import Header from "../../components/Header";

export default function TestProductCategoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "ELECTRONICS", "FURNITURE", "VEHICLES", "GYM_AND_SPORTS_EQUIPMENTS", "CONSTRUCTION_TOOLS"];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products?published=false');
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

  const filteredProducts = products.filter(product => {
    if (selectedCategory === "All") return true;
    return product.category === selectedCategory;
  });

  const getCategoryStats = () => {
    const stats: {[key: string]: number} = {};
    categories.forEach(cat => {
      if (cat === "All") {
        stats[cat] = products.length;
      } else {
        stats[cat] = products.filter(p => p.category === cat).length;
      }
    });
    return stats;
  };

  const categoryStats = getCategoryStats();

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
          <h1 className="text-3xl font-bold mb-8 text-gray-900">Product Category Test</h1>

          {/* Category Stats */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Category Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map(category => (
                <div key={category} className="bg-blue-50 rounded-lg p-4">
                  <div className="text-lg font-bold text-blue-900">
                    {categoryStats[category] || 0}
                  </div>
                  <div className="text-sm text-blue-700">
                    {category === "All" ? "Total Products" : category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Filter by Category</h2>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === "All" ? "All Categories" : category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Products List */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Products ({filteredProducts.length})
            </h2>
            
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No products found for the selected category.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      {product.category && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {product.category.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {product.description || 'No description'}
                    </p>
                    <div className="text-xs text-gray-500">
                      <div>Type: {product.productType}</div>
                      <div>Stock: {product.inventory?.quantityOnHand || 0}</div>
                      <div>Vendor: {product.vendor?.companyName || 'Unknown'}</div>
                      <div>Category: {product.category || 'Uncategorized'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Raw Data for Debugging */}
          <details className="mt-8">
            <summary className="cursor-pointer font-medium text-gray-700 mb-4">Raw Product Data (First 3 Products)</summary>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
              {JSON.stringify(filteredProducts.slice(0, 3), null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
}