"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";
import { productService } from "@/app/lib/services/products";
import type { Product } from "@/types/api";
import { useAuth } from "@/contexts/AuthContext";
import AddProductModal from "@/components/vendor/AddProductModal";

const categories = ["All", "Electronics", "Tools", "Party Supplies", "Sports"];
const statusOptions = ["All", "Published", "Unpublished"];

const getStatusColor = (published: boolean) => {
  return published
    ? { bg: "#dcfce7", text: "#16a34a" }
    : { bg: "#fee2e2", text: "#dc2626" };
};

export default function VendorProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [publishingProducts, setPublishingProducts] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get vendorProfile ID from user
      const vendorProfileId = user?.vendorProfile?.id;

      if (!vendorProfileId) {
        setError('Vendor profile not found');
        setLoading(false);
        return;
      }

      // Fetch ALL products for this vendor (including unpublished)
      const response = await productService.getAll({
        vendorId: vendorProfileId,
        published: false, // Include unpublished products
      });
      setProducts(response.products);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "All" ||
      (selectedStatus === "Published" && product.published) ||
      (selectedStatus === "Unpublished" && !product.published);
    return matchesSearch && matchesStatus;
  });

  const handleDeleteProduct = async (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await productService.delete(productId);
        setProducts(products.filter(p => p.id !== productId));
      } catch (err) {
        console.error('Failed to delete product:', err);
        alert('Failed to delete product');
      }
    }
  };

  const handleTogglePublish = async (productId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    try {
      setPublishingProducts(prev => new Set(prev).add(productId));
      const response = await productService.togglePublish(productId, newStatus);
      if (response.success && response.product) {
        setProducts(products.map(p => 
          p.id === productId ? response.product : p
        ));
      }
    } catch (err) {
      console.error('Failed to toggle publish:', err);
      alert('Failed to update product status');
    } finally {
      setPublishingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchProducts}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg transform hover:scale-105 bg-gradient-to-r from-primary-600 to-primary-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Product
        </button>
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
          const statusColor = getStatusColor(product.published);
          const defaultPrice = product.pricing?.[0]?.price || 0;
          const defaultPeriod = product.pricing?.[0]?.rentalPeriod?.name || 'day';
          const stock = product.inventory?.quantityOnHand || 0;

          return (
            <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Product Image */}
              <div className="relative h-48 bg-secondary-300">
                <div className="absolute top-4 right-4">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                  >
                    {product.published ? 'Published' : 'Unpublished'}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  Stock: {stock}
                </div>
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100">
                  <span className="text-4xl">📦</span>
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
                      {product.productType}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-primary-600">
                      ₹{defaultPrice}
                    </div>
                    <div className="text-sm text-secondary-600">
                      per {defaultPeriod}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-secondary-600 mb-4 line-clamp-2">
                  {product.description || 'No description available'}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                  <div>
                    <div className="font-bold text-secondary-900">
                      {product.pricing?.length || 0}
                    </div>
                    <div className="text-xs text-secondary-600">
                      Pricing Tiers
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-secondary-900">
                      {product.variants?.length || 0}
                    </div>
                    <div className="text-xs text-secondary-600">
                      Variants
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-secondary-900">
                      {stock}
                    </div>
                    <div className="text-xs text-secondary-600">
                      In Stock
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleTogglePublish(product.id, product.published)}
                      disabled={publishingProducts.has(product.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        product.published
                          ? 'hover:bg-amber-100 text-amber-600'
                          : 'hover:bg-green-100 text-green-600'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      title={product.published ? 'Unpublish' : 'Publish'}
                    >
                      {publishingProducts.has(product.id) ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                      ) : product.published ? (
                        <XCircleIcon className="h-5 w-5" />
                      ) : (
                        <CheckCircleIcon className="h-5 w-5" />
                      )}
                    </button>
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

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchProducts}
      />
    </div>
  );
}