"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../../components/Header";
import {
  MagnifyingGlassIcon,
  StarIcon,
  HeartIcon,
  ShoppingCartIcon,
  MapPinIcon,
  AdjustmentsHorizontalIcon,
  CheckIcon
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { addToCart, isProductInCart } from "../../lib/cart";

// Mock data with more realistic products
const mockProducts = [
  {
    id: 1,
    name: "Professional DSLR Camera Kit",
    description: "Complete photography setup with multiple lenses and accessories",
    price: 45,
    period: "day",
    rating: 4.9,
    reviews: 127,
    image: "/api/placeholder/400/300",
    vendor: "TechRent Pro",
    location: "Downtown",
    category: "Electronics",
    availability: "Available",
    features: ["4K Video", "Multiple Lenses", "Tripod Included"],
    isWishlisted: false,
    createdAt: "2024-01-15"
  },
  {
    id: 2,
    name: "Power Drill Set Professional",
    description: "Heavy-duty cordless drill with complete bit set and carrying case",
    price: 25,
    period: "day",
    rating: 4.8,
    reviews: 89,
    image: "/api/placeholder/400/300",
    vendor: "ToolMaster",
    location: "North Side",
    category: "Tools",
    availability: "Available",
    features: ["Cordless", "Multiple Bits", "Carrying Case"],
    isWishlisted: true,
    createdAt: "2024-01-20"
  },
  {
    id: 3,
    name: "Party Sound System",
    description: "Professional PA system perfect for events and parties",
    price: 75,
    period: "day",
    rating: 4.7,
    reviews: 156,
    image: "/api/placeholder/400/300",
    vendor: "EventPro",
    location: "City Center",
    category: "Party Supplies",
    availability: "Available",
    features: ["Wireless Mics", "Bluetooth", "Easy Setup"],
    isWishlisted: false,
    createdAt: "2024-01-10"
  },
  {
    id: 4,
    name: "Mountain Bike - Trek",
    description: "High-performance mountain bike for trails and adventures",
    price: 35,
    period: "day",
    rating: 4.6,
    reviews: 203,
    image: "/api/placeholder/400/300",
    vendor: "BikeRentals",
    location: "South Park",
    category: "Sports",
    availability: "Rented",
    features: ["21 Speed", "Suspension", "Helmet Included"],
    isWishlisted: false,
    createdAt: "2024-01-25"
  },
  {
    id: 5,
    name: "Electric Scooter",
    description: "Eco-friendly electric scooter for city commuting",
    price: 20,
    period: "day",
    rating: 4.5,
    reviews: 94,
    image: "/api/placeholder/400/300",
    vendor: "UrbanRide",
    location: "Downtown",
    category: "Vehicles",
    availability: "Available",
    features: ["25km Range", "Fast Charging", "App Control"],
    isWishlisted: false,
    createdAt: "2024-01-30"
  },
  {
    id: 6,
    name: "Projector & Screen Combo",
    description: "4K projector with portable screen for presentations",
    price: 55,
    period: "day",
    rating: 4.8,
    reviews: 78,
    image: "/api/placeholder/400/300",
    vendor: "TechRent Pro",
    location: "Business District",
    category: "Electronics",
    availability: "Available",
    features: ["4K Resolution", "Portable Screen", "HDMI Cables"],
    isWishlisted: false,
    createdAt: "2024-01-05"
  }
];

const categories = ["All", "Electronics", "Tools", "Party Supplies", "Sports", "Vehicles"];
const sortOptions = ["Featured", "Price: Low to High", "Price: High to Low", "Rating", "Newest"];

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
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Featured");
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState(mockProducts);
  const [addedToCart, setAddedToCart] = useState<number | null>(null);
  const [cartItems, setCartItems] = useState<string[]>([]);

  // Update cart items when component mounts and when cart changes
  React.useEffect(() => {
    const updateCartItems = () => {
      const items = products.map(product => product.id.toString()).filter(id => isProductInCart(id));
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
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort products based on selected option
    switch (sortBy) {
      case "Price: Low to High":
        filtered = filtered.sort((a, b) => a.price - b.price);
        break;
      case "Price: High to Low":
        filtered = filtered.sort((a, b) => b.price - a.price);
        break;
      case "Rating":
        filtered = filtered.sort((a, b) => b.rating - a.rating);
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
  }, [products, searchTerm, selectedCategory, sortBy]);

  const toggleWishlist = (productId: number) => {
    setProducts(products.map(product => 
      product.id === productId 
        ? { ...product, isWishlisted: !product.isWishlisted }
        : product
    ));
  };

  const handleAddToCart = (product: typeof mockProducts[0]) => {
    if (product.availability !== 'Available' || cartItems.includes(product.id.toString())) return;

    const cartItem = {
      productId: product.id.toString(),
      product: {
        id: product.id.toString(),
        name: product.name,
        image: product.image,
        vendor: product.vendor
      },
      quantity: 1,
      rentalDuration: 1,
      rentalUnit: product.period as 'hour' | 'day' | 'week',
      unitPrice: product.price,
      selectedAttributes: {}
    };

    addToCart(cartItem);
    
    // Show success feedback
    setAddedToCart(product.id);
    setTimeout(() => setAddedToCart(null), 2000);
  };

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

            {/* Category Filter */}
            <div className="flex items-center space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-secondary-50 hover:bg-white transition-colors text-secondary-900"
              >
                {categories.map(category => (
                  <option key={category} value={category} className="text-secondary-900 bg-white">{category}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-secondary-50 hover:bg-white transition-colors text-secondary-900"
              >
                {sortOptions.map(option => (
                  <option key={option} value={option} className="text-secondary-900 bg-white">{option}</option>
                ))}
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden p-3 border border-secondary-200 rounded-xl hover:bg-secondary-50 transition-colors"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5 text-secondary-600" />
              </button>
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

        {/* Products Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <AnimatePresence>
            {filteredAndSortedProducts.map((product) => (
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
                      <span className="text-4xl">📷</span>
                    </div>
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300">
                    <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <motion.button
                        onClick={() => toggleWishlist(product.id)}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {product.isWishlisted ? (
                          <HeartSolidIcon className="h-5 w-5 text-red-500" />
                        ) : (
                          <HeartIcon className="h-5 w-5 text-secondary-600" />
                        )}
                      </motion.button>
                    </div>
                  </div>

                  {/* Availability Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      product.availability === 'Available' 
                        ? 'bg-success-100 text-success-800' 
                        : 'bg-error-100 text-error-800'
                    }`}>
                      {product.availability}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-secondary-900 group-hover:text-primary-600 transition-colors">
                      {product.name}
                    </h3>
                  </div>

                  <p className="text-secondary-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {product.features.slice(0, 2).map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-lg"
                      >
                        {feature}
                      </span>
                    ))}
                    {product.features.length > 2 && (
                      <span className="px-2 py-1 bg-secondary-100 text-secondary-600 text-xs rounded-lg">
                        +{product.features.length - 2} more
                      </span>
                    )}
                  </div>

                  {/* Rating and Location */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1">
                      <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-secondary-900">{product.rating}</span>
                      <span className="text-sm text-secondary-500">({product.reviews})</span>
                    </div>
                    <div className="flex items-center text-sm text-secondary-500">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {product.location}
                    </div>
                  </div>

                  {/* Vendor */}
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-bold">
                        {product.vendor.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm text-secondary-600">{product.vendor}</span>
                  </div>

                  {/* Price and Actions */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-secondary-900">₹{product.price}</span>
                      <span className="text-secondary-500">/{product.period}</span>
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
                        disabled={product.availability !== 'Available'}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                          product.availability === 'Available'
                            ? cartItems.includes(product.id.toString())
                              ? 'bg-success-600 text-white cursor-default'
                              : addedToCart === product.id
                                ? 'bg-success-600 text-white'
                                : 'bg-primary-600 text-white hover:bg-primary-700'
                            : 'bg-secondary-300 text-secondary-500 cursor-not-allowed'
                        }`}
                        whileHover={product.availability === 'Available' && !cartItems.includes(product.id.toString()) ? { scale: 1.05 } : {}}
                        whileTap={product.availability === 'Available' && !cartItems.includes(product.id.toString()) ? { scale: 0.95 } : {}}
                      >
                        {cartItems.includes(product.id.toString()) ? (
                          <>
                            <CheckIcon className="h-4 w-4 mr-1" />
                            Already Added
                          </>
                        ) : addedToCart === product.id ? (
                          <>
                            <CheckIcon className="h-4 w-4 mr-1" />
                            Added!
                          </>
                        ) : (
                          <>
                            <ShoppingCartIcon className="h-4 w-4 mr-1" />
                            Add to Cart
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredAndSortedProducts.length === 0 && (
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
                setSelectedCategory("All");
                setSortBy("Featured");
              }}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Clear Filters
            </button>
          </motion.div>
        )}

        {/* Load More Button */}
        {filteredAndSortedProducts.length > 0 && (
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <button className="px-8 py-3 bg-white text-secondary-700 border border-secondary-200 rounded-xl hover:bg-secondary-50 transition-colors font-medium">
              Load More Products
            </button>
          </motion.div>
        )}
      </div>

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