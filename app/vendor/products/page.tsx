"use client";

import { useState, useEffect } from "react";
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

const categories = ["All", "ELECTRONICS", "FURNITURE", "VEHICLES", "GYM_AND_SPORTS_EQUIPMENTS", "CONSTRUCTION_TOOLS"];
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
  const [activeRentals, setActiveRentals] = useState<{[productId: string]: {
    isRented: boolean;
    rentalDetails?: {
      orderNumber: string;
      customerName: string;
      endDate: string;
    };
  }}>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (user && user.role === 'VENDOR') {
      fetchProducts();
    }
  }, [user]); // Only depend on user, not user changes

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

      console.log('🔍 Fetching vendor products with real-time inventory...');

      // Use the real-time inventory API for vendor products
      const response = await fetch(`/api/products/available?vendorId=${vendorProfileId}&includeOutOfStock=true`);
      const data = await response.json();
      
      console.log('📦 Vendor products API response:', data);
      
      if (data.success) {
        setProducts(data.products);
        console.log(`✅ Loaded ${data.products.length} products with real-time inventory`);
        
        // Log inventory data for debugging (only first 3 products to reduce noise)
        data.products.slice(0, 3).forEach((product: any) => {
          if (product.realTimeInventory) {
            console.log(`📦 ${product.name}:`, {
              total: product.realTimeInventory.totalStock,
              available: product.realTimeInventory.availableQuantity,
              reserved: product.realTimeInventory.reservedQuantity,
              isFullyBooked: product.realTimeInventory.availableQuantity === 0 && product.realTimeInventory.totalStock > 0
            });
          }
        });

        // Use real-time inventory data instead of making separate API calls
        await checkRentalStatus(data.products);
      } else {
        throw new Error(data.error || 'Failed to fetch products');
      }
    } catch (err) {
      console.error('❌ Failed to fetch vendor products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Optimized refresh function for after product creation
  const refreshProducts = async () => {
    if (isRefreshing) return; // Prevent multiple simultaneous refreshes
    
    try {
      setIsRefreshing(true);
      console.log('🔄 Refreshing products after creation...');
      await fetchProducts();
    } finally {
      setIsRefreshing(false);
    }
  };

  const checkRentalStatus = async (products: Product[]) => {
    try {
      const rentalStatusMap: {[productId: string]: {
        isRented: boolean;
        rentalDetails?: {
          orderNumber: string;
          customerName: string;
          endDate: string;
        };
      }} = {};
      
      // Instead of checking each product individually, use the real-time inventory data
      // which already contains rental information
      products.forEach(product => {
        const realTimeInventory = product.realTimeInventory;
        const isCurrentlyRented = realTimeInventory ? realTimeInventory.currentlyRentedQuantity > 0 : false;
        
        rentalStatusMap[product.id] = {
          isRented: isCurrentlyRented,
          rentalDetails: isCurrentlyRented ? {
            orderNumber: 'Multiple Orders', // Could be multiple orders
            customerName: 'Various Customers',
            endDate: new Date().toISOString() // Placeholder
          } : undefined
        };
      });
      
      setActiveRentals(rentalStatusMap);
      console.log('✅ Rental status updated from real-time inventory data');
      
    } catch (error) {
      console.error('Failed to check rental status:', error);
      // Set all products as not rented if check fails
      const fallbackMap: {[productId: string]: {isRented: boolean}} = {};
      products.forEach(product => {
        fallbackMap[product.id] = { isRented: false };
      });
      setActiveRentals(fallbackMap);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "All" ||
      (selectedStatus === "Published" && product.published) ||
      (selectedStatus === "Unpublished" && !product.published);
    
    // Category filtering based on product's category
    const productCategory = product.category;
    const matchesCategory = selectedCategory === "All" || productCategory === selectedCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleDeleteProduct = async (productId: string) => {
    // Check if product is currently rented or fully booked
    const rentalStatus = activeRentals[productId];
    const product = products.find(p => p.id === productId);
    const realTimeInventory = product?.realTimeInventory;
    const isFullyBooked = realTimeInventory ? realTimeInventory.availableQuantity === 0 && realTimeInventory.totalStock > 0 : false;
    
    if (rentalStatus?.isRented) {
      alert('Cannot delete product while it is currently rented. Please wait for the rental to end.');
      return;
    }
    
    if (isFullyBooked) {
      alert('Cannot delete product while it is fully booked. Please wait for reservations to end.');
      return;
    }

    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await productService.delete(productId);
        setProducts(products.filter(p => p.id !== productId));
        // Remove from rental status tracking
        setActiveRentals(prev => {
          const newRentals = { ...prev };
          delete newRentals[productId];
          return newRentals;
        });
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
                <option key={category} value={category}>
                  {category === "All" ? "All Categories" : category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
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
                <option key={category} value={category}>
                  {category === "All" ? "All Categories" : category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
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
          
          // Use real-time inventory data
          const realTimeInventory = product.realTimeInventory;
          const totalStock = realTimeInventory ? realTimeInventory.totalStock : (product.inventory?.quantityOnHand || 0);
          const availableStock = realTimeInventory ? realTimeInventory.availableQuantity : totalStock;
          const reservedStock = realTimeInventory ? realTimeInventory.reservedQuantity : 0;
          
          // Determine booking status
          const isFullyBooked = availableStock === 0 && totalStock > 0;
          const isPartiallyBooked = reservedStock > 0 && availableStock > 0;
          const isCurrentlyRented = activeRentals[product.id]?.isRented || false;
          const rentalDetails = activeRentals[product.id]?.rentalDetails;
          const productCategory = product.category || 'UNCATEGORIZED';
          const isInactive = isCurrentlyRented || isFullyBooked; // Product is inactive when rented or fully booked

          return (
            <div key={product.id} className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow ${isInactive ? 'opacity-75 border-2 border-red-200' : ''}`}>
              {/* Product Image */}
              <div className="relative h-48 bg-secondary-300">
                <div className="absolute top-4 right-4 space-y-2">
                  <span
                    className="block px-3 py-1 rounded-full text-xs font-bold"
                    style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                  >
                    {product.published ? 'Published' : 'Unpublished'}
                  </span>
                  
                  {/* Booking Status Badges */}
                  {isFullyBooked && (
                    <span className="block px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                      Fully Booked
                    </span>
                  )}
                  {isPartiallyBooked && !isFullyBooked && (
                    <span className="block px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                      Partially Booked
                    </span>
                  )}
                  {isCurrentlyRented && (
                    <span className="block px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
                      Currently Rented
                    </span>
                  )}
                  {isInactive && (
                    <span className="block px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
                      Inactive
                    </span>
                  )}
                </div>
                
                <div className="absolute bottom-4 left-4 space-y-1">
                  <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    Stock: {availableStock} of {totalStock} available
                  </div>
                  {reservedStock > 0 && (
                    <div className="bg-red-500 bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                      {reservedStock} reserved
                    </div>
                  )}
                  <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    {productCategory.replace(/_/g, ' ')}
                  </div>
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

                {/* Booking/Rental Status Details */}
                {(isFullyBooked || isPartiallyBooked || isCurrentlyRented) && (
                  <div className={`mb-4 p-3 border rounded-lg ${
                    isFullyBooked ? 'bg-red-50 border-red-200' : 
                    isCurrentlyRented ? 'bg-orange-50 border-orange-200' : 
                    'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="text-sm">
                      {isFullyBooked && (
                        <>
                          <div className="font-medium text-red-800 mb-1">Fully Booked</div>
                          <div className="text-red-700">
                            <div>All {totalStock} units are reserved</div>
                            <div>Available: {availableStock} units</div>
                          </div>
                        </>
                      )}
                      
                      {isPartiallyBooked && !isFullyBooked && (
                        <>
                          <div className="font-medium text-yellow-800 mb-1">Partially Booked</div>
                          <div className="text-yellow-700">
                            <div>Reserved: {reservedStock} of {totalStock} units</div>
                            <div>Available: {availableStock} units</div>
                          </div>
                        </>
                      )}
                      
                      {isCurrentlyRented && rentalDetails && (
                        <>
                          <div className="font-medium text-orange-800 mb-1">Currently Rented</div>
                          <div className="text-orange-700">
                            <div>Order: {rentalDetails.orderNumber}</div>
                            <div>Customer: {rentalDetails.customerName}</div>
                            <div>Return: {new Date(rentalDetails.endDate).toLocaleDateString()}</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-4 text-center">
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
                      {totalStock}
                    </div>
                    <div className="text-xs text-secondary-600">
                      Total Stock
                    </div>
                  </div>
                  <div>
                    <div className={`font-bold ${
                      availableStock === 0 ? 'text-red-600' : 
                      availableStock <= 2 ? 'text-yellow-600' : 
                      'text-green-600'
                    }`}>
                      {availableStock}
                    </div>
                    <div className="text-xs text-secondary-600">
                      Available
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleTogglePublish(product.id, product.published)}
                      disabled={publishingProducts.has(product.id) || isCurrentlyRented}
                      className={`p-2 rounded-lg transition-colors ${
                        isCurrentlyRented
                          ? 'opacity-50 cursor-not-allowed text-gray-400'
                          : product.published
                            ? 'hover:bg-amber-100 text-amber-600'
                            : 'hover:bg-green-100 text-green-600'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      title={isCurrentlyRented ? 'Cannot modify while rented' : (product.published ? 'Unpublish' : 'Publish')}
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
                      className={`p-2 rounded-lg transition-colors ${
                        isCurrentlyRented
                          ? 'opacity-50 cursor-not-allowed text-gray-400'
                          : 'hover:bg-secondary-100 text-primary-600'
                      }`}
                      onClick={(e) => {
                        if (isCurrentlyRented) {
                          e.preventDefault();
                          alert('Cannot edit product while it is currently rented');
                        }
                      }}
                    >
                      <PencilIcon className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      disabled={isCurrentlyRented}
                      className={`p-2 rounded-lg transition-colors ${
                        isCurrentlyRented
                          ? 'opacity-50 cursor-not-allowed text-gray-400'
                          : 'hover:bg-red-50 text-red-600'
                      }`}
                      title={isCurrentlyRented ? 'Cannot delete while rented' : 'Delete product'}
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
        onSuccess={refreshProducts}
      />
    </div>
  );
}