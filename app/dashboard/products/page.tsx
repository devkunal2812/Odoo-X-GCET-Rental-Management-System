"use client";

import React from "react";
import { useState } from "react";
import Link from "next/link";
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon
} from "@heroicons/react/24/outline";

// Mock products data
const mockProducts = [
  {
    id: "PROD-001",
    name: "Professional Camera Kit",
    vendor: "TechRent Pro",
    category: "Electronics",
    quantityOnHand: 5,
    salesPrice: 25,
    costPrice: 15,
    unit: "day",
    published: true,
    image: "/api/placeholder/150/150"
  },
  {
    id: "PROD-002",
    name: "Power Drill Set",
    vendor: "TechRent Pro", 
    category: "Tools",
    quantityOnHand: 8,
    salesPrice: 15,
    costPrice: 8,
    unit: "day",
    published: true,
    image: "/api/placeholder/150/150"
  },
  {
    id: "PROD-003",
    name: "Party Sound System",
    vendor: "TechRent Pro",
    category: "Party Supplies",
    quantityOnHand: 3,
    salesPrice: 50,
    costPrice: 30,
    unit: "day",
    published: true,
    image: "/api/placeholder/150/150"
  },
  {
    id: "PROD-004",
    name: "Mountain Bike",
    vendor: "TechRent Pro",
    category: "Sports",
    quantityOnHand: 6,
    salesPrice: 30,
    costPrice: 20,
    unit: "day",
    published: false,
    image: "/api/placeholder/150/150"
  },
  {
    id: "PROD-005",
    name: "Projector & Screen",
    vendor: "TechRent Pro",
    category: "Electronics",
    quantityOnHand: 2,
    salesPrice: 40,
    costPrice: 25,
    unit: "day",
    published: true,
    image: "/api/placeholder/150/150"
  },
  {
    id: "PROD-006",
    name: "Lawn Mower",
    vendor: "TechRent Pro",
    category: "Tools",
    quantityOnHand: 4,
    salesPrice: 20,
    costPrice: 12,
    unit: "day",
    published: true,
    image: "/api/placeholder/150/150"
  }
];

const categories = ["All", "Electronics", "Tools", "Party Supplies", "Sports"];

export default function ProductsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || product.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "published" && product.published) ||
                         (statusFilter === "unpublished" && !product.published);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleDeleteProduct = (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      console.log("Deleting product:", productId);
      // Delete logic here
    }
  };

  const togglePublishStatus = (productId: string) => {
    console.log("Toggling publish status for:", productId);
    // Toggle logic here
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your rental inventory</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/dashboard/products/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  viewMode === "grid" 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  viewMode === "list" 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                List
              </button>
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="unpublished">Unpublished</option>
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <PhotoIcon className="h-12 w-12 text-gray-400" />
                </div>
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    product.published 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {product.published ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                
                <div className="flex justify-between items-center mb-3">
                  <div className="text-lg font-bold text-blue-600">
                    ${product.salesPrice}
                  </div>
                  <div className="text-sm text-gray-500">
                    per {product.unit}
                  </div>
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-600">Stock: {product.quantityOnHand}</span>
                  <span className={`text-sm ${
                    product.quantityOnHand > 5 ? "text-green-600" : 
                    product.quantityOnHand > 2 ? "text-yellow-600" : "text-red-600"
                  }`}>
                    {product.quantityOnHand > 5 ? "In Stock" : 
                     product.quantityOnHand > 2 ? "Low Stock" : "Very Low"}
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  <Link
                    href={`/dashboard/products/${product.id}`}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-center text-sm hover:bg-blue-700"
                  >
                    View
                  </Link>
                  <Link
                    href={`/dashboard/products/${product.id}/edit`}
                    className="bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-200"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="bg-red-100 text-red-700 py-2 px-3 rounded text-sm hover:bg-red-200"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4 flex items-center justify-center">
                          <PhotoIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.vendor}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${product.salesPrice}</div>
                      <div className="text-sm text-gray-500">per {product.unit}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.quantityOnHand} units</div>
                      <div className={`text-sm ${
                        product.quantityOnHand > 5 ? "text-green-600" : 
                        product.quantityOnHand > 2 ? "text-yellow-600" : "text-red-600"
                      }`}>
                        {product.quantityOnHand > 5 ? "In Stock" : 
                         product.quantityOnHand > 2 ? "Low Stock" : "Very Low"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => togglePublishStatus(product.id)}
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          product.published 
                            ? "bg-green-100 text-green-800 hover:bg-green-200" 
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                      >
                        {product.published ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          href={`/dashboard/products/${product.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/dashboard/products/${product.id}/edit`}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <PhotoIcon className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">No products found</h2>
          <p className="text-gray-500 mb-6">Try adjusting your search or filters, or add a new product.</p>
          <Link
            href="/dashboard/products/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Your First Product
          </Link>
        </div>
      )}
    </div>
  );
}
