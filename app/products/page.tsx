"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCartIcon, HeartIcon, UserIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";

// Mock data
const mockProducts = [
  {
    id: "1",
    name: "Professional Camera Kit",
    price: 25,
    priceUnit: "day" as const,
    image: "/api/placeholder/300/300",
    vendor: "TechRent Pro",
    category: "Electronics",
    rating: 4.8,
    reviews: 124
  },
  {
    id: "2", 
    name: "Power Drill Set",
    price: 15,
    priceUnit: "day" as const,
    image: "/api/placeholder/300/300",
    vendor: "ToolMaster",
    category: "Tools",
    rating: 4.6,
    reviews: 89
  },
  {
    id: "3",
    name: "Party Sound System",
    price: 50,
    priceUnit: "day" as const,
    image: "/api/placeholder/300/300", 
    vendor: "EventPro",
    category: "Party Supplies",
    rating: 4.9,
    reviews: 156
  },
  {
    id: "4",
    name: "Mountain Bike",
    price: 30,
    priceUnit: "day" as const,
    image: "/api/placeholder/300/300",
    vendor: "BikeRentals",
    category: "Sports",
    rating: 4.7,
    reviews: 203
  },
  {
    id: "5",
    name: "Projector & Screen",
    price: 40,
    priceUnit: "day" as const,
    image: "/api/placeholder/300/300",
    vendor: "TechRent Pro", 
    category: "Electronics",
    rating: 4.5,
    reviews: 67
  },
  {
    id: "6",
    name: "Lawn Mower",
    price: 20,
    priceUnit: "day" as const,
    image: "/api/placeholder/300/300",
    vendor: "GardenTools",
    category: "Tools",
    rating: 4.4,
    reviews: 45
  }
];

const categories = ["All", "Electronics", "Tools", "Party Supplies", "Sports"];
const priceRanges = [
  { label: "Under $20", min: 0, max: 20 },
  { label: "$20 - $40", min: 20, max: 40 },
  { label: "$40 - $60", min: 40, max: 60 },
  { label: "Over $60", min: 60, max: 1000 }
];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState<{min: number, max: number} | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const filteredProducts = mockProducts.filter(product => {
    const categoryMatch = selectedCategory === "All" || product.category === selectedCategory;
    const priceMatch = !selectedPriceRange || 
      (product.price >= selectedPriceRange.min && product.price <= selectedPriceRange.max);
    return categoryMatch && priceMatch;
  });

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--eggshell)" }}>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold" style={{ color: "var(--deep-space-blue)" }}>
                RentMarket
              </Link>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <Link href="/products" className="font-medium" style={{ color: "var(--deep-space-blue)" }}>
                Products
              </Link>
              <Link href="/about" className="hover:opacity-80 transition-opacity" style={{ color: "var(--blue-slate)" }}>
                About Us
              </Link>
              <Link href="/contact" className="hover:opacity-80 transition-opacity" style={{ color: "var(--blue-slate)" }}>
                Contact Us
              </Link>
              <Link href="/terms" className="hover:opacity-80 transition-opacity" style={{ color: "var(--blue-slate)" }}>
                Terms & Conditions
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link href="/wishlist" className="hover:opacity-80 transition-opacity" style={{ color: "var(--blue-slate)" }}>
                <HeartIcon className="h-6 w-6" />
              </Link>
              <Link href="/cart" className="hover:opacity-80 transition-opacity relative" style={{ color: "var(--blue-slate)" }}>
                <ShoppingCartIcon className="h-6 w-6" />
                <span className="absolute -top-2 -right-2 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                      style={{ backgroundColor: "var(--deep-space-blue)" }}>
                  0
                </span>
              </Link>
              <Link href="/login" className="hover:opacity-80 transition-opacity" style={{ color: "var(--blue-slate)" }}>
                <UserIcon className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "var(--ink-black)" }}>Products</h1>
            <p className="mt-2" style={{ color: "var(--blue-slate)" }}>{filteredProducts.length} products available</p>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border-2"
            style={{ borderColor: "var(--dusty-denim)" }}
          >
            <FunnelIcon className="h-5 w-5" />
            <span>Filters</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`md:w-64 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-4" style={{ color: "var(--ink-black)" }}>Filters</h3>
              
              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3" style={{ color: "var(--ink-black)" }}>Category</h4>
                <div className="space-y-2">
                  {categories.map(category => (
                    <label key={category} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category}
                        checked={selectedCategory === category}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="mr-2"
                        style={{ accentColor: "var(--deep-space-blue)" }}
                      />
                      <span className="text-sm" style={{ color: "var(--blue-slate)" }}>{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3" style={{ color: "var(--ink-black)" }}>Price Range (per day)</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="priceRange"
                      checked={selectedPriceRange === null}
                      onChange={() => setSelectedPriceRange(null)}
                      className="mr-2"
                      style={{ accentColor: "var(--deep-space-blue)" }}
                    />
                    <span className="text-sm" style={{ color: "var(--blue-slate)" }}>All Prices</span>
                  </label>
                  {priceRanges.map(range => (
                    <label key={range.label} className="flex items-center">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={selectedPriceRange?.min === range.min && selectedPriceRange?.max === range.max}
                        onChange={() => setSelectedPriceRange(range)}
                        className="mr-2"
                        style={{ accentColor: "var(--deep-space-blue)" }}
                      />
                      <span className="text-sm" style={{ color: "var(--blue-slate)" }}>{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedPriceRange(null);
                }}
                className="w-full py-2 px-4 rounded-lg transition-colors hover:opacity-80"
                style={{ backgroundColor: "var(--dusty-denim)", color: "var(--eggshell)" }}
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative">
                    <div className="h-48" style={{ backgroundColor: "var(--dusty-denim)" }}></div>
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
                    >
                      {wishlist.includes(product.id) ? (
                        <HeartSolidIcon className="h-5 w-5" style={{ color: "var(--deep-space-blue)" }} />
                      ) : (
                        <HeartIcon className="h-5 w-5" style={{ color: "var(--blue-slate)" }} />
                      )}
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg" style={{ color: "var(--ink-black)" }}>{product.name}</h3>
                      <div className="text-right">
                        <div className="text-xl font-bold" style={{ color: "var(--deep-space-blue)" }}>
                          ${product.price}
                        </div>
                        <div className="text-sm" style={{ color: "var(--blue-slate)" }}>
                          per {product.priceUnit}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm mb-2" style={{ color: "var(--blue-slate)" }}>by {product.vendor}</p>
                    
                    <div className="flex items-center mb-3">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < Math.floor(product.rating) ? "★" : "☆"}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm ml-2" style={{ color: "var(--blue-slate)" }}>
                        {product.rating} ({product.reviews} reviews)
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link
                        href={`/products/${product.id}`}
                        className="flex-1 text-white py-2 px-4 rounded-lg text-center transition-colors hover:opacity-90"
                        style={{ backgroundColor: "var(--deep-space-blue)" }}
                      >
                        View Details
                      </Link>
                      <button className="py-2 px-4 rounded-lg transition-colors hover:opacity-80"
                              style={{ backgroundColor: "var(--dusty-denim)", color: "var(--eggshell)" }}>
                        <ShoppingCartIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg mb-4" style={{ color: "var(--blue-slate)" }}>No products found matching your filters.</p>
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSelectedPriceRange(null);
                  }}
                  className="px-6 py-2 rounded-lg text-white transition-colors hover:opacity-90"
                  style={{ backgroundColor: "var(--deep-space-blue)" }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-white py-12" style={{ backgroundColor: "var(--ink-black)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4" style={{ color: "var(--eggshell)" }}>RentMarket</h3>
              <p style={{ color: "var(--dusty-denim)" }}>
                Your trusted marketplace for renting everything you need.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: "var(--eggshell)" }}>Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/products" className="hover:opacity-80 transition-opacity" style={{ color: "var(--dusty-denim)" }}>Products</Link></li>
                <li><Link href="/about" className="hover:opacity-80 transition-opacity" style={{ color: "var(--dusty-denim)" }}>About Us</Link></li>
                <li><Link href="/contact" className="hover:opacity-80 transition-opacity" style={{ color: "var(--dusty-denim)" }}>Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: "var(--eggshell)" }}>Support</h4>
              <ul className="space-y-2">
                <li><Link href="/help" className="hover:opacity-80 transition-opacity" style={{ color: "var(--dusty-denim)" }}>Help Center</Link></li>
                <li><Link href="/terms" className="hover:opacity-80 transition-opacity" style={{ color: "var(--dusty-denim)" }}>Terms & Conditions</Link></li>
                <li><Link href="/privacy" className="hover:opacity-80 transition-opacity" style={{ color: "var(--dusty-denim)" }}>Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: "var(--eggshell)" }}>Contact Info</h4>
              <div className="space-y-2" style={{ color: "var(--dusty-denim)" }}>
                <p>Email: support@rentmarket.com</p>
                <p>Phone: (555) 123-4567</p>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center" style={{ borderColor: "var(--blue-slate)", color: "var(--dusty-denim)" }}>
            <p>&copy; 2024 RentMarket. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}