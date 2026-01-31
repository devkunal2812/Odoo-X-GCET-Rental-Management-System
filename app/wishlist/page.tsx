"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ShoppingCartIcon, 
  HeartIcon, 
  UserIcon, 
  TrashIcon,
  StarIcon
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";

// Mock wishlist data
const mockWishlistItems = [
  {
    id: "1",
    productId: "1",
    name: "Professional Camera Kit",
    price: 25,
    priceUnit: "day" as const,
    image: "/api/placeholder/300/300",
    vendor: "TechRent Pro",
    category: "Electronics",
    rating: 4.8,
    reviews: 124,
    available: true
  },
  {
    id: "2",
    productId: "3",
    name: "Party Sound System",
    price: 50,
    priceUnit: "day" as const,
    image: "/api/placeholder/300/300", 
    vendor: "EventPro",
    category: "Party Supplies",
    rating: 4.9,
    reviews: 156,
    available: true
  },
  {
    id: "3",
    productId: "5",
    name: "Projector & Screen",
    price: 40,
    priceUnit: "day" as const,
    image: "/api/placeholder/300/300",
    vendor: "TechRent Pro", 
    category: "Electronics",
    rating: 4.5,
    reviews: 67,
    available: false
  }
];

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState(mockWishlistItems);

  const removeFromWishlist = (itemId: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== itemId));
  };

  const addToCart = (productId: string) => {
    console.log("Adding to cart:", productId);
    alert("Added to cart!");
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
              <Link href="/products" className="hover:opacity-80 transition-opacity" style={{ color: "var(--blue-slate)" }}>
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
              <Link href="/wishlist" className="relative" style={{ color: "var(--deep-space-blue)" }}>
                <HeartSolidIcon className="h-6 w-6" />
                <span className="absolute -top-2 -right-2 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                      style={{ backgroundColor: "var(--deep-space-blue)" }}>
                  {wishlistItems.length}
                </span>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--ink-black)" }}>My Wishlist</h1>
          <p style={{ color: "var(--blue-slate)" }}>
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <HeartIcon className="h-24 w-24 mx-auto mb-6" style={{ color: "var(--dusty-denim)" }} />
            <h2 className="text-2xl font-semibold mb-4" style={{ color: "var(--ink-black)" }}>Your wishlist is empty</h2>
            <p className="mb-8" style={{ color: "var(--blue-slate)" }}>
              Start browsing and save your favorite products for later!
            </p>
            <Link
              href="/products"
              className="px-8 py-3 rounded-lg font-semibold text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: "var(--deep-space-blue)" }}
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            {/* Wishlist Actions */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setWishlistItems([])}
                  className="text-sm hover:opacity-80 transition-opacity"
                  style={{ color: "var(--blue-slate)" }}
                >
                  Clear All
                </button>
              </div>
              <div className="text-sm" style={{ color: "var(--blue-slate)" }}>
                Share your wishlist with friends
              </div>
            </div>

            {/* Wishlist Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map(item => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative">
                    <div className="h-48" style={{ backgroundColor: "var(--dusty-denim)" }}></div>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
                    >
                      <HeartSolidIcon className="h-5 w-5" style={{ color: "var(--deep-space-blue)" }} />
                    </button>
                    {!item.available && (
                      <div className="absolute top-3 left-3 px-2 py-1 text-xs font-medium rounded-full text-white"
                           style={{ backgroundColor: "var(--blue-slate)" }}>
                        Unavailable
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg" style={{ color: "var(--ink-black)" }}>{item.name}</h3>
                      <div className="text-right">
                        <div className="text-xl font-bold" style={{ color: "var(--deep-space-blue)" }}>
                          ${item.price}
                        </div>
                        <div className="text-sm" style={{ color: "var(--blue-slate)" }}>
                          per {item.priceUnit}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm mb-2" style={{ color: "var(--blue-slate)" }}>by {item.vendor}</p>
                    
                    <div className="flex items-center mb-3">
                      <div className="flex mr-2">
                        {[...Array(5)].map((_, i) => (
                          <StarSolidIcon 
                            key={i} 
                            className={`h-4 w-4 ${i < Math.floor(item.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm" style={{ color: "var(--blue-slate)" }}>
                        {item.rating} ({item.reviews} reviews)
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link
                        href={`/products/${item.productId}`}
                        className="flex-1 text-center py-2 px-4 rounded-lg border-2 transition-colors hover:opacity-80"
                        style={{ 
                          borderColor: "var(--deep-space-blue)", 
                          color: "var(--deep-space-blue)",
                          backgroundColor: "transparent"
                        }}
                      >
                        View Details
                      </Link>
                      {item.available ? (
                        <button 
                          onClick={() => addToCart(item.productId)}
                          className="py-2 px-4 rounded-lg text-white transition-colors hover:opacity-90"
                          style={{ backgroundColor: "var(--deep-space-blue)" }}
                        >
                          <ShoppingCartIcon className="h-5 w-5" />
                        </button>
                      ) : (
                        <button 
                          disabled
                          className="py-2 px-4 rounded-lg text-white opacity-50 cursor-not-allowed"
                          style={{ backgroundColor: "var(--blue-slate)" }}
                        >
                          <ShoppingCartIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Shopping */}
            <div className="mt-12 text-center">
              <Link
                href="/products"
                className="px-8 py-3 rounded-lg font-semibold border-2 transition-colors hover:opacity-80"
                style={{ 
                  borderColor: "var(--deep-space-blue)", 
                  color: "var(--deep-space-blue)",
                  backgroundColor: "transparent"
                }}
              >
                Continue Shopping
              </Link>
            </div>

            {/* Recommendations */}
            <section className="mt-16">
              <h2 className="text-2xl font-bold mb-8" style={{ color: "var(--ink-black)" }}>You Might Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { name: "Power Drill Set", price: 15, vendor: "ToolMaster", rating: 4.6 },
                  { name: "Mountain Bike", price: 30, vendor: "BikeRentals", rating: 4.7 },
                  { name: "Lawn Mower", price: 20, vendor: "GardenTools", rating: 4.4 },
                  { name: "Gaming Console", price: 35, vendor: "GameRent", rating: 4.8 }
                ].map((product, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-40" style={{ backgroundColor: "var(--dusty-denim)" }}></div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-1" style={{ color: "var(--ink-black)" }}>{product.name}</h3>
                      <p className="text-sm mb-2" style={{ color: "var(--blue-slate)" }}>by {product.vendor}</p>
                      <div className="flex justify-between items-center">
                        <div className="font-bold" style={{ color: "var(--deep-space-blue)" }}>
                          ${product.price}/day
                        </div>
                        <div className="flex items-center">
                          <StarSolidIcon className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm" style={{ color: "var(--blue-slate)" }}>{product.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="text-white py-12 mt-16" style={{ backgroundColor: "var(--ink-black)" }}>
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