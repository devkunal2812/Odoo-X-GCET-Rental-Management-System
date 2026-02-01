"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../../components/Header";
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  CheckIcon
} from "@heroicons/react/24/outline";
import { addToCartWithStockCheck, isProductInCart, getProductQuantityInCart } from "../../lib/cart";
import { productService } from "@/app/lib/services/products";
import type { Product } from "@/types/api";
import RentalDurationModal from "../../components/RentalDurationModal";

const sortOptions = ["Featured", "Price: Low to High", "Price: High to Low", "Newest"];

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("Featured");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Rental Duration Modal state
  const [showRentalModal, setShowRentalModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use the new available products API for real-time inventory
        const response = await fetch(`/api/products/available?published=true&page=${currentPage}&limit=20&includeOutOfStock=true`);
        const data = await response.json();
        
        if (data.success) {
          setProducts(data.products);
          
          // 🔍 Debug: Log the first few products to see their inventory data
          console.log('📦 Products loaded:', data.products.length);
          if (data.products.length > 0) {
            console.log('🔍 First product inventory data:', {
              name: data.products[0].name,
              realTimeInventory: data.products[0].realTimeInventory,
              inventory: data.products[0].inventory,
              currentRentals: data.products[0].currentRentals
            });
          }
          
          if (data.pagination) {
            setTotalPages(data.pagination.pages);
          }
        } else {
          throw new Error(data.error || 'Failed to fetch products');
        }
      } catch (err) {
        setError('Failed to load products. Please try again.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [currentPage]);

  // Update cart items when component mounts and when cart changes
  useEffect(() => {
    const updateCartItems = () => {
      const items = products.map(product => product.id).filter(id => isProductInCart(id));
      setCartItems(items);
    };

    updateCartItems();
    
    // Listen for cart updates
    const handleCartUpdate = () => updateCartItems();
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [products]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

    // Sort products based on selected option
    switch (sortBy) {
      case "Price: Low to High":
        filtered = filtered.sort((a, b) => {
          const priceA = a.pricing?.[0]?.price || 0;
          const priceB = b.pricing?.[0]?.price || 0;
          return priceA - priceB;
        });
        break;
      case "Price: High to Low":
        filtered = filtered.sort((a, b) => {
          const priceA = a.pricing?.[0]?.price || 0;
          const priceB = b.pricing?.[0]?.price || 0;
          return priceB - priceA;
        });
        break;
      case "Newest":
        filtered = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "Featured":
      default:
        // Keep original order for featured
        break;
    }

    return filtered;
  }, [products, searchTerm, sortBy]);



  const handleAddToCart = (product: Product) => {
    if (cartItems.includes(product.id)) return;

    // Use real-time inventory data if available
    const realTimeInventory = product.realTimeInventory;
    const availableStock = realTimeInventory ? realTimeInventory.availableQuantity : (product.inventory?.quantityOnHand || 0);
    
    // Check if product is out of stock
    if (availableStock <= 0) {
      const isCurrentlyRented = product.currentRentals && product.currentRentals.length > 0;
      if (isCurrentlyRented) {
        alert('This product is currently rented and not available for new bookings.');
      } else {
        alert('This product is currently out of stock.');
      }
      return;
    }

    // Open rental duration modal instead of directly adding to cart
    setSelectedProduct({
      ...product,
      maxQuantity: availableStock // Use real-time available quantity
    });
    setShowRentalModal(true);
  };

  const handleRentalConfirm = (rentalData: {
    startDate: string;
    endDate: string;
    quantity: number;
  }) => {
    if (!selectedProduct) return;

    const defaultPrice = selectedProduct.pricing?.[0]?.price || 0;
    const defaultPeriod = selectedProduct.pricing?.[0]?.rentalPeriod?.name || 'day';
    
    // Use real-time inventory data if available
    const realTimeInventory = selectedProduct.realTimeInventory;
    const availableStock = realTimeInventory ? realTimeInventory.availableQuantity : (selectedProduct.inventory?.quantityOnHand || 0);

    // Calculate rental duration in days
    const start = new Date(rentalData.startDate);
    const end = new Date(rentalData.endDate);
    const durationInDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    const cartItem = {
      productId: selectedProduct.id,
      product: {
        id: selectedProduct.id,
        name: selectedProduct.name,
        image: '/api/placeholder/400/300',
        vendor: selectedProduct.vendor?.companyName || 'Unknown Vendor',
        vendorId: selectedProduct.vendorId,
        stock: availableStock // Use real-time available stock
      },
      quantity: rentalData.quantity,
      rentalDuration: durationInDays,
      rentalUnit: 'day' as const,
      unitPrice: defaultPrice,
      selectedAttributes: {},
      // Add rental dates
      rentalStartDate: rentalData.startDate,
      rentalEndDate: rentalData.endDate
    };

    // Use time-based validation since we have rental dates
    const result = addToCartWithStockCheck(cartItem, availableStock);
    
    if (result.success) {
      // Show success feedback
      setAddedToCart(selectedProduct.id);
      setTimeout(() => setAddedToCart(null), 2000);
      
      // Close modal
      setShowRentalModal(false);
      setSelectedProduct(null);
      
      // Refresh products to show updated availability
      window.location.reload(); // Simple refresh for now
    } else {
      // Show error message
      alert(result.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
        <Header currentPage="products" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
      <Header currentPage="products" />

      {/* Hero Section */}
      <section className="pt-20 pb-12 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center text-white"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Amazing Products
            </h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Find the perfect rental for your needs from our extensive collection
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-6 mb-8 -mt-8 relative z-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-secondary-50 hover:bg-white transition-colors text-secondary-900"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-secondary-50 hover:bg-white transition-colors text-secondary-900"
              >
                {sortOptions.map(option => (
                  <option key={option} value={option} className="text-secondary-900 bg-white">{option}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-secondary-600">
            Showing {filteredAndSortedProducts.length} of {products.length} products
            {sortBy !== "Featured" && (
              <span className="ml-2 text-primary-600">• Sorted by {sortBy}</span>
            )}
          </div>
        </motion.div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Products Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <AnimatePresence>
            {filteredAndSortedProducts.map((product, index) => {
              const defaultPrice = product.pricing?.[0]?.price || 0;
              const defaultPeriod = product.pricing?.[0]?.rentalPeriod?.name || 'day';
              const vendorName = product.vendor?.companyName || 'Unknown Vendor';
              
              // Use real-time inventory data with better fallback logic
              const realTimeInventory = product.realTimeInventory;
              
              // Calculate stock values with proper fallbacks
              let availableStock, totalStock;
              
              if (realTimeInventory) {
                // Use real-time data if available
                availableStock = realTimeInventory.availableQuantity;
                totalStock = realTimeInventory.totalStock;
              } else {
                // Fallback to basic inventory data
                const inventoryStock = product.inventory?.quantityOnHand || 0;
                availableStock = inventoryStock;
                totalStock = inventoryStock;
              }
              
              const isAvailable = availableStock > 0;
              
              // 🔍 Debug: Log stock calculation for first few products
              if (index < 3) {
                console.log(`🔍 Product "${product.name}" stock calculation:`, {
                  hasRealTimeInventory: !!realTimeInventory,
                  realTimeInventory,
                  availableStock,
                  totalStock,
                  isAvailable,
                  inventoryData: product.inventory,
                  currentRentals: product.currentRentals
                });
              }
              const isCurrentlyRented = product.currentRentals && product.currentRentals.length > 0;

              return (
                <motion.div
                  key={product.id}
                  variants={fadeInUp}
                  layout
                  whileHover={{ y: -8 }}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500"
                >
                  {/* Product Image */}
                  <div className="relative overflow-hidden">
                    <div className="aspect-w-16 aspect-h-12 bg-gradient-to-br from-secondary-200 to-secondary-300">
                      <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                        <span className="text-4xl">📦</span>
                      </div>
                    </div>
                    
                    {/* Availability Badge */}
                    <div className="absolute top-4 left-4">
                      {isCurrentlyRented ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                          Currently Rented
                        </span>
                      ) : isAvailable ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800">
                          Available
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-error-100 text-error-800">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* Rental Status Badge */}
                    {isCurrentlyRented && (
                      <div className="absolute top-4 right-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500 text-white">
                          🔒 Rented
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-secondary-900 group-hover:text-primary-600 transition-colors">
                        {product.name}
                      </h3>
                    </div>

                    <p className="text-secondary-600 text-sm mb-4 line-clamp-2">
                      {product.description || 'No description available'}
                    </p>

                    {/* Vendor */}
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-bold">
                          {vendorName.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm text-secondary-600">{vendorName}</span>
                    </div>

                    {/* Stock Information with Real-time Data */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-secondary-600">Stock Available:</span>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${
                            !isAvailable 
                              ? 'text-error-600' 
                              : availableStock <= 2 
                                ? 'text-warning-600' 
                                : 'text-success-600'
                          }`}>
                            {availableStock} of {totalStock} units
                          </span>
                          {/* Real-time indicator */}
                          {realTimeInventory && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              Live
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Real-time status messages */}
                      {realTimeInventory?.reservedQuantity > 0 && (
                        <p className="text-xs text-warning-600 mt-1">
                          📅 {realTimeInventory.reservedQuantity} unit(s) reserved/booked
                          {realTimeInventory.currentlyRentedQuantity > 0 && 
                            ` (${realTimeInventory.currentlyRentedQuantity} currently active)`
                          }
                        </p>
                      )}
                      {isAvailable && availableStock <= 2 && (
                        <p className="text-xs text-warning-600 mt-1">⚠️ Only few left available!</p>
                      )}
                      {!isAvailable && (
                        <p className="text-xs text-error-600 mt-1">
                          {realTimeInventory?.reservedQuantity > 0 ? 
                            '📅 All units are reserved/booked' : 
                            '❌ Out of stock'
                          }
                        </p>
                      )}
                      {getProductQuantityInCart(product.id) > 0 && (
                        <p className="text-xs text-primary-600 mt-1">
                          🛒 {getProductQuantityInCart(product.id)} in your cart
                        </p>
                      )}
                      
                      {/* Debug info in development */}
                      {process.env.NODE_ENV === 'development' && (
                        <p className="text-xs text-gray-500 mt-1">
                          Debug: {realTimeInventory ? 'Real-time data' : 'Static inventory'} | 
                          Reserved: {realTimeInventory?.reservedQuantity || 0} | 
                          Reservations: {product.reservations?.length || 0}
                        </p>
                      )}
                    </div>

                    {/* Current Rental Details */}
                    {isCurrentlyRented && product.currentRentals && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs font-medium text-yellow-800 mb-1">Current Rental:</p>
                        {product.currentRentals.map((rental, index) => (
                          <div key={index} className="text-xs text-yellow-700">
                            <p>📋 Order: {rental.orderNumber}</p>
                            <p>👤 Customer: {rental.customerName}</p>
                            <p>📅 Until: {new Date(rental.endDate).toLocaleDateString()}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Price and Actions */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-secondary-900">₹{defaultPrice}</span>
                        <span className="text-secondary-500">/{defaultPeriod}</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Link
                          href={`/products/${product.id}`}
                          className="px-4 py-2 bg-secondary-100 text-secondary-900 rounded-lg hover:bg-secondary-200 transition-colors font-medium"
                        >
                          View
                        </Link>
                        <motion.button
                          onClick={() => handleAddToCart(product)}
                          disabled={!isAvailable || getProductQuantityInCart(product.id) >= availableStock}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                            !isAvailable
                              ? 'bg-secondary-300 text-secondary-500 cursor-not-allowed'
                              : getProductQuantityInCart(product.id) >= availableStock
                                ? 'bg-secondary-300 text-secondary-500 cursor-not-allowed'
                                : cartItems.includes(product.id)
                                  ? 'bg-success-600 text-white cursor-default'
                                  : addedToCart === product.id
                                    ? 'bg-success-600 text-white'
                                    : 'bg-primary-600 text-white hover:bg-primary-700'
                          }`}
                          whileHover={isAvailable && !cartItems.includes(product.id) && getProductQuantityInCart(product.id) < availableStock ? { scale: 1.05 } : {}}
                          whileTap={isAvailable && !cartItems.includes(product.id) && getProductQuantityInCart(product.id) < availableStock ? { scale: 0.95 } : {}}
                        >
                          {!isAvailable ? (
                            <>
                              <ShoppingCartIcon className="h-4 w-4 mr-1" />
                              {isCurrentlyRented ? 'Currently Rented' : 'Out of Stock'}
                            </>
                          ) : getProductQuantityInCart(product.id) >= availableStock ? (
                            <>
                              <CheckIcon className="h-4 w-4 mr-1" />
                              Max in Cart
                            </>
                          ) : cartItems.includes(product.id) ? (
                            <>
                              <CheckIcon className="h-4 w-4 mr-1" />
                              Added
                            </>
                          ) : addedToCart === product.id ? (
                            <>
                              <CheckIcon className="h-4 w-4 mr-1" />
                              Added!
                            </>
                          ) : (
                            <>
                              <ShoppingCartIcon className="h-4 w-4 mr-1" />
                              Add
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredAndSortedProducts.length === 0 && !loading && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-secondary-100 rounded-full flex items-center justify-center">
              <MagnifyingGlassIcon className="h-12 w-12 text-secondary-400" />
            </div>
            <h3 className="text-2xl font-bold text-secondary-900 mb-2">No products found</h3>
            <p className="text-secondary-600 mb-6 max-w-md mx-auto">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSortBy("Featured");
              }}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Clear Filters
            </button>
          </motion.div>
        )}
      </div>

      {/* Rental Duration Modal */}
      {selectedProduct && (
        <RentalDurationModal
          isOpen={showRentalModal}
          onClose={() => {
            setShowRentalModal(false);
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

      {/* Footer */}
      <footer className="bg-secondary-900 text-white py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
                <span className="text-2xl font-bold">RentMarket</span>
              </div>
              <p className="text-secondary-400 mb-6 max-w-md">
                Your trusted marketplace for renting everything you need.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {['Products', 'About Us', 'Contact', 'Help Center'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-secondary-400 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                {['Help Center', 'Terms & Conditions', 'Privacy Policy'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-secondary-400 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-secondary-800 pt-8 text-center text-secondary-400">
            <p>&copy; 2024 RentMarket. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
