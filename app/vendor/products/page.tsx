"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from "@heroicons/react/24/outline";

// Mock data
const mockProducts = [
  {
    id: "1",
    name: "Professional Camera Kit",
    category: "Electronics",
    price: 25,
    priceUnit: "day",
    status: "active",
    stock: 3,
    totalRentals: 45,
    rating: 4.8,
    revenue: "$1,125",
    image: "/api/placeholder/100/100",
    createdAt: "2024-01-15"
  },
  {
    id: "2", 
    name: "Power Drill Set",
    category: "Tools",
    price: 15,
    priceUnit: "day",
    status: "active",
    stock: 5,
    totalRentals: 38,
    rating: 4.6,
    revenue: "$570",
    image: "/api/placeholder/100/100",
    createdAt: "2024-01-10"
  },
  {
    id: "3",
    name: "Party Sound System",
    category: "Party Supplies", 
    price: 50,
    priceUnit: "day",
    status: "active",
    stock: 2,
    totalRentals: 32,
    rating: 4.9,
    revenue: "$1,600",
    image: "/api/placeholder/100/100",
    createdAt: "2024-01-08"
  },
  {
    id: "4",
    name: "Mountain Bike",
    category: "Sports",
    price: 30,
    priceUnit: "day", 
    status: "inactive",
    stock: 1,
    totalRentals: 28,
    rating: 4.7,
    revenue: "$840",
    image: "/api/placeholder/100/100",
    createdAt: "2024-01-05"
  },
  {
    id: "5",
    name: "Projector & Screen",
    category: "Electronics",
    price: 40,
    priceUnit: "day",
    status: "active",
    stock: 2,
    totalRentals: 22,
    rating: 4.5,
    revenue: "$880",
    image: "/api/placeholder/100/100",
    createdAt: "2024-01-03"
  }
];

const categories = ["All", "Electronics", "Tools", "Party Supplies", "Sports"];
const statusOptions = ["All", "Active", "Inactive"];

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return { bg: "#dcfce7", text: "#16a34a" };
    case "inactive":
      return { bg: "#fee2e2", text: "#dc2626" };
    default:
      return { bg: "#f0f9ff", text: "#1e40af" };
  }
};

export default function VendorProducts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesStatus = selectedStatus === "All" || product.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleDeleteProduct = (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      // In a real app, this would make an API call
      console.log("Deleting product:", productId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">
            My Products
          </h1>
          <p className="mt-2 text-secondary-600">
            Manage your rental inventory
          </p>
        </div>
        <Link
          href="/vendor/products/new"
          className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg transform hover:scale-105 bg-gradient-to-r from-primary-600 to-primary-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Product
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center px-4 py-3 rounded-lg border-2 border-primary-600 text-primary-600 transition-colors"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filters
          </button>

          {/* Desktop Filters */}
          <div className="hidden lg:flex items-center space-x-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border-2 border-secondary-200 rounded-lg focus:outline-none text-secondary-900"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 border-2 border-secondary-200 rounded-lg focus:outline-none text-secondary-900"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Mobile Filters */}
        {showFilters && (
          <div className="lg:hidden mt-4 pt-4 border-t border-secondary-200 space-y-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border-2 border-secondary-200 rounded-lg focus:outline-none text-secondary-900"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 border-2 border-secondary-200 rounded-lg focus:outline-none text-secondary-900"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const statusColor = getStatusColor(product.status);
          return (
            <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Product Image */}
              <div className="relative h-48 bg-secondary-300">
                <div className="absolute top-4 right-4">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                  >
                    {product.status}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  Stock: {product.stock}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg mb-1 text-secondary-900">
                      {product.name}
                    </h3>
                    <p className="text-sm text-secondary-600">
                      {product.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-primary-600">
                      ${product.price}
                    </div>
                    <div className="text-sm text-secondary-600">
                      per {product.priceUnit}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                  <div>
                    <div className="font-bold text-secondary-900">
                      {product.totalRentals}
                    </div>
                    <div className="text-xs text-secondary-600">
                      Rentals
                    </div>
                  </div>
                  <div>
                    <div className="font-bold flex items-center justify-center text-secondary-900">
                      <span className="text-yellow-400 mr-1">★</span>
                      {product.rating}
                    </div>
                    <div className="text-xs text-secondary-600">
                      Rating
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-secondary-900">
                      {product.revenue}
                    </div>
                    <div className="text-xs text-secondary-600">
                      Revenue
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/vendor/products/${product.id}`}
                      className="p-2 rounded-lg hover:bg-secondary-100 transition-colors text-primary-600"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </Link>
                    <Link
                      href={`/vendor/products/${product.id}/edit`}
                      className="p-2 rounded-lg hover:bg-secondary-100 transition-colors text-primary-600"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors text-red-600"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <span className="text-xs text-secondary-600">
                    Added {new Date(product.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center bg-secondary-200">
            <MagnifyingGlassIcon className="h-12 w-12 text-secondary-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-secondary-900">
            No products found
          </h3>
          <p className="mb-6 text-secondary-600">
            Try adjusting your search or filters
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("All");
              setSelectedStatus("All");
            }}
            className="px-6 py-3 rounded-lg font-semibold transition-colors hover:opacity-90 bg-primary-600 text-white"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}